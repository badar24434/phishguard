import { getWhoisData, getIPQualityScore } from './api.js';
import { API_ENDPOINTS } from './constants.js';

export const scanUrl = async (url) => {
  try {
    const domain = new URL(url).hostname;
    console.log('Scanning domain:', domain);

    const [whoisData, modelResponse] = await Promise.all([
      getWhoisData(domain),
      fetch(`${API_ENDPOINTS.MODEL_SCAN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      }),
    ]);

    // Debug logging for WHOIS data
    console.log('Raw WHOIS Data:', whoisData.rawData);
    console.log('Parsed WHOIS fields:', {
      country: whoisData.country,
      firstSeen: whoisData.firstSeen,
      host: whoisData.host
    });

    const modelData = await modelResponse.json();
    console.log('Model Data:', modelData);
    console.log('WHOIS Data:', whoisData);

    if (modelData.error) {
      throw new Error(modelData.error);
    }

    const riskScore = Math.round(modelData.confidence * 100);
    console.log('Raw confidence:', modelData.confidence);
    console.log('Calculated risk score:', riskScore);

    return {
      safe: !modelData.isPhishing,
      details: {
        country: whoisData.country,
        firstSeen: whoisData.firstSeen,
        host: whoisData.host,
        riskScore: riskScore,
        modelPrediction: modelData.isPhishing,
        confidence: modelData.confidence
      }
    };
  } catch (error) {
    console.error('Detailed error:', error);
    throw error;
  }
};

export const reportUrl = async (url) => {
  try {
    // First add to blacklist
    await addToBlacklist(url);
    
    // Then try to report to backend
    const response = await fetch('http://localhost:3000/api/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error('Failed to report URL');
    }

    return await response.json();
  } catch (error) {
    console.error('Error reporting URL:', error);
    throw error;
  }
};

export const addToBlacklist = async (url) => {
  try {
    const blacklist = await chrome.storage.local.get('blacklist');
    const updatedBlacklist = [...(blacklist.blacklist || []), url];
    await chrome.storage.local.set({ blacklist: updatedBlacklist });
  } catch (error) {
    console.error('Error adding to blacklist:', error);
    throw new Error('Failed to add URL to blacklist');
  }
};

export const checkBlacklist = async (url) => {
  try {
    const { blacklist = [] } = await chrome.storage.local.get('blacklist');
    return blacklist.includes(url);
  } catch (error) {
    console.error('Error checking blacklist:', error);
    return false;
  }
};

// popup.js - Add debug logging
const updateUI = (result) => {
  console.log('UpdateUI received:', result); // Add this debug line
  
  const resultContainer = document.getElementById('scanResult');
  const actionButtons = document.getElementById('actionButtons');
  const statusTitle = document.querySelector('.status-title');
  
  if (result.safe) {
    statusTitle.textContent = 'Website Appears Safe';
  } else {
    statusTitle.textContent = `Potential Phishing Site (${result.details.riskScore}% Confidence)`;
  }
  
  // Log before updating risk score
  console.log('Risk Score Value:', result.details.riskScore);
  
  document.getElementById('riskScoreValue').textContent = 
    `${result.details.riskScore}/100`;
};

// Add click handler debug
document.getElementById('scanUrl').addEventListener('click', async () => {
  const tab = await getCurrentTab();
  const url = tab.url;
  
  showLoader();
  try {
    console.log('Starting scan for:', url);
    const result = await scanUrl(url);
    console.log('Scan result:', result); // Add this debug line
    hideLoader();
    updateUI(result);
  } catch (error) {
    console.error('Scan failed:', error);
    hideLoader();
    showNotification('Error', `Failed to scan website: ${error.message}`);
  }
});