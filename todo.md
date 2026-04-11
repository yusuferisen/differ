# differ — roadmap

## Research
- [ ] Semantic change classification: investigate whether compromise.js (already loaded) can label what *kind* of thing changed per diff chunk — number, date, name, place, sentiment, etc. — and whether surfacing these labels (e.g. "date changed", "name changed") is useful to non-technical users. Assess feasibility fully in-browser with no additional libraries. NLTK is Python-only and has no browser port; compromise.js covers NER, dates, values, and basic sentiment natively.

## Core diff engine
- [x] Side-by-side diff panels
- [x] Word-level inline highlighting within changed pairs
- [x] Sentence splitting via compromise.js (abbreviation-aware)
- [x] Paragraph splitting
- [x] Line splitting
- [x] Fuzzy segment matching (Jaccard similarity, greedy pairing)
- [x] Smart matching by first word / other heuristics (weighted: 60% Jaccard + 20% first-word + 20% length ratio)
- [x] Clause-level splitting (compromise.js clause segmentation, short-clause merging)
- [x] Character-level diff mode toggle (switches all changed pairs from word to char granularity)

## UI / UX
- [x] Auto-compare on type/paste (debounced 180ms)
- [x] Auto-compare on split mode change
- [x] Auto-compare on fuzzy toggle
- [x] Word/char stats per input box
- [x] Segment stats (total · changed · equal)
- [x] Equal rows dimmed, full opacity on hover
- [x] Identical texts notice
- [x] Sticky column headers in diff output
- [x] Suppress diff when either box is empty/whitespace
- [x] Sample text preloaded for testing
- [x] Merge mode: click a highlighted word/phrase on either side to select that version
- [x] Merged result output area with "Copy" button
- [x] Ignore whitespace toggle
- [x] Ignore case toggle (on by default)
- [x] Keyboard shortcut to cycle split modes (Alt+M)
- [x] Persist user preferences in localStorage: split mode, fuzzy, char mode, ignore case, ignore ws (theme already persists); URL hash takes precedence when present
- [x] "Options" dropdown — hide smart matching, character-level, ignore case, ignore spacing behind a dropdown menu to reduce visual noise; reuses theme picker dropdown pattern; options button shows active indicator when non-default settings are on
- [x] Show changed rows only / show all toggle in toolbar (default: changed only); important for long documents like CVs where equal rows dominate
- [x] Plain-language UI copy: "5 to decide" not "5 unresolved", "final version" not "merge result", "smart matching" not "fuzzy matching", "sections" not "segments", review all technical labels for general-audience friendliness

## Themes
- [x] Theme picker: auto/light/dark + named themes (nord, solarized dark, dracula, github) via dropdown button

## Publishing / distribution
- [ ] Mobile-friendly layout + unified view (stacked panels, single-column diff, touch-friendly controls)
- [ ] Web app compatibility (so it can be saved as an app from Chrome browsers)
- [ ] Responsive breakpoints for tablet/narrow viewports
- [ ] Fully offline mode (bundle compromise.js + jsdiff inline, no CDN dependency)
- [ ] Deploy as static site (GitHub Pages / Cloudflare Pages / Netlify)
- [x] Shareable URL (base64-encoded hash, "link" button copies URL, ~8KB limit)
