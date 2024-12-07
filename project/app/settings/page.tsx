'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    enableNotifications: true,
    autoScan: false,
    highSecurity: false,
    darkMode: false,
  });
  
  const { toast } = useToast();

  const handleSettingChange = (key: string) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: !prev[key as keyof typeof prev] };
      
      toast({
        title: 'Settings Updated',
        description: `${key} has been ${newSettings[key as keyof typeof newSettings] ? 'enabled' : 'disabled'}.`,
      });
      
      return newSettings;
    });
  };

  const clearHistory = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      toast({
        title: 'History Cleared',
        description: 'All scan history has been cleared.',
      });
    }
  };

  return (
    <div className="container p-6">
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
              onClick={clearHistory}
            >
              Clear Scan History
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}