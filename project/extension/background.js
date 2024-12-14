let scanCache = new Map();

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ blacklist: [] });
});

async function scanUrl(url) {
  if (scanCache.has(url)) {
    return scanCache.get(url);
  }

  try {
    const response = await fetch('http://localhost:8001/api', {  // Changed from /api/scan to /api
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!response.ok) throw new Error('Scan failed');
    
    const result = await response.json();
    scanCache.set(url, result);
    return result;
  } catch (error) {
    console.error('Scan error:', error);
    return null;
  }
}

chrome.webNavigation.onCommitted.addListener(async (details) => {
  // Only handle main frame navigation
  if (details.frameId !== 0) return;

  const result = await scanUrl(details.url);
  if (!result) return;

  if (result.isPhishing) {
    // Show warning banner via content script
    chrome.tabs.sendMessage(details.tabId, {
      type: 'PHISHING_WARNING',
      data: result
    });

    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/logo.png',
      title: 'Phishing Warning',
      message: `The site ${new URL(details.url).hostname} may be dangerous!`
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === 'leaveSite') {
    chrome.tabs.update(sender.tab.id, {
      url: 'chrome://newtab/'
    });
  }
});