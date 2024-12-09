'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is authenticated (e.g., by checking localStorage or a cookie)
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <nav className="p-4 bg-background border-b">
      {isAuthenticated ? (
        <Link href="/logout">
          <Button variant="outline">Logout</Button>
        </Link>
      ) : (
        <Link href="/signin">
          <Button variant="outline">Sign In</Button>
        </Link>
      )}
    </nav>
  );
}

export default Navbar;
