'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { saveScanResult } from '@/lib/storage';
import { ScanResult } from '@/lib/phishing-detection';

export function WebsiteScanner() {
  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Store URL in localStorage on change
  useEffect(() => {
    const savedUrl = localStorage.getItem('url');
    if (savedUrl) {
      setUrl(savedUrl);
    }
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleScan = async () => {
    if (url.trim() === '') return;

    setScanning(true);
    setResult(null); // Reset previous results
    localStorage.setItem('url', url);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        cache: 'no-store', // Add this line to prevent caching
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const scanResult = await response.json();
      
      if (scanResult.error) {
        throw new Error(scanResult.error);
      }

      setResult(scanResult);
      saveScanResult(scanResult);
    } catch (error) {
      console.error('Error scanning URL:', error);
      setResult({
        url,
        timestamp: new Date().toISOString(),
        isPhishing: false,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Failed to analyze the URL'
      });
    } finally {
      setScanning(false);
    }
  };

  // Conditionally render back button if we're not on the dashboard
  const isNotDashboard = pathname !== '/dashboard'; // Use pathname here

  return (
    <div>
      {isNotDashboard && (
        <Button variant="ghost" size="icon" onClick={handleBack} className="mb-4">
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}
      
      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <Shield className="h-12 w-12 text-primary" />
            <h2 className="text-2xl font-semibold">Scan a website</h2>
            <div className="flex w-full max-w-xl gap-2">
              <Input
                placeholder="Enter a website URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button onClick={handleScan} disabled={scanning}>
                {scanning ? 'Scanning...' : 'Scan'}
              </Button>
            </div>

            {result && (
              <div className="w-full max-w-xl mt-4">
                <div className={`flex items-center gap-4 p-4 rounded-lg ${
                  result.isPhishing ? 'bg-destructive/10' : 'bg-green-500/10'
                }`}>
                  {result.isPhishing ? (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">
                      {result.isPhishing ? 'Warning: Potential Phishing Site' : 'Safe Website'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Confidence: {Math.round(result.isPhishing ? 
                        result.confidence * 100 : // For phishing sites
                        (1 - result.confidence) * 100 // For safe sites
                      )}%
                    </div>
                    {result.error && (
                      <div className="text-sm text-destructive">{result.error}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
