'use client';

import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';

const challenges = [
{
  number: '01',
  title: 'Unreliable Energy Access',
  description: 'Over 600 million Africans lack reliable electricity. Kerosene-dependent farms risk fires, toxic fumes, and operational shutdowns — costing farmers up to 40% of their annual income in preventable losses.',
  stat: '40%',
  statLabel: 'Income lost to energy failure',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_14aa08fad-1779082800098.png",
  imageAlt: 'Rural African village at night with minimal lighting, dark surroundings, dim kerosene lamp glow, low-key atmosphere, shadows and limited visibility'
},
{
  number: '02',
  title: 'Climate Volatility',
  description: 'Extreme heat waves and erratic weather patterns cause mass flock mortality. A single temperature spike above 38°C can kill 30–60% of a flock within hours — with no warning system in place.',
  stat: '60%',
  statLabel: 'Flock loss in extreme heat events',
  image: "https://images.unsplash.com/photo-1652961623308-fc110c22e7cd",
  imageAlt: 'Harsh African dry season landscape with cracked earth, intense sun, bleached dry vegetation, extreme heat haze visible on horizon'
},
{
  number: '03',
  title: 'Manual Farm Management',
  description: 'Smallholder farmers manually track feeding schedules, health indicators, and environmental readings across multiple pens — making consistent, data-driven decisions nearly impossible at scale.',
  stat: '8hrs',
  statLabel: 'Daily manual monitoring time',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_43d53d8f1-1790006975289.png",
  imageAlt: 'African farmer manually recording data in a notebook inside a poultry house, dim interior, rows of chickens visible in background, practical working environment'
}];


export default function ChallengesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const els = sectionRef?.current?.querySelectorAll('.scroll-reveal');
    els?.forEach((el) => observer?.observe(el));
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-10 bg-primary relative overflow-hidden">
      {/* Decorative skew panel */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none" aria-hidden="true">
        <div className="w-full h-full bg-accent" style={{ transform: 'skewX(-8deg) translateX(30%)' }} />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 scroll-reveal opacity-100">
          <span className="text-xs font-bold uppercase tracking-widest text-accent mb-4 block">
            The Problem
          </span>
          <h2 className="text-display font-extrabold text-primary-foreground mb-6">
            WHAT HOLDS<br />
            <span className="italic font-light opacity-60">FARMERS BACK.</span>
          </h2>
          <p className="text-primary-foreground/50 text-lg max-w-2xl font-light leading-relaxed">
            Poultry farmers across Africa face challenges impacting operations and profitability: unreliable energy sources like kerosene threaten operational continuity, and maintaining optimal environmental conditions during extreme weather is difficult — leading to losses that affect farmer livelihoods and market growth.
          </p>
        </div>

        {/* Challenge cards */}
        <div className="flex flex-col gap-16">
          {challenges?.map((c, idx) =>
          <div
            key={c?.number}
            className={`scroll-reveal opacity-100 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center ${
            idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`
            }>
            
              {/* Image */}
              <div className={`lg:col-span-5 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="relative rounded-4xl overflow-hidden aspect-video lg:aspect-[4/3] shadow-2xl group">
                  <AppImage
                  src={c?.image}
                  alt={c?.imageAlt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 40vw" />
                
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent" />
                  {/* Stat overlay */}
                  <div className="absolute bottom-5 left-5">
                    <span className="text-5xl font-extrabold text-accent">{c?.stat}</span>
                    <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70 mt-1">{c?.statLabel}</p>
                  </div>
                </div>
              </div>

              {/* Text */}
              <div className={`lg:col-span-7 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="challenge-card">
                  <span className="text-accent/40 text-5xl font-extrabold font-display italic">{c?.number}</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-primary-foreground mt-3 mb-4 tracking-tight">
                    {c?.title}
                  </h3>
                  <p className="text-primary-foreground/55 text-base leading-relaxed font-light">
                    {c?.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}