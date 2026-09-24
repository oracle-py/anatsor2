'use client';

import React, { useEffect, useRef } from 'react';

const reviews = [
  {
    rating: 4.5,
    text: 'AIPMS has transformed the way I manage my poultry farm. The integration of solar-powered technology and precision environmental control has made my operations not only more efficient but also sustainable. It\'s the future of poultry farming, and I couldn\'t be happier with the results!',
    author: 'Poultry Farmer',
    location: 'Nigeria',
  },
  {
    rating: 3.5,
    text: 'As a producer, I appreciate the efficiency and precision that AIPMS brings to poultry management. The data-driven insights and automation allow me to make smarter decisions. The system, however, could benefit from more customization options for larger farms.',
    author: 'Farm Producer',
    location: 'Africa',
  },
  {
    rating: 5,
    text: 'AIPMS is truly revolutionary! Its integration of solar-powered systems and precision farming technologies has made a significant difference in our farm\'s productivity and sustainability. This tool is setting new standards in poultry farming, and I\'m excited to see how it will evolve in the future.',
    author: 'Farm Owner',
    location: 'West Africa',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        return (
          <svg
            key={star}
            className={`w-4 h-4 ${filled || half ? 'text-accent' : 'text-muted'}`}
            fill={filled ? 'currentColor' : half ? 'url(#half)' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {half && (
              <defs>
                <linearGradient id="half">
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            )}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      })}
      <span className="ml-2 text-xs font-bold text-muted-foreground">{rating}</span>
    </div>
  );
}

export default function ReviewsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const reveals = entry.target.querySelectorAll<HTMLElement>('.review-reveal');
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
    <section ref={sectionRef} className="py-24 px-4 sm:px-10 bg-muted/40">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          className="review-reveal mb-16 text-center"
          style={{ opacity: 0, transform: 'translateY(30px)' }}
        >
          <span className="text-xs font-bold uppercase tracking-widest text-accent mb-4 block">Testimonials</span>
          <h2 className="text-display font-extrabold text-primary tracking-tight">
            WHAT FARMERS<br />
            <span className="italic font-light text-muted-foreground">ARE SAYING.</span>
          </h2>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="review-reveal bg-card border border-border rounded-4xl p-8 flex flex-col gap-6 hover:shadow-xl transition-all duration-500"
              style={{ opacity: 0, transform: 'translateY(30px)', transitionDelay: `${i * 80}ms` }}
            >
              <StarRating rating={review.rating} />
              <p className="text-muted-foreground text-sm leading-relaxed font-light flex-1">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="pt-4 border-t border-border">
                <p className="font-extrabold text-foreground text-sm">{review.author}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{review.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
