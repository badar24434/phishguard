'use client';

import { FeatureCard } from './feature-card';

const features = [
  {
    title: 'Real-time Detection',
    description: 'Instant analysis of websites to identify potential phishing threats before they can harm you.',
  },
  {
    title: 'AI-Powered',
    description: 'Advanced machine learning algorithms that continuously learn and adapt to new threats.',
  },
  {
    title: 'Easy to Use',
    description: 'Simple interface that makes it easy to stay protected while browsing the web.',
  },
  {
    title: 'AI-Generated Summary',
    description: 'Automatically provides concise summaries of potential threats for quick understanding and informed decision-making.',
  },
  
];

export function FeaturesSection() {
  return (
    <div className="mt-24 grid md:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <FeatureCard
          key={feature.title}
          title={feature.title}
          description={feature.description}
          delay={0.2 + index * 0.1}
          className={feature.title === 'AI-Generated Summary' ? 'md:col-span-3' : ''} 
        />
      ))}
    </div>
  );
}
