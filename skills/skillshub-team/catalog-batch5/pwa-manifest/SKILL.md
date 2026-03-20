# PWA Manifest

## manifest.json
```json
{ "name": "My App", "short_name": "MyApp", "start_url": "/", "display": "standalone",
  "background_color": "#fff", "theme_color": "#4285f4",
  "icons": [
    { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/512.png", "sizes": "512x512", "type": "image/png" }
  ] }
```

## HTML
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#4285f4">
<meta name="apple-mobile-web-app-capable" content="yes">
```

## Install Prompt
```typescript
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });
async function install() { deferredPrompt?.prompt(); }
```

## Requirements: HTTPS, manifest with icons (192+512), service worker with fetch handler.