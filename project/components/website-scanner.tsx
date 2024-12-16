'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2, Copy } from 'lucide-react'; // Add Loader2 and Copy import
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { saveScanResult, saveItem, updateSavedItem } from '@/lib/storage';
import { ScanResult } from '@/lib/phishing-detection';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Import the GFM plugin
import { toast } from './ui/use-toast';
import { RecommendationsModal } from './recommendations-modal';

export function WebsiteScanner() {
  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [savedItemId, setSavedItemId] = useState<string | null>(null);

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

      const savedItem = saveItem({
        url,
        scanResult: {
          isPhishing: scanResult.isPhishing,
          confidence: scanResult.confidence
        }
      });
      
      // Store the ID for later updates
      setSavedItemId(savedItem.id);

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

  const generateSummary = async () => {
    setLoading(true);
    setIsGeneratingSummary(true);
    try {
      const domain = new URL(url).hostname;

      const response = await fetch('http://localhost:8001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          url: domain,
          scan_result: result  // Add scan result to the payload
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Format and display the summary
      setSummary(data.summary);

      if (savedItemId) {
        updateSavedItem(savedItemId, { analysis: data.summary });
      }

    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
      setIsGeneratingSummary(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      toast({
        title: "Copied",
        description: "Summary copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
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
                        result.confidence * 100 : 100
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

      {result && !result.error && (
        <Card className="bg-card mt-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-xl font-semibold">Website Analysis</h3>
              
              <Button 
                onClick={generateSummary}
                disabled={loading || !url}
                className="w-full max-w-xl bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-200"
              >
                {isGeneratingSummary ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  'Generate Website Analysis with AI'
                )}
              </Button>
              
              {summary && (
                <div className="w-full max-w-xl mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-end mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-8 px-2"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="prose prose-sm dark:prose-invert custom-markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
                  </div>
                  {result.isPhishing && ( // Only show recommendations button for phishing sites
                    <Button
                      onClick={() => setShowRecommendations(true)}
                      className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    >
                      Tools Recommendations Based on The Analysis
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <RecommendationsModal 
        isOpen={showRecommendations}
        onClose={() => setShowRecommendations(false)}
        savedItemId={savedItemId || ''}
        url={url} // Add this prop
      />
    </div>
  );
}

