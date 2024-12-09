'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-6 max-w-3xl mx-auto"
    >
      <h1 className="text-5xl font-bold tracking-tight">
        Protect Yourself from Phishing Attacks
      </h1>
      <p className="text-xl text-muted-foreground">
        PhishGuard uses advanced AI to detect and prevent phishing attempts in real-time.
        Stay safe while browsing with our powerful protection system.
      </p>
      <div className="space-x-4">
        <Link href="/signup">
          <Button size="lg">Start Protection</Button>
        </Link>
        <Link href="/about">
          <Button size="lg" variant="outline">Learn More</Button>
        </Link>
      </div>
    </motion.div>
  );
}