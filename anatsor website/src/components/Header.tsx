'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Product', href: '/product' },
  { label: 'About', href: '/about' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleScroll = () => {
    if (menuOpen) setMenuOpen(false);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-4 sm:px-6 py-4 pointer-events-none">
      <nav
        className={`max-w-5xl mx-auto flex justify-between items-center px-5 sm:px-8 py-3 rounded-full pointer-events-auto transition-all duration-500 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-lg border border-border'
            : 'bg-white/60 backdrop-blur-md border border-white/30 shadow-md'
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <AppLogo
            size={64}
            className="transition-transform duration-500 group-hover:rotate-6"
          />
          <span className="font-extrabold text-lg tracking-tight text-primary hidden sm:block">
            Anatsor
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks?.map((link) => (
            <Link
              key={link?.href}
              href={link?.href}
              className={`text-base font-semibold tracking-wide transition-colors duration-300 ${
                pathname === link?.href
                  ? 'text-primary' :'text-muted-foreground hover:text-primary'
              }`}
            >
              {link?.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="magnetic-btn px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-bold tracking-wide hover:bg-secondary transition-all duration-300 shadow-md"
          >
            Explore AIPMS
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
        >
          {menuOpen ? (
            <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-0 z-40 bg-white/95 backdrop-blur-xl flex flex-col pt-24 px-8 pointer-events-auto">
          <div className="flex flex-col gap-6 mt-4">
            {navLinks?.map((link) => (
              <Link
                key={link?.href}
                href={link?.href}
                onClick={() => setMenuOpen(false)}
                className={`text-2xl font-bold tracking-tight transition-colors ${
                  pathname === link?.href ? 'text-primary' : 'text-foreground hover:text-secondary'
                }`}
              >
                {link?.label}
              </Link>
            ))}
          </div>
          <div className="mt-10 pt-8 border-t border-border">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="block w-full py-4 text-center bg-primary text-primary-foreground rounded-2xl font-bold text-lg tracking-wide"
            >
              Explore AIPMS
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
