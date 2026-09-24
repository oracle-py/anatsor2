'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

export default function HeroSection() {
  const mouseGlowRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseGlowRef.current) {
        mouseGlowRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const magneticBtns = document.querySelectorAll<HTMLElement>('.magnetic-btn');
    const handlers: Array<{el: HTMLElement;move: (e: MouseEvent) => void;leave: () => void;}> = [];

    magneticBtns.forEach((btn) => {
      const move = (e: MouseEvent) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      };
      const leave = () => {
        btn.style.transform = 'translate(0px, 0px)';
        btn.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      };
      btn.addEventListener('mousemove', move);
      btn.addEventListener('mouseleave', leave);
      handlers.push({ el: btn, move, leave });
    });

    return () => {
      handlers.forEach(({ el, move, leave }) => {
        el.removeEventListener('mousemove', move);
        el.removeEventListener('mouseleave', leave);
      });
    };
  }, []);

  useEffect(() => {
    const revealEls = document.querySelectorAll<HTMLElement>('.hero-reveal');
    revealEls.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px)';
      setTimeout(() => {
        el.style.transition = 'opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0px)';
      }, 200 + i * 180);
    });
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center px-4 sm:px-10 pt-28 pb-16 bg-background overflow-hidden">
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <AppImage
          src="/assets/images/hero_background.png"
          alt="Hero background"
          fill
          priority
          className="object-cover opacity-30"
          sizes="100vw"
        />
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-background/80" />
      </div>
      
      {/* Mouse glow */}
      <div
        ref={mouseGlowRef}
        className="fixed pointer-events-none w-[600px] h-[600px] rounded-full blob-amber z-0"
        style={{ top: 0, left: 0, willChange: 'transform' }}
        aria-hidden="true" />
      

      {/* Background blobs */}
      <div className="absolute top-1/4 right-0 w-[700px] h-[700px] blob-green pointer-events-none z-0" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] blob-amber pointer-events-none z-0" aria-hidden="true" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center relative z-10">
        {/* Left: Text Content */}
        <div className="lg:col-span-7 flex flex-col" ref={textRef}>
          {/* Eyebrow */}
          <div className="hero-reveal inline-flex items-center gap-3 mb-8 px-5 py-2 rounded-full bg-primary/8 border border-primary/15 self-start">
            <span className="w-2 h-2 rounded-full bg-accent pulse-glow" />
            <span className="text-xs font-bold tracking-widest uppercase text-secondary">
              Agritech Innovation · Africa
            </span>
          </div>

          {/* Main headline */}
          <h1 className="hero-reveal text-hero-xl font-extrabold text-primary mb-6">
            Welcome To<br />
            <span className="text-accent italic font-light">Anatsor</span>
          </h1>

          {/* Sub */}
          <p className="hero-reveal text-lg text-muted-foreground leading-relaxed max-w-xl mb-10 font-light">
            Empowering poultry farmers with modern technologies.
          </p>

          {/* CTAs */}
          <div className="hero-reveal flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-12">
            <Link
              href="/product"
              className="magnetic-btn px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-sm uppercase tracking-widest hover:bg-secondary transition-all duration-300 shadow-lg">
              
              Discover AIPMS
            </Link>
            <Link
              href="/about"
              className="magnetic-btn px-8 py-4 border border-border text-foreground rounded-full font-bold text-sm uppercase tracking-widest hover:bg-muted transition-all duration-300">
              
              Our Mission
            </Link>
          </div>

          {/* Metrics row */}
          <div className="hero-reveal flex gap-8 pt-8 border-t border-border">
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-primary">3×</span>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">Productivity Gain</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-primary">100%</span>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">Solar Powered</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-primary">24/7</span>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">AI Monitoring</span>
            </div>
          </div>
        </div>

        {/* Right: Visual Panel */}
        <div className="lg:col-span-5 hidden lg:flex flex-col gap-4 relative h-[540px]">
          {/* Main image card */}
          <div className="hero-reveal absolute inset-0 rounded-5xl overflow-hidden border border-border shadow-2xl group">
            <AppImage
              src="https://img.rocket.new/generatedImages/rocket_gen_img_1c6bc3f27-1770040084525.png"
              alt="Poultry farmer in Nigeria inspecting a healthy flock inside a well-lit modern chicken house, warm golden morning light, earthy tones"
              fill
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 0vw, 40vw" />
            
            {/* Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/10 to-transparent" />

            {/* Floating badge */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="glass-card rounded-2xl p-4 float-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-foreground">Live Farm Monitor</span>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground">32.4°C</span>
                    <span className="text-xs text-muted-foreground">Temperature</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground">68%</span>
                    <span className="text-xs text-muted-foreground">Humidity</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-accent">Optimal</span>
                    <span className="text-xs text-muted-foreground">Status</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SDG pill floating top-right */}
          <div className="absolute -top-4 -right-4 z-20 float-card" style={{ animationDelay: '1s' }}>
            <div className="bg-primary text-primary-foreground px-5 py-3 rounded-2xl shadow-xl rotate-3">
              <span className="text-xs font-bold uppercase tracking-widest">UN SDG Aligned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-muted-foreground to-transparent" />
      </div>
    </section>);

}