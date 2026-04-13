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
- [ ] Editable merge: currently users can only pick version A or B for each diff chunk. Add the ability to type custom replacement text — a free-text edit option alongside the two existing choices — so the tool works as a full editing aid, not just a picker. UX approach TBD.

## Themes
- [x] Theme picker: auto/light/dark + named themes (nord, solarized dark, dracula, github) via dropdown button

## Pre-launch
- [x] Sample/placeholder text: gated behind ?samples query param; dropdown with multiple sample scenarios; empty textareas by default

## Publishing / distribution
- [x] Mobile-friendly layout + unified view (stacked panels, single-column diff, touch-friendly controls)
- [x] Web app compatibility (so it can be saved as an app from Chrome browsers)
- [x] Responsive breakpoints for tablet/narrow viewports
- [x] Fully offline mode (bundle compromise.js + jsdiff inline, no CDN dependency)
- [x] Deploy as static site (GitHub Pages + custom domain differapp.com)
  - [x] CNAME file for custom domain
  - [x] Service worker cache updated (v3, added maskable icon)
  - [x] DNS A records pointing to GitHub Pages IPs (Namecheap)
  - [x] CNAME record for www → yusuferisen.github.io (Namecheap)
  - [x] GitHub Pages enabled (deploy from branch, main, root)
  - [ ] DNS propagation + GitHub Pages DNS check passes
  - [ ] Enforce HTTPS enabled in GitHub Pages settings
  - [ ] Verify custom domain ownership (TXT record in Namecheap)
- [x] Shareable URL (base64-encoded hash, "link" button copies URL, ~8KB limit)

## Onboarding & discoverability
- [ ] The app's purpose is unclear to newcomers who aren't already routinely comparing/editing text. The current landing state (empty textareas + placeholder) doesn't communicate what the tool does or why someone would use it. Need to add introductory language, usage tips, or a guided first-use experience so that first-time visitors understand the value without a walkthrough. UX approach TBD.

## Splitting modes review
- [ ] Clause mode is not obviously different from sentence mode to non-technical users; line mode often produces identical results to paragraph mode. Evaluate whether to: (a) create better sample texts that clearly showcase when each mode shines, (b) move clause and/or line modes behind an "advanced" settings area, or (c) remove them. Goal is to avoid confusing newcomers with modes that feel redundant.

## Naming
- [ ] "differ" didn't resonate with a non-technical tester — the name felt meaningless without context. Evaluate whether the app needs a different name. This likely needs input from multiple people; add to discussion list.

## Mobile app
- [ ] Despite the PWA and mobile-responsive layout, the experience still isn't great on phones. Explore building a lightweight native or hybrid mobile app for users who need to compare text on the go.

## Chrome extension
- [x] Context-menu extension (lives in `extension/` subdirectory): select text on any web page → right-click → "Set as Original" or "Set as Modified" → opens differ with both texts pre-loaded
  - [x] Manifest V3 with contextMenus, storage, scripting permissions
  - [x] Service worker: context menu registration, auto-open on pair completion
  - [x] Content script injection into specific tab (fills `#text-old` / `#text-new`)
  - [x] Popup: Original + Modified textareas, "Open in Differ" button, dark theme
  - [x] Icons generated from main app icon (16, 48, 128px)
