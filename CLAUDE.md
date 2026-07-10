# differ — repo conventions

Browser-based text review & merge tool ([differapp.com](https://differapp.com)):
a no-build static site plus a Chrome extension, laid out as a **monorepo** by
surface. Auto-loaded every session — keep this lean and durable. No status or
history here (that lives in `PROGRESS.md` / `docs/JOURNAL.md`).

## Monorepo layout

Each surface is its own folder with its own `CLAUDE.md` (build/run/test contract),
which lazy-loads when a session works in that folder. Root holds only the
repo-wide files.

- `web/` — the static site (the whole web app; `web/index.html` is where nearly
  all feature work happens). Published to GitHub Pages by Actions. See
  `web/CLAUDE.md`.
- `extension/` — Chrome extension (Manifest V3), decoupled from the site (talks to
  it over the absolute production URL). See `extension/CLAUDE.md`.
- `docs/` — on-demand product-wide planning docs (router in `PROGRESS.md`).
- `.github/workflows/pages.yml` — deploys `web/` to Pages.
- Root files: `README.md`, `PROGRESS.md`, this `CLAUDE.md`, `.gitignore`.
- **Future surfaces slot in beside these** — `ios/` (an app + `packages/<App>Kit`
  for TCA domain logic), `server/`, `scripts/` — without restructuring.

## How this repo works

- **No build step and no automated tests** on the current surfaces. Each surface's
  `CLAUDE.md` carries its run/verify contract; verification is manual (browser for
  `web/`, unpacked load for `extension/`).
- **Deploy is via GitHub Actions**, not branch-serve: a push touching `web/**`
  triggers `pages.yml` (~1-min build) → live at differapp.com. There's still no
  test gate, so **verify `web/` in a browser before pushing** — the push ships it.
- **No secrets in the repo.** Nothing here needs API keys at runtime. (Analytics
  keys are baked into the site and are site-specific — a fork provisions its own.)

## Docs (on-demand — read by path, not auto-loaded)

`PROGRESS.md` (root, injected every session) is the cursor + the single live
roadmap checklist and routes to everything else. Before non-trivial work, read
`docs/architecture.md` (engineering contract) and `docs/ROADMAP.md` (unshipped
plan prose); after a change, keep `docs/` in sync — behavior/diagrams →
`docs/OVERVIEW.md`, decisions → `docs/DECISIONS.md`, per-phase narrative →
`docs/JOURNAL.md`. Auto-loaded files (this file, README) carry **zero** history.

## If iOS ever happens (Phase 12)

New Swift/iOS app code is built on TCA (Point-Free Composable Architecture) — load
the `pfw-*` skills before writing code. The NLP layer (compromise.js) is the open
architecture question; see `docs/ROADMAP.md § Native iOS app`.
