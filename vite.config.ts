import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/massline-demo/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo_massline.png', 'logo_mototrack.png'],
      manifest: {
        name: 'SmartStock - Sistema de Gestión de Inventarios',
        short_name: 'SmartStock',
        description: 'Sistema integral de gestión de inventarios para almacenes',
        theme_color: '#2563EB',
        background_color: '#FFFFFF',
        display: 'standalone',
        icons: [
          {
            src: '/massline-demo/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/massline-demo/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
})
