import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AboutHero from './components/AboutHero';
import MissionSection from './components/MissionSection';
import FounderSection from './components/FounderSection';
import ValuesSection from './components/ValuesSection';
import ContactSection from './components/ContactSection';

export default function AboutPage() {
  return (
    <main className="bg-background text-foreground overflow-x-hidden">
      <div className="grain-overlay" aria-hidden="true" />
      <Header />
      <AboutHero />
      <MissionSection />
      <FounderSection />
      <ValuesSection />
      <ContactSection />
      <Footer />
    </main>
  );
}