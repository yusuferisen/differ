# Privacy Policy — Differ Chrome Extension

**Last updated:** May 2026

## Summary

The Differ Chrome extension does not collect, transmit, or share any user data, and does not use analytics or tracking. All text processing happens locally in your browser. The only network request the extension ever makes on your behalf is downloading a Google Doc *you* are currently viewing, to your own browser, when you explicitly click the "Compare suggestions in Differ" button (see below).

## Data handling

### What the extension stores

When you use the context menu ("Set as Original" or "Set as Modified") or type into the popup, the selected or entered text is saved to your browser's local storage (`chrome.storage.local`). This data:

- Never leaves your device
- Is not transmitted to any server
- Is not shared with any third party
- Is automatically cleared after a comparison is opened

### Google Docs suggestions comparison

When you are viewing a Google Doc and click "Compare suggestions in Differ", the extension downloads that document (in Word `.docx` format, using your existing Google session) directly into your browser, reads the text and any open suggestions from it locally, and loads the "original" and "all suggestions accepted" versions into the Differ web app. The document is fetched from `docs.google.com` (and its `googleusercontent.com` download host) and is processed entirely on your device — it is never sent to differapp.com or anywhere else. Access to `docs.google.com` is an *optional* permission that is only requested the first time you use this button; if you never use it, the extension never touches Google Docs.

### Permissions and why they are needed

| Permission | Why it is needed |
|---|---|
| `contextMenus` | Adds "Set as Original" and "Set as Modified" to the right-click menu when text is selected |
| `storage` | Temporarily stores captured texts in your browser so they persist across tabs |
| `activeTab` | Reads the full selected text from the current page when you use the context menu; reads the current tab's URL so the popup knows when you're on a Google Doc |
| `scripting` | Injects a small script into the Differ web app tab to fill the text fields with your captured texts |
| `host_permissions` (differapp.com) | Allows the extension to interact with the Differ web app to pre-load your texts |
| `optional_host_permissions` (docs.google.com, googleusercontent.com) | Requested only when you use "Compare suggestions in Differ" — lets the extension download the Google Doc you're viewing so it can read its suggestions |

### What the extension does NOT do

- Does not collect personal information
- Does not track browsing history or behavior
- Does not use analytics, telemetry, or crash reporting
- Does not send your data to any server (the only network request is downloading a Google Doc you're viewing, to your own browser, when you ask it to)
- Does not use cookies of its own
- Does not require its own authentication or user accounts
- Does not run in the background when not in use

## Contact

If you have questions about this privacy policy, visit https://differapp.com or open an issue on the project's GitHub repository.
