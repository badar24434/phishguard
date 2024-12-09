import { NavHeader } from '@/components/landing/nav-header';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container mx-auto px-6 py-12">
        <HeroSection />
        <FeaturesSection />
      </main>
    </div>
  );
}