# PRD — differ

> **Placeholder created by /adopt (2026-07-08).** No product-requirements
> document was written at birth. `/adopt` does not fabricate product intent, so
> this file is an explicit pointer rather than an invented spec. Replace it with a
> real PRD if/when one is authored; until then, intent of record lives in the
> sources below. See `docs/DECISIONS.md § PRD is a placeholder (adopt)`.

## Where intent currently lives

- **What it is and who it's for** — `README.md` ("What makes it different";
  especially useful for edited prose, LLM rewrites, two document versions,
  translated/paraphrased text). Audience: a general (non-developer) audience
  reviewing prose, which is what drove the editorial redesign.
- **What it does today** — `docs/OVERVIEW.md` (user stories as built).
- **Where it's going** — `docs/ROADMAP.md` (unshipped backlog) and
  `PROGRESS.md § Roadmap` (the live checklist).
- **Why it's built the way it is** — `docs/DECISIONS.md`.

## Product shape (reconstructed, not authoritative)

A no-backend, client-only text review and merge tool. Core value: split two
versions of any text into meaningful linguistic units, align them intelligently,
highlight exactly what changed, and let the user assemble a merged result they
can copy or share — all in the browser, with the text never leaving the device.
Free by principle; any future monetization (see `docs/ROADMAP.md`) must not gate
existing features or add accounts/subscriptions/a backend.
