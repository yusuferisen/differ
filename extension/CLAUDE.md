# extension/ — differ Chrome extension (Manifest V3)

Captures text from any web page and hands it to the differ web app. Auto-loads
when a session works in `extension/`. Durable only; no status/history.

## What's here

- `manifest.json` — MV3 manifest (permissions: `contextMenus` / `storage` /
  `scripting`; host `https://differapp.com/*`; optional `docs.google.com`).
- `background.js` — service worker: context-menu registration, tab orchestration.
  `DIFFER_URL = 'https://differapp.com'` (the deployed site).
- `content.js` — injected into the differ page to fill its textareas.
- `popup.{html,css,js}` — the popup UI (edit captured texts, paste, Open in Differ,
  Compare-suggestions on Google Docs).
- `docx.js` — client-side `.docx` reader (`DecompressionStream` ZIP + OOXML
  tracked-changes walker) for the Google-Docs-suggestions feature; no OAuth.
- `icons/` · `store/` — extension icons + Chrome Web Store listing assets.
- `PUBLISHING.md` — step-by-step Web Store publishing guide.

## Build / run / test contract

- **Build:** none (MV3 loads the source directly).
- **Run:** load `extension/` unpacked at `chrome://extensions` (enable Developer
  mode). Reload the extension there after edits.
- **Test:** manual — select text on a page → context menu → Set as Original /
  Modified → confirm differ opens pre-filled; on a Google Doc, confirm
  "Compare suggestions in Differ" round-trips the `.docx` export.

## Coupling to the web app

The extension talks to the **deployed** site via the absolute `DIFFER_URL`, not a
relative path — so it is unaffected by the repo layout / the `web/` fold. If the
production URL ever changes, update `DIFFER_URL` (background.js), `homepage_url`
and `host_permissions` (manifest.json), and the store listing.
