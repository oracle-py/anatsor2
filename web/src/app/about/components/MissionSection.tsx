'use client';

import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';

export default function MissionSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const reveals = entry.target.querySelectorAll<HTMLElement>('.mission-reveal');
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
      { threshold: 0.12 }
    );
    if (sectionRef?.current) observer?.observe(sectionRef?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-4sm:px-10 bg-primary relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none z-0" aria-hidden="true">
        <div className="w-full h-full bg-accent" style={{ transform: 'skewX(-8deg) translateX(30%)' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="lg:col-span-5">
            <div
              className="mission-reveal relative rounded-4xl overflow-hidden aspect-[4/3] shadow-2xl border border-primary-foreground/10 group"
              style={{ opacity: 0, transform: 'translateY(30px)' }}>
              
              <AppImage
                src="https://img.rocket.new/generatedImages/rocket_gen_img_183fce9d7-1780922169412.png"
                alt="Healthy flock of chickens in a well-managed poultry house in Africa, clean environment, warm natural light filtering through ventilation, rows of birds in good condition"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 40vw" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-primary/65 via-primary/15 to-transparent" />
              {/* Quote overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-primary-foreground/80 text-sm italic font-light leading-relaxed border-l-2 border-accent pl-4">
                  &ldquo;Empowering poultry farmers with modern technologies.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="lg:col-span-7">
            <div
              className="mission-reveal flex items-center gap-4 mb-8"
              style={{ opacity: 0, transform: 'translateY(30px)' }}>
              
              <span className="w-12 h-px bg-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-accent">Our Mission</span>
            </div>

            <h2
              className="mission-reveal text-display font-extrabold text-primary-foreground tracking-tight mb-6"
              style={{ opacity: 0, transform: 'translateY(30px)' }}>
              
              TECHNOLOGY<br />
              <span className="italic font-light opacity-50">FOR EVERY FARMER.</span>
            </h2>

            <p
              className="mission-reveal text-primary-foreground/55 text-lg font-light leading-relaxed mb-6"
              style={{ opacity: 0, transform: 'translateY(30px)' }}>
              
              Anatsor&apos;s mission is to transform poultry farming in Africa through modern, accessible technologies. The African poultry industry faces challenges including climate change, unreliable energy access, and environmental uncertainties, especially for smallholder farmers.
            </p>

            <p
              className="mission-reveal text-primary-foreground/55 text-lg font-light leading-relaxed mb-10"
              style={{ opacity: 0, transform: 'translateY(30px)' }}>
              
              Anatsor developed the Anatsor Integrated Poultry Management System (AIPMS) — a technology integrating Artificial Intelligence, IoT, and Mobile technology to give poultry farmers the tools and insights they need for sustainable, efficient farm operations. Empowering poultry farmers with modern technologies. Modern solutions to create a green and safer society.
            </p>

            {/* Mission pillars */}
            <div
              className="mission-reveal grid grid-cols-1 sm:grid-cols-3 gap-6"
              style={{ opacity: 0, transform: 'translateY(30px)' }}>
              
              {[
              { label: 'Accessible', desc: 'Technology designed for every farmer, regardless of education level or farm size.' },
              { label: 'Sustainable', desc: 'Solar-powered solutions that reduce environmental impact while improving yields.' },
              { label: 'Impactful', desc: 'Measurable outcomes — fewer losses, higher yields, stronger livelihoods.' }]?.
              map((pillar) =>
              <div key={pillar?.label} className="border-l-2 border-accent/40 pl-5">
                  <h4 className="font-extrabold text-primary-foreground text-sm uppercase tracking-widest mb-2">{pillar?.label}</h4>
                  <p className="text-primary-foreground/45 text-xs leading-relaxed">{pillar?.desc}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>);

}