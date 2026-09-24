'use client';

import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';

const teamMembers = [
  { name: 'Nanret Gungshik', role: 'Software-Product Manager' },
  { name: 'Ruel Nuffy', role: 'CTO / Technology Lead' },
  { name: 'Sunday Madu', role: 'Solar/Energy Engineer' },
  { name: 'Sefa Peter Ichor', role: 'Chief Operations Officer' },
];

export default function FounderSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const reveals = entry.target.querySelectorAll<HTMLElement>('.founder-about-reveal');
            reveals.forEach((el, i) => {
              setTimeout(() => {
                el.style.transition = 'opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
              }, i * 140);
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
    <section ref={sectionRef} className="py-20 px-4 sm:px-10 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full pointer-events-none z-0" aria-hidden="true">
        <div className="w-full h-full bg-muted" style={{ transform: 'skewX(-8deg) translateX(30%)' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section label */}
        <div
          className="founder-about-reveal mb-16 text-center"
          style={{ opacity: 0, transform: 'translateY(30px)' }}>
          
          <span className="text-xs font-bold uppercase tracking-widest text-accent mb-4 block">Leadership</span>
          <h2 className="text-display font-extrabold text-primary tracking-tight">
            THE PEOPLE<br />
            <span className="italic font-light text-muted-foreground">BEHIND ANATSOR.</span>
          </h2>
        </div>

        {/* Founder card */}
        <div className="bg-card border border-border rounded-5xl p-8 sm:p-14 lg:p-20 shadow-2xl overflow-hidden relative mb-12">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-muted/30 pointer-events-none z-0" style={{ transform: 'skewX(-8deg) translateX(25%)' }} aria-hidden="true" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <div className="lg:col-span-4">
              <div
                className="founder-about-reveal relative group max-w-xs mx-auto lg:mx-0"
                style={{ opacity: 0, transform: 'translateY(30px)' }}>
                
                <div className="aspect-[4/5] rounded-4xl overflow-hidden bg-muted border border-border shadow-xl">
                  <AppImage
                    src="https://img.rocket.new/generatedImages/rocket_gen_img_1d4b80bf9-1763297785049.png"
                    alt="Professional African woman in business attire smiling confidently, bright neutral background, warm natural light, approachable and expert"
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                    sizes="(max-width: 1024px) 80vw, 25vw" />
                  
                </div>
                <div className="absolute -bottom-5 -right-5 bg-accent text-accent-foreground px-6 py-3 rounded-2xl shadow-xl rotate-3 float-card">
                  <span className="text-xs font-bold uppercase tracking-widest">CEO &amp; Co-Founder</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-8">
              <span
                className="founder-about-reveal text-xs font-bold uppercase tracking-widest text-accent mb-4 block"
                style={{ opacity: 0, transform: 'translateY(30px)' }}>
                
                Meet the Author
              </span>

              <h3
                className="founder-about-reveal text-4xl sm:text-5xl font-extrabold text-primary tracking-tight mb-2"
                style={{ opacity: 0, transform: 'translateY(30px)' }}>
                
                AGBO MIRIAM
              </h3>

              <p
                className="founder-about-reveal text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8 italic"
                style={{ opacity: 0, transform: 'translateY(30px)' }}>
                
                CEO &amp; Co-Founder · Anatsor
              </p>

              <blockquote
                className="founder-about-reveal text-xl sm:text-2xl font-light text-foreground leading-relaxed italic border-l-2 border-accent pl-8 mb-8"
                style={{ opacity: 0, transform: 'translateY(30px)' }}>
                
                &ldquo;AIPMS is not just a system — it&apos;s a game-changer for sustainable and efficient poultry management.&rdquo;
              </blockquote>

              <p
                className="founder-about-reveal text-muted-foreground text-base leading-relaxed mb-10 font-light"
                style={{ opacity: 0, transform: 'translateY(30px)' }}>
                
                Passionate expert dedicated to advancing poultry farming, bringing fresh perspective and innovative solutions, with a commitment to sustainability, progress, and impact.
              </p>

              {/* Stats grid */}
              <div
                className="founder-about-reveal grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-border"
                style={{ opacity: 0, transform: 'translateY(30px)' }}>
                
                {[
                { value: '500+', label: 'Farmers Reached' },
                { value: '5+', label: 'African Countries' },
                { value: '3', label: 'UN SDGs Addressed' },
                { value: '2024', label: 'Year Founded' }]?.
                map((stat) =>
                <div key={stat?.label}>
                    <span className="block text-2xl font-extrabold text-primary">{stat?.value}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat?.label}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Team members grid */}
        <div
          className="founder-about-reveal"
          style={{ opacity: 0, transform: 'translateY(30px)' }}>
          <h3 className="text-xl font-extrabold text-primary tracking-tight mb-8 text-center uppercase">Our Team</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers?.map((member) => (
              <div key={member?.name} className="bg-card border border-border rounded-3xl p-6 flex flex-col gap-2 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-extrabold text-lg mb-2">
                  {member?.name?.charAt(0)}
                </div>
                <h4 className="font-extrabold text-foreground text-sm tracking-tight">{member?.name}</h4>
                <p className="text-xs text-muted-foreground font-medium">{member?.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

}