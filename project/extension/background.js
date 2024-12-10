chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ blacklist: [] });
});

// Listen for navigation events to check blacklisted sites
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  const { blacklist = [] } = await chrome.storage.local.get('blacklist');
  if (blacklist.includes(details.url)) {
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL('blocked.html')
    });
  }
});