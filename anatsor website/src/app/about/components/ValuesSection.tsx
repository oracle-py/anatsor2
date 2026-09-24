'use client';

import React, { useEffect, useRef } from 'react';

const values = [
  {
    number: '01',
    title: 'Innovation First',
    description: 'We relentlessly pursue new technologies — AI, IoT, solar energy — and apply them practically to solve the real, daily challenges of African poultry farmers.',
    color: 'bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-primary-foreground',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Farmer-Centered Design',
    description: 'Every feature in AIPMS was co-designed with farmers in the field. Usability on low-end phones and 2G networks is not an afterthought — it is the requirement.',
    color: 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Environmental Responsibility',
    description: 'Solar power is not a feature — it is our foundation. We are committed to building agriculture technology that actively reduces carbon emissions and kerosene dependency.',
    color: 'bg-green-100 text-green-700 group-hover:bg-green-600 group-hover:text-white',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Measurable Impact',
    description: 'We track real outcomes — flock survival rates, energy savings, yield increases, and farmer income growth. If we cannot measure it, we cannot improve it.',
    color: 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function ValuesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const reveals = entry.target.querySelectorAll<HTMLElement>('.value-reveal');
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
          className="value-reveal mb-16 max-w-2xl"
          style={{ opacity: 0, transform: 'translateY(30px)' }}
        >
          <span className="text-xs font-bold uppercase tracking-widest text-accent mb-4 block">What We Stand For</span>
          <h2 className="text-display font-extrabold text-primary tracking-tight">
            OUR CORE<br />
            <span className="italic font-light text-muted-foreground">VALUES.</span>
          </h2>
        </div>

        {/* Values grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values?.map((value, i) => (
            <div
              key={value?.number}
              className="value-reveal bg-card border border-border rounded-4xl p-10 flex flex-col gap-6 hover:shadow-xl transition-all duration-500 group"
              style={{ opacity: 0, transform: 'translateY(30px)', transitionDelay: `${i * 80}ms` }}
            >
              <div className="flex justify-between items-start">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${value?.color}`}>
                  {value?.icon}
                </div>
                <span className="text-5xl font-extrabold italic text-muted/80">{value?.number}</span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-foreground mb-3 tracking-tight">{value?.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-light">{value?.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}