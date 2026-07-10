# web/ — the differ static site

The entire web app. Auto-loads when a session works in `web/`. Keep durable; no
status/history here.

## What's here

- `index.html` — **the entire application** (markup + CSS + all JS inline). Nearly
  all feature work happens here.
- `analytics.js` · `samples.js` — the only other loaded scripts.
- `compromise.min.js` · `diff.min.js` — **vendored** deps (NLP tokenizer + jsdiff);
  no CDN / package manager, so the offline PWA works.
- `manifest.json` · `sw.js` · `icon*` · `og-image.png` — PWA + SEO assets.
- `robots.txt` · `sitemap.xml` · `CNAME` — crawler + custom-domain files.
- `ANALYTICS.md` — analytics providers + full event inventory.
- `SITE-PUBLISHING-PLAYBOOK.md` — the hosting/publishing recipe for this site.

## Build / run / test contract

- **Build:** none. No bundler, no transpile — the files ship as-is.
- **Run:** open `web/index.html` directly in a browser. For PWA install / service
  worker, serve over `localhost` or HTTPS (e.g. `python3 -m http.server` from
  `web/`). Add `?samples` for the sample-pairs dropdown.
- **Test:** no automated suite. Verify by hand in a browser: diff updates live,
  merge (click / «» / Keep all/Accept all / wizard), copy result, share link
  round-trip. This manual check **is** the pre-deploy gate.

## Deploy

- **`web/` is published to GitHub Pages by `.github/workflows/pages.yml`** on any
  push that touches `web/**`. A push to `main` → ~1-min Actions build → live at
  [differapp.com](https://differapp.com). The artifact root is `web/`, so its
  contents are served at the domain root — **keep all asset paths relative**
  (`./foo`, `foo`), never root-absolute (`/foo`).
- **`CNAME` must stay in `web/`** — it's what binds the custom domain in the
  published artifact.
- **Bump `CACHE` in `sw.js`** whenever a cached asset changes, or returning
  visitors get the stale asset list (network-first HTML only covers the shell).
- Analytics keys (Cloudflare beacon token, Aptabase app key) are site-specific;
  a fork provisions its own — see `SITE-PUBLISHING-PLAYBOOK.md`.
