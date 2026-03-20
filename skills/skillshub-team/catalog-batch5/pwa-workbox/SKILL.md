# Workbox PWA

## Vite PWA Plugin
```bash
npm install vite-plugin-pwa
```

```typescript
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    plugins: [VitePWA({
        registerType: 'autoUpdate',
        workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            runtimeCaching: [
                { urlPattern: /^https:\/\/api\./, handler: 'NetworkFirst',
                  options: { cacheName: 'api', expiration: { maxEntries: 50, maxAgeSeconds: 300 } } },
                { urlPattern: /\.(?:png|jpg|svg|webp)$/, handler: 'CacheFirst',
                  options: { cacheName: 'images', expiration: { maxEntries: 100 } } },
            ],
        },
    })],
});
```

## Workbox Strategies: CacheFirst, NetworkFirst, StaleWhileRevalidate, NetworkOnly, CacheOnly
## Background Sync for offline form submissions
## Precaching for app shell