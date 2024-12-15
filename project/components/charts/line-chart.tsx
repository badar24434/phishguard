'use client';

import { ComponentProps } from 'react';
import {
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface DataPoint {
  [key: string]: string | number;
}

interface LineChartProps {
  data: DataPoint[];
  xAxisKey: string;
  yAxisKey: string;
  height?: number;
  warningThreshold?: number;
  dangerThreshold?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const attempts = payload[0].value;
    const isWarning = attempts >= 5; // Warning threshold
    const isDanger = attempts >= 10;  // Danger threshold
    
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        <p className={`text-sm ${
          isDanger ? 'text-destructive font-bold' :
          isWarning ? 'text-yellow-500 font-bold' :
          'text-muted-foreground'
        }`}>
          {attempts} phishing attempts
          {isDanger && ' ⚠️ High Risk!'}
          {isWarning && !isDanger && ' ⚠️ Warning'}
        </p>
      </div>
    );
  }
  return null;
};

export function LineChart({
  data,
  xAxisKey,
  yAxisKey,
  height = 300,
  warningThreshold = 5,
  dangerThreshold = 10,
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
          <Tooltip content={<CustomTooltip />} />
          {/* Safe threshold line */}
          <ReferenceLine
            y={warningThreshold}
            stroke="#EAB308" // Changed to Tailwind's yellow-500
            strokeDasharray="3 3"
            label={{
              value: "Warning Threshold",
              fill: "#EAB308", // Changed to match stroke color
              fontSize: 12,
            }}
          />
          {/* Danger threshold line */}
          <ReferenceLine
            y={dangerThreshold}
            stroke="hsl(var(--destructive))"
            strokeDasharray="3 3"
            label={{
              value: "Danger Threshold",
              fill: "hsl(var(--destructive))",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey={yAxisKey}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={(props: any) => {
              const attempts = props.payload[yAxisKey];
              if (attempts >= dangerThreshold) {
                return (
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={4}
                    fill="hsl(var(--destructive))"
                    stroke="none"
                  />
                );
              } else if (attempts >= warningThreshold) {
                return (
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={4}
                    fill="hsl(var(--warning))"
                    stroke="none"
                  />
                );
              }
              return null;
            }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}