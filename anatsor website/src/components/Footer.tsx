import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

export default function Footer() {
  return (
    <footer className="border-t border-border pt-16 pb-10 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Arc Pattern: Logo+tagline left, links right */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 mb-10">
          {/* Left: Logo + tagline */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <AppLogo size={36} />
              <span className="font-extrabold text-lg tracking-tight text-primary">Anatsor</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Empowering African poultry farmers with solar-powered AI technology.
            </p>
          </div>

          {/* Right: Compact links */}
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center">Home</Link>
            <Link href="/product" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center">Product</Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center">About</Link>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-border text-xs font-medium text-muted-foreground">
          <p>© 2024 Anatsor. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-xs font-semibold text-muted-foreground">SDG 2 · SDG 7 · SDG 13</span>
            <Link href="/about#contact" className="hover:text-foreground transition-colors min-h-[44px] flex items-center">Contact</Link>
            <Link href="/about" className="hover:text-foreground transition-colors min-h-[44px] flex items-center">Privacy Policy</Link>
            <Link href="/about" className="hover:text-foreground transition-colors min-h-[44px] flex items-center">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>

      {/* Big brand text */}
      <div className="mt-12 overflow-hidden">
        <p
          className="font-extrabold uppercase text-center leading-none tracking-tighter pointer-events-none select-none"
          style={{ fontSize: 'clamp(3rem, 16vw, 14rem)', color: 'var(--muted)', opacity: 0.6 }}
        >
          ANATSOR
        </p>
      </div>
    </footer>
  );
}