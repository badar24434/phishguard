import { getWhoisData, getIPQualityScore } from './api.js';
import { API_ENDPOINTS } from './constants.js';

export const scanUrl = async (url) => {
  try {
    // Show loading state
    const domain = new URL(url).hostname;
    
    // Parallel API calls for better performance
    const [whoisData, ipQualityScore] = await Promise.all([
      getWhoisData(domain),
      getIPQualityScore(url)
    ]);

    const result = {
      safe: ipQualityScore?.riskScore < 75,
      details: {
        ...whoisData,
        riskScore: ipQualityScore?.riskScore || 0,
        suspicious: ipQualityScore?.suspicious || false
      }
    };

    return result;
  } catch (error) {
    console.error('Error scanning URL:', error);
    throw new Error('Failed to scan URL');
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