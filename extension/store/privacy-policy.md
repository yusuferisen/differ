# Privacy Policy — Differ Chrome Extension

**Last updated:** April 2026

## Summary

The Differ Chrome extension does not collect, transmit, or share any user data. All text processing happens locally in your browser.

## Data handling

### What the extension stores

When you use the context menu ("Set as Original" or "Set as Modified") or type into the popup, the selected or entered text is saved to your browser's local storage (`chrome.storage.local`). This data:

- Never leaves your device
- Is not transmitted to any server
- Is not shared with any third party
- Is automatically cleared after a comparison is opened

### Permissions and why they are needed

| Permission | Why it is needed |
|---|---|
| `contextMenus` | Adds "Set as Original" and "Set as Modified" to the right-click menu when text is selected |
| `storage` | Temporarily stores captured texts in your browser so they persist across tabs |
| `activeTab` | Reads the full selected text from the current page when you use the context menu |
| `scripting` | Injects a small script into the Differ web app tab to fill the text fields with your captured texts |
| `host_permissions` (differapp.com) | Allows the extension to interact with the Differ web app to pre-load your texts |

### What the extension does NOT do

- Does not collect personal information
- Does not track browsing history or behavior
- Does not use analytics, telemetry, or crash reporting
- Does not communicate with any remote server
- Does not use cookies
- Does not require authentication or user accounts
- Does not run in the background when not in use

## Contact

If you have questions about this privacy policy, visit https://differapp.com or open an issue on the project's GitHub repository.
