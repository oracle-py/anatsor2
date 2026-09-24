'use client';

import React, { useEffect, useRef, useState } from 'react';

const sdgs = [
  {
    code: 'SDG 2',
    title: 'Zero Hunger',
    color: 'bg-amber-500',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    description: 'Enhancing poultry efficiency and productivity for food security and nutrition across African communities.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    code: 'SDG 7',
    title: 'Affordable and Clean Energy',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    borderColor: 'border-yellow-200',
    description: 'Solar-powered technology promoting renewable energy access — eliminating kerosene dependence for smallholder farms across sub-Saharan Africa.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    code: 'SDG 13',
    title: 'Climate Action',
    color: 'bg-green-600',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    description: 'Sustainable farming practices reducing environmental impact — helping farmers adapt to and mitigate the effects of climate change.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
  },
];

const impactStats = [
  { value: 40, suffix: '%', label: 'Reduction in Farm Losses' },
  { value: 3, suffix: 'x', label: 'Productivity Increase' },
  { value: 100, suffix: '%', label: 'Solar Energy Powered' },
];

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * target);
      setCount(start);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return count;
}

function StatCounter({ value, suffix, label, active }: { value: number; suffix: string; label: string; active: boolean }) {
  const count = useCountUp(value, 1400, active);
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-4xl sm:text-5xl font-extrabold text-primary-foreground">
        {count}{suffix}
      </span>
      <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground/50 mt-2">{label}</span>
    </div>
  );
}

export default function SDGImpactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const sparklesRef = useRef<HTMLDivElement>(null);
  const [countersActive, setCountersActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCountersActive(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sparkleColors = ['#F4A522', '#2D6A4F', '#FFFFFF'];
    let interval: ReturnType<typeof setInterval>;

    const createSparkle = () => {
      if (!sparklesRef.current) return;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
      const delay = Math.random() * 1.5;
      const scale = Math.random() * 0.8 + 0.3;

      svg.setAttribute('class', 'pointer-events-none absolute');
      svg.setAttribute('width', '20');
      svg.setAttribute('height', '20');
      svg.setAttribute('viewBox', '0 0 21 21');
      svg.style.left = `${x}%`;
      svg.style.top = `${y}%`;
      svg.style.transform = `scale(${scale})`;
      svg.style.animation = `sparkle-fade 1.8s ease-in-out forwards`;
      svg.style.animationDelay = `${delay}s`;
      svg.innerHTML = `<path d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z" fill="${color}"/>`;
      sparklesRef.current.appendChild(svg);
      setTimeout(() => svg.remove(), 3500);
    };

    interval = setInterval(createSparkle, 450);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-10 bg-primary relative overflow-hidden">
      {/* Background radial */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
        style={{ background: 'radial-gradient(circle at center, rgba(244,165,34,0.06) 0%, transparent 60%)' }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Sparkles headline */}
        <div className="text-center mb-20">
          <div className="relative inline-block">
            <h2 className="text-display font-extrabold text-primary-foreground uppercase tracking-tight relative z-10">
              Built for Impact.
            </h2>
            <div ref={sparklesRef} className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true" />
          </div>
          <p className="mt-6 text-primary-foreground/50 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Anatsor is committed to the United Nations Sustainable Development Goals — creating measurable change for African farming communities.
          </p>
        </div>

        {/* Impact counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 mb-20 pb-20 border-b border-primary-foreground/10">
          {impactStats.map((stat) => (
            <StatCounter
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              active={countersActive}
            />
          ))}
        </div>

        {/* SDG Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sdgs.map((sdg) => (
            <div
              key={sdg.code}
              className={`bg-primary-foreground/5 border ${sdg.borderColor} rounded-4xl p-8 hover:bg-primary-foreground/10 transition-all duration-500 group`}
            >
              <div className={`w-14 h-14 rounded-2xl ${sdg.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                {sdg.icon}
              </div>
              <div className="mb-2">
                <span className={`text-xs font-bold uppercase tracking-widest ${sdg.textColor}`}>{sdg.code}</span>
              </div>
              <h3 className="text-xl font-extrabold text-primary-foreground mb-4 tracking-tight">{sdg.title}</h3>
              <p className="text-primary-foreground/50 text-sm leading-relaxed font-light">{sdg.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}