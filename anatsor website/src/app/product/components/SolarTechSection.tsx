'use client';

import React, { useEffect, useRef, useState } from 'react';
import AppImage from '@/components/ui/AppImage';

const solarStats = [
{ value: 100, suffix: '%', label: 'Solar Powered' },
{ value: 72, suffix: 'hr', label: 'Battery Backup' },
{ value: 60, suffix: '%', label: 'Cost Reduction' }];


function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return count;
}

function SolarStat({ value, suffix, label, active }: {value: number;suffix: string;label: string;active: boolean;}) {
  const count = useCountUp(value, 1200, active);
  return (
    <div className="flex flex-col border-l-2 border-accent pl-6">
      <span className="text-3xl font-extrabold text-primary-foreground">{count}{suffix}</span>
      <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground/50 mt-1">{label}</span>
    </div>);

}

export default function SolarTechSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(true);
            const reveals = entry.target.querySelectorAll<HTMLElement>('.solar-reveal');
            reveals.forEach((el, i) => {
              setTimeout(() => {
                el.style.transition = 'opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
              }, i * 130);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-4 sm:px-10 bg-primary relative overflow-hidden">
      {/* Skew panel */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none z-0" aria-hidden="true">
        <div className="w-full h-full bg-accent" style={{ transform: 'skewX(-8deg) translateX(30%)' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="lg:col-span-5">
            <div
              className="solar-reveal relative rounded-4xl overflow-hidden aspect-[4/3] shadow-2xl border border-primary-foreground/10 group"
              style={{ opacity: 0, transform: 'translateY(30px)' }}>
              
              <AppImage
                src="https://img.rocket.new/generatedImages/rocket_gen_img_11fab617a-1768823201620.png"
                alt="Large solar panel array on a farm in Africa under bright sunshine, rows of photovoltaic panels, lush green agricultural land in background, clear sky"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 40vw" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/10 to-transparent" />
              {/* Orbital decoration */}
              <div className="absolute top-8 right-8 w-24 h-24 border border-accent/30 rounded-full flex items-center justify-center orbital-ring">
                <div className="w-3 h-3 rounded-full bg-accent shadow-lg pulse-glow" />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="lg:col-span-7">
            <div
              className="solar-reveal flex items-center gap-4 mb-8"
              style={{ opacity: 0, transform: 'translateY(30px)' }}>
              
              <span className="w-12 h-px bg-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-accent">SDG 7 · Clean Energy</span>
            </div>

            <h2
              className="solar-reveal text-display font-extrabold text-primary-foreground tracking-tight mb-6"
              style={{ opacity: 0, transform: 'translateY(30px)' }}>
              
              SOLAR ENERGY<br />
              <span className="italic font-light opacity-50">REIMAGINED.</span>
            </h2>

            <p
              className="solar-reveal text-primary-foreground/55 text-lg font-light leading-relaxed max-w-xl mb-10"
              style={{ opacity: 0, transform: 'translateY(30px)' }}>
              
              AIPMS uses solar-powered technology instead of kerosene dependence, offering a sustainable, eco-friendly energy source that also reduces the environmental impact of poultry farming. Our solar energy system powers all AIPMS hardware 24/7 — even through cloudy days with intelligent battery buffering.
            </p>

            {/* Stats */}
            <div
              className="solar-reveal flex flex-wrap gap-8 mb-10"
              style={{ opacity: 0, transform: 'translateY(30px)' }}>
              
              {solarStats.map((s) =>
              <SolarStat key={s.label} value={s.value} suffix={s.suffix} label={s.label} active={active} />
              )}
            </div>

            {/* Features list */}
            <div
              className="solar-reveal grid grid-cols-1 sm:grid-cols-2 gap-4"
              style={{ opacity: 0, transform: 'translateY(30px)' }}>
              
              {[
              'Intelligent battery management',
              'Cloudy-day performance optimization',
              'No grid dependency required',
              'Auto-failover protection'].
              map((feature) =>
              <div key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-primary-foreground/60 text-sm font-medium">{feature}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>);

}