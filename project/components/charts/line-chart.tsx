'use client';

import { ComponentProps } from 'react';
import {
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  [key: string]: string | number;
}

interface LineChartProps {
  data: DataPoint[];
  xAxisKey: string;
  yAxisKey: string;
  height?: number;
}

export function LineChart({
  data,
  xAxisKey,
  yAxisKey,
  height = 300,
}: LineChartProps) {
  const defaultAxisProps = {
    stroke: '#888888',
    fontSize: 12,
    tickLine: false,
    axisLine: false,
  };

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <XAxis 
            {...defaultAxisProps}
            dataKey={xAxisKey}
          />
          <YAxis
            {...defaultAxisProps}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey={yAxisKey}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}