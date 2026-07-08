# Decisions log

> Choices + rationale, append-only, dated. What we chose, why, and the
> alternatives — **not** how a phase went (that's `docs/JOURNAL.md`), **not** step
> plans (that's `docs/ROADMAP.md`). Dates are approximate where reconstructed by
> `/adopt` from the codebase and README.

## compromise.js over `Intl.Segmenter` for sentence/clause splitting

**Chose:** compromise.js. **Why:** `Intl.Segmenter` has a documented bug in Chrome
and Firefox where abbreviations ("Mr.", "Dr.", "Jr.") incorrectly trigger
sentence breaks. compromise handles them correctly at ~132 KB gzip with no model
download. **Cost:** a ~353 KB vendored dependency — accepted for the offline PWA.

## jsdiff over difflib.js for the diff engine

**Chose:** jsdiff (Myers O(ND)). **Why:** Myers is equivalent to LCS and produces
output identical to Python's `difflib.SequenceMatcher`. **Alternative rejected:**
the only `difflib.js` port was abandoned in 2012.

## Never modify the input boxes during merge

**Chose:** input boxes are the source of truth; the merged result is assembled
from the diff structure. **Why:** keeps both originals available for
re-comparison and avoids a feedback loop between edits and segmentation.

## Save merge state per split mode instead of warning on switch

**Chose:** persist `mergeState` per mode (`savedMergeStates`); switching back
restores decisions exactly. **Why:** no friction. **Boundary:** a text edit
(which changes segmentation) is the only thing that clears saved states.

## Encode the full merge state in the URL hash

**Chose:** the share link is a complete snapshot — texts, mode, toggles, and all
merge decisions — in a base64 URL fragment. **Why:** the recipient sees the exact
same diff and every decision so far, enabling async collaboration (share a
half-merged doc, let someone finish it). **Trade-off:** URL length; capped at
`HASH_MAX` 32 KB with graceful overflow. Compression is the future lever
(`docs/ROADMAP.md`).

## Editorial "paper" as the default theme, keep every developer theme

**Chose:** `paper` (serif, warm, editorial) is the default for new visitors; the
original monospace/dark "code" themes stay one click away and byte-for-byte
unchanged; existing users keep whatever they had. **Why:** the terminal look read
as "developer tool" and turned off the general audience this tool also serves.
The token system carries fonts/radii, so reading themes are truly editorial
rather than recolored.

## Keep the final-version panel as a sticky footer, not an in-flow card

**Chose:** a sticky footer ("your final version"). **Why:** the mockup put the
result in a card below the diff, but a sticky footer keeps the result in view
while scrolling a long diff, and moving it would have disturbed the resize,
edit-bar, and share-link plumbing for little gain.

## Whitespace preserved between segments, normalized within (sentence/clause)

**Chose:** `splitText` returns `{text, pre}` and the merged output re-emits each
segment's original leading whitespace, so documents stay multi-paragraph. **Known
limitation:** in sentence/clause mode the segment text comes from compromise and
may have internal whitespace normalized. **Escape hatch if ever needed:** a
two-level model separating structural whitespace from segment text.

## Google Docs suggestions via `.docx` round-trip, no OAuth

**Chose:** the extension downloads the credentialed `.docx` export and parses
tracked changes client-side (hand-rolled ZIP + OOXML walker in
`extension/docx.js`). **Why:** no Google API, no OAuth consent flow — the
credentialed fetch from the extension origin authenticates fine, verified in a
real logged-in browser. **Rejected:** detecting "has open suggestions" from the
DOM — Docs is canvas-rendered, so there's no cheap signal (see
`docs/ROADMAP.md` Phase 13).

## Extension: content-script injection over messaging to fill the app

**Chose:** the extension fills the web app's textareas via an injected content
script rather than a `postMessage`/`sendMessage` handshake. **Why:** works
without modifying `index.html`; the app needs no extension-awareness. Fallback is
documented in the extension code.

## Semantic change classification — won't do

**Chose:** not to build entity-type labeling of changed spans. **Why:**
compromise can detect dates/names/numbers/places/money in a changed span, but the
labels don't help an editor decide which version to keep — no product value.

---

## Adoption decisions (`/adopt`, 2026-07-08)

Reversible structural choices made while converging the repo onto the doc
contract; recorded here for review.

### PRD is a placeholder (adopt)

No product-intent document existed. Rather than fabricate intent, `docs/PRD.md`
was created as an explicit placeholder pointing at the README and PROGRESS as
where intent currently lives. Replace it with a real PRD if/when one is written.

### todo.md split by /adopt

`todo.md` was a combined roadmap **and** progress file (checkboxes + narrative).
Its completion checklist became `PROGRESS.md § Roadmap` (the single live
checklist), its unshipped items became plan prose in `docs/ROADMAP.md`, and its
shipped narrative moved to `docs/JOURNAL.md`. The original file was relocated
verbatim to `docs/attic/todo.md` (move-never-delete).

### README extraction (adopt)

The README's engineering deep-dive (diff pipeline, merge-state model, URL
encoding, similarity, theme system) was extracted to `docs/architecture.md` and
its "Key design decisions" to this file. The README was slimmed to a human front
door (what it is, features, stack, how to run) with pointers, to keep a single
source of truth for the engineering contract.
