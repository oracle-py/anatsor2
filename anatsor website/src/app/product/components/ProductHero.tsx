'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

export default function ProductHero() {
  useEffect(() => {
    const revealEls = document.querySelectorAll<HTMLElement>('.product-hero-reveal');
    revealEls?.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(36px)';
      setTimeout(() => {
        el.style.transition = 'opacity 0.85s cubic-bezier(0.22,1,0.36,1), transform 0.85s cubic-bezier(0.22,1,0.36,1)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 200 + i * 160);
    });
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center px-4 sm:px-10 pt-28 pb-20 bg-primary overflow-hidden">
      {/* Atmospheric blobs */}
      <div className="absolute top-0 left-1/2 w-[800px] h-[800px] pointer-events-none z-0" aria-hidden="true"
      style={{ background: 'radial-gradient(circle, rgba(244,165,34,0.07) 0%, transparent 65%)', transform: 'translateX(-30%)' }} />
      
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] pointer-events-none z-0" aria-hidden="true"
      style={{ background: 'radial-gradient(circle, rgba(45,106,79,0.15) 0%, transparent 70%)' }} />
      

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left text */}
          <div className="lg:col-span-6">
            <div className="product-hero-reveal inline-flex items-center gap-3 mb-8 px-5 py-2 rounded-full bg-accent/15 border border-accent/25 self-start">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-bold tracking-widest uppercase text-accent">Flagship Product</span>
            </div>

            <h1 className="product-hero-reveal text-hero-xl font-extrabold text-primary-foreground mb-2">
              AIPMS
            </h1>
            <p className="product-hero-reveal text-section font-light text-primary-foreground/50 italic mb-8 tracking-tight">
              Anatsor Integrated<br />Poultry Management System
            </p>

            <p className="product-hero-reveal text-lg text-primary-foreground/60 leading-relaxed max-w-xl mb-10 font-light">
              A complete hardware and software ecosystem that integrates AI, IoT sensors, solar energy, and mobile technology — giving African poultry farmers the precision tools to manage their farms with confidence.
            </p>

            <div className="product-hero-reveal flex flex-col sm:flex-row gap-4">
              <Link
                href="/about#contact"
                className="magnetic-btn px-8 py-4 bg-accent text-accent-foreground rounded-full font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all duration-300 shadow-lg">
                
                Request a Demo
              </Link>
              <Link
                href="/about"
                className="magnetic-btn px-8 py-4 border border-primary-foreground/20 text-primary-foreground rounded-full font-bold text-sm uppercase tracking-widest hover:bg-primary-foreground/10 transition-all duration-300">
                
                Learn About Anatsor
              </Link>
            </div>
          </div>

          {/* Right: visual panel */}
          <div className="lg:col-span-6 hidden lg:block">
            <div className="relative">
              {/* Main image */}
              <div className="rounded-5xl overflow-hidden aspect-[4/3] shadow-2xl border border-primary-foreground/10 group">
                <AppImage
                  src="https://img.rocket.new/generatedImages/rocket_gen_img_1087951da-1783812227544.png"
                  alt="Modern poultry farm interior with automated feeding systems, rows of healthy chickens, clean controlled environment, professional agricultural technology"
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 0vw, 50vw" />
                
                <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
              </div>

              {/* Floating stat card */}
              <div className="absolute -bottom-6 -left-6 glass-card rounded-3xl p-6 shadow-2xl float-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-foreground">System Active</span>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="font-extrabold text-foreground text-lg">98.7%</p>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                  </div>
                  <div>
                    <p className="font-extrabold text-foreground text-lg">±0.3°C</p>
                    <p className="text-xs text-muted-foreground">Temp Accuracy</p>
                  </div>
                </div>
              </div>

              {/* Floating top badge */}
              <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground px-5 py-3 rounded-2xl shadow-xl -rotate-2 float-card" style={{ animationDelay: '0.8s' }}>
                <span className="text-xs font-bold uppercase tracking-widest">AI + IoT + Solar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}