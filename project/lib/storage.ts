import { ScanResult } from './phishing-detection';

const STORAGE_KEY = 'phishing_scan_results';

export function getScanHistory(): ScanResult[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveScanResult(result: ScanResult): void {
  if (typeof window === 'undefined') return;
  const history = getScanHistory();
  history.unshift(result);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 100)));
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