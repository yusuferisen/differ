# Analytics

differ uses two analytics providers, both privacy-friendly (no cookies, no consent banner required).

## Providers

### Cloudflare Web Analytics
**What it tracks:** page views, unique visitors, countries, referrers, browser/OS, Core Web Vitals.
**Setup:** a beacon script at the bottom of `index.html`.
**Dashboard:** [Cloudflare dashboard](https://dash.cloudflare.com/) → Web Analytics.

Cloudflare handles aggregate traffic metrics. It does not support custom events.

### Aptabase
**What it tracks:** custom events (user interactions with the tool).
**Setup:** `analytics.js` loads the SDK via dynamic ESM import from jsDelivr. The wrapper exposes `window.analytics.init()` and `window.analytics.track()`.
**Dashboard:** [us.aptabase.com](https://us.aptabase.com) → differ app.
**App key:** `A-US-6807308605`

#### Build modes
Aptabase separates events by build mode:
- **Release** — events from `differapp.com` (or any non-localhost hostname). This is production data.
- **Debug** — events from `localhost` only.

The dashboard defaults to the Debug view. To see production data, click the **gear icon** next to the time period selector and choose **Release**.

## Event inventory

### Funnel events

| Event | Properties | Purpose |
|---|---|---|
| `page_view` | `has_hash`, `referrer` | Entry point. `has_hash` indicates arrival via share link. |
| `diff_performed` | `mode`, `segments`, `changed` | Core value moment — user pasted text and got a diff. Debounced 2s to avoid noise from typing. |
| `copy_merge` | `left`, `right`, `custom`, `unresolved` | Completion — user copied the merged result. Props summarize merge decisions made. |
| `share_link` | `status` (optional: `too_long`) | Distribution — user created a shareable URL. Tracks failures when content exceeds URL length limit. |

**Product funnel:** `page_view` → `diff_performed` → `copy_merge` / `share_link`

### Interaction events

| Event | Properties | Purpose |
|---|---|---|
| `mode_switch` | `mode` | Which diff mode (paragraph, sentence, clause, line) — informs which modes to invest in. |
| `settings_change` | `setting`, `value` | Unified toggle event. `setting` is one of: `char`, `smart_matching`, `ignore_case`, `ignore_spacing`, `show_equal`. `value` is `on`/`off`. |
| `accept_all` | `side` | Bulk merge — user clicked « or » to accept all changes from one side. |
| `try_sample` | — | Onboarding — user clicked "try a sample" to explore the tool. |
| `clear` | — | User cleared both text areas. |
| `theme_select` | `theme` | Which theme was chosen. |

## What we intentionally skip

These interactions are too noisy or not actionable as individual events:
- Textarea input / keystrokes
- Resize handle drags
- Undo clicks
- Dropdown open/close
- Per-chunk merge decisions (summarized in `copy_merge` instead)

## Key questions these events answer

- **Activation rate:** what % of `page_view` sessions produce a `diff_performed`?
- **Completion rate:** what % of `diff_performed` sessions end in `copy_merge` or `share_link`?
- **Mode preference:** which diff modes get the most `mode_switch` usage?
- **Feature adoption:** which settings are toggled on via `settings_change`?
- **Share link health:** how often does `share_link` fail with `too_long`?
- **Onboarding:** how often is `try_sample` used, and do those sessions convert to real diffs?
- **Merge behavior:** when users copy, how do they merge? (left vs right vs custom edits, from `copy_merge` props)
