# Architecture — engineering contract

> The timeless engineering contract: modules, data model, invariants, seams,
> dependencies. Describes what **is**, never what happened when (history →
> `docs/JOURNAL.md`; rationale → `docs/DECISIONS.md`; present-state summary +
> diagrams → `docs/OVERVIEW.md`).

## Shape

A monorepo with one folder per surface: a self-contained web app (`web/`) plus an
optional Chrome extension (`extension/`). No build step, no server, no runtime
package install — `web/` is served as static files.

- **Web app** (`web/`) — `web/index.html` is the entire application (markup + CSS +
  all JS inline). Two dependencies are **vendored** as minified files so the app
  runs fully offline: `compromise.min.js` (NLP tokenizer) and `diff.min.js`
  (jsdiff). `samples.js` and `analytics.js` are the only other loaded scripts.
  Published to GitHub Pages by `.github/workflows/pages.yml`; the artifact root is
  `web/`, so its contents are served at the domain root and **all asset paths are
  relative**.
- **Chrome extension** (`extension/`) — Manifest V3; captures text from any page
  and hands it to the web app. Independent of the app's internals — fills the
  textareas via injected content script, never modifies `web/index.html`, and
  reaches the app over the absolute production URL, so the repo layout doesn't
  affect it.

## Dependencies

| Dependency | Purpose | Notes |
|---|---|---|
| compromise.js v14.15.0 | Sentence & clause tokenization | ~353 KB, vendored; handles abbreviations (Mr., Dr., U.S.A.) that `Intl.Segmenter` breaks on |
| jsdiff v8.0.4 | LCS / Myers word & char diff | ~30 KB, vendored |

Both are bundled (no CDN) — the offline PWA story depends on it. Analytics SDKs
(Aptabase) are lazy-imported at runtime and are non-essential to core function.

## Diff pipeline

```
splitText(text, mode) → segments[]        // {text, pre}; `pre` = original leading whitespace
norm(s)                                    // apply ignoreWS (collapse) / ignoreCase (lowercase)
computeDiff(segs1, segs2, fuzzy)
  → Diff.diffArrays() with an optional norm-based comparator
  → removed+added blocks:
      fuzzy off → positional pairing
      fuzzy on  → fuzzyPairBlocks() via segmentSimilarity()
  → changed row (both sides):  row.parts = diffWords()|diffChars() (ignoreCase/WS-normalized)
                               row.segIdx (merge key), row.chunkCount
  → removed/added/one-sided row: row.segIdx, row.chunkCount = 1 (whole segment = one decision)
renderDiff(rows)
  → sticky header: Original/Suggested + Keep all/Accept all pills (data-allside)
  → renderHighlightedDiff(parts, side, segIdx)  // changed rows
  → makeHighlightSpan(text, ...)                // removed/added rows
      spans carry data-seg / data-chunk / data-side / data-base; class via resolveSpanClass(mergeState)
  → «/» accept-all buttons on non-equal rows
```

On the empty state `renderDiff` is skipped: `compare()` injects `emptyStateHTML()`
(the editorial home) into `#diff-output` and adds `.is-home` so the page scrolls
naturally instead of trapping the home in the diff area's scroll box.

After any decision change, `updateMergePanel()` re-renders the "your final
version" panel and calls `updateProgressBar()` (the `N of M reviewed` pill, via
`reviewProgress()`) and `updateColHeaderBtns()` (the Keep all / Accept all
active highlight). `acceptAllRows(side)` and the per-row «/» handler push
`batchAll` / `batch` undo entries respectively.

## Data model

```js
mergeState = { [segIdx]: { [chunkIdx]: 'left' | 'right' | null } }   // null = unresolved
undoStack  = [{ seg, chunk, prev }]                    // single chunk
           | { batch, seg, chunks[] }                  // a whole row («/»)
           | { batchAll, chunks: [{ seg, chunkIdx, prev }] }  // Keep all / Accept all
savedMergeStates = { [mode]: { mergeState, undoStack } }         // per-mode persistence
```

**Chunk indexing invariant** — `chunkIdx` is computed identically on both sides by
walking `row.parts`: it increments after each `{added}` part, and after a
`{removed}` not followed by an `{added}`. Both sides must agree, or a decision on
one side would target the wrong chunk on the other.

`enumerateChunks(rows)` produces the ordered actionable-chunk list
(`{segIdx, chunkIdx, kind: 'replace'|'insert'|'delete', before, after}`) shared by
the wizard, `reviewProgress()`, and `computeMergedParts()` — one walk, one source
of chunk truth. `chunkContext(rows, segIdx, chunkIdx)` returns ~140-char
sentence-trimmed surrounding snippets for the wizard.

## Invariants & seams

- **Input boxes are the source of truth.** Merge never mutates them; the merged
  result is assembled from the diff structure, keeping both originals available
  for re-comparison.
- **Whitespace between segments is preserved.** `splitText` captures each
  segment's leading whitespace (`pre`); the assembled output re-emits it, so a
  multi-paragraph document stays multi-paragraph. Caveat: in sentence/clause mode
  the segment *text* comes from compromise and may have its internal whitespace
  normalized (clause-merging joins short clauses with a single space) — breaks
  *between* segments are preserved either way. (Two-level model is the escape
  hatch if intra-segment fidelity ever matters.)
- **Merge decisions are per-mode.** Switching split modes saves and restores
  `mergeState` per mode (`savedMergeStates`); only a text edit (which changes
  segmentation) clears saved states.
- **Both review views render from one state.** Side-by-side and one-at-a-time
  both derive from the same `currentRows` + `mergeState`, so switching is
  lossless. The view choice persists as `localStorage` `differ-view` (default
  `side`) and is *not* part of the share hash (`ms` already carries decisions).

## Shareable URL encoding

```
hash = base64(JSON.stringify({ o, n, md, fz, ch, ic, iw, ms }))
// o/n = texts, md = mode, fz/ch/ic/iw = toggle booleans, ms = mergeState
// on load: decode → set texts → compare() → restore mergeState
```

Keys are intentionally short to minimize URL length. The payload is capped at
`HASH_MAX` (32 KB); over that the hash is omitted from the URL and the share
button signals it can't be shared (rather than producing a broken link). The
hash is a URL fragment — it never reaches a server. Compression is the lever for
larger comparisons (see `docs/ROADMAP.md § URL payload compression`).

## Similarity function (fuzzy mode)

```
segmentSimilarity(a, b) = 0.6·jaccard + 0.2·firstWordBonus + 0.2·lengthRatio
threshold = 0.25
```

Word-set overlap dominates; a first-word match and a balanced length each nudge
the score. Used only when smart matching is on, to pair removed/added blocks.

## Theme system

Themes are JS objects of CSS-custom-property overrides applied to
`document.documentElement.style`; the `THEMES` object is the source of truth and
the CSS `:root` block is a FOUC fallback that mirrors `paper`. `auto` reads
`prefers-color-scheme` and updates live. Choice persists as `localStorage`
`differ-theme`.

Tokens carry **typography and layout**, not just color, so "reading" themes are
genuinely editorial rather than recolored: `--font-body` (reading face),
`--font-ui` (chrome), `--logo`, `--radius`, `--on-accent` (text on `--accent`
backgrounds), `--text-dim-strong`. A post-`THEMES` backfill loop fills these for
any theme that didn't define them (the code/monospace themes), so they render
exactly as before. Adding a theme needs only a new `THEMES` entry.

## Deploy

`web/` is published to GitHub Pages by `.github/workflows/pages.yml` on any push
that touches `web/**` (or manual dispatch): it uploads `web/` as the Pages
artifact and deploys it. The artifact's contents serve at the domain root, so
every asset path in the site must stay relative. `web/CNAME` travels in the
artifact and binds the custom domain (differapp.com, HTTPS enforced). The Pages
source is "GitHub Actions" (not branch-serve). There is no test gate — the push
ships the site — so the manual browser check is the gate.

## PWA / offline

`manifest.json` declares the installable app; `sw.js` is the service worker.
Caching is **network-first for HTML/navigations** (fresh shell, cache fallback
offline) and **cache-first for other local assets**. The cache name is versioned
(`const CACHE = 'differ-vN'`); `activate` deletes any key `!== CACHE` and
`skipWaiting()` + `clients.claim()` take over promptly.

**Maintenance invariant:** bump `CACHE` whenever cached assets change, or
returning visitors are served the stale asset list.

## Chrome extension

Manifest V3, permissions `contextMenus` / `storage` / `scripting` (+ optional
`docs.google.com` host permission on first Docs use). Captured texts live in
`chrome.storage.local` across tabs and restarts. Full selection text is read via
the scripting API (avoids `selectionText` truncation). Tab creation is delegated
to the background service worker so it survives popup close. Google-Docs
comparison downloads the credentialed `.docx` export and parses it entirely
client-side (`extension/docx.js`: a hand-rolled `DecompressionStream` ZIP reader
+ an OOXML tracked-changes walker) — no Google API, no OAuth — yielding original
vs. all-suggestions-accepted.

## Testing strategy

No automated suite and no build step. Verification is manual: exercise the
diff → merge → copy/share flows in a browser after any change to `web/index.html`,
and load `extension/` unpacked at `chrome://extensions` for extension changes.
The Actions deploy builds but runs no tests, so a push to `main` still ships
whatever it ships — the browser check *is* the gate; run it before pushing.
