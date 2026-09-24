'use client';

import React, { useEffect } from 'react';

export default function AboutHero() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.about-hero-reveal');
    els?.forEach((el, i) => {
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
    <section className="relative min-h-[70vh] flex items-center px-4 sm:px-10 pt-28 pb-20 bg-background overflow-hidden">
      {/* Blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] blob-green pointer-events-none z-0" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] blob-amber pointer-events-none z-0" aria-hidden="true" />

      <div className="max-w-5xl mx-auto w-full relative z-10">
        <div className="about-hero-reveal inline-flex items-center gap-3 mb-8 px-5 py-2 rounded-full bg-primary/8 border border-primary/15 self-start">
          <span className="w-2 h-2 rounded-full bg-accent pulse-glow" />
          <span className="text-xs font-bold tracking-widest uppercase text-secondary">Our Story</span>
        </div>

        <h1 className="about-hero-reveal text-hero-xl font-extrabold text-primary mb-6 max-w-4xl">
          TRANSFORMING<br />
          <span className="text-accent italic font-light">AFRICAN FARMING.</span>
        </h1>

        <p className="about-hero-reveal text-xl text-muted-foreground font-light leading-relaxed max-w-2xl">
          Anatsor offers a modern, innovative resource designed to inspire forward-thinking solutions, focused on exceptional services tailored to clients&apos; unique needs. We believe in the power of creativity and modern solutions to drive growth and success, backed by industry-leading expertise.
        </p>

        {/* Orbital decoration */}
        <div className="about-hero-reveal absolute right-10 top-1/2 -translate-y-1/2 hidden xl:block">
          <div className="w-48 h-48 border border-primary/10 rounded-full flex items-center justify-center orbital-ring">
            <div className="w-32 h-32 border border-dashed border-accent/20 rounded-full orbital-ring-reverse flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-accent pulse-glow" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}