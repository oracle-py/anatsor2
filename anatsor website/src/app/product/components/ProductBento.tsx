'use client';

import React, { useEffect, useRef } from 'react';

// BENTO AUDIT:
// Array has 5 cards: [AutoFeeding, TempControl, HealthMonitor, DataAnalytics, RemoteControl]
// 4-col grid, 2-row grid:
// Row 1: [col-1-2: AutoFeeding cs-2 rs-1] [col-3: TempControl cs-1 rs-1] [col-4: HealthMonitor cs-1 rs-1]
// Row 2: [col-1-2: DataAnalytics cs-2 rs-1] [col-3-4: RemoteControl cs-2 rs-1]
// Placed 5/5 cards ✓

export default function ProductBento() {
  const bentoRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const items = entry.target.querySelectorAll<HTMLElement>('.bento-item');
            items.forEach((el, i) => {
              setTimeout(() => {
                el.style.transition = 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
              }, i * 90);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    if (bentoRef?.current) observer?.observe(bentoRef?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={bentoRef} className="py-20 px-4 sm:px-10 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-14 text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-accent mb-4 block">Core Capabilities</span>
          <h2 className="text-display font-extrabold text-primary tracking-tight mb-4">
            DELEGATE TASKS<br />
            <span className="italic font-light text-muted-foreground">TO AIPMS.</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed font-light">
            AIPMS is an AI-powered system that continuously monitors and optimizes farm operations — tracking environmental changes, monitoring flock health, and enabling data-driven decisions without constant manual oversight.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="bento-grid-product">

          {/* Card 1: AutoFeeding — col-span-2, row-span-1 */}
          {/* BENTO: AutoFeeding cs-2 rs-1 */}
          <div
            className="bento-item col-span-2 row-span-1 p-10 flex flex-row gap-8 items-center bg-gradient-to-br from-primary to-secondary group overflow-hidden"
            style={{ opacity: 0, transform: 'translateY(30px)' }}
          >
            <div className="flex-1">
              <div className="flex justify-between items-start mb-6">
                <span className="text-primary-foreground/30 text-5xl font-extrabold italic">01</span>
                <span className="sdg-badge bg-accent/20 text-accent border border-accent/30">Automated</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-primary-foreground mb-4 tracking-tight">
                Automated Feeding System
              </h3>
              <p className="text-primary-foreground/55 text-sm leading-relaxed font-light">
                AI-scheduled feeders deliver precise portions based on flock age, weight, and growth stage — eliminating waste and ensuring consistent nutrition across all pens.
              </p>
            </div>
            <div className="hidden sm:flex flex-col gap-3 min-w-[140px] bg-primary-foreground/10 rounded-3xl p-5 border border-primary-foreground/15">
              <div className="flex justify-between text-xs text-primary-foreground/60 font-bold uppercase">
                <span>Pen A</span>
                <span className="text-green-400">Active</span>
              </div>
              <div className="h-1.5 rounded-full bg-primary-foreground/20 overflow-hidden">
                <div className="h-full rounded-full bg-accent" style={{ width: '82%' }} />
              </div>
              <p className="text-xs text-primary-foreground/50">Feed: 82% full</p>
              <div className="flex justify-between text-xs text-primary-foreground/60 font-bold uppercase">
                <span>Next feed</span>
                <span className="text-accent">14:30</span>
              </div>
            </div>
          </div>

          {/* Card 2: TempControl — col-span-1, row-span-1 */}
          {/* BENTO: TempControl cs-1 rs-1 */}
          <div
            className="bento-item col-span-1 row-span-1 p-8 flex flex-col justify-between bg-card group"
            style={{ opacity: 0, transform: 'translateY(30px)' }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-accent/40 text-4xl font-extrabold italic">02</span>
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-foreground mb-3 tracking-tight">
                Temperature<br />Regulation
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Real-time thermal sensors with automated ventilation response — maintains ±0.3°C accuracy even during extreme weather events.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-foreground">32.1°C</span>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Optimal</span>
              </div>
            </div>
          </div>

          {/* Card 3: HealthMonitor — col-span-1, row-span-1 */}
          {/* BENTO: HealthMonitor cs-1 rs-1 */}
          <div
            className="bento-item col-span-1 row-span-1 p-8 flex flex-col justify-between bg-gradient-to-br from-accent/8 to-background border border-accent/15 group"
            style={{ opacity: 0, transform: 'translateY(30px)' }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-accent/40 text-4xl font-extrabold italic">03</span>
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-foreground mb-3 tracking-tight">
                Flock Health<br />Monitoring
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Continuous behavioral analysis detects early signs of disease, stress, or injury — alerting farmers before losses occur.
              </p>
            </div>
          </div>

          {/* Card 4: DataAnalytics — col-span-2, row-span-1 */}
          {/* BENTO: DataAnalytics cs-2 rs-1 */}
          <div
            className="bento-item col-span-2 row-span-1 p-10 flex flex-row gap-8 items-center bg-card group"
            style={{ opacity: 0, transform: 'translateY(30px)' }}
          >
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-primary-foreground transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-accent/40 text-4xl font-extrabold italic">04</span>
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mb-3 tracking-tight">
                Cloud Data Analytics
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Aggregated farm data processed in the cloud delivers weekly performance reports, yield forecasts, and cost optimization recommendations tailored to your operation.
              </p>
            </div>
            {/* Mini chart */}
            <div className="hidden sm:flex flex-col gap-2 min-w-[160px]">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Weekly Yield</p>
              <div className="flex items-end gap-1.5 h-20">
                {[55, 70, 60, 85, 75, 90, 88]?.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-secondary/30 group-hover:bg-secondary transition-all duration-500"
                    style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mon</span>
                <span>Sun</span>
              </div>
            </div>
          </div>

          {/* Card 5: RemoteControl — col-span-2, row-span-1 */}
          {/* BENTO: RemoteControl cs-2 rs-1 */}
          <div
            className="bento-item col-span-2 row-span-1 p-10 flex flex-row gap-8 items-center bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 group"
            style={{ opacity: 0, transform: 'translateY(30px)' }}
          >
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-accent/40 text-4xl font-extrabold italic">05</span>
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mb-3 tracking-tight">
                Remote Farm Control
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Control feeders, lighting, ventilation, and incubation heat from anywhere via the Anatsor mobile app — optimized for low-bandwidth 2G and 3G networks across rural Africa.
              </p>
            </div>
            {/* Connectivity badges */}
            <div className="hidden sm:flex flex-col gap-3 min-w-[140px]">
              {['2G Ready', '3G Ready', '4G Ready', 'WiFi']?.map((net) => (
                <div key={net} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs font-bold text-muted-foreground">{net}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}