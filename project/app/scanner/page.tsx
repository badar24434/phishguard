import { WebsiteScanner } from '@/components/website-scanner';

export default function ScannerPage() {
  return (
    <div className="container p-6">
      <h1 className="text-3xl font-bold mb-6">Website Scanner</h1>
      <WebsiteScanner />
    </div>
  );
}