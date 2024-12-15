export interface SavedItem {
  id: string;
  url: string;
  timestamp: string;
  scanResult?: {
    isPhishing: boolean;
    confidence: number;
  };
  analysis?: string;
  selectedTools?: {
    category: string;
    toolName: string;
  }[];
}
