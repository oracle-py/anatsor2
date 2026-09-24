'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

// BENTO AUDIT:
// Array has 4 cards: [SolarPower, EnvironmentalControl, AIAnalytics, MobileApp]
// 4-col grid, 2-row grid (280px rows):
// Row 1: [col-1-2: SolarPower cs-2 rs-2] [col-3: EnvironmentalControl cs-1 rs-1] [col-4: AIAnalytics cs-1 rs-1]
// Row 2: [col-1-2: SolarPower (continued)] [col-3-4: MobileApp cs-2 rs-1]
// Placed 4/4 cards ✓

export default function AIPMSBentoSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    const items = sectionRef.current?.querySelectorAll('.bento-item');
    items?.forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = `${i * 80}ms`;
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-10 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-4 block">
              The Solution
            </span>
            <h2 className="text-display font-extrabold text-primary tracking-tight">
              WORK LESS,<br />
              <span className="italic font-light text-muted-foreground">ACHIEVE MORE WITH AIPMS.</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
            AIPMS helps manage poultry farms effortlessly through powerful automation and AI-driven insights. Adapts to both seasoned and new farmers with top-tier security and seamless integration.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="bento-grid-home">

          {/* Card 1: Solar Power — col-span-2, row-span-2 */}
          {/* BENTO: SolarPower cs-2 rs-2 */}
          <div className="bento-item col-span-2 row-span-2 p-0 overflow-hidden flex flex-col">
            <div className="relative w-full h-full min-h-[280px]">
              <AppImage
                src="https://img.rocket.new/generatedImages/rocket_gen_img_1b937a421-1773093286076.png"
                alt="Solar panels installed on a farm roof in bright African sunlight, clear blue sky, clean energy, warm golden light reflecting off panels"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent" />
              <div className="absolute inset-0 p-10 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-accent/60 text-7xl font-extrabold italic opacity-50">01</span>
                  <span className="sdg-badge bg-accent/20 text-accent border border-accent/30">
                    SDG 7 · Clean Energy
                  </span>
                </div>
                <div>
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-primary-foreground mb-4 tracking-tight">
                    Solar-Powered<br />Technology
                  </h3>
                  <p className="text-primary-foreground/60 text-base max-w-sm mb-6 font-light leading-relaxed">
                    AIPMS uses solar-powered technology instead of kerosene dependence, offering a sustainable, eco-friendly energy source that also reduces the environmental impact of poultry farming.
                  </p>
                  <div className="flex gap-4">
                    <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase text-primary-foreground">Battery Backup</span>
                    <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase text-primary-foreground">Zero Emissions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Environmental Control — col-span-1, row-span-1 */}
          {/* BENTO: EnvironmentalControl cs-1 rs-1 */}
          <div className="bento-item col-span-1 row-span-1 p-8 flex flex-col justify-between bg-card group">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-primary-foreground transition-all duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <span className="text-accent/40 text-4xl font-extrabold italic">02</span>
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-foreground mb-3 tracking-tight">
                Precision<br />Environmental Control
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                AIPMS gives farmers precision control over lighting, feeding, and critical incubation heat, mitigating losses from extreme temperatures and climate-driven fluctuations.
              </p>
            </div>
          </div>

          {/* Card 3: AI Analytics — col-span-1, row-span-1 */}
          {/* BENTO: AIAnalytics cs-1 rs-1 */}
          <div className="bento-item col-span-1 row-span-1 p-8 flex flex-col justify-between bg-gradient-to-br from-primary/5 to-background border border-primary/10 group">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="text-accent/40 text-4xl font-extrabold italic">03</span>
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-foreground mb-3 tracking-tight">
                AI-Driven<br />Insights
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                AIPMS continuously monitors and optimizes farm operations — tracking environmental changes, monitoring flock health, and enabling data-driven decisions without constant manual oversight.
              </p>
            </div>
          </div>

          {/* Card 4: Mobile App — col-span-2, row-span-1 */}
          {/* BENTO: MobileApp cs-2 rs-1 */}
          <div className="bento-item col-span-2 row-span-1 p-8 flex flex-col sm:flex-row gap-6 justify-between items-center bg-card group overflow-hidden">
            <div className="flex flex-col justify-between h-full flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-accent/40 text-4xl font-extrabold italic">04</span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-foreground mb-3 tracking-tight">
                  Real-Time Monitoring<br />&amp; Remote Control
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Real-time monitoring, automated environmental control, and personalized recommendations tailored to each farm — all from your smartphone.
                </p>
                <Link
                  href="/product"
                  className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-primary transition-colors">
                  
                  See full app features
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Mini phone mockup */}
            <div className="hidden sm:flex flex-col gap-2 bg-primary/5 rounded-3xl p-4 min-w-[160px] border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Farm A</span>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
              <div className="flex justify-between text-xs">
                <div>
                  <p className="font-bold text-foreground">32°C</p>
                  <p className="text-muted-foreground">Temp</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">65%</p>
                  <p className="text-muted-foreground">Humidity</p>
                </div>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-accent" style={{ width: '78%' }} />
              </div>
              <p className="text-xs text-muted-foreground">Feed: 78% remaining</p>
            </div>
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/product"
            className="magnetic-btn px-10 py-4 bg-primary text-primary-foreground rounded-full font-bold text-sm uppercase tracking-widest hover:bg-secondary transition-all duration-300 shadow-lg">
            
            Explore All AIPMS Features
          </Link>
        </div>
      </div>
    </section>);

}