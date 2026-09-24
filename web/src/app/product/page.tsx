import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductHero from './components/ProductHero';
import AppShowcaseSection from './components/AppShowcaseSection';
import OurSolutionsSection from './components/OurSolutionsSection';
import ProductBento from './components/ProductBento';
import SolarTechSection from './components/SolarTechSection';
import ProductCTASection from './components/ProductCTASection';

export default function ProductPage() {
  return (
    <main className="bg-background text-foreground overflow-x-hidden">
      <div className="grain-overlay" aria-hidden="true" />
      <Header />
      <ProductHero />
      <AppShowcaseSection />
      <OurSolutionsSection />
      <ProductBento />
      <SolarTechSection />
      <ProductCTASection />
      <Footer />
    </main>
  );
}
