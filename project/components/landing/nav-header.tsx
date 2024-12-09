import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export function NavHeader() {
  return (
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6" />
        <span className="font-bold text-xl">PhishGuard</span>
      </div>
      <div className="space-x-4">
        <Link href="/signin">
          <Button variant="ghost">Sign In</Button>
        </Link>
        <Link href="/signup">
          <Button>Get Started</Button>
        </Link>
      </div>
    </nav>
  );
}