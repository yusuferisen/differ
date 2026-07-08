# differ — roadmap

## Research
- [x] ~~Semantic change classification~~: investigated — compromise.js can detect entity types (dates, names, numbers, places, money) in changed spans, but the labels don't help editors decide which version to keep. Won't do.

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
- [x] Editable merge: pencil icon (✎) on unresolved conflicts in the merge panel + tap-to-edit on resolved text. Opens a slim edit bar between header and content. Custom text shown in purple. Integrates with undo, hash persistence, and mode switches.

## Themes
- [x] Theme picker: auto/light/dark + named themes (nord, solarized dark, dracula, github) via dropdown button
- [x] Editorial "paper" themes (`paper` light + `paper-dark`) — serif reading face (Charter), sans UI chrome, warm paper backgrounds, softer red/green. `paper` is the default for new visitors; existing users keep their saved theme; the code/monospace themes are untouched. Theme tokens extended with `--font-body`/`--font-ui`/`--logo`/`--radius`/`--on-accent`/`--text-dim-strong`, backfilled for the legacy themes.

## Editorial redesign (general-audience UX)
Origin: a Claude Design session produced "Direction A" (side-by-side, softened) and "Direction B" (one change at a time) mockups. Plan file: `~/.claude/plans/i-worked-on-a-delightful-lovelace.md` (has the full Phase 2 spec, file:line pointers, decisions, and deviations). Bundle reference files are described in the plan.

**Phase 1 — done**
- [x] Editorial `paper` / `paper-dark` themes + token system (see Themes above)
- [x] Editorial empty state: hero ("See what changed. / Pick what stays."), 3 example cards (resume / AI rewrite / proofread), "How Differ works" 3-step; rendered into `#diff-output` when empty; toolbar + final-version panel hidden until there's a real diff; `#diff-output.is-home { overflow: visible }` so the page scrolls naturally
- [x] Side-by-side restyle ("Direction A"): paper styling throughout the review screen; column headers relabeled "Original"/"Suggested" with italic subtitles; **Keep all / Accept all** pills in the column headers (toggle + active-state highlight; one `batchAll` undo step); toolbar turned into a review strip with an `N of M changes reviewed` progress bar (`reviewProgress()` / `updateProgressBar()`) + a filled `copy result` pill (moved out of the merge-panel header) + ghost-pill share / clear / show-all; final-version panel header gets a subtitle ("your final version" + hint); friendlier merge-hint copy; mobile rules for all the new chrome
- [x] Kept the existing dev themes byte-for-byte (backfill loop); `--on-accent` token so a near-white `--accent` (paper-dark) gets dark text

**Phase 2 — done**
- [x] `enumerateChunks(rows)` helper — ordered actionable chunks `{segIdx, chunkIdx, kind: 'replace'|'insert'|'delete', before, after}`, derived from `currentRows` with the same chunk-index walk used by `renderHighlightedDiff`/`computeMergedParts`. `reviewProgress()` now shares this walk.
- [x] `chunkContext(rows, segIdx, chunkIdx)` — `{before, after}` ≈140-char surrounding-text snippets trimmed at sentence boundaries (`trimContextToBoundary` + neighbor-row walk).
- [x] "One at a time" wizard view (Direction B): stepper dots colored by decision (clay / forest / purple), stage card with dim context + struck old → new + `{Change|Add|Remove} — change N of M` microcopy, three choice cards adapted to chunk kind — `Keep / Use new / Write my own` for replace, `Keep it / Remove it / Write my own` for delete, `Leave it out / Add it / Write my own` for insert (the right card on delete and the left card on insert show the chunk text struck through; the custom card reuses the `{custom, side}` mergeState shape via the inline `g-custom-bar`). Previous / Skip nav, a running final-version preview pinned at the bottom showing unresolved chunks as the new version (so unresolved deletes are omitted, not kept), and a done screen (review again / copy final text). 0-changes case shows the "identical / nothing to review" state instead of an empty wizard.
- [x] View switcher in the review header: **side by side ⇄ one at a time**, persisted as `localStorage` `differ-view` (default `"side"`). Switching re-renders the post-diff area from the same `currentRows` + `mergeState` (lossless either way; not in the share-link hash since `ms` carries decisions).
- [x] Per-section "review →" affordance on Side-by-side rows: small ghost pill that appears on hover (always visible on touch). Click → switches to guided at that section's first chunk via `enumerateChunks` lookup.
- Default review mode stays **side by side** for new visitors; the home → review state separation stayed lighter than the bundle's `app.jsx` (inputs remain above review chrome).
- Not doing: "Direction C" (unified inline / Track-Changes popovers — user disliked it); any change to segmentation / smart matching / jsdiff usage / the `mergeState` model.

**Wrap-up**
- [x] Bumped `sw.js` cache version to `differ-v9`
- [x] Analytics events: `view_switch { view }` on every flip; `guided_complete { total, reviewed }` the first time the user advances past the last chunk; `copy_merge { source: 'guided' }` from the wizard's copy buttons
- [x] README updated for the Phase 1 redesign

## Pre-launch
- [x] Sample/placeholder text: dropdown with multiple sample scenarios gated behind ?samples query param; generic sample always available via "try a sample" button

## Publishing / distribution
- [x] Mobile-friendly layout + unified view (stacked panels, single-column diff, touch-friendly controls)
- [x] Web app compatibility (so it can be saved as an app from Chrome browsers)
- [x] Responsive breakpoints for tablet/narrow viewports
- [x] Fully offline mode (bundle compromise.js + jsdiff inline, no CDN dependency)
- [x] Deploy as static site (GitHub Pages + custom domain differapp.com)
  - [x] CNAME file for custom domain
  - [x] Service worker cache updated (v4, added maskable icon + samples.js)
  - [x] DNS A records pointing to GitHub Pages IPs (Namecheap)
  - [x] CNAME record for www → yusuferisen.github.io (Namecheap)
  - [x] GitHub Pages enabled (deploy from branch, main, root)
  - [x] DNS propagation + GitHub Pages DNS check passes
  - [x] Enforce HTTPS enabled in GitHub Pages settings
  - [x] Verify custom domain ownership (TXT record in Namecheap)
- [x] Shareable URL (base64-encoded hash, "link" button copies URL; `HASH_MAX` = 32 KB — over that, the hash is dropped from the address bar and the share button is dimmed with a tooltip rather than failing silently)
  - [ ] Compress the payload (`deflate-raw` + base64, with a version marker so old links still decode) to fit ~3× more text per URL — would need an async encode path; the `DecompressionStream` pattern is already in `extension/docx.js`

## Onboarding & discoverability
- [x] Tagline ("review changes in any text") below the app name in the header
- [x] Textarea placeholders guiding users to paste original / modified text
- [x] Enriched empty state with use cases and "try a sample" button (loads a generic sample)
- [x] Generic sample text (reading room scene) for public-facing demo; other samples remain behind `?samples`
- [x] Mode button tooltips describing each split mode on hover
- [x] Options dropdown language cleanup: "normalization" → "when matching", "character-level" → "show character changes"
- [x] Meta description rewritten for plain-language review framing
- [x] Clear button in toolbar with 8-second undo window (switches to "undo" after clearing, auto-expires)
- [x] Editable merge: pencil icon (✎) on unresolved conflicts in the merge panel + tap-to-edit on resolved text. Opens a slim edit bar between header and content. Custom text shown in purple. Integrates with undo, hash persistence, and mode switches.

## Splitting modes review
- [x] Clause mode is not obviously different from sentence mode to non-technical users; line mode often produces identical results to paragraph mode. Solution: paragraph and sentence remain as primary buttons; clause and line moved behind a "more" dropdown to reduce cognitive load while keeping all modes accessible.

## Naming
- [ ] "differ" didn't resonate with a non-technical tester — the name felt meaningless without context. Evaluate whether the app needs a different name. This likely needs input from multiple people; add to discussion list.

## Analytics & event tracking
- [x] Cloudflare Web Analytics — privacy-friendly visitor tracking (page views, unique visitors, countries, referrers, browser/OS, Core Web Vitals). Zero cookies, no consent banner. Beacon token added to `index.html`.
- [x] Event tracking for user interactions — Cloudflare Web Analytics does not support custom events. Integrated Aptabase (privacy-friendly, hosted) via a platform-agnostic wrapper (`analytics.js`). Tracks 10 event types covering the full funnel: `page_view` → `diff_performed` → `copy_merge` / `share_link`. See [ANALYTICS.md](ANALYTICS.md) for full details.

## Mobile app
- [ ] Despite the PWA and mobile-responsive layout, the experience still isn't great on phones. Explore building a native iOS app. Key considerations from initial assessment:
  - **Strongest case for native**: Share Sheet integration (select text in any app → share to Differ) is the killer feature a web app can't replicate. Also: Spotlight search, haptic feedback on merge decisions, App Store discoverability.
  - **Architecture challenge**: compromise.js (NLP sentence/clause splitting) has no Swift equivalent. Options: (a) port the tokenizer, (b) use a WKWebView bridge for the NLP layer, or (c) ship a simpler MVP with line-mode only (no NLP dependency) and layer in sentence/clause later.
  - **Suggested MVP scope**: two text fields → line-mode diff only → view-only (no merge) → Share Sheet extension for text capture. Add sentence/clause modes and merge UX as follow-ups.
  - **Effort**: not a single-session task. The diff viewer, merge interaction model (chunk selection + undo stack), and Share Extension (separate target, app groups) each need iterative work.

## Monetization
Goal: cover costs and make some side income — not building a business. No backend, no accounts, no subscriptions. All current features stay free.

- [ ] **Tip jar**: add a Buy Me a Coffee or Ko-fi link (footer or after completing a merge). Near-zero effort, worth doing regardless of other options.
- [ ] **Pro features (one-time purchase)**: use LemonSqueezy or Gumroad for license keys, unlock features client-side. Target price $5–8 one-time. Candidate pro features:
  - [ ] File upload — drag in `.txt`, `.docx`, or `.pdf` files instead of copy-pasting. Most compelling upgrade; removes real friction for longer documents.
  - [ ] Export — save the diff view as a styled PDF or HTML document. Useful for editors, teachers, legal review.
  - [ ] Comparison history — store past comparisons in IndexedDB, revisit later.
  - [ ] Batch mode — compare multiple document pairs in one session.
- [ ] **iOS App Store** (later): paid app ($3–5 one-time) if/when the native app is built. App Store is a natural payment channel.

Decided against for now:
- Ads: not worth it until there's meaningful traffic.
- Subscriptions: overkill for a static client-side tool.
- Gating existing features: would feel like a downgrade to current users.

## Chrome extension
- [x] Context-menu extension (lives in `extension/` subdirectory): select text on any web page → right-click → "Set as Original" or "Set as Modified" → opens differ with both texts pre-loaded
  - [x] Manifest V3 with contextMenus, storage, scripting permissions
  - [x] Service worker: context menu registration, auto-open on pair completion
  - [x] Content script injection into specific tab (fills `#text-old` / `#text-new`)
  - [x] Popup: Original + Modified textareas, "Open in Differ" button, dark theme
  - [x] Icons generated from main app icon (16, 48, 128px)
- [x] Google Docs suggestions: on a `docs.google.com/document/...` page, popup shows "Compare suggestions in Differ" → downloads the doc as `.docx`, parses tracked changes client-side (`docx.js`: hand-rolled ZIP reader + OOXML walker, no deps/OAuth), opens differ with original vs. all-suggestions-accepted. Optional `docs.google.com` host permission requested on first use.
  - [x] Verified in a real logged-in browser — the credentialed `.docx` fetch authenticates fine from the extension origin
  - [ ] Reliably detect "has open suggestions" without downloading (currently shows on any doc, reports "no suggestions" after fetch) — not feasible via DOM (canvas-rendered); would need a cheap signal
  - extracted text is plain runs only — tables/lists/headers-footers lose structure; not worth handling (out of scope for a text-diff app)
