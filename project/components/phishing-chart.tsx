'use client';

import { useEffect, useState } from 'react';
import { LineChart } from '@/components/charts/line-chart';
import { getChartData, TimeRange } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const timeRanges = [
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: '90days', label: 'Last 90 Days' },
] as const;

export function PhishingChart() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7days');
  const [data, setData] = useState(getChartData(selectedRange));

  useEffect(() => {
    // Update data when range changes
    setData(getChartData(selectedRange));

    const handleStorageUpdate = () => {
      setData(getChartData(selectedRange));
    };

    window.addEventListener('phishguardStorageUpdate', handleStorageUpdate);

    const interval = setInterval(() => {
      setData(getChartData(selectedRange));
    }, 5000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('phishguardStorageUpdate', handleStorageUpdate);
    };
  }, [selectedRange]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Phishing Attempts</CardTitle>
        <Select
          value={selectedRange}
          onValueChange={(value: TimeRange) => setSelectedRange(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map(({ value, label }) => (
              <SelectItem
                key={value}
                value={value}
                className="cursor-pointer hover:bg-accent"
              >
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <LineChart 
            data={data} 
            xAxisKey="date" 
            yAxisKey="attempts"
            warningThreshold={5}
            dangerThreshold={10}
          />
        </div>
      </CardContent>
    </Card>
  );
}