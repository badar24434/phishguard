'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getScanHistory } from '@/lib/storage';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function AlertsPage() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    setHistory(getScanHistory());
  }, []);

  return (
    <div className="container p-6">
      <h1 className="text-3xl font-bold mb-6">Scan History & Alerts</h1>
      
      <div className="space-y-4">
        {history.map((scan, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center gap-4">
              {scan.isPhishing ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              <div className="flex-1">
                <CardTitle className="text-base">
                  {scan.url}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(scan.timestamp).toLocaleString()}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                scan.isPhishing ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'
              }`}>
                {scan.isPhishing ? 'Phishing' : 'Safe'}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Confidence: {Math.round(scan.confidence * 100)}%
              </div>
            </CardContent>
          </Card>
        ))}
        
        {history.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No scan history available yet. Start by scanning a website!
          </p>
        )}
      </div>
    </div>
  );
}