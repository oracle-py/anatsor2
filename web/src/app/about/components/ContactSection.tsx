'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '', type: 'demo' });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const reveals = entry.target.querySelectorAll<HTMLElement>('.contact-reveal');
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
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Backend connection point: replace with real API call
    setSubmitted(true);
  };

  return (
    <section id="contact" ref={sectionRef} className="py-20 px-4 sm:px-10 bg-primary relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
        style={{ background: 'radial-gradient(circle at 30% 50%, rgba(244,165,34,0.06) 0%, transparent 60%)' }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Left info */}
          <div className="lg:col-span-5">
            <div
              className="contact-reveal flex items-center gap-4 mb-8"
              style={{ opacity: 0, transform: 'translateY(30px)' }}
            >
              <span className="w-12 h-px bg-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-accent">Get in Touch</span>
            </div>

            <h2
              className="contact-reveal text-display font-extrabold text-primary-foreground tracking-tight mb-6"
              style={{ opacity: 0, transform: 'translateY(30px)' }}
            >
              PARTNER<br />
              <span className="italic font-light opacity-50">WITH US.</span>
            </h2>

            <p
              className="contact-reveal text-primary-foreground/55 text-lg font-light leading-relaxed mb-10"
              style={{ opacity: 0, transform: 'translateY(30px)' }}
            >
              Whether you&apos;re a farmer ready to transform your operation, an NGO seeking partnership, or an investor aligned with our mission — we&apos;d love to hear from you.
            </p>

            {/* Contact types */}
            <div
              className="contact-reveal flex flex-col gap-5"
              style={{ opacity: 0, transform: 'translateY(30px)' }}
            >
              {[
                { label: 'Farmers', desc: 'Request a product demo or deployment consultation.' },
                { label: 'NGOs & Development Bodies', desc: 'Explore partnership and co-deployment opportunities.' },
                { label: 'Investors', desc: 'Learn about our growth roadmap and impact metrics.' },
              ].map((type) => (
                <div key={type.label} className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-extrabold text-primary-foreground">{type.label}</span>
                    <p className="text-xs text-primary-foreground/45 mt-0.5">{type.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact details */}
            <div
              className="contact-reveal mt-10 flex flex-col gap-4"
              style={{ opacity: 0, transform: 'translateY(30px)' }}
            >
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-primary-foreground/60">Jos, Plateau State, Nigeria</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm text-primary-foreground/60">+234 814 437 1309</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@anatsor.com" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">info@anatsor.com</a>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <span className="text-sm text-primary-foreground/60">Instagram: @anatsor2 · Facebook: Anatsor</span>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-7">
            <div
              className="contact-reveal bg-primary-foreground/5 border border-primary-foreground/10 rounded-4xl p-8 sm:p-12"
              style={{ opacity: 0, transform: 'translateY(30px)' }}
            >
              {submitted ? (
                <div className="flex flex-col items-center justify-center text-center py-12 gap-6">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-extrabold text-primary-foreground">Message Received!</h3>
                  <p className="text-primary-foreground/55 text-base font-light leading-relaxed max-w-sm">
                    Thank you for reaching out. The Anatsor team will get back to you within 24–48 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '', type: 'demo' }); }}
                    className="px-6 py-3 bg-accent text-accent-foreground rounded-full font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <h3 className="text-xl font-extrabold text-primary-foreground mb-2">Send us a message</h3>

                  {/* Enquiry type */}
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'demo', label: 'Request Demo' },
                      { value: 'partnership', label: 'Partnership' },
                      { value: 'investor', label: 'Investment' },
                      { value: 'general', label: 'General' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
                          form.type === opt.value
                            ? 'bg-accent text-accent-foreground border-accent'
                            : 'border-primary-foreground/20 text-primary-foreground/50 hover:border-accent/50 hover:text-primary-foreground'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary-foreground/50">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Chukwuemeka Okonkwo"
                      className="w-full px-5 py-4 bg-primary-foreground/8 border border-primary-foreground/15 rounded-2xl text-primary-foreground placeholder-primary-foreground/25 focus:outline-none focus:border-accent transition-all text-sm font-medium"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary-foreground/50">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="emeka@farmoperations.ng"
                      className="w-full px-5 py-4 bg-primary-foreground/8 border border-primary-foreground/15 rounded-2xl text-primary-foreground placeholder-primary-foreground/25 focus:outline-none focus:border-accent transition-all text-sm font-medium"
                    />
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary-foreground/50">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Tell us about your farm, your challenges, or your interest in partnering with Anatsor..."
                      className="w-full px-5 py-4 bg-primary-foreground/8 border border-primary-foreground/15 rounded-2xl text-primary-foreground placeholder-primary-foreground/25 focus:outline-none focus:border-accent transition-all text-sm font-medium resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="magnetic-btn w-full py-5 bg-accent text-accent-foreground rounded-full font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all duration-300 shadow-lg mt-2"
                  >
                    Send Message
                  </button>

                  <p className="text-center text-xs text-primary-foreground/30 font-medium">
                    No spam. Response within 24–48 hours.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}