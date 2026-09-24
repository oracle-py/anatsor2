'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function ProductCTASection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const reveals = entry.target.querySelectorAll<HTMLElement>('.cta-reveal');
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
      { threshold: 0.2 }
    );
    if (sectionRef?.current) observer?.observe(sectionRef?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-4 sm:px-10 bg-background">
      <div className="max-w-4xl mx-auto text-center">
        <div
          className="cta-reveal bg-primary rounded-5xl p-12 sm:p-20 relative overflow-hidden shadow-2xl"
          style={{ opacity: 0, transform: 'translateY(30px)' }}
        >
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
            style={{ background: 'radial-gradient(circle at center, rgba(244,165,34,0.08) 0%, transparent 65%)' }}
          />

          <div className="relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-6 block">
              Get Started Today
            </span>
            <h2 className="text-display font-extrabold text-primary-foreground tracking-tight mb-6">
              READY TO<br />
              <span className="italic font-light opacity-50">TRANSFORM YOUR FARM?</span>
            </h2>
            <p className="text-primary-foreground/55 text-lg font-light leading-relaxed max-w-xl mx-auto mb-10">
              &ldquo;AIPMS is not just a system — it&apos;s a game-changer for sustainable and efficient poultry management.&rdquo; Join poultry farmers already using AIPMS to reduce losses, cut energy costs, and grow their operations with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/about#contact"
                className="magnetic-btn px-10 py-5 bg-accent text-accent-foreground rounded-full font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all duration-300 shadow-lg"
              >
                Request a Demo
              </Link>
              <Link
                href="/about"
                className="magnetic-btn px-10 py-5 border border-primary-foreground/25 text-primary-foreground rounded-full font-bold text-sm uppercase tracking-widest hover:bg-primary-foreground/10 transition-all duration-300"
              >
                About Anatsor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}