# PWA Service Worker

## Registration
```typescript
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' });
}
```

## sw.js — Cache-First + Network-First
```javascript
const CACHE = 'v1';
const STATIC = ['/', '/index.html', '/styles.css', '/app.js'];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    if (e.request.url.includes('/api/')) {
        e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    } else {
        e.respondWith(caches.match(e.request).then(c => c || fetch(e.request)));
    }
});
```

## Strategies
- **Cache-first**: Static assets
- **Network-first**: API calls
- **Stale-while-revalidate**: Semi-dynamic content
