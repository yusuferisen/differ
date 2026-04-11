# differ

A browser-based text diff and merge tool. Compares two texts at the sentence, paragraph, clause, or line level — with word- or character-level inline highlighting within each changed pair — and lets you interactively build a merged result.

No server. No installation. Open `index.html` and start comparing.

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

```
open index.html
```

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

| Toggle | What it does | Default |
|---|---|---|
| **char mode** | Character-level highlighting instead of word-level within each changed pair | Off |
| **fuzzy matching** | Pairs segments by similarity instead of position — handles insertions in the middle correctly | Off |
| **ignore case** | Treats upper/lowercase as equal for matching and highlighting | **On** |
| **ignore ws** | Normalizes whitespace before comparison | Off |

### Merge mode

Activated automatically on the first tap of any highlighted word or `«`/`»` button.

- **Tap a highlighted word** on either side → accept that version for that diff chunk
- **Tap the other side** of the same chunk → flip the decision
- **Tap the same side again** → unset (back to unresolved)
- **`«` / `»`** buttons (hover a changed row) → accept the entire row left or right in one action
- **Undo** button (up to 20 steps, batch row-accept = 1 step)
- Switching split modes preserves merge decisions per mode — switching back restores them

### Merge result panel

Appears at the bottom on the first merge action.

- Live-updating assembled text
- **Unresolved chunks**: `{old|new}` inline (amber) if short ≤80 chars, or a two-line block with `← old` / `→ new` each clickable for long chunks
- Block-format conflicts can also be resolved directly in the panel
- **Copy** — always available; includes `{old|new}` placeholders for unresolved chunks. Button flashes green on copy.

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
- All toggle states (fuzzy, char mode, ignore case, ignore ws)
- All merge decisions

Click **link** in the toolbar to copy the current URL. Anyone opening it sees the exact same diff and merge state. If the encoded state exceeds ~8KB the button shows e.g. `9.2KB > 8KB max` instead.

### Stats

- Each input box: live word count and character count
- Diff output: total segments · changed · equal
- Merge panel: count of unresolved chunks

---

## Architecture

A single HTML file with two CDN dependencies:

| Dependency | Purpose | Gzip size |
|---|---|---|
| [compromise.js](https://github.com/spencermountain/compromise) | Sentence and clause tokenization | ~132 KB |
| [jsdiff](https://github.com/kpdecker/jsdiff) | LCS-based sequence and word/char diff | ~8 KB |

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
  → for each changed row:
      row.parts      = diffWords() or diffChars() with ignoreCase / ignoreWS normalization
      row.segIdx     = unique integer (merge state key)
      row.chunkCount = number of highlighted chunks

renderDiff(rows)
  → renderHighlightedDiff(row.parts, side, row.segIdx)
      each highlighted span: data-seg, data-chunk, data-side, data-base
      class from resolveSpanClass() reading mergeState
  → «/» accept-all buttons overlaid at row center (hover-visible)
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

Themes are JS objects of CSS custom property overrides applied to `document.documentElement.style`. `auto` clears all overrides and lets the `@media (prefers-color-scheme)` block handle it. Choice persists in `localStorage` as `differ-theme`.

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
├── index.html   # entire application (self-contained, no build step)
├── todo.md      # feature roadmap
└── README.md    # this file
```

Open `index.html` directly in a browser. Sample text is preloaded. No build step, no local server needed.

CDN links load compromise.js and jsdiff from unpkg. For offline use, both need to be bundled inline (see todo.md).

---

## Roadmap

See [todo.md](todo.md). Remaining items:

**UI / UX**
- Persist user preferences (split mode, toggle states) in localStorage
- Settings/Advanced panel to hide technical options from non-technical users
- Show changed rows only / show all toggle (default: changed only — important for long documents)
- Plain-language copy throughout ("5 decisions remaining" not "5 unresolved", "final draft" not "merge result")

**Research**
- Investigate semantic change classification using compromise.js (already loaded): label diff chunks by what kind of thing changed — number, date, name, sentiment, etc.

**Publishing**
- Mobile-friendly layout + unified single-column view
- Web app compatibility (installable from browser)
- Offline mode (bundle dependencies inline, no CDN)
- Deploy to GitHub Pages
