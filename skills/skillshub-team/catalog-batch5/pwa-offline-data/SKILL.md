# PWA Offline-First

## IndexedDB with idb
```typescript
import { openDB } from 'idb';
const db = await openDB('app', 1, {
    upgrade(db) { db.createObjectStore('items', { keyPath: 'id' }).createIndex('synced', 'synced'); },
});
await db.put('items', { id: crypto.randomUUID(), text: 'hello', synced: false });
```

## Sync When Online
```typescript
async function sync() {
    if (!navigator.onLine) return;
    const unsynced = await db.getAllFromIndex('items', 'synced', false);
    const res = await fetch('/api/sync', { method: 'POST', body: JSON.stringify(unsynced) });
    for (const item of unsynced) await db.put('items', { ...item, synced: true });
}
window.addEventListener('online', sync);
```

## Key Principles
- Store locally first (IndexedDB), sync when online
- Queue mutations offline, replay on reconnect
- Handle conflicts (last-write-wins or merge)
- Show sync status indicator to users
