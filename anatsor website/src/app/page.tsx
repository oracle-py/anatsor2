import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from './components/HeroSection';
import ChallengesSection from './components/ChallengesSection';
import AIPMSBentoSection from './components/AIPMSBentoSection';
import SDGImpactSection from './components/SDGImpactSection';
import FounderCTASection from './components/FounderCTASection';
import ReviewsSection from './components/ReviewsSection';

export default function HomePage() {
  return (
    <main className="bg-background text-foreground overflow-x-hidden">
      <div className="grain-overlay" aria-hidden="true" />
      <Header />
      <HeroSection />
      <ChallengesSection />
      <AIPMSBentoSection />
      <SDGImpactSection />
      <FounderCTASection />
      <ReviewsSection />
      <Footer />
    </main>
  );
}