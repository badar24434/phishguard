let warningBanner = null;

function createWarningBanner(result) {
  if (warningBanner) return;

  warningBanner = document.createElement('div');
  warningBanner.id = 'phishguard-warning';
  warningBanner.innerHTML = `
    <div class="warning-content">
      <img src="${chrome.runtime.getURL('assets/logo.png')}" alt="PhishGuard Logo" />
      <div class="warning-text">
        <h2>⚠️ Warning: Potential Phishing Site Detected</h2>
        <p>This website has been flagged as potentially dangerous.</p>
        <p>Confidence: ${Math.round(result.confidence * 100)}%</p>
      </div>
      <button id="phishguard-proceed">Proceed Anyway</button>
      <button id="phishguard-leave">Leave Site</button>
    </div>
  `;

  document.body.prepend(warningBanner);

  document.getElementById('phishguard-proceed').addEventListener('click', () => {
    warningBanner.remove();
    warningBanner = null;
  });

  document.getElementById('phishguard-leave').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'leaveSite' });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PHISHING_WARNING') {
    createWarningBanner(message.data);
  }
});
