# Roadmap — future plan prose

> **Future only.** Scope prose for *unshipped* work — what each item means, why,
> and what's out of scope. No execution state lives here (no checkboxes, no
> completion marks): the live checklist is `PROGRESS.md § Roadmap`. Shipped work
> is described in `docs/OVERVIEW.md` (present) and `docs/JOURNAL.md` (past).

The v1 product is live; everything below is optional backlog — pull items
independently, none blocks another.

## URL payload compression (Phase 9)

Today the shareable URL encodes the full session as `base64(JSON)` in the hash,
capped at `HASH_MAX` (32 KB) — over that, the hash is dropped from the address
bar and the share button dims with a tooltip. The lever to fit larger
comparisons is compression: `deflate-raw` + base64, gated by a version marker so
links produced by the current (uncompressed) scheme still decode. This needs an
async encode path (the compression APIs are streaming/promise-based). The
`DecompressionStream` pattern already lives in `extension/docx.js` and can be
mirrored for `CompressionStream`. Target: roughly 3× more text per link.

## App naming (Phase 10)

A non-technical tester found the name "differ" meaningless without context. This
is a discussion item, not an implementation task — a rename touches the domain,
PWA identity, store listings, and analytics continuity, so it needs broader
input before any change is committed. Out of scope until there's a decision.

## Monetization (Phase 11)

Goal: cover costs and earn modest side income — **not** build a business. Hard
constraints: no backend, no accounts, no subscriptions, and all current features
stay free. Two independent tracks:

- **Tip jar** — a Buy Me a Coffee or Ko-fi link (footer, or surfaced after a
  a finished merge). Near-zero effort; worth doing regardless of anything else.
- **Pro one-time unlock** — license keys via LemonSqueezy or Gumroad, verified
  and unlocked client-side (target $5–8 one-time). Candidate pro features, in
  rough order of appeal: file upload (drag in `.txt` / `.docx` / `.pdf`), export
  (styled PDF/HTML of the diff), comparison history (IndexedDB), batch mode
  (multiple document pairs per session).

An App Store paid tier ($3–5 one-time) becomes a natural payment channel *if* the
native app (Phase 12) is ever built.

## Native iOS app (Phase 12)

The strongest case for going native is **Share Sheet integration** — select text
in any app, share to Differ — which a web app cannot replicate. Secondary wins:
Spotlight, haptics on merge decisions, App Store discoverability.

The architecture challenge is the NLP layer: compromise.js (sentence/clause
splitting) has no Swift equivalent. Three options, roughly increasing fidelity:
(a) ship a line-mode-only MVP with no NLP dependency and layer sentence/clause in
later; (b) bridge the NLP layer through a `WKWebView`; (c) port the tokenizer to
Swift. Suggested MVP scope: two text fields → line-mode diff → view-only (no
merge) → a Share Extension for text capture; add sentence/clause modes and the
merge UX as follow-ups. This is explicitly **not** a single-session effort — the
diff viewer, the chunk-selection + undo interaction model, and the Share
Extension (separate target, app groups) each need iterative work.

Per the repo's architecture rule, new Swift/iOS app code would be built on TCA;
that decision is deferred to when/if this phase is actually started.

## Extension: reliable "has open suggestions" detection (Phase 13)

The Google-Docs comparison currently offers itself on *any* Doc and only reports
"no suggestions" after downloading the `.docx`. Detecting whether a Doc has open
suggestions *before* downloading isn't feasible from the DOM — Docs renders to a
canvas — so this needs a cheap alternative signal, or it stays as-is. Related
known limitation: extracted text is plain runs only (tables/lists/headers/footers
lose structure), which is out of scope for a text-diff tool.

## Out of scope / won't do

Kept for the record so they aren't re-litigated:

- **Semantic change classification.** Investigated: compromise.js can label
  changed spans by entity type (dates, names, numbers, places, money), but the
  labels don't help an editor decide which version to keep. Not worth building.
- **Direction C (unified inline / Track-Changes popovers).** A third review
  layout was prototyped in the editorial redesign and disliked in testing.
- **Ads** — not worth it until there's meaningful traffic.
- **Subscriptions** — overkill for a static client-side tool.
- **Gating existing features** — would feel like a downgrade to current users.
- **Changing segmentation / smart matching / jsdiff usage / the mergeState model**
  as part of UI work — the diff core is stable and deliberately left untouched.
