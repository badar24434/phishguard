export interface ScanResult {
  url: string;
  timestamp: string;
  isPhishing: boolean;
  confidence: number;
  error?: string;
}