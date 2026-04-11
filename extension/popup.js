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
