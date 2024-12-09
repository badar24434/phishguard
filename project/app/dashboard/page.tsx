'use client';

import { PhishingStats } from '@/components/phishing-stats';
import { PhishingChart } from '@/components/phishing-chart';
import { WebsiteScanner } from '@/components/website-scanner';

export default function DashboardPage() {
  return (
    <div className="container p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="space-y-6">
        <WebsiteScanner />
        <PhishingStats />
        <PhishingChart />
      </div>
    </div>
  );
}