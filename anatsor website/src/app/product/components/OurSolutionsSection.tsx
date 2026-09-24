'use client';

import React, { useEffect, useRef } from 'react';

const solutions = [
  {
    number: '01',
    title: 'Solar-Powered Technology',
    description: 'AIPMS uses solar-powered technology instead of kerosene dependence, offering a sustainable, eco-friendly energy source that also reduces the environmental impact of poultry farming.',
    badge: 'SDG 7',
  },
  {
    number: '02',
    title: 'Precision Environmental Control',
    description: 'AIPMS gives farmers precision control over lighting, feeding, and critical incubation heat, mitigating losses from extreme temperatures and climate-driven fluctuations.',
    badge: 'SDG 13',
  },
  {
    number: '03',
    title: 'Comprehensive Management Suite',
    description: 'AIPMS is Anatsor\'s brain child — an integrated system bringing precision technology and clean energy to poultry farms via solar power. A full poultry management suite collecting data through sensors — monitoring temperature, humidity, and carbon monoxide levels in real time — enabling protective automation and regulation of farm environmental conditions.',
    badge: 'Flagship',
  },
];

export default function OurSolutionsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const reveals = entry.target.querySelectorAll<HTMLElement>('.solutions-reveal');
            reveals.forEach((el, i) => {
              setTimeout(() => {
                el.style.transition = 'opacity 0.75s cubic-bezier(0.22,1,0.36,1), transform 0.75s cubic-bezier(0.22,1,0.36,1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
              }, i * 100);
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
    <section ref={sectionRef} className="py-20 px-4 sm:px-10 bg-muted/40">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          className="solutions-reveal mb-16 text-center max-w-3xl mx-auto"
          style={{ opacity: 0, transform: 'translateY(30px)' }}
        >
          <span className="text-xs font-bold uppercase tracking-widest text-accent mb-4 block">Our Innovative Solutions</span>
          <h2 className="text-display font-extrabold text-primary tracking-tight mb-4">
            OUR<br />
            <span className="italic font-light text-muted-foreground">SOLUTIONS.</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed font-light">
            Flagship product: Anatsor Integrated Poultry Management System (AIPMS) — combines automation, real-time monitoring, and AI-driven analytics.
          </p>
        </div>

        {/* Solutions grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {solutions?.map((solution, i) => (
            <div
              key={solution?.number}
              className="solutions-reveal bg-card border border-border rounded-4xl p-10 flex flex-col gap-5 hover:shadow-xl transition-all duration-500 group"
              style={{ opacity: 0, transform: 'translateY(30px)', transitionDelay: `${i * 80}ms` }}
            >
              <div className="flex justify-between items-start">
                <span className="text-5xl font-extrabold italic text-muted/80">{solution?.number}</span>
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest border border-accent/20">{solution?.badge}</span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-foreground mb-3 tracking-tight">{solution?.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-light">{solution?.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div
          className="solutions-reveal mt-12 text-center"
          style={{ opacity: 0, transform: 'translateY(30px)' }}
        >
          <blockquote className="text-xl sm:text-2xl font-light text-foreground leading-relaxed italic border-l-2 border-accent pl-8 max-w-3xl mx-auto text-left">
            &ldquo;AIPMS is not just a system — it&apos;s a game-changer for sustainable and efficient poultry management.&rdquo;
          </blockquote>
        </div>
      </div>
    </section>
  );
}
