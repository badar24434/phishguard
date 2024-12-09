'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Shield, BarChart3, Settings, AlertCircle, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    title: 'Website Scanner',
    href: '/scanner',
    icon: Shield,
  },
  {
    title: 'Alerts',
    href: '/alerts',
    icon: AlertCircle,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      "relative h-full bg-card border-r transition-all duration-300",
      collapsed ? "w-[70px]" : "w-[200px]"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-6 z-10"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      <div className="flex h-14 items-center border-b px-2">
        <Shield className="h-6 w-6 text-primary" />
        {!collapsed && <span className="ml-2 font-semibold">PhishGuard</span>}
      </div>

      <div className="flex-1 space-y-1 py-4">
        {sidebarItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start',
                collapsed ? 'px-2' : 'px-4'
              )}
            >
              <item.icon className="h-4 w-4" />
              {!collapsed && <span className="ml-2">{item.title}</span>}
            </Button>
          </Link>
        ))}
      </div>

      <div className="absolute bottom-4 left-0 right-0 px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}