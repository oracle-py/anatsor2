import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import '../styles/brand.css';
import { withBasePath } from '@/lib/basePath';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Anatsor',
  description: 'Anatsor: Empowering poultry farmers with modern technologies',
  icons: {
    icon: [
      { url: withBasePath('/favicon.ico'), type: 'image/x-icon' }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}