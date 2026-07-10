# Journal — past, append-only

> One entry per phase/session: what shipped, gotchas, commit anchors. Never
> auto-loaded; grows freely. Newest entries last.
>
> Entries below the divider were **migrated from `todo.md` and the README by
> `/adopt` 2026-07-08** — dates are approximate (reconstructed from git history);
> they preserve the shipped-phase narrative that the checklist and OVERVIEW
> intentionally compress.

## Migrated history (pre-adoption)

### Core diff engine
Side-by-side panels with word-level inline highlighting within changed pairs.
Four split modes — paragraph (blank lines), sentence (compromise.js,
abbreviation-aware, the default), clause (compromise clause segmentation with
short-clause <4-words merged into predecessors), line (single newlines). Fuzzy
segment matching pairs blocks by weighted similarity (60% Jaccard + 20%
first-word + 20% length ratio, threshold 0.25) instead of position, handling
mid-document insertions. Character-level diff toggle switches all changed pairs
from word to char granularity.

### Whitespace preservation
`splitText` returns `{text, pre}` where `pre` is the original leading whitespace;
the merged output re-emits it so multi-paragraph documents stay multi-paragraph.
Known caveat kept in the record: in sentence/clause mode the segment text comes
from compromise and may have internal whitespace normalized (clause-merging joins
with a single space), so intra-segment runs can collapse — breaks *between*
segments are preserved either way. Two-level model is the noted escape hatch.
(commit `a35b2fd`.)

### Review & merge UX
Auto-compare on type/paste (debounced 180 ms) and on mode/fuzzy change. Merge
mode activates on the first click of any highlighted chunk, «/» row button, or
Keep all/Accept all: click a side to pick that version, the other side to flip,
the same side again to unset. Per-mode merge-state persistence; Alt+M cycles
modes. Preferences persist in localStorage (URL hash wins when present). Options
dropdown hides char-level / smart matching / ignore case / ignore spacing with an
active indicator. Show-changed-only / show-all toggle (default changed-only) —
important for CV-length docs where equal rows dominate. Plain-language copy pass
("5 to decide", "final version", "smart matching", "sections"). Editable merge:
pencil edit bar on conflicts + tap-to-edit resolved text, custom text shown in
purple, integrated with undo / hash / mode switches. Undo stack up to 20 steps
(single / batch-row / batch-all each count as one). (commit `d8bed86`, and
"more" dropdown for clause/line modes `5999f5d`.)

### Themes
Theme picker: auto/light/dark plus named nord / solarized-dark / dracula /
github. Then the editorial "paper" / "paper-dark" themes — serif reading face
(Charter), sans UI chrome, warm paper backgrounds, softer red/green. `paper`
became the default for new visitors; existing users keep their saved theme; the
code/monospace themes stayed byte-for-byte. Token system extended with
`--font-body`/`--font-ui`/`--logo`/`--radius`/`--on-accent`/`--text-dim-strong`,
backfilled for legacy themes. (commit `50cabae`.)

### Editorial redesign (general-audience UX)
Origin: a Claude Design session produced "Direction A" (side-by-side, softened)
and "Direction B" (one change at a time) mockups.

**Phase 1** — editorial empty state: hero ("See what changed. / Pick what
stays."), three example cards (resume / AI rewrite / proofread), a "How Differ
works" 3-step, rendered into `#diff-output` when empty with `.is-home` so the
page scrolls naturally; toolbar + final-version panel hidden until a real diff.
Direction A restyle: paper styling throughout review; Original/Suggested column
headers with italic subtitles; Keep all / Accept all pills in the headers (one
`batchAll` undo step); toolbar turned into a review strip with an
`N of M changes reviewed` progress bar (`reviewProgress()` /
`updateProgressBar()`), a filled `copy result` pill, and ghost share/clear/
show-all pills; `--on-accent` token so a near-white `--accent` (paper-dark) gets
dark text. (commit `50cabae`.)

**Phase 2** — `enumerateChunks(rows)` produces ordered actionable chunks
`{segIdx, chunkIdx, kind, before, after}` from `currentRows` using the same
chunk-index walk as `renderHighlightedDiff`/`computeMergedParts`;
`reviewProgress()` shares it. `chunkContext()` returns ~140-char sentence-trimmed
surrounding snippets. "One at a time" wizard (Direction B): stepper dots colored
by decision (clay/forest/purple), a stage card with dim context + struck old →
new + `{Change|Add|Remove} — change N of M` microcopy, and three kind-adapted
choice cards — Keep / Use new / Write my own (replace), Keep it / Remove it /
Write my own (delete), Leave it out / Add it / Write my own (insert); the
remove/leave-out cards show the affected text struck through; the custom card
reuses the `{custom, side}` mergeState via an inline `g-custom-bar`. Previous /
Skip nav, a running final-version preview pinned at the bottom (unresolved chunks
render as the new version, so unresolved deletes are omitted not kept), and a
done screen. View switcher side-by-side ⇄ one-at-a-time persisted as
`differ-view` (default `side`); lossless because both render from the same
`currentRows` + `mergeState`; not in the share hash since `ms` carries decisions.
Per-section "review →" affordance on side-by-side rows jumps into the wizard at
that section's first chunk. Wrap-up: `sw.js` cache bumped to `differ-v9`;
analytics `view_switch` / `guided_complete` / `copy_merge {source:'guided'}`;
README updated. Not done: Direction C (unified inline / Track-Changes popovers —
disliked in testing); any change to segmentation / smart matching / jsdiff /
mergeState. (commits `e0ba8fb`, `c5b2263`.)

### Publishing, PWA & distribution
Mobile-friendly responsive layout with a unified stacked view. Fully offline PWA
(vendored compromise.js + jsdiff, `manifest.json`, `sw.js` with versioned
cache). Deployed as a static site on GitHub Pages (main / root, no CI) with
custom domain differapp.com — `CNAME` file, Namecheap DNS (four apex A records,
`www` CNAME → `yusuferisen.github.io`, TXT ownership verification), Pages DNS
check green, Enforce HTTPS. Shareable URL: base64 hash of the full session,
`HASH_MAX` raised to 32 KB with graceful overflow (hash dropped from the address
bar and share button dimmed with a tooltip rather than failing silently). Full
launch recipe captured in `SITE-PUBLISHING-PLAYBOOK.md`. (commit `77baea5`.)

### Onboarding & discoverability
Tagline, textarea placeholders, enriched empty state, generic "try a sample"
(other samples behind `?samples`), mode/option tooltips, plain-language option
labels, a clear button with an 8-second undo window. SEO: rewritten meta
description, canonical + Open Graph + Twitter tags (absolute URLs), `robots.txt`,
`sitemap.xml`, `og-image.png`. (commit `f796e8b`.)

### Analytics
Cloudflare Web Analytics beacon for cookieless aggregate traffic (page views,
visitors, countries, referrers, browser/OS, Core Web Vitals — no custom events).
Aptabase for custom events via a provider-agnostic wrapper (`analytics.js`,
exposing `init()`/`track()` with a queue so early calls buffer), lazy-importing
the SDK as ESM from jsDelivr. Full funnel `page_view → diff_performed →
copy_merge / share_link` plus interaction events; full inventory in
`ANALYTICS.md`. Gotcha: the Aptabase dashboard defaults to the Debug view;
production data is under Release (gear icon). Early attempt used the IIFE SDK path
which 404'd — switched to ESM dynamic import. (commits `a49f619`, `3c3f0d5`,
`b36508d`.)

### Chrome extension (Manifest V3)
Context-menu capture (select text → Set as Original / Set as Modified) opens
differ with both texts pre-loaded. Popup with editable captured texts, paste, and
Open in Differ; content-script injection fills the app's textareas; background
service worker owns tab creation so it survives popup close. Texts persist in
`chrome.storage.local`. Google Docs suggestions: on a Docs page the popup offers
"Compare suggestions in Differ" — downloads the `.docx` export and parses tracked
changes client-side (`extension/docx.js`: hand-rolled `DecompressionStream` ZIP
reader + OOXML walker, no deps/OAuth), opening original vs. all-suggestions-
accepted; verified the credentialed fetch authenticates from the extension
origin. Web Store listing assets in `extension/store/`. Known limitation:
extracted text is plain runs only (tables/lists/headers-footers lose structure).
(commit `e45425e`.)

---

## 2026-07-08 — `/adopt`: converged onto the canonical doc contract

Repo was born outside the pipeline (no `PROGRESS.md`, no `docs/`). Created the
canonical doc set: `PROGRESS.md` (cursor + single live checklist, Phases 1–13
with a 🏁 public-launch milestone), `docs/ROADMAP.md` (unshipped plan prose),
`docs/OVERVIEW.md` (Mermaid diagrams + user stories from the code),
`docs/architecture.md` and `docs/DECISIONS.md` (extracted from the README's
engineering deep-dive), this JOURNAL, and a `docs/PRD.md` placeholder. Retired
`todo.md` to `docs/attic/todo.md`. Slimmed the README to a front door with
pointers. Added a lean root `CLAUDE.md`. Doctor: clean; parser: green.

## 2026-07-10 — Monorepo fold + Actions-based Pages deploy (Phase 14)

Converted the flat repo into a monorepo by surface. `git mv`'d the entire static
site (index.html + all assets + CNAME + ANALYTICS.md + SITE-PUBLISHING-PLAYBOOK.md)
into `web/`; the Chrome extension stayed its own `extension/` surface. Added a
build/run/test `CLAUDE.md` to each surface and rewrote the root `CLAUDE.md` as a
repo-wide monorepo map. Root is now minimal (README, PROGRESS, CLAUDE, docs/,
web/, extension/, .github/).

Deploy: since Pages branch-serve only reads root or `/docs` (taken), switched from
`main`/root serving to a GitHub Actions workflow (`.github/workflows/pages.yml`,
`upload-pages-artifact path: web` → `deploy-pages`) and flipped the Pages source
to `build_type=workflow` via `gh`. Custom domain + HTTPS preserved by `web/CNAME`
in the artifact; `web/` contents serve at the domain root so no asset paths
changed (verified index.html/sw.js/manifest use only relative paths). The
extension was unaffected — it reaches the site over the absolute production URL.
Updated README / OVERVIEW / architecture / the publishing playbook to the new
layout and deploy model. Gotcha to remember: the flip to `workflow` had to happen
before pushing the rootless tree, or a legacy branch-root build would have
deployed a 404 root.
