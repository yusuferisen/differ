# differ

A browser-based text diff and merge tool. Compares two texts at the sentence, paragraph, clause, or line level — with word- or character-level inline highlighting within each changed pair — and lets you interactively build a merged result.

**[differapp.com](https://differapp.com)** — no server, no installation. Installable as a web app from Chrome, Edge, or Safari. Also available as a [Chrome extension](#chrome-extension) for comparing text across any web page.

---

## What makes it different

Most diff tools operate on lines. differ splits text into **meaningful linguistic units** and aligns them intelligently. Within each changed pair it highlights the exact words (or characters) that differ. You can then tap any highlighted word to pick a side, build a merged result, and copy or share it.

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
| **line** | Splits on single newlines. Blank and whitespace-only lines are dropped. |

### Diff options

The **options** dropdown in the header contains comparison and normalization settings. The button highlights when any non-default setting is active.

| Toggle | What it does | Default |
|---|---|---|
| **character-level** | Character-level highlighting instead of word-level within each changed pair | Off |
| **smart matching** | Pairs sections by similarity instead of position — handles insertions in the middle correctly | Off |
| **ignore case** | Treats upper/lowercase as equal for matching and highlighting | **On** |
| **ignore spacing** | Normalizes whitespace before comparison | Off |

The **show all / changed only** button in the toolbar toggles unchanged rows in the diff output — hides unchanged sections to focus on changes. Default: changed only.

### Merge mode

Activated automatically on the first click of any highlighted word or `«`/`»` button.

- **Click a highlighted word** on either side → choose that version for that diff chunk
- **Click the other side** of the same chunk → flip the decision
- **Click the same side again** → unset (back to undecided)
- **`«` / `»`** buttons (hover any changed, removed, or added row) → choose the entire row left or right in one action; click again to unset
- **Removed/added rows** are also interactive — click or use `«`/`»` to keep or exclude a section that only exists on one side
- **Undo** button (up to 20 steps, batch row-accept = 1 step)
- Switching split modes preserves merge decisions per mode — switching back restores them

### Final version panel

Always visible at the bottom of the page, sticky while scrolling. The top edge is a drag handle — resize the panel vertically by dragging. Height persists across reloads.

- Live-updating assembled text using mode-appropriate delimiters (spaces between sentences/clauses, blank lines between paragraphs, newlines between lines)
- **Undecided chunks**: `{old|new}` inline (amber) if short ≤80 chars, or a two-line block with `← old` / `→ new` each clickable for long chunks
- Removed/added sections are included by default; exclude them via the diff table
- Block-format conflicts can also be resolved directly in the panel
- **Copy** — appears when a diff is active; includes `{old|new}` placeholders for undecided chunks. Button flashes green on copy.

### Themes

A **theme** dropdown button in the header offers two sections:

**Appearance** (follows or overrides system preference):
- `auto` — follows `prefers-color-scheme`
- `light` — force light
- `dark` — force dark (default when system is dark)

**Named themes:**
- `nord` — cool blue-gray
- `solarized dark` — warm amber/cyan
- `dracula` — purple-heavy dark
- `github` — clean GitHub light

Theme choice persists in `localStorage`.

### Shareable URL

The URL hash updates automatically as you work, encoding the full session:

- Both text boxes
- Split mode
- All toggle states (smart matching, character-level, ignore case, ignore spacing)
- All merge decisions

Click **share link** in the toolbar to copy the current URL. Anyone opening it sees the exact same diff and merge state. If the encoded state exceeds ~8KB the button shows "too long to share" instead.

### Stats

- Each input box: live word count and character count
- Diff output: total sections · changed · unchanged
- Final version panel: count of undecided chunks

### Chrome extension

A Manifest V3 Chrome extension that lets you compare text from any web page without copy-pasting into the app manually.

**How it works:**
1. Select text on any page, right-click → **Differ > Set as Original**
2. Go to any page (same or different tab), select text, right-click → **Differ > Set as Modified**
3. Differ opens automatically with both texts loaded

**Popup:** Click the extension icon to see and edit captured texts, paste directly, or click **Open in Differ** at any time — even with empty fields.

**Technical details:**
- Texts persist in `chrome.storage.local` across tabs and browser restarts
- Full selection text is retrieved via the scripting API (avoids `selectionText` truncation)
- Content script injection fills the web app's textareas without modifying `index.html`
- Popup delegates tab creation to the background service worker to survive popup close

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
  → renderHighlightedDiff(row.parts, side, row.segIdx)  // changed rows
  → makeHighlightSpan(text, ...)                         // removed/added rows
      each highlighted span: data-seg, data-chunk, data-side, data-base
      class from resolveSpanClass() reading mergeState
  → «/» accept-all buttons on all non-equal rows (hover-visible)
  → merge hint (removed on first merge action)
```

### Merge state model

```js
mergeState = {
  [segIdx]: {
    [chunkIdx]: 'left' | 'right' | null   // null = unresolved
  }
}
undoStack        = [{ seg, chunk, prev }]  // or { batch, seg, chunks[] }
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

JSON keys are intentionally short to minimize URL length. Limit: 8KB encoded.

### Similarity function (fuzzy mode)

```
segmentSimilarity(a, b) =
  0.6 × jaccardSimilarity     // word set overlap
  0.2 × firstWordBonus        // 1 if first words match, else 0
  0.2 × lengthRatio           // min(wA, wB) / max(wA, wB)

Threshold: 0.25
```

### Theme system

Themes are JS objects of CSS custom property overrides applied to `document.documentElement.style`. `auto` reads `window.matchMedia('(prefers-color-scheme: light)')` and applies the matching theme, updating live when the system preference changes. Choice persists in `localStorage` as `differ-theme`. The CSS `:root` block is a FOUC fallback only — the JS `THEMES` object is the source of truth.

All colors in the stylesheet are CSS variables — adding a new theme requires only a new entry in the `THEMES` object.

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

---

## Development

```
differ/
├── index.html              # entire application (self-contained, no build step)
├── compromise.min.js       # NLP tokenizer (bundled)
├── diff.min.js             # diff engine (bundled)
├── manifest.json           # PWA manifest
├── sw.js                   # service worker (offline cache)
├── icon.svg                # app icon (vector)
├── icon-192.png            # app icon 192×192
├── icon-512.png            # app icon 512×512
├── icon-maskable-512.png   # app icon (maskable, Android adaptive)
├── icon-maskable.svg       # maskable icon (vector)
├── samples.js              # sample text pairs (loaded with ?samples param)
├── CNAME                   # custom domain for GitHub Pages (differapp.com)
├── extension/              # Chrome extension (Manifest V3)
│   ├── manifest.json       # extension manifest
│   ├── background.js       # service worker (context menus, tab orchestration)
│   ├── content.js          # injected into differ to fill textareas
│   ├── popup.html/css/js   # extension popup UI
│   ├── icons/              # extension icons (16, 48, 128px)
│   ├── store/              # Chrome Web Store listing assets
│   │   ├── description.txt # store listing copy (short + full)
│   │   └── privacy-policy.md # privacy policy
│   └── PUBLISHING.md       # step-by-step publishing guide
├── todo.md                 # feature roadmap
└── README.md               # this file
```

Open `index.html` directly in a browser. No build step, no server needed. Add `?samples` to the URL to load a dropdown with sample text pairs for testing. For PWA install (Add to Home Screen), serve via `localhost` or HTTPS.

---

## Roadmap

See [todo.md](todo.md). Remaining items:

**Research**
- Investigate semantic change classification using compromise.js (already loaded): label diff chunks by what kind of thing changed — number, date, name, sentiment, etc.

**Publishing**
- DNS propagation + GitHub Pages DNS verification
- HTTPS enforcement and custom domain ownership verification (TXT record)
