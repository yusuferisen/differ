const originalEl = document.getElementById('original');
const modifiedEl = document.getElementById('modified');
const openBtn = document.getElementById('open-btn');

// ---------------------------------------------------------------------------
// Show/hide clear buttons based on whether textareas have content
// ---------------------------------------------------------------------------
function updateClearVisibility(textarea) {
  textarea.parentElement.classList.toggle('has-text', textarea.value.length > 0);
}

// ---------------------------------------------------------------------------
// Load stored texts into the popup
// ---------------------------------------------------------------------------
chrome.storage.local.get(['original', 'modified'], (data) => {
  if (data.original) originalEl.value = data.original;
  if (data.modified) modifiedEl.value = data.modified;
  updateClearVisibility(originalEl);
  updateClearVisibility(modifiedEl);
});

// ---------------------------------------------------------------------------
// Save on edit (debounced) + flush on close
// ---------------------------------------------------------------------------
let saveTimer;
function flushSave() {
  clearTimeout(saveTimer);
  chrome.storage.local.set({
    original: originalEl.value,
    modified: modifiedEl.value,
  });
}

function saveToStorage() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 300);
}

// Stop the autosave from clobbering storage — used when the Google Docs flow
// has just written its own texts and is about to close the popup.
function cancelPopupAutosave() {
  clearTimeout(saveTimer);
  window.removeEventListener('unload', flushSave);
}

originalEl.addEventListener('input', () => {
  updateClearVisibility(originalEl);
  saveToStorage();
});
modifiedEl.addEventListener('input', () => {
  updateClearVisibility(modifiedEl);
  saveToStorage();
});
window.addEventListener('unload', flushSave);

// ---------------------------------------------------------------------------
// Per-field clear buttons
// ---------------------------------------------------------------------------
document.querySelectorAll('.clear-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const textarea = document.getElementById(btn.dataset.target);
    textarea.value = '';
    updateClearVisibility(textarea);
    textarea.focus();
    flushSave();
  });
});

// ---------------------------------------------------------------------------
// Open in Differ — delegates to background service worker so the
// tab-load listener survives after the popup closes
// ---------------------------------------------------------------------------
openBtn.addEventListener('click', () => {
  flushSave();
  chrome.runtime.sendMessage({ type: 'openDiffer' });
  window.close();
});

// ===========================================================================
// Google Docs: compare a doc's original text against a version with all open
// suggestions accepted. The doc is downloaded as .docx (which embeds open
// suggestions as Word tracked changes), parsed locally, and loaded into Differ.
// ===========================================================================
const gdocsSection = document.getElementById('gdocs-section');
const gdocsBtn = document.getElementById('gdocs-btn');
const gdocsStatus = document.getElementById('gdocs-status');

const GDOCS_ORIGINS = ['https://docs.google.com/*', 'https://*.googleusercontent.com/*'];

// Pull a document id out of an editor URL. Published docs (/document/d/e/…)
// and non-document Docs URLs return null.
function extractDocId(url) {
  let u;
  try { u = new URL(url); } catch { return null; }
  if (u.hostname !== 'docs.google.com') return null;
  if (u.pathname.includes('/document/d/e/')) return null;
  const m = u.pathname.match(/\/document\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]{15,})/);
  return m ? m[1] : null;
}

function setGdocsStatus(msg, isError) {
  gdocsStatus.textContent = msg || '';
  gdocsStatus.classList.toggle('error', !!isError);
}

let currentDocId = null;
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs && tabs[0];
  currentDocId = tab && tab.url ? extractDocId(tab.url) : null;
  if (currentDocId) gdocsSection.hidden = false;
});

gdocsBtn.addEventListener('click', async () => {
  if (!currentDocId || gdocsBtn.disabled) return;

  // Must be requested from the user gesture, before any await.
  let granted = false;
  try { granted = await chrome.permissions.request({ origins: GDOCS_ORIGINS }); } catch { /* denied */ }
  if (!granted) {
    setGdocsStatus('Differ needs permission to read docs.google.com to do this.', true);
    return;
  }

  gdocsBtn.disabled = true;
  setGdocsStatus('Downloading the document…');
  try {
    const url = `https://docs.google.com/document/d/${currentDocId}/export?format=docx`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) {
      throw new Error(`Couldn't download the document (HTTP ${res.status}). Make sure you're signed in to Google.`);
    }
    const buf = await res.arrayBuffer();
    if (buf.byteLength < 4) {
      throw new Error('The document download came back empty. Make sure you have access to this doc.');
    }
    const head = new Uint8Array(buf, 0, 4);
    if (!(head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04)) {
      // Not a ZIP — almost certainly a sign-in/HTML page came back instead.
      throw new Error("Couldn't read the document — are you signed in to the right Google account?");
    }

    setGdocsStatus('Reading suggestions…');
    const xml = await extractDocumentXml(buf);
    const { original, modified, hasSuggestions } = parseTrackedChanges(xml);

    if (!hasSuggestions) {
      setGdocsStatus('No open suggestions found in this document.', true);
      gdocsBtn.disabled = false;
      return;
    }

    cancelPopupAutosave();
    await chrome.storage.local.set({ original, modified });
    chrome.runtime.sendMessage({ type: 'openDiffer' });
    window.close();
  } catch (err) {
    setGdocsStatus(err && err.message ? err.message : 'Something went wrong reading the document.', true);
    gdocsBtn.disabled = false;
  }
});
