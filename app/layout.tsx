import './globals.css';
import type { Metadata } from 'next';
import PWARegister from '@/components/PWARegister';

export const metadata: Metadata = {
  title: 'Hamiq — Plan. Track. Achieve.',
  description: 'Hamiq is your personal planning and scenario intelligence workspace.',
  icons: { icon: '/icons/hamiq-192.png', apple: '/icons/hamiq-192.png' },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><PWARegister />{children}</body></html>;
}
