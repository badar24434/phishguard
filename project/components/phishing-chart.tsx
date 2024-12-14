'use client';

import { useEffect, useState } from 'react';
import { LineChart } from '@/components/charts/line-chart';
import { getChartData } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PhishingChart() {
  const [data, setData] = useState(getChartData());

  useEffect(() => {
    // Initial load
    setData(getChartData());

    // Listen for storage updates from extension
    const handleStorageUpdate = () => {
      setData(getChartData());
    };

    window.addEventListener('phishguardStorageUpdate', handleStorageUpdate);

    // Refresh every 5 seconds to match stats refresh
    const interval = setInterval(() => {
      setData(getChartData());
    }, 5000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('phishguardStorageUpdate', handleStorageUpdate);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phishing Attempts (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <LineChart 
            data={data} 
            xAxisKey="date" 
            yAxisKey="attempts"
          />
        </div>
      </CardContent>
    </Card>
  );
}