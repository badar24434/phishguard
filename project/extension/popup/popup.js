import { scanUrl, reportUrl, addToBlacklist, checkBlacklist } from '../lib/security.js';
import { showNotification } from '../lib/notifications.js';

document.addEventListener('DOMContentLoaded', async () => {
  const getCurrentTab = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Unknown') return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const showLoader = () => {
    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('scanResult').classList.add('hidden');
    document.getElementById('actionButtons').classList.add('hidden');
  };

  const hideLoader = () => {
    document.getElementById('loader').classList.add('hidden');
  };

  // Update UI function
  const updateUI = (result) => {
    const indicator = document.querySelector('.status-indicator');
    const statusTitle = document.querySelector('.status-title');
    const actionButtons = document.getElementById('actionButtons');

    // Update status based on model prediction
    if (result.safe) {
      indicator.style.backgroundColor = 'var(--accent-color)';
      statusTitle.textContent = 'Website Appears Safe';
      actionButtons.classList.add('hidden');
    } else {
      indicator.style.backgroundColor = 'var(--danger-color)';
      statusTitle.textContent = 'Potential Phishing Site';
      actionButtons.classList.remove('hidden');
    }

    // Update details with risk interpretation
    document.getElementById('countryValue').textContent = result.details.country;
    document.getElementById('firstSeenValue').textContent = formatDate(result.details.firstSeen);
    document.getElementById('hostValue').textContent = result.details.host;
    document.getElementById('riskScoreValue').textContent = `${result.details.riskScore}/100 ${
      result.details.riskScore > 50 ? '(High Risk)' : '(Low Risk)'
    }`;

    document.getElementById('scanResult').classList.remove('hidden');
  };

  // Scan URL Button
  document.getElementById('scanUrl').addEventListener('click', async () => {
    const tab = await getCurrentTab();
    const url = tab.url;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      updateUI({
        safe: true,
        details: {
          country: 'N/A',
          firstSeen: 'N/A',
          host: 'Browser Page',
          riskScore: 0
        }
      });
      return;
    }

    showLoader();
    try {
      console.log('Starting scan for:', tab.url);
      const result = await scanUrl(tab.url);
      hideLoader();
      updateUI(result);
    } catch (error) {
      console.error('Scan failed:', error);
      hideLoader();
      showNotification('Error', `Failed to scan website: ${error.message}`);
    }
  });

  // Report URL Button
  document.getElementById('reportUrl').addEventListener('click', async () => {
    const tab = await getCurrentTab();
    try {
      await reportUrl(tab.url);
      showNotification('Success', 'Website reported successfully. Thank you for helping keep the web safe!');
    } catch (error) {
      showNotification('Error', 'Failed to report website. Please try again.');
    }
  });

  // Antivirus Scan Button
  document.getElementById('antivirusScan').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.mcafee.com/en-my/antivirus.html' });
  });

  // Check if current URL is blacklisted on popup open
  const tab = await getCurrentTab();
  const isBlacklisted = await checkBlacklist(tab.url);
  if (isBlacklisted) {
    updateUI({ safe: false, details: { country: 'N/A', firstSeen: 'N/A', host: 'N/A', riskScore: 100 } });
  }
});