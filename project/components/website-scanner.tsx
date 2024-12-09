'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation'; 
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { scanUrl } from '@/lib/phishing-detection';
import { saveScanResult } from '@/lib/storage';

export function WebsiteScanner() {
  const router = useRouter();
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
    localStorage.setItem('url', url);

    try {
      // Use the scanUrl function directly instead of making an API call
      const scanResult = await scanUrl(url);
      setResult(scanResult);
      saveScanResult(scanResult); // Save to scan history
    } catch (error) {
      console.error("Error scanning URL:", error);
      setResult({
        isPhishing: true,
        confidence: 1,
        error: "Invalid URL or scanning error"
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div>
      <Button variant="ghost" size="icon" onClick={handleBack} className="mb-4">
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
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
                      Confidence: {Math.round(result.confidence * 100)}%
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
