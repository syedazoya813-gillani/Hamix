import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hamiq — Plan. Track. Achieve.',
  description: 'Hamiq is your personal planning and scenario intelligence workspace.',
  icons: { icon: '/hamiq-logo.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
