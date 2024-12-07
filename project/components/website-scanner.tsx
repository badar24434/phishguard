'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { scanUrl } from '@/lib/phishing-detection';
import { saveScanResult } from '@/lib/storage';
import { useToast } from '@/components/ui/use-toast';

export function WebsiteScanner() {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleScan = async () => {
    try {
      setScanning(true);
      setResult(null);

      // Validate URL
      new URL(url);
      
      const scanResult = await scanUrl(url);
      saveScanResult(scanResult);
      setResult(scanResult);
      
      toast({
        title: scanResult.isPhishing ? 'Warning: Potential Phishing Site' : 'Safe Website',
        description: scanResult.isPhishing 
          ? `This website shows signs of being a phishing attempt (${Math.round(scanResult.confidence * 100)}% confidence)`
          : 'This website appears to be safe',
        variant: scanResult.isPhishing ? 'destructive' : 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Please enter a valid URL',
        variant: 'destructive',
      });
    } finally {
      setScanning(false);
    }
  };

  return (
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
              <div className={`flex items-center gap-2 p-4 rounded-lg ${
                result.isPhishing ? 'bg-destructive/10' : 'bg-green-500/10'
              }`}>
                {result.isPhishing ? (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                <div>
                  <p className="font-medium">
                    {result.isPhishing ? 'Potential Phishing Site' : 'Safe Website'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Confidence: {Math.round(result.confidence * 100)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}