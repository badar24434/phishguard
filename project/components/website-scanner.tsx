'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation'; 
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shield } from 'lucide-react';

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
    localStorage.setItem('url', url);  // Store URL in localStorage for persistence
    try {
      // Replace with your actual scan logic
      const response = await fetch(`/api/scan?url=${url}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error scanning URL:", error);
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
                <div className={`flex items-center gap-2 p-4 rounded-lg ${result.isPhishing ? 'bg-destructive/10' : 'bg-green-500/10'}`}>
                  <div>{result.isPhishing ? 'Warning: Phishing' : 'Safe'}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
