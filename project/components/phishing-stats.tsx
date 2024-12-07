'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';
import { getStatistics } from '@/lib/storage';
import { useEffect, useState } from 'react';

const StatCard = ({ title, value, icon: Icon, description }: any) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
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

  useEffect(() => {
    setStats(getStatistics());
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
    },
    {
      title: 'Safe Websites',
      value: stats.safeWebsites,
      icon: Shield,
      description: 'Last 30 days',
    },
    {
      title: 'Recent Scans',
      value: stats.recentScans,
      icon: AlertTriangle,
      description: 'Last 30 days',
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