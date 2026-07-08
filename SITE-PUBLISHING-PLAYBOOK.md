# Static Site Publishing Playbook (as practiced by `differ`)

> A reusable, end-to-end reference for how the `differ` single-page site is built and shipped: GitHub Pages hosting (no CI), a custom domain via Namecheap DNS, cookieless dual analytics (Cloudflare + Aptabase), SEO/crawler files, and an installable PWA layer. Reconstructed from the live repo, `todo.md`, `ANALYTICS.md`, and the page source so it can be replayed for a brand-new repo/site.

## Table of Contents
- [Overview](#overview)
- [Hosting Model: GitHub Pages from Branch Root](#hosting-model-github-pages-from-branch-root)
- [Custom Domain & DNS](#custom-domain--dns)
- [HTTPS](#https)
- [Analytics: Two Cookieless Providers](#analytics-two-cookieless-providers)
- [SEO & Crawler Files](#seo--crawler-files)
- [PWA: Installable & Offline](#pwa-installable--offline)
- [File Inventory](#file-inventory)
- [New-Repo Checklist](#new-repo-checklist)
- [Gotchas & Pitfalls](#gotchas--pitfalls)
- [Open Questions](#open-questions)

## Overview

`differ` is a **no-build static site** — the repository *is* the deployed site. There is no `.github/workflows/`, no bundler, no `dist/` output. Source files live at the repo root and are served verbatim by GitHub Pages. Third-party libraries are **vendored** into the repo as minified files (`compromise.min.js`, `diff.min.js`) rather than installed from a package manager, which is what makes the "fully offline" PWA story work.

The practical consequence: **a push to `main` is a deploy.** Whatever lands on the default branch is live within roughly a minute, with no intermediate build step to break.

This document separates the launch into independent layers. Hosting + domain + HTTPS are the mandatory core; analytics, SEO, and PWA are independent add-ons that can be adopted piecemeal.

## Hosting Model: GitHub Pages from Branch Root

- **Repository:** `git@github.com:yusuferisen/differ.git`
- **Pages source:** Settings → Pages → **Deploy from a branch**, branch `main`, folder `/ (root)`.
- **No CI/CD:** the absence of `.github/workflows/` is intentional. GitHub Pages serves the raw files. This only works because the site needs no compilation — HTML + vendored JS.

If a future site *does* need a build (framework, bundler, Tailwind compile, etc.), the equivalent would be either a GitHub Actions workflow that publishes to Pages, or pointing Pages at a `/docs` folder containing pre-built output. `differ` deliberately avoids both.

## Custom Domain & DNS

A custom domain requires coordinated changes in **two places**: a file in the repo and DNS records at the registrar (Namecheap).

### In the repo: `CNAME`

A file named `CNAME` at the repo root containing exactly one line — the bare apex domain, no scheme, no trailing slash:

```
differapp.com
```

GitHub reads this file to bind the domain to the Pages site. (Note: the git history shows this file was created/deleted/re-created a few times early on, with a merge conflict at one point — keep it stable once set.)

### At the registrar: Namecheap DNS records

| Record | Host | Value | Purpose |
|---|---|---|---|
| `A` ×4 | `@` (apex) | GitHub Pages IPs | Apex domain → Pages |
| `CNAME` | `www` | `yusuferisen.github.io` | `www` subdomain → Pages |
| `TXT` | `_github-pages-challenge-…` | (value from GitHub) | Domain ownership verification |

**Apex A-record IPs** — GitHub's canonical apex set is:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

⚠️ These IPs were **not recorded in the repo**; the above is GitHub's documented set. Confirm against the current GitHub Pages docs before configuring — GitHub occasionally rotates them and now also publishes AAAA/IPv6 records.

**Domain verification:** GitHub provides the `_github-pages-challenge-…` host + value under Settings → Pages → "Verify domains." Adding the TXT record and verifying prevents domain takeover by other GitHub accounts.

After DNS records are in place, **wait for propagation**. GitHub Pages settings runs an automated DNS check that must pass (go green) before HTTPS can be enabled.

## HTTPS

Once the GitHub Pages DNS check passes, enable **"Enforce HTTPS"** in Settings → Pages. GitHub then auto-provisions and renews a Let's Encrypt certificate. No manual cert handling.

## Analytics: Two Cookieless Providers

`differ` runs **two** analytics providers, both privacy-friendly (no cookies, no consent banner). They are complementary, not redundant — Cloudflare can't do custom events, so Aptabase fills that gap. Full event inventory lives in `ANALYTICS.md`.

### Cloudflare Web Analytics — aggregate traffic

- **Tracks:** page views, unique visitors, countries, referrers, browser/OS, Core Web Vitals.
- **Does not** support custom events.
- **Setup:** a single deferred beacon `<script>` placed just before `</body>` in `index.html`:

```html
<!-- Cloudflare Web Analytics -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js'
        data-cf-beacon='{"token": "d5b7eb5a89324656b448287d72756026"}'></script>
<!-- End Cloudflare Web Analytics -->
```

- **Token:** issued per-site from the Cloudflare dashboard → Web Analytics → Add a site. The token above is `differ`'s; **a new site needs its own token.**
- **Dashboard:** dash.cloudflare.com → Web Analytics.

### Aptabase — custom product events

- **Tracks:** custom user-interaction events forming a product funnel.
- **App key:** `A-US-6807308605` (differ's; **get a new key per app** from us.aptabase.com).
- **Setup:** `analytics.js`, a small **provider-agnostic wrapper**, is loaded in `<head>` via `<script src="analytics.js">`. It exposes `window.analytics.init()` and `window.analytics.track(event, props)`, with an internal **queue** so `track()` calls made before the SDK loads are buffered and flushed once ready. `init()` lazy-imports the SDK as ESM from jsDelivr:

```js
import('https://cdn.jsdelivr.net/npm/@aptabase/web@0.5.0/+esm')
  .then(mod => { mod.init('A-US-6807308605'); /* ...flush queue... */ });
```

- `analytics.init()` is called once on app startup (around `index.html:4003`).
- **Build modes:** Aptabase auto-separates events by origin — events from `localhost` go to the **Debug** view, events from the real domain go to **Release**. The dashboard **defaults to Debug**; switch to Release via the **gear icon** next to the time-period selector. (Easy to think production has no data when you're just looking at the wrong view.)

### Reusable design note

The wrapper pattern is the part worth carrying forward: because `analytics.js` isolates the provider behind `init()`/`track()`, you can **swap analytics backends by editing only those two functions** — call sites throughout the app never change. The queue makes early `track()` calls safe regardless of load order.

### Event funnel (from `ANALYTICS.md`)

Core funnel: `page_view` → `diff_performed` → `copy_merge` / `share_link`. Plus interaction events (`mode_switch`, `settings_change`, `accept_all`, `try_sample`, `clear`, `theme_select`, `view_switch`, `guided_complete`). Deliberately **not** tracked: keystrokes, resize drags, undo clicks, dropdown toggles, per-chunk merge decisions (these are summarized into `copy_merge` props instead). The guiding principle: track events that answer a real product question (activation rate, completion rate, mode preference, feature adoption), skip noise.

## SEO & Crawler Files

- **`robots.txt`** — allows all crawlers and points to the sitemap by absolute URL:
  ```
  User-agent: *
  Allow: /

  Sitemap: https://differapp.com/sitemap.xml
  ```
- **`sitemap.xml`** — minimal single-URL `<urlset>` listing the canonical home URL.
- **`<head>` metadata** in `index.html`:
  - `<link rel="canonical" href="https://differapp.com/">`
  - Open Graph: `og:type`, `og:title`, `og:description`, `og:url`, `og:image` (all absolute URLs).
  - `<meta name="twitter:card" content="summary_large_image">`
- **`og-image.png`** — the social-share preview card, referenced by absolute URL in `og:image`.

All canonical/OG URLs are **absolute** (`https://differapp.com/...`) — relative URLs don't work for social scrapers.

## PWA: Installable & Offline

Optional layer that makes the site installable and usable offline.

### `manifest.json`
Declares `name`/`short_name`, `description`, `display: standalone`, `theme_color`/`background_color` (`#21252b`), and an icon set (`icon.svg` as scalable "any", `icon-192.png`, `icon-512.png`, and `icon-maskable-512.png` with `purpose: maskable`). Linked from `<head>` via `<link rel="manifest" href="manifest.json">`, alongside `apple-touch-icon`.

### `sw.js` (service worker)
Registered at the end of `index.html`:
```js
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
```
Caching strategy:
- **Network-first for HTML / navigations** — fetch fresh, fall back to cache offline. Ensures users get updates immediately rather than a stale shell.
- **Cache-first for all other local assets** — fast loads, offline support.
- A versioned cache name (`const CACHE = 'differ-v10'`) lists the precached assets. On `activate`, old caches (any key `!== CACHE`) are deleted; `skipWaiting()` + `clients.claim()` make the new worker take over promptly.

**Critical maintenance rule:** bump the `CACHE` version string whenever cached assets change. Otherwise the old asset list is served and updates silently don't reach users. (`todo.md` shows the cache version being bumped repeatedly across releases for exactly this reason.)

## File Inventory

Files that exist specifically to support hosting/publishing/discoverability:

| File | Role |
|---|---|
| `CNAME` | Binds custom domain `differapp.com` to Pages |
| `index.html` | The site; contains `<head>` SEO/OG, beacon script, SW registration, `analytics.init()` |
| `analytics.js` | Provider-agnostic analytics wrapper (Aptabase) |
| `ANALYTICS.md` | Analytics documentation + full event inventory |
| `robots.txt` | Crawler directives + sitemap pointer |
| `sitemap.xml` | Single-URL sitemap |
| `og-image.png` | Social share preview image |
| `manifest.json` | PWA manifest |
| `sw.js` | Service worker (offline + caching) |
| `icon.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | PWA / favicon icons |
| `compromise.min.js`, `diff.min.js` | Vendored deps (no CDN/runtime install) |

## New-Repo Checklist

1. Place static files at repo root (or use a `/docs` folder if you prefer that Pages option).
2. Add a `CNAME` file containing the new bare domain.
3. Settings → Pages → deploy from `main` / root.
4. Namecheap DNS: four apex `A` records (verify current GitHub IPs), `www` `CNAME` → `<user>.github.io`, and the `TXT` verification record from GitHub.
5. Wait for the Pages DNS check to pass → tick **Enforce HTTPS**.
6. Create a **new Cloudflare beacon token** and a **new Aptabase app key**; drop the beacon `<script>` before `</body>` and wire `analytics.js` / `analytics.init()`.
7. Add `robots.txt`, `sitemap.xml`, `<head>` canonical + OG tags, and `og-image.png`.
8. (Optional) Add `manifest.json`, `sw.js`, and icons for the PWA layer.

## Gotchas & Pitfalls

- **A-record IPs are not in the repo.** Don't blindly copy the four IPs here; confirm GitHub's current published set (and IPv6 AAAA records) before configuring DNS.
- **Tokens/keys are per-site.** The Cloudflare beacon token and Aptabase app key in this repo belong to `differ`. A new site reusing them would pollute differ's analytics. Always provision fresh ones.
- **Aptabase dashboard defaults to Debug.** Production data is under the **Release** view (gear icon). Easy to mistake "no production events" for a broken integration.
- **Service worker cache version.** Forgetting to bump `CACHE` in `sw.js` ships stale assets to returning visitors. The network-first HTML rule mitigates this for the page shell but not for JS/CSS/icons.
- **Absolute URLs for OG/canonical/sitemap.** Social scrapers and search engines need fully-qualified `https://…` URLs, not relative paths.
- **`CNAME` file stability.** Early git history shows churn (create/delete/merge-conflict) on this file; treat it as set-once to avoid breaking the domain binding.
- **Push = deploy.** With no CI gate, a broken commit on `main` is immediately live. There's no build to catch errors.

## Open Questions

- **Exact GitHub Pages IPs used.** The repo records only "A records pointing to GitHub Pages IPs"; the literal values configured at Namecheap were never written down. Verify live DNS or GitHub docs if reproducing exactly.
- **IPv6 / AAAA records.** Unknown whether `differapp.com` has AAAA records configured; GitHub now publishes them and recommends adding them.

---
*Generated from a Claude Code session on 2026-06-16. Working directory: `/Users/ysf/Developer/differ`.*
