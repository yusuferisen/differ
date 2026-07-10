# differ

A browser-based text review and merge tool. Paste two versions of any text to see exactly what changed — at the sentence, paragraph, clause, or line level — with word- or character-level inline highlighting. Then interactively build a merged result.

**[differapp.com](https://differapp.com)** — no server, no installation. Installable as a web app from Chrome, Edge, or Safari. Also available as a [Chrome extension](#chrome-extension) for comparing text across any web page.

Status: see [`PROGRESS.md`](PROGRESS.md).

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

Visit **[differapp.com](https://differapp.com)** — or open `web/index.html` locally.

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

### Review modes

Two ways to walk through the same diff — toggle from the **side by side ⇄ one at a time** switch in the toolbar. The choice persists in `localStorage` (`differ-view`, default `side`); switching mid-flow is lossless because both modes render from the same `currentRows` + `mergeState`.

- **Side by side** (the default) — the two-column diff with click-to-pick highlights, `«`/`»` row buttons, `Keep all` / `Accept all` pills, and the sticky "your final version" panel. Each changed row also surfaces a small **review →** affordance that switches to one-at-a-time focused on that section.
- **One at a time** — a guided wizard. Stepper dots across the top (colored by decision: clay = original, forest = new, purple = custom); a stage card showing the change in its surrounding context (`…before` + struck old `→` new + `after…`); three choice cards adapted to the chunk kind — **keep / use new / write my own** on a replace, **keep it / remove it / write my own** on a delete, **leave it out / add it / write my own** on an insert. The "remove it" and "leave it out" cards show the affected text struck through to make the dropped content visible. The "write my own" card opens an inline textarea that round-trips through the same `{custom, side}` mergeState as the side-by-side edit bar. Previous / skip nav; a running final-version preview pinned at the bottom (unresolved chunks render as if the new version were accepted — so an unresolved delete is omitted rather than kept); and a done screen with **copy final text** when you reach the end. The "Identical / nothing to review" state replaces the wizard when there are no changes.

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

A single self-contained HTML file with two vendored dependencies (compromise.js for NLP tokenization, jsdiff for the LCS diff), fully offline, no build step. The diff pipeline (`splitText` → `computeDiff` → `renderDiff`), the per-chunk `mergeState` model, the shareable-URL encoding, the fuzzy-similarity function, the theme token system, and the PWA/service-worker layer are documented in **[docs/architecture.md](docs/architecture.md)**. The rationale behind the key choices (compromise over `Intl.Segmenter`, jsdiff over difflib, URL-encoded merge state, editorial default theme, …) lives in **[docs/DECISIONS.md](docs/DECISIONS.md)**. A skimmable present-state overview with diagrams is in **[docs/OVERVIEW.md](docs/OVERVIEW.md)**.

---

## Development

A monorepo, one folder per surface. Root holds only repo-wide files; each surface
carries its own `CLAUDE.md` build/run/test contract.

```
differ/
├── README.md · PROGRESS.md · CLAUDE.md   # front door · live checklist+status · repo conventions
├── .github/workflows/pages.yml           # deploys web/ to GitHub Pages
├── web/                                   # the static site (a surface)
│   ├── index.html            # entire application (self-contained, no build step)
│   ├── analytics.js · samples.js
│   ├── compromise.min.js · diff.min.js    # vendored deps (NLP tokenizer + jsdiff)
│   ├── manifest.json · sw.js · icon*.{svg,png} · og-image.png   # PWA + SEO assets
│   ├── robots.txt · sitemap.xml · CNAME   # crawler + custom-domain files
│   ├── ANALYTICS.md · SITE-PUBLISHING-PLAYBOOK.md
│   └── CLAUDE.md             # web build/run/deploy contract
├── extension/                             # Chrome extension, MV3 (a surface)
│   ├── manifest.json · background.js · content.js · popup.{html,css,js}
│   ├── docx.js              # client-side .docx reader for Google Docs suggestions
│   ├── icons/ · store/      # extension icons + Chrome Web Store listing assets
│   ├── PUBLISHING.md        # step-by-step publishing guide
│   └── CLAUDE.md            # extension build/run/test contract
└── docs/                                  # on-demand planning docs
    ├── PRD.md · ROADMAP.md · OVERVIEW.md · JOURNAL.md · DECISIONS.md
    ├── architecture.md      # engineering contract
    └── attic/todo.md        # retired original roadmap (kept for the record)
```

Open `web/index.html` directly in a browser to run — no build step, no server needed. A "try a sample" button on the empty state loads a generic demo; add `?samples` to the URL for a dropdown of additional sample pairs. For PWA install (Add to Home Screen), serve `web/` via `localhost` or HTTPS. The site deploys to [differapp.com](https://differapp.com) automatically when a push to `main` touches `web/**` (GitHub Actions, `.github/workflows/pages.yml`).

---

## Roadmap

The live checklist is [`PROGRESS.md`](PROGRESS.md); plan prose for unshipped work is in [`docs/ROADMAP.md`](docs/ROADMAP.md). Key remaining items:

- URL payload compression (fit ~3× more text per share link)
- Native iOS app with Share Sheet integration
- App naming — "differ" didn't resonate with a non-technical tester; needs broader input
- Monetization — tip jar and optional one-time pro features (file upload, export)
