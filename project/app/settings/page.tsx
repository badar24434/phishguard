'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    enableNotifications: true,
    autoScan: false,
    highSecurity: false,
  });
  const { toast } = useToast();
  const router = useRouter();

  const handleSettingChange = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleClearHistory = () => {
    toast({
      title: "History Cleared",
      description: "Your scan history has been cleared successfully",
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="container p-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBack}
        className="mb-6 text-muted-foreground"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Desktop Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts about scanning results
                </p>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={() => handleSettingChange('enableNotifications')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Scan Links</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically scan links when clicked
                </p>
              </div>
              <Switch
                checked={settings.autoScan}
                onCheckedChange={() => handleSettingChange('autoScan')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>High Security Mode</Label>
                <p className="text-sm text-muted-foreground">
                  More strict phishing detection rules
                </p>
              </div>
              <Switch
                checked={settings.highSecurity}
                onCheckedChange={() => handleSettingChange('highSecurity')}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleClearHistory}
            >
              Clear Scan History
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
