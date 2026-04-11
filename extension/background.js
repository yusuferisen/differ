const DIFFER_URL = 'https://differapp.com';

// ---------------------------------------------------------------------------
// Context menus — registered once on install
// ---------------------------------------------------------------------------
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'set-original',
    title: 'Set as Original',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: 'set-modified',
    title: 'Set as Modified',
    contexts: ['selection'],
  });
});

// ---------------------------------------------------------------------------
// Get full selection text from the active tab (avoids selectionText truncation)
// ---------------------------------------------------------------------------
async function getFullSelection(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => window.getSelection().toString(),
    });
    return results?.[0]?.result || '';
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Context menu click handler
// ---------------------------------------------------------------------------
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const text = await getFullSelection(tab.id) || info.selectionText;
  if (!text) return;

  if (info.menuItemId === 'set-original') {
    await chrome.storage.local.set({ original: text });
    const { modified } = await chrome.storage.local.get('modified');
    if (modified) openDiffer();
  } else if (info.menuItemId === 'set-modified') {
    await chrome.storage.local.set({ modified: text });
    const { original } = await chrome.storage.local.get('original');
    if (original) openDiffer();
  }
});

// ---------------------------------------------------------------------------
// Message handler — popup delegates "open differ" here so the listener
// survives after the popup closes
// ---------------------------------------------------------------------------
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'openDiffer') openDiffer();
});

// ---------------------------------------------------------------------------
// Open differ in a new tab and inject texts
// ---------------------------------------------------------------------------
async function openDiffer() {
  // Register listener BEFORE creating the tab to avoid a race condition
  // where the page loads from service worker cache before the listener exists
  let targetTabId;
  chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
    if (tabId === targetTabId && changeInfo.status === 'complete') {
      chrome.tabs.onUpdated.removeListener(listener);
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js'],
      });
    }
  });
  const tab = await chrome.tabs.create({ url: DIFFER_URL });
  targetTabId = tab.id;
}
