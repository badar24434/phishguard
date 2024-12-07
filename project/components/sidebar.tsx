'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Shield, BarChart3, Settings, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/',
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

  return (
    <div className="flex h-full w-[200px] flex-col border-r bg-card px-2">
      <div className="flex h-14 items-center border-b px-2">
        <Shield className="h-6 w-6 text-primary" />
        <span className="ml-2 font-semibold">PhishGuard</span>
      </div>
      <div className="flex-1 space-y-1 py-4">
        {sidebarItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              className={cn('w-full justify-start gap-2')}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}