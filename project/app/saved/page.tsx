'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSavedItems } from '@/lib/storage';
import { SavedItem } from '@/types/saved-item';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, ExternalLink, Clock, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';

export default function SavedPage() {
  const router = useRouter();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadSavedItems = () => {
      setSavedItems(getSavedItems());
    };

    loadSavedItems();
    window.addEventListener('storage', loadSavedItems);
    return () => window.removeEventListener('storage', loadSavedItems);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => router.push('/dashboard')}
        className="mb-4"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Saved Results</h1>
        <Badge variant="secondary">
          {savedItems.length} {savedItems.length === 1 ? 'Item' : 'Items'}
        </Badge>
      </div>
      
      <div className="grid gap-4">
        {savedItems.map((item) => (
          <Card key={item.id} className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-4">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-xl font-semibold">
                    {new URL(item.url).hostname}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {format(new Date(item.timestamp), 'MMM d, yyyy HH:mm')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(item.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpand(item.id)}
                >
                  {expandedItems.has(item.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {item.scanResult && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  item.scanResult.isPhishing ? 'bg-destructive/10' : 'bg-green-500/10'
                }`}>
                  {item.scanResult.isPhishing ? (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  <div>
                    <div className="font-medium">
                      {item.scanResult.isPhishing ? 'Potential Phishing Site' : 'Safe Website'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Confidence: {Math.round(item.scanResult.confidence * 100)}%
                    </div>
                  </div>
                </div>
              )}

              {expandedItems.has(item.id) && (
                <div className="mt-4 space-y-6">
                  {item.analysis && (
                    <div className="prose prose-sm dark:prose-invert">
                      <h4 className="text-lg font-semibold mb-2">Analysis</h4>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <ReactMarkdown>{item.analysis}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {item.selectedTools && item.selectedTools.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Selected Security Tools</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        {item.selectedTools.map((tool, index) => (
                          <div
                            key={index}
                            className="bg-muted/50 p-4 rounded-lg border border-border/50"
                          >
                            <div className="font-medium text-primary mb-2">
                              {tool.category.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {tool.toolName}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {savedItems.length === 0 && (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground text-center">
                No saved items yet. Scan websites to save them here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
