import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WebsiteScanner } from '@/components/website-scanner';
import { PhishingStats } from '@/components/phishing-stats';
import { PhishingChart } from '@/components/phishing-chart';

export default function Home() {
  return (
    <div className="container p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <WebsiteScanner />
      
      <div className="grid gap-4 md:grid-cols-3">
        <PhishingStats />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Phishing Attempts Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <PhishingChart />
        </CardContent>
      </Card>
    </div>
  );
}