# PWA Push Notifications

## Subscribe
```typescript
const reg = await navigator.serviceWorker.ready;
const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
});
await fetch('/api/push/subscribe', { method: 'POST', body: JSON.stringify(sub) });
```

## Service Worker Handler
```javascript
self.addEventListener('push', (e) => {
    const data = e.data?.json() ?? { title: 'Update', body: 'New content' };
    e.waitUntil(self.registration.showNotification(data.title, {
        body: data.body, icon: '/icon-192.png', data: { url: data.url || '/' },
    }));
});
self.addEventListener('notificationclick', (e) => {
    e.notification.close();
    e.waitUntil(clients.openWindow(e.notification.data.url));
});
```

## Server (web-push)
```typescript
import webpush from 'web-push';
webpush.setVapidDetails('mailto:admin@app.com', PUBLIC_KEY, PRIVATE_KEY);
await webpush.sendNotification(subscription, JSON.stringify(payload));
```