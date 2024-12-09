'use client';

import { motion } from 'framer-motion';

interface FeatureCardProps {
  title: string;
  description: string;
  delay: number;
}

export function FeatureCard({ title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-6 rounded-lg border bg-card"
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}