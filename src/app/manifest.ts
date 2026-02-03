import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VibeBuff - Build Your Perfect Tech Stack',
    short_name: 'VibeBuff',
    description: 'The ultimate tech stack builder for developers. Compare 500+ tools, get AI-powered recommendations, and discover what top startups use.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/icon?v=1',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon?v=1',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    categories: ['developer tools', 'productivity', 'technology'],
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en-US',
  }
}
