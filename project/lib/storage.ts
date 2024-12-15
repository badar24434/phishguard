import { ScanResult } from './phishing-detection';
import { SavedItem } from '@/types/saved-item';

const STORAGE_KEY = 'phishing_scan_results';
const SAVED_ITEMS_KEY = 'phishguard_saved_items';

export function getScanHistory(): ScanResult[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveScanResult(result: ScanResult): void {
  if (typeof window === 'undefined') return;
  const history = getScanHistory();
  history.unshift(result);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 200)));
  // Dispatch custom event for real-time updates
  window.dispatchEvent(new CustomEvent('phishguardStorageUpdate', {
    detail: { type: 'scan', data: result }
  }));
}

export function saveExtensionScanResult(url: string, isPhishing: boolean): void {
  if (typeof window === 'undefined') return;
  const result: ScanResult = {
    url,
    timestamp: new Date().toISOString(),
    isPhishing,
    confidence: isPhishing ? 0.9 : 0.1, 
  };
  saveScanResult(result);
}

export function getStatistics() {
  const history = getScanHistory();
  const last30Days = history.filter(
    result => new Date(result.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );

  return {
    totalScans: history.length,
    phishingDetected: last30Days.filter(result => result.isPhishing).length,
    safeWebsites: last30Days.filter(result => !result.isPhishing).length,
    recentScans: last30Days.length,
  };
}

export type TimeRange = '7days' | '30days' | '90days';

export function getChartData(range: TimeRange = '7days') {
  const history = getScanHistory();
  const days = range === '7days' ? 7 : range === '30days' ? 30 : 90;
  
  const daysArray = new Array(days).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailyPhishing = history.reduce((acc: { [key: string]: number }, scan) => {
    const date = new Date(scan.timestamp).toISOString().split('T')[0];
    if (scan.isPhishing) {
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {});

  return daysArray.map(date => ({
    date,
    attempts: dailyPhishing[date] || 0
  }));
}

export function getSavedItems(): SavedItem[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(SAVED_ITEMS_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function saveItem(item: Partial<SavedItem>) {
  const items = getSavedItems();
  const newItem: SavedItem = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    url: item.url || '',
    scanResult: item.scanResult,
    analysis: item.analysis,
    selectedTools: item.selectedTools,
  };
  
  items.unshift(newItem); // Add new item at the beginning
  localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(items));
  return newItem;
}

export function updateSavedItem(id: string, updates: Partial<SavedItem>) {
  const items = getSavedItems();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(items));
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('storage', {
      detail: { type: 'savedItems', data: items }
    }));
  }
}