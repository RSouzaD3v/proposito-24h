import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Propósito24h | Escritores e Leitores',
    short_name: 'Propósito24h',
    description: 'Uma plataforma para escritores e leitores',
    start_url: '/',
    display: 'standalone',
    background_color: '#212529',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/AppImages/ios/192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/AppImages/ios/512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/AppImages/ios/256.png',
        sizes: '256x256',
        type: 'image/png',
      },
      {
        src: '/AppImages/ios/152.png',
        sizes: '152x152',
        type: 'image/png',
      },
      {
        src: '/AppImages/ios/120.png',
        sizes: '120x120',
        type: 'image/png',
      },
      {
        src: '/AppImages/ios/128.png',
        sizes: '128x128',
        type: 'image/png',
      },
    ],
  }
}