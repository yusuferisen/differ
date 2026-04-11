// Injected into the differ page to fill textareas from extension storage.
// Runs once per injection — targeted to a specific tab by background.js.

chrome.storage.local.get(['original', 'modified'], (data) => {
  const textOld = document.getElementById('text-old');
  const textNew = document.getElementById('text-new');

  if (data.original && textOld) {
    textOld.value = data.original;
    textOld.dispatchEvent(new Event('input', { bubbles: true }));
  }
  if (data.modified && textNew) {
    textNew.value = data.modified;
    textNew.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // Clear storage so future tabs start fresh
  chrome.storage.local.remove(['original', 'modified']);
});
