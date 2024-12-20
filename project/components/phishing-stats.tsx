'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';
import { getStatistics } from '@/lib/storage';
import { useEffect, useState } from 'react';

const StatCard = ({ title, value, icon: Icon, description, valueClassName, percentage }: any) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="flex items-baseline gap-2">
        <div className={`text-2xl font-bold ${valueClassName || ''}`}>{value}</div>
        {percentage !== undefined && (
          <div className="text-xs font-medium text-muted-foreground animate-fade-in">
            ({percentage}%)
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export function PhishingStats() {
  const [stats, setStats] = useState({
    totalScans: 0,
    phishingDetected: 0,
    safeWebsites: 0,
    recentScans: 0,
  });

  // Calculate percentages
  const calculatePercentage = (value: number) => {
    if (stats.totalScans === 0) return 0;
    return ((value / stats.totalScans) * 100).toFixed(1);
  };

  useEffect(() => {
    // Initial load
    setStats(getStatistics());

    // Listen for storage updates from extension
    const handleStorageUpdate = () => {
      setStats(getStatistics());
    };

    window.addEventListener('phishguardStorageUpdate', handleStorageUpdate);

    // Set up periodic refresh
    const interval = setInterval(() => {
      setStats(getStatistics());
    }, 5000); // Refresh every 5 seconds

    return () => {
      clearInterval(interval);
      window.removeEventListener('phishguardStorageUpdate', handleStorageUpdate);
    };
  }, []);

  const statCards = [
    {
      title: 'Total Scans',
      value: stats.totalScans,
      icon: Activity,
      description: 'All time',
    },
    {
      title: 'Phishing Detected',
      value: stats.phishingDetected,
      icon: ShieldAlert,
      description: 'Last 30 days',
      valueClassName: 'text-red-500 dark:text-red-400',
      percentage: calculatePercentage(stats.phishingDetected)
    },
    {
      title: 'Safe Websites',
      value: stats.safeWebsites,
      icon: Shield,
      description: 'Last 30 days',
      valueClassName: 'text-green-500 dark:text-green-400',
      percentage: calculatePercentage(stats.safeWebsites)
    },
    {
      title: 'Recent Scans',
      value: stats.recentScans,
      icon: AlertTriangle,
      description: 'Last 30 days',
      valueClassName: 'text-blue-500 dark:text-blue-400'
    },
  ];

  return (
    <>
      {statCards.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </>
  );
}