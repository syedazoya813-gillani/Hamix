import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hamiq — Plan. Track. Achieve.',
    short_name: 'Hamiq',
    description: 'Personal planning, study tracking and scenario intelligence workspace.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#f7f5ef',
    theme_color: '#0f172a',
    categories: ['productivity', 'education'],
    icons: [
      { src: '/icons/hamiq-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/icons/hamiq-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };
}
