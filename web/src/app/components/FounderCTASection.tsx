'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

export default function FounderCTASection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const reveals = entry.target.querySelectorAll<HTMLElement>('.founder-reveal');
            reveals.forEach((el, i) => {
              setTimeout(() => {
                el.style.transition = 'opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
              }, i * 150);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    if (sectionRef?.current) observer?.observe(sectionRef?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-4 sm:px-10 bg-background relative overflow-hidden">
      {/* Decorative skew */}
      <div className="absolute top-0 right-0 w-1/3 h-full pointer-events-none z-0" aria-hidden="true">
        <div className="w-full h-full bg-muted" style={{ transform: 'skewX(-8deg) translateX(30%)' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="bg-card border border-border rounded-5xl p-8 sm:p-16 lg:p-20 shadow-2xl overflow-hidden relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-muted/30 pointer-events-none z-0" style={{ transform: 'skewX(-8deg) translateX(25%)' }} aria-hidden="true" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            {/* Founder image */}
            <div className="lg:col-span-5">
              <div className="relative group max-w-sm mx-auto lg:mx-0">
                <div className="aspect-[4/5] rounded-4xl overflow-hidden bg-muted border border-border shadow-xl">
                  <AppImage
                    src="/assets/images/author.png"
                    alt="Professional African woman in business attire smiling confidently, bright neutral background, warm natural light, approachable and expert"
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                    sizes="(max-width: 1024px) 100vw, 35vw" />
                  
                </div>
                {/* Badge */}
                <div className="absolute -bottom-5 -right-5 bg-accent text-accent-foreground px-6 py-3 rounded-2xl shadow-xl rotate-3 float-card">
                  <span className="text-xs font-bold uppercase tracking-widest">Founder & CEO</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-7">
              <span
                className="founder-reveal text-xs font-bold uppercase tracking-widest text-accent mb-6 block"
                style={{ opacity: 0, transform: 'translateY(30px)' }}>
                
                Meet the Founder
              </span>

              <h2
                className="founder-reveal text-display font-extrabold text-primary tracking-tight mb-4"
                style={{ opacity: 0, transform: 'translateY(30px)' }}>
                
                AGBO<br />MIRIAM
              </h2>

              <p
                className="founder-reveal text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8 italic"
                style={{ opacity: 0, transform: 'translateY(30px)' }}>
                
                CEO &amp; Co-Founder · Anatsor
              </p>

              <blockquote
                className="founder-reveal text-xl sm:text-2xl font-light text-foreground leading-relaxed italic border-l-2 border-accent pl-8 mb-10"
                style={{ opacity: 0, transform: 'translateY(30px)' }}>
                
                &ldquo;AIPMS is not just a system — it&apos;s a game-changer for sustainable and efficient poultry management.&rdquo;
              </blockquote>

              <p
                className="founder-reveal text-muted-foreground text-base leading-relaxed mb-10 font-light"
                style={{ opacity: 0, transform: 'translateY(30px)' }}>
                
                A passionate expert dedicated to advancing poultry farming, bringing fresh perspective and innovative solutions, with a commitment to sustainability, progress, and impact.
              </p>

              {/* CTA */}
              <div
                className="founder-reveal flex flex-col sm:flex-row gap-4"
                style={{ opacity: 0, transform: 'translateY(30px)' }}>
                
                <Link
                  href="/about"
                  className="magnetic-btn px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-sm uppercase tracking-widest hover:bg-secondary transition-all duration-300 shadow-lg">
                  
                  Our Full Story
                </Link>
                <Link
                  href="/product"
                  className="magnetic-btn px-8 py-4 border border-border text-foreground rounded-full font-bold text-sm uppercase tracking-widest hover:bg-muted transition-all duration-300">
                  
                  See AIPMS in Action
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}