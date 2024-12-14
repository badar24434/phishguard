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

export function getChartData() {
  const history = getScanHistory();
  const last7Days = new Array(7).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  // Create a map of dates and their phishing attempts
  const dailyPhishing = history.reduce((acc: { [key: string]: number }, scan) => {
    const date = new Date(scan.timestamp).toISOString().split('T')[0];
    if (scan.isPhishing) {
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {});

  // Format data for the chart
  return last7Days.map(date => ({
    date,
    attempts: dailyPhishing[date] || 0
  }));
}