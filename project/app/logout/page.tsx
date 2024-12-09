'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/app/logout/navbar';  // Correct import for Navbar

export default function LogoutPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Example: Clear authentication token
    toast({
      title: "Logged Out",
      description: "You have successfully logged out.",
    });
    router.push('/'); // Redirect to login or home page
  };

  const goToDashboard = () => {
    toast({
      title: "Dashboard",
      description: "Navigating to your dashboard.",
    });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Navbar /> {/* Navbar is displayed here */}
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg border text-center">
        <h1 className="text-2xl font-bold">Are you sure you want to log out?</h1>
        <div className="space-y-4">
          <Button className="w-full" onClick={handleLogout}>
            Logout
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={goToDashboard}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
