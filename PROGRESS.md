<!--
  PROGRESS.md — the CURSOR: autopilot state & handoff file (repo root).
  Injected into every session. Sections are OVERWRITTEN, never appended.
  History lives in docs/JOURNAL.md. Doc contract: docs is on-demand; this file routes.
-->

# Project Progress

- **Project:** differ — browser-based text review & merge tool ([differapp.com](https://differapp.com))
- **Target milestone:** Public launch — **reached**; now in maintenance + optional post-launch backlog
- **Status:** `milestone-reached`
- **Updated:** 2026-07-08

---

## Reference docs (the router — `docs/` files don't auto-load)

- **PRD (intent):** `docs/PRD.md` _(placeholder — intent lives in README + this file; see DECISIONS)_
- **Roadmap (future — plan prose for unshipped work):** `docs/ROADMAP.md`
- **Overview (present — diagrams + current user stories):** `docs/OVERVIEW.md`
- **Journal (past — append-only per-phase narrative):** `docs/JOURNAL.md`
- **Architecture (engineering contract):** `docs/architecture.md`
- **Decisions log:** `docs/DECISIONS.md`
- **Analytics reference:** `ANALYTICS.md` · **Publishing playbook:** `SITE-PUBLISHING-PLAYBOOK.md`
- **Surfaces:** web app at repo root (`index.html`, no build) · Chrome extension in `extension/` (`extension/PUBLISHING.md` = Web Store guide)

---

## Roadmap

- [x] **Phase 1 — Core diff engine**
  - [x] 1.1 Side-by-side diff panels
  - [x] 1.2 Word-level inline highlighting within changed pairs
  - [x] 1.3 Sentence splitting via compromise.js (abbreviation-aware)
  - [x] 1.4 Paragraph splitting
  - [x] 1.5 Line splitting
  - [x] 1.6 Clause-level splitting (compromise clause segmentation, short-clause merging)
  - [x] 1.7 Character-level diff mode toggle
  - [x] 1.8 Fuzzy segment matching (Jaccard + first-word + length-ratio, greedy pairing)
  - [x] 1.9 Whitespace-preserving segmentation (splitText returns {text, pre}; merged output keeps paragraphs/blank lines/indentation)
- [x] **Phase 2 — Review & merge UX**
  - [x] 2.1 Auto-compare on type/paste (debounced 180ms) + on mode/fuzzy change
  - [x] 2.2 Merge mode: click a highlighted chunk on either side to pick that version; «/» whole-row accept; click-again to unset
  - [x] 2.3 Merged-result output ("your final version" sticky panel) with copy result
  - [x] 2.4 Ignore-whitespace and ignore-case toggles (ignore-case on by default)
  - [x] 2.5 Alt+M to cycle split modes; per-mode merge-state persistence
  - [x] 2.6 Persist preferences in localStorage; URL hash takes precedence when present
  - [x] 2.7 Options dropdown (char-level, smart matching, ignore case/spacing) with active indicator
  - [x] 2.8 Show-changed-only / show-all toggle (default changed-only)
  - [x] 2.9 Plain-language UI copy pass for a general audience
  - [x] 2.10 Editable merge: pencil edit bar on conflicts + tap-to-edit resolved text; custom text in purple; undo/hash-aware
  - [x] 2.11 Undo stack (single / batch-row / batch-all = one step each; up to 20)
- [x] **Phase 3 — Themes**
  - [x] 3.1 Theme picker: auto/light/dark + nord/solarized-dark/dracula/github
  - [x] 3.2 Editorial "paper" / "paper-dark" themes + token system (--font-body/-ui, --logo, --radius, --on-accent, --text-dim-strong); paper is default for new visitors
- [x] **Phase 4 — Editorial redesign (general-audience UX)**
  - [x] 4.1 Editorial empty state (hero + example cards + "How Differ works"); toolbar/panel hidden until a real diff
  - [x] 4.2 Direction A: side-by-side restyle; Original/Suggested headers; Keep all / Accept all pills; review-strip progress bar
  - [x] 4.3 enumerateChunks + chunkContext helpers (ordered actionable chunks + surrounding-text snippets)
  - [x] 4.4 Direction B: "one at a time" wizard (stepper dots by decision, kind-adapted choice cards, running preview, done screen)
  - [x] 4.5 View switcher side-by-side ⇄ one-at-a-time (persisted `differ-view`; lossless, shares currentRows + mergeState)
  - [x] 4.6 Per-section "review →" affordance jumping into the wizard at that chunk
- [x] **Phase 5 — Publishing, PWA & distribution**
  - [x] 5.1 Mobile-friendly / responsive layout; unified stacked view
  - [x] 5.2 Fully offline PWA (vendored compromise.js + jsdiff, manifest, service worker)
  - [x] 5.3 Deploy as static site (GitHub Pages, main/root) + custom domain differapp.com (CNAME + Namecheap DNS + HTTPS)
  - [x] 5.4 Shareable URL (base64 hash of full session; HASH_MAX 32KB with graceful overflow on the share button)
- [x] **Phase 6 — Onboarding & discoverability**
  - [x] 6.1 Tagline, textarea placeholders, enriched empty state, "try a sample" (generic sample public; others behind ?samples)
  - [x] 6.2 Mode/option tooltips + plain-language option labels
  - [x] 6.3 Clear button with 8-second undo window
  - [x] 6.4 SEO: meta description, canonical, OG/Twitter tags, robots.txt, sitemap.xml, og-image
- [x] **Phase 7 — Analytics**
  - [x] 7.1 Cloudflare Web Analytics beacon (cookieless aggregate traffic)
  - [x] 7.2 Aptabase custom events via provider-agnostic wrapper (`analytics.js`); full funnel (see ANALYTICS.md)
- [x] **Phase 8 — Chrome extension (Manifest V3)**
  - [x] 8.1 Context-menu capture (Set as Original / Modified) → opens differ with both texts loaded
  - [x] 8.2 Popup (editable captured texts, paste, Open in Differ), content-script injection, background tab orchestration
  - [x] 8.3 Google Docs suggestions: `.docx` export + client-side OOXML tracked-changes parse (no OAuth); original vs all-suggestions-accepted
  - [x] 8.4 Web Store listing assets (`extension/store/`) + publishing guide
- [x] 🏁 **MILESTONE: Public launch** — site live, PWA installable, analytics wired, extension built
- [ ] **Phase 9 — URL payload compression** — deflate-raw + base64 with a version marker so old links still decode (fit ~3× more text per URL); async encode path (see docs/ROADMAP.md)
- [ ] **Phase 10 — App naming** — "differ" didn't resonate with a non-technical tester; needs broader input before any change
- [ ] **Phase 11 — Monetization** (cover costs; no backend/accounts/subscriptions; all current features stay free)
  - [ ] 11.1 Tip jar (Buy Me a Coffee / Ko-fi) — near-zero effort, worth doing regardless
  - [ ] 11.2 Pro one-time unlock (LemonSqueezy/Gumroad license, client-side): file upload / export / history / batch
- [ ] **Phase 12 — Native iOS app** — Share-Sheet capture is the killer feature; NLP layer is the architecture challenge (port / WKWebView bridge / line-mode MVP). Not a single-session task.
- [ ] **Phase 13 — Extension: reliable "has open suggestions" detection** without downloading (currently shows on any doc, reports "no suggestions" after fetch) — no cheap DOM signal (canvas-rendered)

<!-- Deferred / won't-do (kept for the record — see docs/ROADMAP.md § Out of scope):
     semantic change classification, Direction C (unified inline / Track-Changes popovers), ads, subscriptions, gating existing features. -->

---

## Current Status

- **Current phase / sub-phase:** post-launch maintenance — v1 public launch reached (Phases 1–8)
- **State:** milestone-reached; open backlog is Phases 9–13, none started
- **Last completed:** 4.4 wizard "remove it / leave it out" cards — commit `c5b2263`
- **Build:** n/a (no build step — the repo *is* the deployed site) · **Tests:** n/a (no automated suite) · **Simulator-verified:** n/a (web)

---

## Next Concrete Action

> Pull the cheapest post-launch item: **11.1 tip jar** — add a Buy Me a Coffee / Ko-fi link (footer or post-merge), near-zero effort and independent of everything else. Alternatively, **Phase 9 URL compression** is the highest-leverage functional win (`deflate-raw` + base64 + version marker; the `DecompressionStream` pattern already exists in `extension/docx.js`).

---

## Open Decisions (reversible — defaults chosen, proceeding)

- **PRD placeholder** — no product-intent doc existed; chose a placeholder pointing at README/PROGRESS rather than fabricating intent → DECISIONS.md § PRD is a placeholder (adopt)
- **todo.md retired to `docs/attic/`** — content split into this checklist + ROADMAP prose → DECISIONS.md § todo.md split by /adopt
- **README engineering deep-dive extracted** to `docs/architecture.md` + `docs/DECISIONS.md`; README slimmed to front-door + pointers → DECISIONS.md § README extraction (adopt)

---

## Needs You (irreversible / load-bearing — halts the run)

- _none_

---

## Assumptions & Risks

- **No CI gate — push to `main` is the deploy.** A broken commit on `main` is live within ~a minute; there's no build to catch it. Sanity-check `index.html` in a browser before pushing.
- **Service-worker cache version.** Bump `CACHE` in `sw.js` whenever cached assets change, or returning visitors silently get stale JS/CSS/icons (network-first HTML mitigates only the shell).
- **Analytics keys are differ-specific.** The Cloudflare beacon token and Aptabase app key belong to this site; a fork must provision its own (see SITE-PUBLISHING-PLAYBOOK.md).
- **No automated tests.** Regression safety is manual — verify diff/merge/share flows by hand after changes to `index.html`.

---

## How to Resume

This file is the handoff. A fresh session should: read this top-to-bottom → do **Next Concrete Action** → on completion, check off the roadmap item, **overwrite** **Current Status** + **Next Concrete Action** (outgoing narrative → a new `docs/JOURNAL.md` entry), add any new **Open Decisions** one-liners (full rationale → `docs/DECISIONS.md`), commit, then continue or stop at the milestone. If **Needs You** is non-empty, STOP and surface those items.
