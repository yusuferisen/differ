# Publishing the Differ Chrome Extension

Step-by-step guide for publishing to the Chrome Web Store (and optionally Microsoft Edge Add-ons).

---

## Prerequisites

- A Google account (consider creating a dedicated one — the email cannot be changed later)
- A one-time **$5 USD** registration fee
- The extension source code in the `extension/` directory

---

## 1. Register a developer account

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the $5 registration fee
4. Set your **publisher display name** — this is what appears publicly on the store listing. You can use a brand name (e.g., "Differ" or "differapp") instead of your real name
5. Optionally set a support email (e.g., support@differapp.com)

---

## 2. Prepare the zip file

From the repository root:

```bash
cd extension
zip -r ../differ-extension.zip . -x "store/*" -x "PUBLISHING.md"
```

The zip should contain:
```
manifest.json
background.js
content.js
docx.js
popup.html
popup.css
popup.js
icons/
  icon-16.png
  icon-48.png
  icon-128.png
```

**Excluded** from the zip (not part of the extension itself):
- `store/` — publishing assets
- `PUBLISHING.md` — this file

Delete the zip after uploading — don't commit it to the repo.

---

## 3. Prepare required assets

### Store listing icon (already done)
- `icons/icon-128.png` — 128x128 pixels, PNG

### Screenshots (you must create these)

**Requirements:** 1280x800 pixels, PNG or JPEG, 1-5 screenshots.

**Recommended screenshots:**

1. **Context menu** — Show text selected on a web page with the right-click menu open, showing "Differ > Set as Original" and "Differ > Set as Modified"
2. **Popup** — Show the extension popup with text in both fields and the "Open in Differ" button
3. **Differ in action** — Show the differ web app with a comparison loaded via the extension, highlighting the diff output

**How to capture at exact dimensions:**
1. Open Chrome DevTools (F12)
2. Click the device toolbar icon (or Ctrl+Shift+M)
3. Set dimensions to 1280x800
4. Take a screenshot (three-dot menu in DevTools → "Capture screenshot")

### Small promotional image (you must create this)

**Requirements:** 440x280 pixels, PNG or JPEG.

This is the banner shown on the store listing. Create a simple branded image with:
- The app name and icon
- A brief tagline (e.g., "Compare text from any web page")
- Clean background matching the app's dark theme (#21252b)

---

## 4. Upload and fill out the listing

### In the Developer Dashboard:

1. Click **"Add new item"**
2. Upload the zip file

### Store Listing tab

| Field | Value |
|---|---|
| **Language** | English |
| **Extension name** | Differ (or your chosen name, max 75 characters) |
| **Short description** | Copy from `store/description.txt` — the short description line (max 132 characters) |
| **Full description** | Copy from `store/description.txt` — the full description section |
| **Category** | Productivity |
| **Icon** | Upload `icons/icon-128.png` |
| **Screenshots** | Upload 1-5 screenshots (1280x800) |
| **Small promo image** | Upload your 440x280 image |
| **Homepage URL** | `https://differapp.com` (optional) |
| **Support URL** | Link to GitHub issues or a contact page (optional) |

### Privacy tab

| Field | Value |
|---|---|
| **Single purpose description** | "Captures text from web pages — including the original-vs-suggested versions of a Google Doc — and opens it in the Differ text comparison tool" |
| **Host permissions justification** | "differapp.com: inject captured texts into the Differ web app's text fields. docs.google.com / googleusercontent.com (optional, requested at runtime): download the Google Doc the user is viewing so the extension can extract its open suggestions and load original-vs-accepted into Differ." |
| **Are you using remote code?** | No |
| **Data usage disclosures** | The extension does not collect or transmit user data. Check "No" for all data type categories. (The Google Docs feature downloads the user's own document into their own browser; nothing is sent to a third party.) |
| **Privacy policy URL** | Link to hosted privacy policy (e.g., `https://differapp.com/privacy` or the raw GitHub URL of `store/privacy-policy.md`) |

**Permission justifications** (if prompted):

| Permission | Justification |
|---|---|
| `contextMenus` | Adds right-click menu items for capturing selected text |
| `storage` | Temporarily stores captured texts locally so they persist across tabs |
| `activeTab` | Reads the full selected text from the page when the user right-clicks; reads the current tab's URL so the popup can detect a Google Doc |
| `scripting` | Injects a script into the Differ web app to fill text fields with captured texts |
| `optional_host_permissions` (docs.google.com, googleusercontent.com) | Requested at runtime only when the user clicks "Compare suggestions in Differ" — downloads the Google Doc being viewed so the extension can read its suggested edits |

### Distribution tab

| Field | Value |
|---|---|
| **Visibility** | Public (or Unlisted if you want a link-only distribution) |
| **Countries** | All regions |

---

## 5. Submit for review

1. Review all tabs for completeness
2. Click **"Submit for review"**
3. Typical review time: **24-72 hours** (can take up to 3 weeks for first submissions)
4. You'll receive an email when the review is complete

If rejected, the dashboard will show the reason. Common issues:
- Permissions not justified
- Description doesn't match actual functionality
- Missing privacy policy
- Screenshots misleading or missing

---

## 6. Post-approval

Once approved, the extension is live on the Chrome Web Store. Share the listing URL.

### Updating the extension

1. Bump the `version` in `manifest.json` (e.g., `"1.0"` → `"1.1"`)
2. Create a new zip (same process as step 2)
3. In the Developer Dashboard, click your extension → **"Package"** → **"Upload new package"**
4. Upload the new zip
5. Submit for review (updates are usually reviewed faster — often within hours)

---

## 7. Optional: Microsoft Edge Add-ons

Edge supports Chrome extensions natively. To publish there as well:

1. Go to [Microsoft Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/public/login)
2. Register with a Microsoft account (free, no fee)
3. Upload the same zip file
4. Fill out similar listing details
5. Submit for review

The same extension zip works for both stores without modification.

---

## 8. Optional: Verified publisher badge

A verified publisher badge shows "Offered by: differapp.com" on your listing, increasing trust.

1. Go to Developer Dashboard → **Account** → **Publisher verification**
2. Add your domain: `differapp.com`
3. Verify ownership via DNS TXT record (Google will provide the record value)
4. Add the TXT record in your DNS provider (Namecheap)
5. Wait for verification (usually minutes to a few hours)

---

## Asset checklist

Before publishing, confirm you have:

- [ ] Extension zip file (without `store/` and `PUBLISHING.md`)
- [ ] Store listing icon: 128x128 PNG (`icons/icon-128.png`)
- [ ] At least 1 screenshot: 1280x800 PNG/JPEG
- [ ] Small promotional image: 440x280 PNG/JPEG
- [ ] Short description: under 132 characters
- [ ] Full description: copied from `store/description.txt`
- [ ] Privacy policy: hosted at a public URL
- [ ] Permission justifications: prepared for each permission
- [ ] Publisher display name: decided
- [ ] $5 developer registration fee: paid
