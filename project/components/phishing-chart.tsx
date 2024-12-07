'use client';

import { LineChart } from '@/components/charts/line-chart';

const data = [
  { date: '2024-01-01', attempts: 4 },
  { date: '2024-01-02', attempts: 7 },
  { date: '2024-01-03', attempts: 5 },
  { date: '2024-01-04', attempts: 8 },
  { date: '2024-01-05', attempts: 12 },
  { date: '2024-01-06', attempts: 9 },
  { date: '2024-01-07', attempts: 6 },
];

export function PhishingChart() {
  return <LineChart data={data} xAxisKey="date" yAxisKey="attempts" />;
}