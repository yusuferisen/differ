# differ

A browser-based text review and merge tool. Paste two versions of any text to see exactly what changed — at the sentence, paragraph, clause, or line level — with word- or character-level inline highlighting. Then interactively build a merged result.

**[differapp.com](https://differapp.com)** — no server, no installation. Installable as a web app from Chrome, Edge, or Safari. Also available as a [Chrome extension](#chrome-extension) for comparing text across any web page.

---

## What makes it different

Most diff tools operate on lines. differ splits text into **meaningful linguistic units** and aligns them intelligently. Within each changed pair it highlights the exact words (or characters) that changed. You can then tap any highlighted word to pick a side, build a merged result, and copy or share it.

Especially useful for:

- Edited prose or essays (no line breaks to rely on)
- LLM rewrites of a passage
- Two versions of a document, speech, or article
- Translated or paraphrased text

All processing runs entirely in the browser. Text never leaves your device.

---

## Usage

Visit **[differapp.com](https://differapp.com)** — or open `index.html` locally.

Paste original text in the left box, modified text in the right. The diff updates live as you type. No compare button.

---

## Features

### Split modes

Controls how text is divided into units before diffing. Toggle with the mode buttons or press **Alt+M** to cycle.

| Mode | How it splits |
|---|---|
| **paragraph** | Splits on blank lines (`\n\n`) |
| **sentence** | NLP-aware tokenization via compromise.js — handles abbreviations like Mr., Dr., U.S.A. correctly. Default. |
| **clause** | Splits within sentences at clause boundaries. Short clauses (<4 words) are merged into their predecessor. |
| **line** | Splits on single newlines (one segment per non-blank line). |

Whatever the mode, the original whitespace *between* segments — blank lines, single newlines inside a paragraph, indentation — is kept and re-emitted in the assembled output, so a multi-paragraph document stays multi-paragraph. (In sentence/clause mode the segment text comes from compromise and may have its internal whitespace normalized — and clause-merging joins short clauses with a single space — so a multi-space or newline run *inside* a segment can collapse; the breaks between segments are preserved either way.)

### Diff options

The **options** dropdown in the header contains compare and matching settings. The button highlights when any non-default setting is active.

| Toggle | What it does | Default |
|---|---|---|
| **show character changes** | Character-level highlighting instead of word-level within each changed pair | Off |
| **smart matching** | Pairs sections by similarity instead of position — handles insertions in the middle correctly | Off |
| **ignore case** | Treats upper/lowercase as equal for matching and highlighting | **On** |
| **ignore spacing** | Normalizes whitespace before comparison | Off |

The **show all / changed only** button in the toolbar toggles unchanged rows in the diff output — hides unchanged sections to focus on changes. Default: changed only.

### Merge mode

Activated automatically on the first click of any highlighted word, a `«`/`»` button, or **Keep all / Accept all**.

- **Click a highlighted word** on either side → choose that version for that diff chunk
- **Click the other side** of the same chunk → flip the decision
- **Click the same side again** → unset (back to undecided)
- **`«` / `»`** buttons (hover any changed, removed, or added row) → choose the entire row left or right in one action; click again to unset
- **Keep all / Accept all** — pills in the two column headers (`Original` / `Suggested`). One click applies that whole side to every changed chunk (custom edits are left alone); the pill highlights while it's the fully-applied side; clicking it again toggles everything back to undecided. Counts as a single undo step.
- **Removed/added rows** are also interactive — click or use `«`/`»` to keep or exclude a section that only exists on one side
- **Progress** — the toolbar shows `N of M changes reviewed` with a bar that turns green at 100%. A chunk counts as reviewed once it has any decision (left, right, or a custom edit).
- **Undo** button (up to 20 steps; a batch row-accept or a Keep all / Accept all = 1 step)
- Switching split modes preserves merge decisions per mode — switching back restores them

### Final version panel ("your final version")

Always visible at the bottom of the page, sticky while scrolling. The top edge is a drag handle — resize the panel vertically by dragging. Height persists across reloads. The header carries a one-line hint ("updates live as you pick · click any word to rewrite it").

- Live-updating assembled text that preserves the source's original spacing — paragraph breaks, blank lines, indentation — rather than re-joining segments with a uniform delimiter
- **Undecided chunks**: `{old|new}` inline (amber) if short ≤80 chars, or a two-line block with `← old` / `→ new` each clickable for long chunks
- Removed/added sections are included by default; exclude them via the diff table
- Block-format conflicts can also be resolved directly in the panel
- **copy result** — the filled pill in the toolbar (not on the panel). Appears when a diff is active; copies the assembled text, including `{old|new}` placeholders for undecided chunks. Flashes on copy.

When there's nothing to compare, the diff area shows an **editorial home** instead — a hero, three example cards (resume / AI rewrite / proofread, wired to `samples.js` keys), and a short "How Differ works" walkthrough; the toolbar and this panel are hidden until a real comparison exists.

### Themes

A **theme** dropdown button in the header offers two groups:

**Reading** — editorial themes with a serif reading face (Charter), sans-serif UI chrome, warm paper backgrounds, and softer red/green change colors. Built for a general audience reviewing prose.
- `paper` — warm light editorial. **Default for new visitors.**
- `paper dark` — warm dark editorial

**Code · monospace** — the original developer-friendly themes (monospace everywhere). Unchanged from before.
- `auto` — follows `prefers-color-scheme` (light/dark)
- `light` — force light · `dark` — force dark
- `nord` — cool blue-gray · `solarized dark` — warm amber/cyan · `dracula` — purple-heavy dark · `github` — clean GitHub light

Theme choice persists in `localStorage` (`differ-theme`). Existing users keep whatever they had selected; only first-time visitors get `paper`.

### Shareable URL

The URL hash updates automatically as you work, encoding the full session:

- Both text boxes
- Split mode
- All toggle states (smart matching, character-level, ignore case, ignore spacing)
- All merge decisions

Click **share link** in the toolbar to copy the current URL. Anyone opening it sees the exact same diff and merge state. The hash never reaches a server (it's a URL fragment), so the limit is just about keeping the link pasteable elsewhere — encoded state over ~32KB is dropped from the address bar and the share button is dimmed (hover for why) rather than producing a broken link.

### Stats

- Each input box: live word count and character count
- Diff output: total sections · changed · unchanged
- Toolbar: `N of M changes reviewed` progress bar (shown while a diff is active)
- Final version panel: count of undecided chunks

### Chrome extension

A Manifest V3 Chrome extension that lets you compare text from any web page without copy-pasting into the app manually.

**How it works:**
1. Select text on any page, right-click → **Differ > Set as Original**
2. Go to any page (same or different tab), select text, right-click → **Differ > Set as Modified**
3. Differ opens automatically with both texts loaded

**Popup:** Click the extension icon to see and edit captured texts, paste directly, or click **Open in Differ** at any time — even with empty fields.

**Google Docs suggestions:** When you're viewing a Google Doc, the popup shows a **Compare suggestions in Differ** button. It downloads the doc as `.docx` (which embeds open suggestions as Word tracked changes), parses it locally, and opens Differ with the **original** vs. the document **with all suggestions accepted**. Access to `docs.google.com` is an optional permission, requested only the first time you use it; the document is processed entirely in the browser and never uploaded anywhere.

**Technical details:**
- Texts persist in `chrome.storage.local` across tabs and browser restarts
- Full selection text is retrieved via the scripting API (avoids `selectionText` truncation)
- Content script injection fills the web app's textareas without modifying `index.html`
- Popup delegates tab creation to the background service worker to survive popup close
- Google Docs comparison parses the `.docx` export client-side (`extension/docx.js`: a tiny hand-rolled ZIP reader using `DecompressionStream` + an OOXML tracked-changes walker) — no Google API, no OAuth

To install locally: load `extension/` as an unpacked extension at `chrome://extensions` (enable Developer mode). For publishing to the Chrome Web Store, see [extension/PUBLISHING.md](extension/PUBLISHING.md).

---

## Architecture

A single HTML file with two bundled dependencies (no CDN, fully offline):

| Dependency | Purpose | Size |
|---|---|---|
| [compromise.js](https://github.com/spencermountain/compromise) v14.15.0 | Sentence and clause tokenization | 353 KB |
| [jsdiff](https://github.com/kpdecker/jsdiff) v8.0.4 | LCS-based sequence and word/char diff | 30 KB |

### Diff pipeline

```
splitText(text, mode)
  → segments[]

norm(s)
  → apply ignoreWS (collapse whitespace) and/or ignoreCase (lowercase)

computeDiff(segs1, segs2, fuzzy)
  → Diff.diffArrays() with optional norm-based comparator
  → for removed+added blocks:
      fuzzy off → positional pairing
      fuzzy on  → fuzzyPairBlocks() using segmentSimilarity()
  → for each changed row (both sides present):
      row.parts      = diffWords() or diffChars() with ignoreCase / ignoreWS normalization
      row.segIdx     = unique integer (merge state key)
      row.chunkCount = number of highlighted chunks
  → for removed, added, or changed-with-one-side rows:
      row.segIdx     = unique integer
      row.chunkCount = 1 (whole segment is one merge decision)

renderDiff(rows)
  → sticky column header: "Original"/"Suggested" + subtitles + "Keep all"/"Accept all" pills (data-allside)
  → renderHighlightedDiff(row.parts, side, row.segIdx)  // changed rows
  → makeHighlightSpan(text, ...)                         // removed/added rows
      each highlighted span: data-seg, data-chunk, data-side, data-base
      class from resolveSpanClass() reading mergeState
  → «/» accept-all buttons on all non-equal rows (hover-visible)
  → merge hint (removed on first merge action)

// On the empty state, renderDiff is skipped — compare() injects emptyStateHTML()
// (the editorial home) into #diff-output and adds the .is-home class so the page
// scrolls naturally instead of trapping the home in the diff area's scroll box.
```

After any decision change, `updateMergePanel()` re-renders the panel and calls `updateProgressBar()` (the `N of M reviewed` pill, via `reviewProgress()`) and `updateColHeaderBtns()` (the `Keep all`/`Accept all` active highlight). `acceptAllRows(side)` and the per-row `«`/`»` handler push `batchAll` / `batch` undo entries respectively.

### Merge state model

```js
mergeState = {
  [segIdx]: {
    [chunkIdx]: 'left' | 'right' | null   // null = unresolved
  }
}
undoStack        = [{ seg, chunk, prev }]      // single chunk
                 | { batch, seg, chunks[] }     // a whole row («/»)
                 | { batchAll, chunks: [{seg, chunkIdx, prev}] }  // Keep all / Accept all
savedMergeStates = { [mode]: { mergeState, undoStack } }  // per-mode persistence
```

Chunk index is computed identically on both sides by walking `row.parts`:
- `chunkIdx` increments after each `{added}` part, and after a `{removed}` not followed by `{added}`

### Shareable URL encoding

```js
// Hash contains base64(JSON.stringify({o, n, md, fz, ch, ic, iw, ms}))
// o/n = texts, md = mode, fz/ch/ic/iw = toggle booleans, ms = mergeState
// Decoded on load → texts set → compare() → mergeState restored
```

JSON keys are intentionally short to minimize URL length. Encoded payload is capped at `HASH_MAX` (32KB); over that the hash is omitted from the URL and the share button shows it can't be shared. No compression yet — that's the lever for fitting larger comparisons.

### Similarity function (fuzzy mode)

```
segmentSimilarity(a, b) =
  0.6 × jaccardSimilarity     // word set overlap
  0.2 × firstWordBonus        // 1 if first words match, else 0
  0.2 × lengthRatio           // min(wA, wB) / max(wA, wB)

Threshold: 0.25
```

### Theme system

Themes are JS objects of CSS custom property overrides applied to `document.documentElement.style`. `auto` reads `window.matchMedia('(prefers-color-scheme: light)')` and applies the matching theme, updating live when the system preference changes. Choice persists in `localStorage` as `differ-theme` (default `paper`). The CSS `:root` block is a FOUC fallback only (it mirrors `paper`) — the JS `THEMES` object is the source of truth.

Beyond colors, the token set carries **typography and layout** so the "reading" themes can be genuinely editorial rather than just recolored:

- `--font-body` — the reading face (serif for the paper themes, the monospace stack for the code themes); used by the textareas, diff cells, merged text, headings, hero
- `--font-ui` — chrome/labels (sans-serif for paper, mono for code)
- `--logo` — wordmark color · `--radius` — component corner radius · `--on-accent` — text color on `--accent` backgrounds (so a near-white `--accent` like paper-dark's gets dark text, not white) · `--text-dim-strong` — a higher-contrast dim for small overline labels

A post-`THEMES` backfill loop fills `--font-body`/`--font-ui`/`--logo`/`--radius`/`--on-accent`/`--text-dim-strong` for any theme that didn't define them (i.e. the code themes), so they render exactly as before. Adding a new theme still requires only a new `THEMES` entry; supply the editorial tokens if you want the serif/sans treatment.

### Key design decisions

**Why compromise.js over `Intl.Segmenter`?**
`Intl.Segmenter` has a documented bug in Chrome and Firefox: abbreviations like "Mr.", "Dr.", "Jr." incorrectly trigger sentence breaks. compromise.js handles them correctly at ~132 KB gzip, no model download needed.

**Why jsdiff over difflib.js?**
Myers O(ND) is equivalent to LCS and produces identical output to Python's `difflib.SequenceMatcher`. The only `difflib.js` port was abandoned in 2012.

**Why not modify input boxes during merge?**
Input boxes are the source of truth. The merged result is assembled from the diff structure, keeping both originals available for re-comparison.

**Why save merge state per mode instead of warning on switch?**
No friction. Switching back restores decisions exactly. Text edits (which change segmentation) are the only thing that clears saved states.

**Why encode merge state in the URL?**
A shared link is a complete snapshot — the recipient sees the same diff and all decisions made so far. This enables async collaboration: share a half-merged doc, let someone finish it.

**Why an editorial default theme but keep all the developer themes?**
The original look ("terminal" — monospace, dark, dense) reads as "developer tool" and turns off the general audience this tool is also for. `paper` makes the default friendly while the code/monospace themes stay one click away (and untouched) for people who prefer them. The token system carries fonts/radii too, so "reading" themes are truly editorial rather than recolored.

**Why keep the final-version panel as a sticky footer instead of an in-flow card?**
The mockup ("Direction A") put the assembled result in a card below the diff. A sticky footer keeps the result in view while you scroll a long diff, and moving it would have touched the resize, edit-bar, and share-link plumbing for little gain. It got the editorial restyle ("your final version" + hint) in place.

---

## Development

```
differ/
├── index.html              # entire application (self-contained, no build step)
├── analytics.js            # event tracking wrapper (Aptabase)
├── compromise.min.js       # NLP tokenizer (bundled)
├── diff.min.js             # diff engine (bundled)
├── manifest.json           # PWA manifest
├── sw.js                   # service worker (offline cache)
├── icon.svg                # app icon (vector)
├── icon-192.png            # app icon 192×192
├── icon-512.png            # app icon 512×512
├── icon-maskable-512.png   # app icon (maskable, Android adaptive)
├── icon-maskable.svg       # maskable icon (vector)
├── samples.js              # sample text pairs (always loaded; dropdown with ?samples)
├── og-image.png            # Open Graph preview image (1200×630)
├── robots.txt              # crawler directives
├── sitemap.xml             # sitemap for search engines
├── CNAME                   # custom domain for GitHub Pages (differapp.com)
├── extension/              # Chrome extension (Manifest V3)
│   ├── manifest.json       # extension manifest
│   ├── background.js       # service worker (context menus, tab orchestration)
│   ├── content.js          # injected into differ to fill textareas
│   ├── docx.js             # client-side .docx reader (ZIP + OOXML tracked changes) for Google Docs suggestions
│   ├── popup.html/css/js   # extension popup UI
│   ├── icons/              # extension icons (16, 48, 128px)
│   ├── store/              # Chrome Web Store listing assets
│   │   ├── description.txt # store listing copy (short + full)
│   │   └── privacy-policy.md # privacy policy
│   └── PUBLISHING.md       # step-by-step publishing guide
├── todo.md                 # feature roadmap
└── README.md               # this file
```

Open `index.html` directly in a browser. No build step, no server needed. A "try a sample" button on the empty state loads a generic demo. Add `?samples` to the URL to show a dropdown with additional sample text pairs for testing. For PWA install (Add to Home Screen), serve via `localhost` or HTTPS.

---

## Roadmap

See [todo.md](todo.md). Key remaining items:

- **Editorial redesign — Phase 2**: a "one at a time" guided review mode (walk through each change like a Google-Docs suggestion queue), a view switcher between it and the current "side by side" view, and a per-section "Review" deep link. Phase 1 (editorial `paper` theme + default, editorial home, review-strip restyle, progress bar, Keep all / Accept all) shipped; Phase 2 is designed but not built — see the plan file referenced in `todo.md`.
- Native iOS app with Share Sheet integration
- App naming — "differ" didn't resonate with a non-technical tester; needs broader input
