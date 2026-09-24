'use client';

import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';

const appFeatures = [
{
  title: 'Real-Time Dashboard',
  description: 'Live readings for temperature, humidity, CO₂ levels, and feed status — updated every 30 seconds across all pens.',
  icon:
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>

},
{
  title: 'Smart Alerts',
  description: 'Instant push notifications when temperature spikes, feeder empties, or abnormal flock behavior is detected.',
  icon:
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>

},
{
  title: 'Remote Control',
  description: 'Adjust feeder schedules, ventilation settings, and lighting remotely — even from a 2G connection in rural areas.',
  icon:
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>

},
{
  title: 'Yield Forecasting',
  description: 'AI models predict weekly egg production and growth rates based on current environmental data and flock age.',
  icon:
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>

}];


export default function AppShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const reveals = entry.target.querySelectorAll<HTMLElement>('.app-reveal');
            reveals.forEach((el, i) => {
              setTimeout(() => {
                el.style.transition = 'opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
              }, i * 120);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef?.current) observer?.observe(sectionRef?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-4 sm:px-10 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Left: Feature list */}
          <div className="lg:col-span-6">
            <div
              className="app-reveal flex items-center gap-4 mb-8"
              style={{ opacity: 0, transform: 'translateY(30px)' }}>
              
              <span className="w-12 h-px bg-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-accent">Mobile Application</span>
            </div>

            <h2
              className="app-reveal text-display font-extrabold text-primary tracking-tight mb-6"
              style={{ opacity: 0, transform: 'translateY(30px)' }}>
              
              YOUR FARM<br />
              <span className="italic font-light text-muted-foreground">IN YOUR POCKET.</span>
            </h2>

            <p
              className="app-reveal text-muted-foreground text-lg font-light leading-relaxed mb-10"
              style={{ opacity: 0, transform: 'translateY(30px)' }}>
              
              Advanced Hardware: state-of-the-art hardware from automated feeders to climate control systems for efficiency and productivity. Innovative App: real-time monitoring, data analytics, and remote farm control with a user-friendly interface.
            </p>

            <div className="flex flex-col gap-6">
              {appFeatures?.map((feature, i) =>
              <div
                key={feature?.title}
                className="app-reveal flex gap-5 items-start group"
                style={{ opacity: 0, transform: 'translateY(30px)', transitionDelay: `${i * 60}ms` }}>
                
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0 group-hover:bg-secondary group-hover:text-primary-foreground transition-all duration-300 mt-0.5">
                    {feature?.icon}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-foreground text-base mb-1">{feature?.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature?.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: App visual */}
          <div className="lg:col-span-6">
            <div
              className="app-reveal relative"
              style={{ opacity: 0, transform: 'translateY(30px)' }}>
              
              <div className="rounded-5xl overflow-hidden aspect-[3/4] shadow-2xl border border-border group max-w-sm mx-auto lg:mx-0">
                <AppImage
                  src="https://img.rocket.new/generatedImages/rocket_gen_img_15d43bd7a-1783868069861.png"
                  alt="African farmer using a smartphone app on a modern mobile device, bright outdoor setting near a farm, focused expression, natural daylight"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 35vw" />
                
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
              </div>

              {/* Floating hardware card */}
              <div className="absolute -top-6 -right-4 glass-card rounded-3xl p-5 shadow-2xl float-card border border-border max-w-[180px]">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Hardware</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs font-semibold text-foreground">IoT Sensors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs font-semibold text-foreground">Auto Feeders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs font-semibold text-foreground">Solar Array</span>
                  </div>
                </div>
              </div>

              {/* Bottom badge */}
              <div className="absolute -bottom-4 right-4 bg-primary text-primary-foreground px-5 py-3 rounded-2xl shadow-xl rotate-2 float-card" style={{ animationDelay: '1.2s' }}>
                <span className="text-xs font-bold uppercase tracking-widest">Works on 2G</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}