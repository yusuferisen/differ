# differ — repo conventions

Browser-based text review & merge tool ([differapp.com](https://differapp.com)):
a no-build static site plus a Chrome extension. Auto-loaded every session — keep
this lean and durable. No status or history here (that lives in `PROGRESS.md` /
`docs/JOURNAL.md`).

## Layout

- `index.html` — **the entire web app** (markup + CSS + all JS inline). This is
  where nearly all feature work happens.
- `analytics.js` · `samples.js` — the only other loaded scripts.
- `compromise.min.js` · `diff.min.js` — **vendored** deps (NLP tokenizer + jsdiff).
  No CDN, no package manager — the offline PWA depends on them being local.
- `manifest.json` · `sw.js` · `icon*` — PWA layer.
- `extension/` — Chrome extension (Manifest V3), independent of the app internals.
- `docs/` — on-demand planning docs (see the router in `PROGRESS.md`).

## How this repo works

- **No build step, no server, no tests.** Open `index.html` in a browser to run.
- **Push to `main` is the deploy.** GitHub Pages serves the repo verbatim (main /
  root, no CI). A broken commit on `main` is live within ~a minute — verify in a
  browser before pushing. The browser check *is* the gate.
- **Bump `CACHE` in `sw.js`** whenever cached assets change, or returning visitors
  get stale JS/CSS/icons.
- **Analytics keys are site-specific** — the Cloudflare beacon token and Aptabase
  app key belong to this site; a fork provisions its own (`SITE-PUBLISHING-PLAYBOOK.md`).
- **No secrets in the repo.** Nothing here needs API keys at runtime.

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
