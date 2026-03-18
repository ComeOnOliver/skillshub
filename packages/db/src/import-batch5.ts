import "dotenv/config";
import { createDb } from "./client.js";
import { users, repos, skills } from "./schema.js";
import { eq, and, sql } from "drizzle-orm";
import matter from "gray-matter";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "User-Agent": "skillshub-importer",
  ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
};

const REPOS_TO_IMPORT = [
  { owner: "aaaronmiller", repo: "frontend-design-masterclass" },
  { owner: "anna-oya-ai", repo: "astro-skill.md" },
  { owner: "esurovtsev", repo: "langchain-lab" },
  { owner: "Bamose", repo: "everything-codex-cli" },
  { owner: "Mind-Dragon", repo: "atoolix" },
  { owner: "EvitanRelta", repo: "doctest-cmake" },
  { owner: "microclaw", repo: "skillsyoga" },
];

async function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function githubFetch(url: string): Promise<any> {
  const res = await fetch(url, { headers });
  if (res.status === 403 || res.status === 429) {
    console.log("  ⏳ Rate limited, waiting 60s...");
    await sleep(60000);
    return githubFetch(url);
  }
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${url}`);
  return res.json();
}

interface Skill {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  readme: string;
}

function s(slug: string, name: string, description: string, tags: string[], readme: string): Skill {
  return { slug, name, description, tags, readme };
}

// ==========================================
// ALL CURATED SKILLS (compact format)
// ==========================================
const CURATED_SKILLS: Skill[] = [
  // === 1. TAURI (5 skills) ===
  s("tauri-setup", "Tauri App Setup", "Bootstrap Tauri v2 desktop apps with Rust backend and web frontend. Cross-platform desktop development.", ["rust", "frontend", "desktop"],
`# Tauri App Setup
Build cross-platform desktop apps with Tauri v2.

## Quick Start
\`\`\`bash
npm create tauri-app@latest my-app -- --template react-ts
cd my-app && npm install && npm run tauri dev
\`\`\`

## Project Structure
\`\`\`
src-tauri/src/lib.rs    # Rust commands
src-tauri/tauri.conf.json # App config
src/                     # Web frontend
\`\`\`

## Rust Commands (IPC)
\`\`\`rust
#[tauri::command]
fn greet(name: &str) -> String { format!("Hello, {}!", name) }

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!()).expect("error");
}
\`\`\`

\`\`\`typescript
import { invoke } from "@tauri-apps/api/core";
const msg = await invoke<string>("greet", { name: "World" });
\`\`\`

## Config (tauri.conf.json)
\`\`\`json
{ "productName": "MyApp", "version": "0.1.0", "identifier": "com.myapp",
  "app": { "windows": [{ "title": "My App", "width": 1024, "height": 768 }] },
  "bundle": { "active": true, "targets": "all" } }
\`\`\`

## Build
\`\`\`bash
npm run tauri build  # Output in src-tauri/target/release/bundle/
\`\`\`

- Tauri v2 supports desktop + mobile (iOS/Android)
- ~600KB bundle vs Electron's ~150MB
- Use capabilities/ for security permissions`),

  s("tauri-plugins", "Tauri Plugins & System Access", "Use Tauri plugins for filesystem, dialogs, notifications, and system tray. Extend desktop app functionality.", ["rust", "desktop"],
`# Tauri Plugins
Extend Tauri with official plugins for system access.

## Install
\`\`\`bash
npm install @tauri-apps/plugin-fs @tauri-apps/plugin-dialog @tauri-apps/plugin-store
cargo add tauri-plugin-fs tauri-plugin-dialog tauri-plugin-store
\`\`\`

## Filesystem
\`\`\`typescript
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
const content = await readTextFile(filePath);
await writeTextFile(filePath, JSON.stringify(data));
\`\`\`

## Dialogs
\`\`\`typescript
import { open, save, confirm } from "@tauri-apps/plugin-dialog";
const file = await open({ filters: [{ name: "Images", extensions: ["png", "jpg"] }] });
const yes = await confirm("Delete this?", { title: "Confirm", kind: "warning" });
\`\`\`

## Persistent Store
\`\`\`typescript
import { Store } from "@tauri-apps/plugin-store";
const store = new Store("settings.json");
await store.set("theme", "dark");
await store.save();
\`\`\`

## System Tray
\`\`\`rust
use tauri::tray::TrayIconBuilder;
TrayIconBuilder::new()
    .icon(app.default_window_icon().unwrap().clone())
    .menu(&menu)
    .on_menu_event(|app, event| { /* handle */ })
    .build(app)?;
\`\`\`

## Capabilities (permissions)
\`\`\`json
{ "identifier": "default", "windows": ["main"],
  "permissions": ["core:default", "fs:default", "dialog:default"] }
\`\`\``),

  s("tauri-updater", "Tauri Auto-Updater", "Ship OTA updates for Tauri desktop apps with built-in updater and code signing.", ["rust", "desktop", "devops"],
`# Tauri Auto-Updater
\`\`\`bash
cargo add tauri-plugin-updater
npm install @tauri-apps/plugin-updater
\`\`\`

## Check & Install Updates
\`\`\`typescript
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
const update = await check();
if (update) {
    await update.downloadAndInstall();
    await relaunch();
}
\`\`\`

## Config
\`\`\`json
{ "plugins": { "updater": {
    "endpoints": ["https://releases.myapp.com/{{target}}/{{arch}}/{{current_version}}"],
    "pubkey": "YOUR_PUBLIC_KEY" } } }
\`\`\`

## Generate Keys
\`\`\`bash
npm run tauri signer generate -- -w ~/.tauri/myapp.key
\`\`\``),

  s("tauri-state-events", "Tauri State & Events", "Manage shared state and bidirectional events between Rust and frontend in Tauri apps.", ["rust", "desktop", "backend"],
`# Tauri State & Events

## Shared State
\`\`\`rust
use std::sync::Mutex;
use tauri::State;

struct AppState { counter: Mutex<i32> }

#[tauri::command]
fn increment(state: State<AppState>) -> i32 {
    let mut c = state.counter.lock().unwrap();
    *c += 1; *c
}

// Register: .manage(AppState { counter: Mutex::new(0) })
\`\`\`

## Events (Rust → Frontend)
\`\`\`rust
use tauri::{AppHandle, Emitter};
#[tauri::command]
async fn long_task(app: AppHandle) {
    for i in 0..100 {
        app.emit("progress", i).unwrap();
        tokio::time::sleep(std::time::Duration::from_millis(50)).await;
    }
}
\`\`\`

\`\`\`typescript
import { listen } from "@tauri-apps/api/event";
await listen<number>("progress", (e) => console.log(e.payload));
\`\`\`

## Error Handling
\`\`\`rust
#[tauri::command]
fn risky_op() -> Result<String, String> {
    Err("Something failed".into()) // Reaches frontend as error
}
\`\`\``),

  s("tauri-multi-window", "Tauri Multi-Window Apps", "Create and manage multiple windows in Tauri desktop applications.", ["rust", "desktop", "frontend"],
`# Tauri Multi-Window

## Create Windows from Frontend
\`\`\`typescript
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
const win = new WebviewWindow("settings", {
    url: "/settings", title: "Settings",
    width: 600, height: 400, center: true, resizable: false,
});
win.once("tauri://error", (e) => console.error(e));
\`\`\`

## Window Controls
\`\`\`typescript
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
const win = getCurrentWebviewWindow();
await win.minimize();
await win.maximize();
await win.hide();
await win.show();
await win.setTitle("New Title");
\`\`\`

## Close to Tray
\`\`\`typescript
await win.onCloseRequested(async (event) => {
    event.preventDefault();
    await win.hide(); // Minimize to tray instead
});
\`\`\``),

  // === 2. PWA (5 skills) ===
  s("pwa-service-worker", "PWA Service Worker", "Build offline-capable web apps with service workers and caching strategies.", ["frontend", "typescript"],
`# PWA Service Worker

## Registration
\`\`\`typescript
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' });
}
\`\`\`

## sw.js — Cache-First + Network-First
\`\`\`javascript
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
\`\`\`

## Strategies
- **Cache-first**: Static assets
- **Network-first**: API calls
- **Stale-while-revalidate**: Semi-dynamic content`),

  s("pwa-manifest", "PWA Web App Manifest", "Configure installable PWAs with web app manifest, icons, and install prompts.", ["frontend"],
`# PWA Manifest

## manifest.json
\`\`\`json
{ "name": "My App", "short_name": "MyApp", "start_url": "/", "display": "standalone",
  "background_color": "#fff", "theme_color": "#4285f4",
  "icons": [
    { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/512.png", "sizes": "512x512", "type": "image/png" }
  ] }
\`\`\`

## HTML
\`\`\`html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#4285f4">
<meta name="apple-mobile-web-app-capable" content="yes">
\`\`\`

## Install Prompt
\`\`\`typescript
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });
async function install() { deferredPrompt?.prompt(); }
\`\`\`

## Requirements: HTTPS, manifest with icons (192+512), service worker with fetch handler.`),

  s("pwa-workbox", "PWA with Workbox", "Production-grade PWA caching with Google Workbox and Vite PWA plugin.", ["frontend", "typescript", "devops"],
`# Workbox PWA

## Vite PWA Plugin
\`\`\`bash
npm install vite-plugin-pwa
\`\`\`

\`\`\`typescript
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    plugins: [VitePWA({
        registerType: 'autoUpdate',
        workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            runtimeCaching: [
                { urlPattern: /^https:\\/\\/api\\./, handler: 'NetworkFirst',
                  options: { cacheName: 'api', expiration: { maxEntries: 50, maxAgeSeconds: 300 } } },
                { urlPattern: /\\.(?:png|jpg|svg|webp)$/, handler: 'CacheFirst',
                  options: { cacheName: 'images', expiration: { maxEntries: 100 } } },
            ],
        },
    })],
});
\`\`\`

## Workbox Strategies: CacheFirst, NetworkFirst, StaleWhileRevalidate, NetworkOnly, CacheOnly
## Background Sync for offline form submissions
## Precaching for app shell`),

  s("pwa-push-notifications", "PWA Push Notifications", "Send web push notifications to PWA users even when the app is closed.", ["frontend", "backend"],
`# PWA Push Notifications

## Subscribe
\`\`\`typescript
const reg = await navigator.serviceWorker.ready;
const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
});
await fetch('/api/push/subscribe', { method: 'POST', body: JSON.stringify(sub) });
\`\`\`

## Service Worker Handler
\`\`\`javascript
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
\`\`\`

## Server (web-push)
\`\`\`typescript
import webpush from 'web-push';
webpush.setVapidDetails('mailto:admin@app.com', PUBLIC_KEY, PRIVATE_KEY);
await webpush.sendNotification(subscription, JSON.stringify(payload));
\`\`\``),

  s("pwa-offline-data", "PWA Offline-First Data", "Build offline-first apps with IndexedDB local storage and background sync.", ["frontend", "database", "typescript"],
`# PWA Offline-First

## IndexedDB with idb
\`\`\`typescript
import { openDB } from 'idb';
const db = await openDB('app', 1, {
    upgrade(db) { db.createObjectStore('items', { keyPath: 'id' }).createIndex('synced', 'synced'); },
});
await db.put('items', { id: crypto.randomUUID(), text: 'hello', synced: false });
\`\`\`

## Sync When Online
\`\`\`typescript
async function sync() {
    if (!navigator.onLine) return;
    const unsynced = await db.getAllFromIndex('items', 'synced', false);
    const res = await fetch('/api/sync', { method: 'POST', body: JSON.stringify(unsynced) });
    for (const item of unsynced) await db.put('items', { ...item, synced: true });
}
window.addEventListener('online', sync);
\`\`\`

## Key Principles
- Store locally first (IndexedDB), sync when online
- Queue mutations offline, replay on reconnect
- Handle conflicts (last-write-wins or merge)
- Show sync status indicator to users`),

  // === 3. MOCHA/CHAI (4 skills) ===
  s("mocha-testing", "Mocha Test Framework", "JavaScript/TypeScript testing with Mocha. BDD/TDD style describe/it blocks, hooks, and async tests.", ["testing", "typescript", "coding"],
`# Mocha Testing

## Setup
\`\`\`bash
npm install -D mocha @types/mocha chai ts-node
\`\`\`

## .mocharc.yml
\`\`\`yaml
require: ts-node/register
spec: "test/**/*.test.ts"
timeout: 5000
recursive: true
\`\`\`

## Tests
\`\`\`typescript
import { expect } from 'chai';

describe('Calculator', () => {
    let calc: Calculator;
    beforeEach(() => { calc = new Calculator(); });

    it('should add numbers', () => { expect(calc.add(2, 3)).to.equal(5); });
    it('should throw on div by zero', () => {
        expect(() => calc.divide(1, 0)).to.throw('Division by zero');
    });
});

describe('API', () => {
    it('should fetch data', async () => {
        const data = await api.get('/users');
        expect(data).to.be.an('array');
    });
});
\`\`\`

## Hooks: before, after, beforeEach, afterEach
## Run: npx mocha / npx mocha --grep "pattern" / npx mocha --watch`),

  s("chai-assertions", "Chai Assertion Library", "Expressive BDD assertions with Chai expect/should for JavaScript testing.", ["testing", "typescript", "coding"],
`# Chai Assertions

\`\`\`typescript
import { expect } from 'chai';

// Equality
expect(x).to.equal(42);
expect(obj).to.deep.equal({ a: 1 });

// Types
expect('hello').to.be.a('string');
expect([]).to.be.an('array');
expect(true).to.be.true;
expect(null).to.be.null;

// Numbers
expect(10).to.be.above(5).and.below(20);
expect(10.5).to.be.closeTo(10, 1);

// Strings & Arrays
expect('foobar').to.include('foo');
expect([1,2,3]).to.include(2).and.have.lengthOf(3);
expect([]).to.be.empty;

// Objects
expect(obj).to.have.property('name', 'Alice');
expect(obj).to.have.all.keys('name', 'age');
expect(obj).to.have.nested.property('addr.city');

// Errors
expect(() => fn()).to.throw(Error, /message/);

// Promises (chai-as-promised)
await expect(promise).to.eventually.equal(42);
await expect(badPromise).to.be.rejectedWith(Error);
\`\`\``),

  s("sinon-mocking", "Sinon.js Test Doubles", "Spies, stubs, mocks, and fake timers with Sinon.js for JavaScript testing.", ["testing", "typescript", "coding"],
`# Sinon.js

## Spies
\`\`\`typescript
const spy = sinon.spy(obj, 'method');
obj.method('arg');
expect(spy.calledWith('arg')).to.be.true;
spy.restore();
\`\`\`

## Stubs
\`\`\`typescript
const stub = sinon.stub(api, 'fetch');
stub.resolves({ id: 1, name: 'Alice' });
stub.withArgs('error').rejects(new Error('fail'));
\`\`\`

## Fake Timers
\`\`\`typescript
const clock = sinon.useFakeTimers();
const debounced = debounce(fn, 100);
debounced(); debounced();
clock.tick(100);
expect(fn.callCount).to.equal(1);
clock.restore();
\`\`\`

## Sandbox (auto-cleanup)
\`\`\`typescript
const sandbox = sinon.createSandbox();
afterEach(() => sandbox.restore());
sandbox.stub(api, 'fetch').resolves([]);
\`\`\``),

  s("mocha-integration", "Mocha Integration Testing", "HTTP API and database integration testing with Mocha and chai-http.", ["testing", "backend", "typescript"],
`# Mocha Integration Testing

## HTTP API Tests
\`\`\`typescript
import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
const { expect } = chai;

describe('GET /api/users', () => {
    it('returns users', async () => {
        const res = await chai.request(app).get('/api/users');
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
    });

    it('creates user', async () => {
        const res = await chai.request(app).post('/api/users')
            .set('Authorization', 'Bearer token')
            .send({ name: 'Alice', email: 'a@b.com' });
        expect(res).to.have.status(201);
    });
});
\`\`\`

## Database Tests
\`\`\`typescript
before(async () => { await db.migrate(); });
afterEach(async () => { await db.query('DELETE FROM users'); });
after(async () => { await db.close(); });
\`\`\``),

  // === 4. RABBITMQ/KAFKA (4 skills) ===
  s("rabbitmq-node", "RabbitMQ with Node.js", "Message queuing with RabbitMQ using amqplib. Task queues, pub/sub, dead letter queues.", ["backend", "typescript", "devops"],
`# RabbitMQ with Node.js

## Setup
\`\`\`bash
npm install amqplib
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management
\`\`\`

## Producer
\`\`\`typescript
const conn = await amqp.connect('amqp://localhost');
const ch = await conn.createChannel();
await ch.assertQueue('tasks', { durable: true });
ch.sendToQueue('tasks', Buffer.from(JSON.stringify(msg)), { persistent: true });
\`\`\`

## Consumer
\`\`\`typescript
ch.prefetch(1);
ch.consume('tasks', async (msg) => {
    if (!msg) return;
    try {
        await process(JSON.parse(msg.content.toString()));
        ch.ack(msg);
    } catch { ch.nack(msg, false, true); }
});
\`\`\`

## Pub/Sub (Fanout Exchange)
\`\`\`typescript
await ch.assertExchange('events', 'fanout', { durable: true });
ch.publish('events', '', Buffer.from(data));
// Subscriber binds queue to exchange
\`\`\`

## Topic Exchange: ch.publish('logs', 'order.created', data) → ch.bindQueue(q, 'logs', 'order.*')
## Dead Letter Queue: x-dead-letter-exchange + x-dead-letter-routing-key arguments`),

  s("kafka-node", "Apache Kafka with Node.js", "Event streaming with KafkaJS. Producers, consumers, consumer groups, and exactly-once semantics.", ["backend", "typescript", "data"],
`# Kafka with KafkaJS

## Setup
\`\`\`bash
npm install kafkajs
\`\`\`

## Producer
\`\`\`typescript
const kafka = new Kafka({ clientId: 'app', brokers: ['localhost:9092'] });
const producer = kafka.producer();
await producer.connect();
await producer.send({ topic: 'events', messages: [{ key: 'user-1', value: JSON.stringify(event) }] });
\`\`\`

## Consumer
\`\`\`typescript
const consumer = kafka.consumer({ groupId: 'my-service' });
await consumer.subscribe({ topic: 'events' });
await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value!.toString());
        await processEvent(event);
    },
});
\`\`\`

## Admin
\`\`\`typescript
const admin = kafka.admin();
await admin.createTopics({ topics: [{ topic: 'events', numPartitions: 3 }] });
\`\`\`

## Key Patterns
- Message keys for partition ordering
- Consumer groups for parallel processing
- Idempotent consumers (handle duplicates)
- Transactional producer for exactly-once`),

  s("event-driven-arch", "Event-Driven Architecture", "Design patterns for event-driven systems: event sourcing, CQRS, sagas, and message-based microservices.", ["backend", "coding", "devops"],
`# Event-Driven Architecture

## Event Sourcing
Store events as facts, rebuild state by replaying them.
\`\`\`typescript
interface DomainEvent { type: string; aggregateId: string; data: unknown; timestamp: number; }
class OrderAggregate {
    apply(event: DomainEvent) {
        switch(event.type) {
            case 'OrderCreated': this.state.status = 'created'; break;
            case 'OrderShipped': this.state.status = 'shipped'; break;
        }
    }
    static fromEvents(events: DomainEvent[]) { /* replay */ }
}
\`\`\`

## CQRS
- **Command side**: writes events to event store
- **Query side**: reads from materialized projections
- **Projection**: listens to events, updates read DB

## Saga Pattern (distributed transactions)
\`\`\`typescript
try {
    await paymentService.charge(order);
    await inventoryService.reserve(order);
} catch { // compensating transactions
    await inventoryService.release(order);
    await paymentService.refund(order);
}
\`\`\`

## Best Practices
- Events are immutable, past-tense (OrderCreated not CreateOrder)
- Idempotent consumers (same event twice = same result)
- Correlation IDs for distributed tracing
- Dead letter queues for failed messages`),

  s("message-queue-patterns", "Message Queue Patterns", "Common messaging patterns: work queues, pub/sub, routing, RPC, and dead letter handling.", ["backend", "devops"],
`# Message Queue Patterns

## Work Queue: Multiple consumers share work, messages delivered to one consumer
## Pub/Sub: Messages broadcast to all subscribers
## Topic Routing: Pattern-based message routing (order.* matches order.created)
## Request/Reply (RPC): Correlate requests with responses via correlation IDs
## Dead Letter Queue: Failed messages routed to DLQ after max retries
## Priority Queue: High-priority messages processed first
## Delayed Messages: TTL-based delayed delivery

## Choosing a Broker
| Feature | RabbitMQ | Kafka | Redis Streams |
|---------|----------|-------|--------------|
| Ordering | Per-queue | Per-partition | Per-stream |
| Replay | No (consumed) | Yes (log-based) | Yes (limited) |
| Throughput | ~50K/s | ~1M/s | ~100K/s |
| Use case | Task queues | Event streaming | Simple pub/sub |

## Reliability Patterns
- Publisher confirms / acks
- Consumer acknowledgments
- Persistent/durable queues
- Exactly-once with idempotency keys
- Circuit breaker for downstream failures`),

  // === 5. APACHE (2 skills) ===
  s("apache-httpd", "Apache HTTP Server", "Configure Apache httpd: virtual hosts, SSL, mod_rewrite, reverse proxy, and .htaccess.", ["devops", "backend"],
`# Apache httpd

## Virtual Hosts
\`\`\`apache
<VirtualHost *:80>
    ServerName myapp.com
    DocumentRoot /var/www/myapp/public
    <Directory /var/www/myapp/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
\`\`\`

## SSL: sudo certbot --apache -d myapp.com
## Reverse Proxy
\`\`\`apache
ProxyPass / http://localhost:3000/
ProxyPassReverse / http://localhost:3000/
\`\`\`

## .htaccess (SPA fallback)
\`\`\`apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [L]
\`\`\`

## Modules: sudo a2enmod rewrite ssl proxy headers expires deflate
## Security: ServerTokens Prod, X-Frame-Options, CSP headers`),

  s("apache-performance", "Apache Performance Tuning", "Optimize Apache with compression, caching, MPM tuning, and security hardening.", ["devops", "backend"],
`# Apache Performance

## Compression
\`\`\`apache
AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
\`\`\`

## Caching Headers
\`\`\`apache
<FilesMatch "\\.(jpg|png|css|js|woff2)$">
    Header set Cache-Control "max-age=31536000, public, immutable"
</FilesMatch>
\`\`\`

## MPM Event Tuning
\`\`\`apache
StartServers 3
MinSpareThreads 75
MaxSpareThreads 250
MaxRequestWorkers 400
\`\`\`

## Security
\`\`\`apache
ServerTokens Prod
ServerSignature Off
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Options -Indexes
\`\`\``),

  // === 6. CMAKE/CONAN (3 skills) ===
  s("cmake-modern", "Modern CMake", "Build C/C++ projects with modern CMake 3.20+ best practices. Targets, FetchContent, presets.", ["coding", "devops"],
`# Modern CMake

## Minimal Project
\`\`\`cmake
cmake_minimum_required(VERSION 3.20)
project(MyApp VERSION 1.0 LANGUAGES CXX)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

add_library(mylib src/lib.cpp)
target_include_directories(mylib PUBLIC include)

add_executable(myapp src/main.cpp)
target_link_libraries(myapp PRIVATE mylib)
\`\`\`

## FetchContent Dependencies
\`\`\`cmake
include(FetchContent)
FetchContent_Declare(fmt GIT_REPOSITORY https://github.com/fmtlib/fmt.git GIT_TAG 10.2.1)
FetchContent_MakeAvailable(fmt)
target_link_libraries(myapp PRIVATE fmt::fmt)
\`\`\`

## Build
\`\`\`bash
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --parallel
ctest --test-dir build
\`\`\`

## Presets (CMakePresets.json) for reproducible dev/release builds
## Best: Use target_* commands, not global include_directories()`),

  s("conan-cpp", "Conan C++ Package Manager", "Manage C++ dependencies with Conan 2.x. Install, create, and publish C++ packages.", ["coding", "devops"],
`# Conan Package Manager

## conanfile.txt
\`\`\`ini
[requires]
fmt/10.2.1
spdlog/1.13.0
nlohmann_json/3.11.3
[generators]
CMakeDeps
CMakeToolchain
\`\`\`

## Build
\`\`\`bash
conan install . --output-folder=build --build=missing
cmake -B build -DCMAKE_TOOLCHAIN_FILE=build/conan_toolchain.cmake
cmake --build build
\`\`\`

## Search: conan search "fmt" -r conancenter
## Create: conan new cmake_lib && conan create .`),

  s("cmake-testing", "CMake Testing & CTest", "C++ unit testing with CMake, Google Test, and Catch2.", ["testing", "coding"],
`# CMake Testing

## Google Test
\`\`\`cmake
FetchContent_Declare(googletest GIT_REPOSITORY https://github.com/google/googletest.git GIT_TAG v1.14.0)
FetchContent_MakeAvailable(googletest)
enable_testing()
add_executable(tests test/test_main.cpp)
target_link_libraries(tests PRIVATE mylib GTest::gtest_main)
gtest_discover_tests(tests)
\`\`\`

\`\`\`cpp
TEST(MathTest, Add) { EXPECT_EQ(add(2, 3), 5); }
TEST(MathTest, Throws) { EXPECT_THROW(divide(1, 0), std::runtime_error); }
\`\`\`

## Run: ctest --test-dir build --output-on-failure -j\$(nproc)`),

  // === 7. AIRFLOW/SPARK (4 skills) ===
  s("airflow-dags", "Apache Airflow DAGs", "Orchestrate data pipelines with Airflow. TaskFlow API, sensors, XCom, and scheduling.", ["python", "data", "devops"],
`# Airflow DAGs

## TaskFlow API
\`\`\`python
from airflow.decorators import dag, task
from datetime import datetime

@dag(schedule='@daily', start_date=datetime(2024, 1, 1), catchup=False)
def etl():
    @task()
    def extract() -> dict: return fetch_data()

    @task()
    def transform(data: dict) -> dict: return clean(data)

    @task()
    def load(data: dict): write_to_db(data)

    load(transform(extract()))
etl()
\`\`\`

## Classic DAG
\`\`\`python
with DAG('pipeline', schedule='0 6 * * *', default_args={'retries': 2}) as dag:
    t1 = PythonOperator(task_id='extract', python_callable=extract)
    t2 = BashOperator(task_id='transform', bash_command='python transform.py')
    t1 >> t2
\`\`\`

## Sensors: FileSensor, HttpSensor — wait for conditions
## XCom: ti.xcom_push(key='count', value=42) / ti.xcom_pull(task_ids='extract')
## CLI: airflow dags trigger / airflow tasks test`),

  s("pyspark-basics", "Apache Spark with PySpark", "Large-scale data processing with PySpark DataFrames, SQL, UDFs, and window functions.", ["python", "data"],
`# PySpark

## SparkSession
\`\`\`python
from pyspark.sql import SparkSession, functions as F
spark = SparkSession.builder.appName("ETL").getOrCreate()
\`\`\`

## DataFrames
\`\`\`python
df = spark.read.parquet("s3://data/")
result = (df.filter(F.col("age") > 18)
    .groupBy("country")
    .agg(F.count("*").alias("cnt"), F.avg("age").alias("avg_age"))
    .orderBy(F.desc("cnt")))
result.write.parquet("output/", mode="overwrite", partitionBy=["country"])
\`\`\`

## Window Functions
\`\`\`python
from pyspark.sql.window import Window
w = Window.partitionBy("dept").orderBy(F.desc("salary"))
df.withColumn("rank", F.row_number().over(w))
\`\`\`

## Pandas UDF (10-100x faster than regular UDF)
\`\`\`python
@pandas_udf(StringType())
def categorize(ages: pd.Series) -> pd.Series:
    return ages.apply(lambda a: "minor" if a < 18 else "adult")
\`\`\``),

  s("spark-streaming", "Spark Structured Streaming", "Real-time stream processing from Kafka, files, and sockets with Spark.", ["python", "data", "backend"],
`# Spark Streaming

\`\`\`python
df = spark.readStream.format("kafka") \\
    .option("kafka.bootstrap.servers", "localhost:9092") \\
    .option("subscribe", "events").load()

events = df.selectExpr("CAST(value AS STRING)") \\
    .select(F.from_json(F.col("value"), schema).alias("d")).select("d.*")

# Windowed aggregation
windowed = events.withWatermark("ts", "10 min") \\
    .groupBy(F.window("ts", "5 min"), "userId") \\
    .agg(F.count("*").alias("cnt"))

query = windowed.writeStream.outputMode("update") \\
    .format("console").start()
query.awaitTermination()
\`\`\`

## Output modes: append, update, complete
## Triggers: processingTime, once, availableNow`),

  s("airflow-providers", "Airflow Cloud Providers", "Connect Airflow to AWS, GCP, and cloud services with official providers.", ["python", "data", "devops"],
`# Airflow Providers

## AWS
\`\`\`python
from airflow.providers.amazon.aws.transfers.s3_to_redshift import S3ToRedshiftOperator
S3ToRedshiftOperator(task_id='load', s3_bucket='data', s3_key='{{ ds }}.csv',
    schema='public', table='users', redshift_conn_id='redshift')
\`\`\`

## GCP BigQuery
\`\`\`python
BigQueryInsertJobOperator(task_id='query', configuration={'query': {
    'query': 'SELECT * FROM dataset.table', 'useLegacySql': False }})
\`\`\`

## Docker
\`\`\`python
DockerOperator(task_id='etl', image='my-etl:latest', command='python run.py --date {{ ds }}')
\`\`\`

## Dynamic Task Mapping
\`\`\`python
@task
def get_files() -> list[str]: return ['a.csv', 'b.csv']
@task
def process(f: str): ...
process.expand(f=get_files())
\`\`\``),

  // === 8. SAML/OpenID (3 skills) ===
  s("openid-connect", "OpenID Connect (OIDC)", "OIDC authentication with Authorization Code + PKCE flow for web apps and SSO.", ["security", "backend", "typescript"],
`# OpenID Connect

## Auth Code + PKCE Flow
1. Generate code_verifier + code_challenge (S256)
2. Redirect to /authorize with client_id, redirect_uri, scope=openid, code_challenge
3. Exchange code for tokens at /token endpoint
4. Validate id_token JWT with JWKS

## Token Exchange
\`\`\`typescript
const res = await fetch(tokenUrl, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri, client_id, code_verifier }),
});
const { access_token, id_token, refresh_token } = await res.json();
\`\`\`

## Validate ID Token
\`\`\`typescript
import { jwtVerify, createRemoteJWKSet } from 'jose';
const JWKS = createRemoteJWKSet(new URL(issuer + '/.well-known/jwks.json'));
const { payload } = await jwtVerify(id_token, JWKS, { issuer, audience: clientId });
\`\`\`

## Discovery: GET /.well-known/openid-configuration`),

  s("saml-sso", "SAML 2.0 Single Sign-On", "Enterprise SAML SSO with service provider setup, assertion validation, and IdP integration.", ["security", "backend"],
`# SAML SSO

## Flow: SP → AuthnRequest → IdP → SAML Response → SP ACS URL

## Node.js (saml2-js)
\`\`\`typescript
const sp = new saml2.ServiceProvider({
    entity_id: 'https://app.com/saml/metadata',
    assert_endpoint: 'https://app.com/saml/acs',
    private_key: fs.readFileSync('sp-key.pem', 'utf-8'),
    certificate: fs.readFileSync('sp-cert.pem', 'utf-8'),
});

app.get('/saml/login', (req, res) => {
    sp.create_login_request_url(idp, {}, (err, url) => res.redirect(url));
});

app.post('/saml/acs', (req, res) => {
    sp.post_assert(idp, { request_body: req.body }, (err, resp) => {
        req.session.user = { email: resp.user.name_id };
        res.redirect('/dashboard');
    });
});
\`\`\`

## Generate Certs: openssl req -x509 -newkey rsa:2048 -keyout sp-key.pem -out sp-cert.pem -days 3650 -nodes`),

  s("oauth2-jwt-auth", "OAuth 2.0 & JWT Auth", "JWT token authentication with access/refresh tokens, middleware, and social login integration.", ["security", "backend", "typescript"],
`# OAuth 2.0 & JWT

## Sign & Verify Tokens
\`\`\`typescript
import { SignJWT, jwtVerify } from 'jose';
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function sign(payload: any, exp = '15m') {
    return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt().setExpirationTime(exp).sign(secret);
}
async function verify(token: string) {
    return (await jwtVerify(token, secret)).payload;
}
\`\`\`

## Auth Middleware
\`\`\`typescript
async function auth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Missing token' });
    try { req.user = await verify(token); next(); }
    catch { res.status(401).json({ error: 'Invalid token' }); }
}
\`\`\`

## Refresh Token Flow
- Short-lived access token (15m) + long-lived refresh token (7d)
- Store refresh tokens in DB, check revocation
- POST /auth/refresh exchanges refresh → new access token`),

  // === 9-10. VUE.JS + SVELTE ===
  s("nuxt3-framework", "Nuxt 3 Framework", "Full-stack Vue.js with Nuxt 3. SSR, SSG, file-based routing, server API routes, and auto-imports.", ["frontend", "typescript", "backend"],
`# Nuxt 3

## Setup: npx nuxi@latest init my-app

## File-Based Routing
pages/index.vue → /
pages/blog/[slug].vue → /blog/:slug

## Data Fetching
\`\`\`vue
<script setup>
const { data } = await useFetch('/api/posts');
const { data: user } = await useAsyncData('user', () => $fetch('/api/me'));
</script>
\`\`\`

## Server Routes
\`\`\`typescript
// server/api/posts.get.ts
export default defineEventHandler(async () => {
    return await db.query.posts.findMany();
});
\`\`\`

## Config
\`\`\`typescript
export default defineNuxtConfig({
    modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
    routeRules: { '/': { prerender: true }, '/api/**': { cors: true } },
});
\`\`\``),

  s("pinia-state", "Pinia State Management", "Vue 3 state management with Pinia stores, getters, actions, and persistence.", ["frontend", "typescript"],
`# Pinia

## Store
\`\`\`typescript
import { defineStore } from 'pinia';
export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const isLoggedIn = computed(() => !!user.value);
    async function login(email: string, pass: string) {
        user.value = await api.login(email, pass);
    }
    return { user, isLoggedIn, login };
});
\`\`\`

## Usage
\`\`\`vue
<script setup>
const auth = useAuthStore();
const { isLoggedIn } = storeToRefs(auth);
</script>
\`\`\`

## Persistence: pinia-plugin-persistedstate for localStorage sync`),

  s("vuetify3", "Vuetify 3 Components", "Material Design component library for Vue 3 with data tables, forms, and theming.", ["frontend", "design", "typescript"],
`# Vuetify 3

## Setup
\`\`\`bash
npm install vuetify @mdi/font
\`\`\`

## Plugin
\`\`\`typescript
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
export default createVuetify({ components, theme: {
    themes: { light: { colors: { primary: '#1976D2' } } } } });
\`\`\`

## Key Components
- v-app, v-app-bar, v-navigation-drawer — Layout
- v-btn, v-text-field, v-select, v-checkbox — Forms
- v-data-table — Sortable, filterable data tables
- v-card, v-list, v-chip — Content display
- v-dialog, v-snackbar — Overlays`),

  s("sveltekit", "SvelteKit Framework", "Full-stack Svelte framework with file-based routing, SSR, load functions, and form actions.", ["frontend", "typescript", "backend"],
`# SvelteKit

## Setup: npx sv create my-app

## Routing
\`\`\`
src/routes/
  +page.svelte          → /
  +layout.svelte        → shared layout
  blog/[slug]/
    +page.svelte        → /blog/:slug
    +page.server.ts     → load data
\`\`\`

## Load Functions
\`\`\`typescript
// +page.server.ts
export async function load({ params }) {
    const post = await db.getPost(params.slug);
    if (!post) throw error(404, 'Not found');
    return { post };
}
\`\`\`

## Form Actions
\`\`\`typescript
export const actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        await db.createPost(data.get('title'), data.get('body'));
        throw redirect(303, '/blog');
    },
};
\`\`\`

## svelte.config.js: adapter-auto, adapter-node, adapter-static, adapter-vercel`),

  s("svelte5-runes", "Svelte 5 Runes", "Svelte 5 reactivity with $state, $derived, $effect runes and component patterns.", ["frontend", "typescript"],
`# Svelte 5 Runes

## Reactivity
\`\`\`svelte
<script>
let count = $state(0);
let doubled = $derived(count * 2);
$effect(() => { console.log('Count:', count); });
</script>
<button onclick={() => count++}>{count} (doubled: {doubled})</button>
\`\`\`

## Props
\`\`\`svelte
<script>
let { name, age = 25 }: { name: string; age?: number } = $props();
</script>
\`\`\`

## Stores (shared state)
\`\`\`typescript
// stores.svelte.ts
class CounterStore {
    count = $state(0);
    increment() { this.count++; }
}
export const counter = new CounterStore();
\`\`\``),

  // === 11. DENO/BUN ===
  s("deno-runtime", "Deno Runtime", "Server-side TypeScript with Deno. Built-in TypeScript, permissions, std library, and fresh framework.", ["typescript", "backend"],
`# Deno

## Run
\`\`\`bash
deno run --allow-net --allow-read server.ts
deno run --watch server.ts  # dev mode
\`\`\`

## HTTP Server
\`\`\`typescript
Deno.serve({ port: 8000 }, (req) => {
    const url = new URL(req.url);
    if (url.pathname === "/api/hello") return Response.json({ msg: "hello" });
    return new Response("Not Found", { status: 404 });
});
\`\`\`

## Permissions: --allow-net, --allow-read, --allow-write, --allow-env
## Imports: import from "https://deno.land/std@0.220.0/..."
## deno.json for import maps, tasks, lint/fmt config
## Fresh framework for full-stack Deno web apps`),

  s("bun-runtime", "Bun Runtime", "Fast JavaScript/TypeScript runtime. Built-in bundler, test runner, and package manager.", ["typescript", "backend"],
`# Bun

## Run & Dev
\`\`\`bash
bun run index.ts
bun --watch index.ts
\`\`\`

## HTTP Server (fastest in JS ecosystem)
\`\`\`typescript
Bun.serve({
    port: 3000,
    fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/api") return Response.json({ ok: true });
        return new Response("Hello!");
    },
});
\`\`\`

## Package Manager: bun install (25x faster than npm)
## Bundler: bun build ./index.ts --outdir ./dist
## Test Runner: bun test
\`\`\`typescript
import { test, expect } from "bun:test";
test("math", () => { expect(2 + 2).toBe(4); });
\`\`\`

## SQLite built-in: import { Database } from "bun:sqlite";`),

  // === 12. SUPABASE ===
  s("supabase-backend", "Supabase Backend", "Build backends with Supabase: auth, database, storage, edge functions, and real-time subscriptions.", ["backend", "database", "typescript"],
`# Supabase

## Client Setup
\`\`\`typescript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
\`\`\`

## Database (Postgres)
\`\`\`typescript
const { data } = await supabase.from('posts').select('*, author:users(name)').order('created_at', { ascending: false }).limit(10);
await supabase.from('posts').insert({ title, body, user_id: user.id });
await supabase.from('posts').update({ title }).eq('id', postId);
\`\`\`

## Auth
\`\`\`typescript
await supabase.auth.signUp({ email, password });
await supabase.auth.signInWithPassword({ email, password });
await supabase.auth.signInWithOAuth({ provider: 'github' });
const { data: { user } } = await supabase.auth.getUser();
\`\`\`

## Real-time
\`\`\`typescript
supabase.channel('posts').on('postgres_changes',
    { event: '*', schema: 'public', table: 'posts' },
    (payload) => console.log(payload)
).subscribe();
\`\`\`

## Storage
\`\`\`typescript
await supabase.storage.from('avatars').upload(path, file);
const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
\`\`\`

## RLS (Row Level Security) for fine-grained access control in Postgres policies`),

  s("supabase-edge-functions", "Supabase Edge Functions", "Deploy serverless functions at the edge with Supabase and Deno.", ["backend", "typescript", "devops"],
`# Supabase Edge Functions

## Create & Deploy
\`\`\`bash
supabase functions new my-function
supabase functions deploy my-function
\`\`\`

## Function
\`\`\`typescript
// supabase/functions/my-function/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data } = await supabase.from('users').select('*');
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
});
\`\`\`

## Invoke: supabase.functions.invoke('my-function', { body: { name: 'test' } })
## Secrets: supabase secrets set MY_KEY=value`),

  // === 13. PRISMA ===
  s("prisma-orm", "Prisma ORM", "Type-safe database access with Prisma. Schema definition, migrations, queries, and relations.", ["database", "typescript", "backend"],
`# Prisma ORM

## Setup
\`\`\`bash
npm install prisma @prisma/client
npx prisma init
\`\`\`

## Schema (prisma/schema.prisma)
\`\`\`prisma
datasource db { provider = "postgresql" url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
}
\`\`\`

## Migrations
\`\`\`bash
npx prisma migrate dev --name init
npx prisma generate  # Regenerate client
\`\`\`

## Queries
\`\`\`typescript
const users = await prisma.user.findMany({ include: { posts: true } });
const user = await prisma.user.create({ data: { email: 'a@b.com', name: 'Alice' } });
await prisma.post.update({ where: { id: 1 }, data: { published: true } });
await prisma.user.delete({ where: { id: 1 } });
\`\`\`

## Advanced: transactions, raw SQL, middleware, soft deletes`),

  // === 14. tRPC ===
  s("trpc-fullstack", "tRPC End-to-End Typesafe APIs", "Build typesafe APIs without REST/GraphQL. Shared types between server and client.", ["typescript", "backend", "frontend"],
`# tRPC

## Server
\`\`\`typescript
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
const t = initTRPC.create();

const appRouter = t.router({
    getUser: t.procedure.input(z.string()).query(({ input }) => {
        return db.user.findUnique({ where: { id: input } });
    }),
    createUser: t.procedure
        .input(z.object({ name: z.string(), email: z.string().email() }))
        .mutation(({ input }) => db.user.create({ data: input })),
});
export type AppRouter = typeof appRouter;
\`\`\`

## Client (React)
\`\`\`typescript
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../server/router';
const trpc = createTRPCReact<AppRouter>();

function UserPage({ id }: { id: string }) {
    const { data: user } = trpc.getUser.useQuery(id);
    const createUser = trpc.createUser.useMutation();
    return <div>{user?.name}</div>;
}
\`\`\`

## Key: Full type inference from server to client, no codegen needed`),

  // === 15. ASTRO ===
  s("astro-framework", "Astro Framework", "Content-focused web framework. Islands architecture, zero JS by default, multi-framework support.", ["frontend", "typescript"],
`# Astro

## Setup: npm create astro@latest

## Pages (.astro files)
\`\`\`astro
---
// Component script (runs at build time)
const posts = await fetch('https://api.example.com/posts').then(r => r.json());
---
<html>
<body>
    <h1>Blog</h1>
    {posts.map(p => <article><h2>{p.title}</h2><p>{p.excerpt}</p></article>)}
</body>
</html>
\`\`\`

## Islands (interactive components)
\`\`\`astro
---
import Counter from '../components/Counter.tsx';
---
<Counter client:load />      <!-- Hydrate on load -->
<Counter client:visible />   <!-- Hydrate when visible -->
<Counter client:idle />      <!-- Hydrate on idle -->
\`\`\`

## Content Collections
\`\`\`typescript
// src/content/config.ts
const blog = defineCollection({ schema: z.object({ title: z.string(), date: z.date() }) });
\`\`\`

## Supports React, Vue, Svelte, Solid components in same project
## Static by default, opt-in SSR with adapters (Node, Vercel, Cloudflare)`),

  // === 16. REMIX ===
  s("remix-framework", "Remix Framework", "Full-stack React framework with nested routing, data loading, form actions, and progressive enhancement.", ["frontend", "typescript", "backend"],
`# Remix

## Routes with Data Loading
\`\`\`typescript
// app/routes/posts.$slug.tsx
export async function loader({ params }: LoaderFunctionArgs) {
    const post = await db.post.findUnique({ where: { slug: params.slug } });
    if (!post) throw new Response("Not Found", { status: 404 });
    return json(post);
}

export default function PostPage() {
    const post = useLoaderData<typeof loader>();
    return <article><h1>{post.title}</h1><div>{post.body}</div></article>;
}
\`\`\`

## Form Actions
\`\`\`typescript
export async function action({ request }: ActionFunctionArgs) {
    const form = await request.formData();
    await db.comment.create({ data: { body: form.get('body') as string } });
    return redirect('/posts');
}

export default function NewComment() {
    return <Form method="post"><textarea name="body" /><button type="submit">Post</button></Form>;
}
\`\`\`

## Error Boundaries, nested layouts, streaming, deferred data loading`),

  // === 17. TURBOREPO ===
  s("turborepo", "Turborepo Monorepo", "Manage JavaScript/TypeScript monorepos with Turborepo. Caching, task pipelines, and workspace management.", ["typescript", "devops", "coding"],
`# Turborepo

## Setup
\`\`\`bash
npx create-turbo@latest
\`\`\`

## turbo.json
\`\`\`json
{ "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**"] },
    "dev": { "cache": false, "persistent": true },
    "test": { "dependsOn": ["build"] },
    "lint": {} } }
\`\`\`

## Structure
\`\`\`
apps/web/         # Next.js app
apps/api/         # Express API
packages/ui/      # Shared components
packages/config/  # Shared config (eslint, tsconfig)
\`\`\`

## Commands
\`\`\`bash
turbo build              # Build all packages (cached)
turbo dev --filter=web   # Dev only web app
turbo test --affected    # Test only changed packages
\`\`\`

## Remote Caching: turbo login && turbo link (share cache across CI/team)`),

  // === 18. STRIPE ===
  s("stripe-payments", "Stripe Payments Integration", "Accept payments with Stripe. Checkout sessions, subscriptions, webhooks, and customer management.", ["backend", "typescript"],
`# Stripe Payments

## Setup
\`\`\`bash
npm install stripe
\`\`\`

## Checkout Session
\`\`\`typescript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: 'price_xxx', quantity: 1 }],
    success_url: 'https://app.com/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://app.com/cancel',
});
// Redirect to session.url
\`\`\`

## Subscriptions
\`\`\`typescript
const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: 'price_monthly', quantity: 1 }],
    success_url: '...',
});
\`\`\`

## Webhooks
\`\`\`typescript
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
    switch (event.type) {
        case 'checkout.session.completed': handlePayment(event.data.object); break;
        case 'customer.subscription.deleted': handleCancellation(event.data.object); break;
    }
    res.json({ received: true });
});
\`\`\`

## Customer Portal: stripe.billingPortal.sessions.create({ customer })`),

  // === 19. SENDGRID ===
  s("sendgrid-email", "SendGrid Email Service", "Send transactional and marketing emails with SendGrid. Templates, dynamic content, and webhooks.", ["backend", "typescript"],
`# SendGrid Email

## Setup
\`\`\`bash
npm install @sendgrid/mail
\`\`\`

## Send Email
\`\`\`typescript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
    to: 'user@example.com',
    from: 'noreply@myapp.com',
    subject: 'Welcome!',
    html: '<h1>Welcome to MyApp</h1><p>Thanks for signing up.</p>',
});
\`\`\`

## Dynamic Templates
\`\`\`typescript
await sgMail.send({
    to: 'user@example.com', from: 'noreply@myapp.com',
    templateId: 'd-xxxx',
    dynamicTemplateData: { name: 'Alice', resetLink: 'https://...' },
});
\`\`\`

## Bulk Send
\`\`\`typescript
await sgMail.sendMultiple({
    to: ['a@b.com', 'c@d.com'], from: 'noreply@app.com',
    subject: 'Newsletter', html: '<p>Monthly update</p>',
});
\`\`\`

## Webhooks for delivery tracking: delivered, opened, clicked, bounced`),

  // === 20. OPENTELEMETRY ===
  s("opentelemetry-node", "OpenTelemetry for Node.js", "Distributed tracing and metrics with OpenTelemetry in Node.js applications.", ["backend", "typescript", "devops"],
`# OpenTelemetry Node.js

## Setup
\`\`\`bash
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http
\`\`\`

## Instrumentation
\`\`\`typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({ url: 'http://localhost:4318/v1/traces' }),
    instrumentations: [getNodeAutoInstrumentations()],
    serviceName: 'my-api',
});
sdk.start();
\`\`\`

## Custom Spans
\`\`\`typescript
import { trace } from '@opentelemetry/api';
const tracer = trace.getTracer('my-service');

async function processOrder(orderId: string) {
    return tracer.startActiveSpan('process-order', async (span) => {
        span.setAttribute('order.id', orderId);
        try {
            const result = await doWork();
            span.setStatus({ code: SpanStatusCode.OK });
            return result;
        } catch (err) {
            span.recordException(err); span.setStatus({ code: SpanStatusCode.ERROR });
            throw err;
        } finally { span.end(); }
    });
}
\`\`\`

## Collectors: Jaeger, Zipkin, Grafana Tempo, Datadog, Honeycomb`),

  s("observability-stack", "Observability Stack", "Set up Grafana, Prometheus, and Loki for metrics, logs, and tracing.", ["devops", "backend"],
`# Observability Stack

## Prometheus Metrics
\`\`\`typescript
import { Counter, Histogram, register } from 'prom-client';
const httpRequests = new Counter({ name: 'http_requests_total', help: 'Total HTTP requests', labelNames: ['method', 'path', 'status'] });
const httpDuration = new Histogram({ name: 'http_duration_seconds', help: 'Request duration', labelNames: ['method', 'path'] });

app.use((req, res, next) => {
    const end = httpDuration.startTimer({ method: req.method, path: req.path });
    res.on('finish', () => {
        httpRequests.inc({ method: req.method, path: req.path, status: res.statusCode });
        end();
    });
    next();
});
app.get('/metrics', async (req, res) => { res.set('Content-Type', register.contentType); res.send(await register.metrics()); });
\`\`\`

## Docker Compose Stack
Grafana (dashboards) + Prometheus (metrics) + Loki (logs) + Tempo (traces)

## Key Metrics: request rate, error rate, latency (p50/p95/p99), saturation`),

  // === 21. PULUMI ===
  s("pulumi-iac", "Pulumi Infrastructure as Code", "Define cloud infrastructure with TypeScript/Python using Pulumi. AWS, GCP, Azure resources.", ["devops", "typescript"],
`# Pulumi IaC

## Setup
\`\`\`bash
pulumi new aws-typescript
\`\`\`

## AWS Example
\`\`\`typescript
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const bucket = new aws.s3.Bucket("my-bucket", { website: { indexDocument: "index.html" } });
const vpc = new aws.ec2.Vpc("my-vpc", { cidrBlock: "10.0.0.0/16" });
const lambda = new aws.lambda.Function("api", {
    runtime: "nodejs18.x", handler: "index.handler",
    code: new pulumi.asset.FileArchive("./dist"),
    role: role.arn,
});

export const bucketUrl = bucket.websiteEndpoint;
\`\`\`

## Commands
\`\`\`bash
pulumi up          # Deploy
pulumi preview     # Dry run
pulumi destroy     # Tear down
pulumi stack ls    # List stacks (dev, staging, prod)
\`\`\`

## Key advantage: Real programming languages (TypeScript, Python, Go) instead of YAML/HCL`),

  // === 22. ANSIBLE ===
  s("ansible-automation", "Ansible Automation", "Server provisioning and configuration management with Ansible playbooks, roles, and inventories.", ["devops"],
`# Ansible

## Inventory (hosts.yml)
\`\`\`yaml
all:
  children:
    webservers:
      hosts:
        web1: { ansible_host: 192.168.1.10 }
        web2: { ansible_host: 192.168.1.11 }
    dbservers:
      hosts:
        db1: { ansible_host: 192.168.1.20 }
\`\`\`

## Playbook
\`\`\`yaml
- hosts: webservers
  become: yes
  tasks:
    - name: Install nginx
      apt: name=nginx state=present
    - name: Copy config
      template: src=nginx.conf.j2 dest=/etc/nginx/nginx.conf
      notify: restart nginx
    - name: Enable service
      systemd: name=nginx state=started enabled=yes
  handlers:
    - name: restart nginx
      systemd: name=nginx state=restarted
\`\`\`

## Run
\`\`\`bash
ansible-playbook -i hosts.yml playbook.yml
ansible-playbook playbook.yml --check  # Dry run
ansible webservers -m ping             # Ad-hoc
\`\`\`

## Roles for reusable modules, Vault for secrets, Galaxy for community roles`),

  s("ansible-roles", "Ansible Roles & Best Practices", "Organize Ansible automation with roles, variables, templates, and Ansible Vault.", ["devops"],
`# Ansible Roles

## Role Structure
\`\`\`
roles/nginx/
  tasks/main.yml       # Task list
  handlers/main.yml    # Handlers
  templates/nginx.conf.j2
  defaults/main.yml    # Default variables
  vars/main.yml        # Role variables
\`\`\`

## Using Roles
\`\`\`yaml
- hosts: webservers
  roles:
    - { role: nginx, nginx_port: 8080 }
    - { role: certbot, domain: myapp.com }
\`\`\`

## Ansible Vault (secrets)
\`\`\`bash
ansible-vault encrypt secrets.yml
ansible-vault edit secrets.yml
ansible-playbook --ask-vault-pass playbook.yml
\`\`\`

## Galaxy: ansible-galaxy install geerlingguy.docker`),

  // === 23-28. AI/AGENT TOOLS ===
  s("langgraph-workflows", "LangGraph Agent Workflows", "Build stateful multi-step AI agent workflows with LangGraph. Graphs, nodes, conditional edges.", ["ai", "python", "agent"],
`# LangGraph

## Basic Agent Graph
\`\`\`python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class AgentState(TypedDict):
    messages: list
    next_step: str

def call_model(state: AgentState) -> AgentState:
    response = llm.invoke(state["messages"])
    return {"messages": state["messages"] + [response]}

def should_continue(state: AgentState) -> str:
    if state["messages"][-1].tool_calls:
        return "tools"
    return END

graph = StateGraph(AgentState)
graph.add_node("agent", call_model)
graph.add_node("tools", tool_executor)
graph.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
graph.add_edge("tools", "agent")
graph.set_entry_point("agent")

app = graph.compile()
result = app.invoke({"messages": [HumanMessage("What's the weather?")]})
\`\`\`

## Checkpointing for persistence, human-in-the-loop, branching, subgraphs`),

  s("crewai-multiagent", "CrewAI Multi-Agent", "Build collaborative AI agent teams with CrewAI. Roles, tasks, and crew orchestration.", ["ai", "python", "agent"],
`# CrewAI

## Define Agents & Tasks
\`\`\`python
from crewai import Agent, Task, Crew

researcher = Agent(
    role='Research Analyst',
    goal='Find comprehensive information on the topic',
    backstory='Expert researcher with access to web search',
    tools=[search_tool],
    llm=llm,
)

writer = Agent(
    role='Content Writer',
    goal='Write engaging content based on research',
    backstory='Experienced technical writer',
    llm=llm,
)

research_task = Task(description='Research {topic}', agent=researcher, expected_output='Research report')
write_task = Task(description='Write article from research', agent=writer, expected_output='Blog post', context=[research_task])

crew = Crew(agents=[researcher, writer], tasks=[research_task, write_task], verbose=True)
result = crew.kickoff(inputs={'topic': 'AI agents'})
\`\`\`

## Process types: sequential, hierarchical (manager delegates)
## Memory, callbacks, custom tools`),

  s("autogen-agents", "AutoGen Multi-Agent", "Build conversational multi-agent systems with Microsoft AutoGen.", ["ai", "python", "agent"],
`# AutoGen

## Two-Agent Chat
\`\`\`python
from autogen import AssistantAgent, UserProxyAgent

assistant = AssistantAgent("assistant", llm_config={"model": "gpt-4o"})
user_proxy = UserProxyAgent("user", human_input_mode="NEVER", code_execution_config={"work_dir": "output"})

user_proxy.initiate_chat(assistant, message="Create a plot of AAPL stock price for the last month")
\`\`\`

## Group Chat
\`\`\`python
from autogen import GroupChat, GroupChatManager

coder = AssistantAgent("coder", system_message="Write Python code")
reviewer = AssistantAgent("reviewer", system_message="Review code for bugs")
group = GroupChat(agents=[user_proxy, coder, reviewer], messages=[], max_round=10)
manager = GroupChatManager(groupchat=group, llm_config=llm_config)
user_proxy.initiate_chat(manager, message="Build a REST API")
\`\`\`

## Features: code execution, tool use, human-in-the-loop, nested chats`),

  s("vercel-ai-sdk", "Vercel AI SDK", "Build AI-powered apps with the Vercel AI SDK. Streaming, tool calling, and React hooks.", ["ai", "typescript", "frontend"],
`# Vercel AI SDK

## Setup
\`\`\`bash
npm install ai @ai-sdk/openai
\`\`\`

## Streaming Chat (Next.js)
\`\`\`typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
    const { messages } = await req.json();
    const result = streamText({ model: openai('gpt-4o'), messages });
    return result.toDataStreamResponse();
}
\`\`\`

\`\`\`tsx
// app/page.tsx
'use client';
import { useChat } from 'ai/react';

export default function Chat() {
    const { messages, input, handleInputChange, handleSubmit } = useChat();
    return (
        <div>
            {messages.map(m => <div key={m.id}>{m.role}: {m.content}</div>)}
            <form onSubmit={handleSubmit}>
                <input value={input} onChange={handleInputChange} />
            </form>
        </div>
    );
}
\`\`\`

## Tool Calling
\`\`\`typescript
const result = streamText({
    model: openai('gpt-4o'), messages,
    tools: { getWeather: { parameters: z.object({ city: z.string() }),
        execute: async ({ city }) => fetchWeather(city) } },
});
\`\`\``),

  s("github-copilot-skills", "GitHub Copilot Agent Skills", "Build custom skills for GitHub Copilot agents with SKILL.md configuration.", ["ai", "agent", "coding"],
`# GitHub Copilot Agent Skills

## SKILL.md Format
\`\`\`markdown
---
name: My Custom Skill
description: What this skill does
tags: [typescript, testing]
---

# My Custom Skill

## When to Use
Use when the user asks about X or needs help with Y.

## Instructions
1. Always check for existing code first
2. Follow project conventions
3. Add tests for new features

## Code Patterns
\\\`\\\`\\\`typescript
// Preferred pattern
\\\`\\\`\\\`
\`\`\`

## Best Practices
- Clear description for skill matching
- Specific "when to use" criteria
- Include code examples and patterns
- Keep focused on one domain
- Reference project-specific conventions`),

  // === 28. CLOUDFLARE WORKERS ===
  s("cloudflare-workers", "Cloudflare Workers", "Deploy serverless functions at the edge with Cloudflare Workers. KV, D1, R2, and Durable Objects.", ["backend", "typescript", "devops"],
`# Cloudflare Workers

## Setup
\`\`\`bash
npm create cloudflare@latest my-worker
cd my-worker && npx wrangler dev
\`\`\`

## Worker
\`\`\`typescript
export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        if (url.pathname === '/api/hello') return Response.json({ msg: 'Hello from the edge!' });
        if (url.pathname === '/api/kv') {
            const val = await env.MY_KV.get('key');
            return Response.json({ val });
        }
        return new Response('Not Found', { status: 404 });
    },
};
\`\`\`

## wrangler.toml
\`\`\`toml
name = "my-worker"
main = "src/index.ts"
[[kv_namespaces]]
binding = "MY_KV"
id = "xxx"
[[d1_databases]]
binding = "DB"
database_name = "my-db"
database_id = "xxx"
\`\`\`

## Deploy: npx wrangler deploy
## D1 (SQLite), KV (key-value), R2 (object storage), Durable Objects (stateful)`),

  s("cloudflare-hono", "Hono on Cloudflare Workers", "Build APIs with Hono web framework on Cloudflare Workers.", ["backend", "typescript"],
`# Hono on Workers

\`\`\`typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';

const app = new Hono<{ Bindings: Env }>();
app.use('/api/*', cors());

app.get('/api/users', async (c) => {
    const { results } = await c.env.DB.prepare('SELECT * FROM users').all();
    return c.json(results);
});

app.post('/api/users', async (c) => {
    const { name, email } = await c.req.json();
    await c.env.DB.prepare('INSERT INTO users (name, email) VALUES (?, ?)').bind(name, email).run();
    return c.json({ ok: true }, 201);
});

export default app;
\`\`\`

## Middleware, route groups, validation with zod, WebSocket support`),

  // === 29. DAGGER ===
  s("dagger-cicd", "Dagger CI/CD", "Write CI/CD pipelines as code with Dagger. Portable, testable pipelines in TypeScript/Python/Go.", ["devops", "typescript", "coding"],
`# Dagger CI/CD

## Setup
\`\`\`bash
curl -L https://dl.dagger.io/dagger/install.sh | sh
npm install @dagger.io/dagger
\`\`\`

## Pipeline (TypeScript)
\`\`\`typescript
import { connect } from "@dagger.io/dagger";

connect(async (client) => {
    const src = client.host().directory(".", { exclude: ["node_modules", ".git"] });

    // Build
    const build = client.container()
        .from("node:20-alpine")
        .withDirectory("/app", src)
        .withWorkdir("/app")
        .withExec(["npm", "ci"])
        .withExec(["npm", "run", "build"]);

    // Test
    await build.withExec(["npm", "test"]).sync();

    // Publish
    const image = build.withEntrypoint(["node", "dist/index.js"]);
    await image.publish("ghcr.io/myorg/myapp:latest");
});
\`\`\`

## Run: dagger run node pipeline.ts
## Works the same locally and in CI (GitHub Actions, GitLab, etc.)
## Caching built-in, reproducible builds`),

  // === 30. NIX ===
  s("nix-development", "Nix Development Environments", "Reproducible development environments with Nix flakes and nix-shell.", ["devops", "coding"],
`# Nix Dev Environments

## flake.nix
\`\`\`nix
{
  inputs = { nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable"; flake-utils.url = "github:numtide/flake-utils"; };
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.\${system}; in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [ nodejs_20 python3 rustc cargo postgresql redis ];
          shellHook = "echo 'Dev environment ready!'";
        };
      });
}
\`\`\`

## Enter: nix develop (or direnv for auto-activation)

## shell.nix (non-flake)
\`\`\`nix
{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell { buildInputs = [ pkgs.nodejs pkgs.yarn ]; }
\`\`\`

## Key Benefits
- Reproducible: same packages everywhere (dev, CI, prod)
- Isolated: doesn't pollute global system
- Declarative: version-controlled dev dependencies
- Cross-platform: Linux and macOS`),

  s("nixos-config", "NixOS Configuration", "Configure NixOS systems declaratively. Services, packages, networking, and users.", ["devops"],
`# NixOS Configuration

## /etc/nixos/configuration.nix
\`\`\`nix
{ config, pkgs, ... }: {
  system.stateVersion = "24.05";
  networking.hostName = "myserver";
  networking.firewall.allowedTCPPorts = [ 22 80 443 ];

  users.users.admin = {
    isNormalUser = true;
    extraGroups = [ "wheel" "docker" ];
    openssh.authorizedKeys.keys = [ "ssh-ed25519 AAAA..." ];
  };

  environment.systemPackages = with pkgs; [ vim git htop docker-compose ];

  services.openssh.enable = true;
  services.nginx = {
    enable = true;
    virtualHosts."myapp.com" = {
      forceSSL = true;
      enableACME = true;
      locations."/".proxyPass = "http://localhost:3000";
    };
  };

  virtualisation.docker.enable = true;
}
\`\`\`

## Rebuild: sudo nixos-rebuild switch
## Rollback: sudo nixos-rebuild switch --rollback
## Generations: nix-env --list-generations`),

  // === EXTRA: Fill remaining gaps ===
  s("stripe-subscriptions", "Stripe Subscriptions", "Manage recurring payments with Stripe subscriptions, billing portal, and metered billing.", ["backend", "typescript"],
`# Stripe Subscriptions

## Create Subscription via Checkout
\`\`\`typescript
const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: 'price_monthly_pro', quantity: 1 }],
    success_url: 'https://app.com/success',
    cancel_url: 'https://app.com/pricing',
    customer: customerId,
});
\`\`\`

## Manage Subscription
\`\`\`typescript
await stripe.subscriptions.update(subId, { items: [{ price: 'price_annual_pro' }] });
await stripe.subscriptions.cancel(subId);
\`\`\`

## Billing Portal
\`\`\`typescript
const portal = await stripe.billingPortal.sessions.create({
    customer: customerId, return_url: 'https://app.com/settings',
});
// Redirect to portal.url
\`\`\`

## Webhook Events: customer.subscription.created/updated/deleted, invoice.paid/payment_failed`),

  s("email-service-patterns", "Email Service Patterns", "Transactional email patterns: templates, queuing, delivery tracking, and provider abstraction.", ["backend", "typescript"],
`# Email Service Patterns

## Provider Abstraction
\`\`\`typescript
interface EmailProvider {
    send(opts: { to: string; subject: string; html: string; from?: string }): Promise<void>;
}

class SendGridProvider implements EmailProvider {
    async send(opts) { await sgMail.send({ ...opts, from: opts.from || DEFAULT_FROM }); }
}

class ResendProvider implements EmailProvider {
    async send(opts) { await resend.emails.send(opts); }
}
\`\`\`

## Template Engine
\`\`\`typescript
const templates = {
    welcome: (name: string) => ({ subject: 'Welcome!', html: \`<h1>Hi \${name}</h1>\` }),
    resetPassword: (link: string) => ({ subject: 'Reset Password', html: \`<a href="\${link}">Reset</a>\` }),
};
\`\`\`

## Queue emails for reliability (Bull/BullMQ)
## Track: delivered, opened, clicked, bounced via webhooks
## Rate limiting, retry with exponential backoff`),

  s("trpc-middleware", "tRPC Middleware & Auth", "Add authentication, rate limiting, and error handling middleware to tRPC routers.", ["typescript", "backend", "security"],
`# tRPC Middleware

## Auth Middleware
\`\`\`typescript
const isAuthed = t.middleware(({ ctx, next }) => {
    if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
    return next({ ctx: { user: ctx.user } });
});

const protectedProcedure = t.procedure.use(isAuthed);

const router = t.router({
    getProfile: protectedProcedure.query(({ ctx }) => {
        return db.user.findUnique({ where: { id: ctx.user.id } });
    }),
});
\`\`\`

## Rate Limiting
\`\`\`typescript
const rateLimited = t.middleware(async ({ ctx, next }) => {
    const key = ctx.ip;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 60);
    if (count > 100) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
    return next();
});
\`\`\`

## Error Handling, logging, input validation with Zod`),

  s("prisma-advanced", "Prisma Advanced Patterns", "Prisma transactions, raw queries, middleware, and performance optimization.", ["database", "typescript", "backend"],
`# Prisma Advanced

## Transactions
\`\`\`typescript
const [user, post] = await prisma.$transaction([
    prisma.user.create({ data: { email } }),
    prisma.post.create({ data: { title, authorId: userId } }),
]);

// Interactive transaction
await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id } });
    if (user.balance < amount) throw new Error('Insufficient balance');
    await tx.user.update({ where: { id }, data: { balance: { decrement: amount } } });
});
\`\`\`

## Raw SQL
\`\`\`typescript
const result = await prisma.$queryRaw\`SELECT * FROM users WHERE age > \${minAge}\`;
\`\`\`

## Middleware
\`\`\`typescript
prisma.$use(async (params, next) => {
    if (params.action === 'delete') { params.action = 'update'; params.args.data = { deleted: true }; }
    return next(params);
});
\`\`\`

## Performance: select only needed fields, use cursor-based pagination, connection pooling`),

  s("supabase-rls", "Supabase Row Level Security", "Secure Supabase data with PostgreSQL Row Level Security policies.", ["database", "security", "backend"],
`# Supabase RLS

## Enable RLS
\`\`\`sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Users can only read published posts
CREATE POLICY "Public posts" ON posts FOR SELECT USING (published = true);

-- Users can only edit their own posts
CREATE POLICY "Own posts" ON posts FOR ALL USING (auth.uid() = user_id);

-- Admin can do anything
CREATE POLICY "Admin access" ON posts FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
\`\`\`

## Common Patterns
- auth.uid() — current user's ID
- auth.jwt() — full JWT claims
- Use WITH CHECK for INSERT/UPDATE validation
- Separate SELECT/INSERT/UPDATE/DELETE policies for fine-grained control`),

  s("astro-content", "Astro Content Collections", "Manage content in Astro with type-safe collections, MDX, and static generation.", ["frontend", "typescript"],
`# Astro Content Collections

## Define Collection
\`\`\`typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';
const blog = defineCollection({
    type: 'content',
    schema: z.object({ title: z.string(), date: z.date(), tags: z.array(z.string()).optional() }),
});
export const collections = { blog };
\`\`\`

## Content Files
\`\`\`markdown
---
title: My First Post
date: 2024-01-15
tags: [typescript, astro]
---
# Hello World
Content here...
\`\`\`

## Query
\`\`\`astro
---
import { getCollection } from 'astro:content';
const posts = await getCollection('blog');
const sorted = posts.sort((a, b) => b.data.date - a.data.date);
---
{sorted.map(post => <a href={\`/blog/\${post.slug}\`}>{post.data.title}</a>)}
\`\`\``),

  s("remix-loaders", "Remix Data Loading", "Server-side data loading with Remix loaders, actions, and progressive enhancement.", ["frontend", "typescript", "backend"],
`# Remix Data Loading

## Loader (GET)
\`\`\`typescript
export async function loader({ params, request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 1);
    const posts = await db.post.findMany({ skip: (page - 1) * 10, take: 10 });
    return json({ posts, page });
}
\`\`\`

## Action (POST/PUT/DELETE)
\`\`\`typescript
export async function action({ request }: ActionFunctionArgs) {
    const form = await request.formData();
    const intent = form.get('intent');
    if (intent === 'delete') {
        await db.post.delete({ where: { id: form.get('id') } });
    } else {
        await db.post.create({ data: { title: form.get('title') } });
    }
    return redirect('/posts');
}
\`\`\`

## Streaming & Deferred
\`\`\`typescript
export async function loader() {
    return defer({ fast: await getFast(), slow: getSlow() }); // slow loads async
}
\`\`\``),

  s("sveltekit-api", "SvelteKit API Routes", "Build server APIs and form handling in SvelteKit with load functions and actions.", ["frontend", "typescript", "backend"],
`# SvelteKit APIs

## API Routes
\`\`\`typescript
// src/routes/api/posts/+server.ts
export async function GET() {
    const posts = await db.post.findMany();
    return json(posts);
}
export async function POST({ request }) {
    const { title, body } = await request.json();
    const post = await db.post.create({ data: { title, body } });
    return json(post, { status: 201 });
}
\`\`\`

## Load Functions
\`\`\`typescript
// +page.server.ts
export async function load({ params }) {
    return { post: await db.post.findUnique({ where: { slug: params.slug } }) };
}
\`\`\`

## Form Actions
\`\`\`typescript
export const actions = {
    create: async ({ request }) => {
        const data = await request.formData();
        await db.post.create({ data: { title: data.get('title') } });
    },
    delete: async ({ request }) => {
        const data = await request.formData();
        await db.post.delete({ where: { id: data.get('id') } });
    },
};
\`\`\``),

  s("turborepo-config", "Turborepo Configuration", "Configure Turborepo workspace: package boundaries, shared configs, and remote caching.", ["typescript", "devops"],
`# Turborepo Config

## pnpm-workspace.yaml
\`\`\`yaml
packages:
  - "apps/*"
  - "packages/*"
\`\`\`

## Shared Package
\`\`\`json
// packages/ui/package.json
{ "name": "@repo/ui", "exports": { ".": "./src/index.ts" } }
\`\`\`

## Consuming Shared Package
\`\`\`json
// apps/web/package.json
{ "dependencies": { "@repo/ui": "workspace:*" } }
\`\`\`

## Filtering
\`\`\`bash
turbo build --filter=web           # Build only web
turbo build --filter=web...        # Web + its dependencies
turbo build --filter=...[HEAD~1]   # Changed since last commit
\`\`\`

## Remote Caching: turbo login && turbo link
## Or self-hosted: TURBO_REMOTE_CACHE_SIGNATURE_KEY + custom server`),

  s("pulumi-aws", "Pulumi AWS Infrastructure", "Deploy AWS resources with Pulumi TypeScript: Lambda, S3, DynamoDB, API Gateway.", ["devops", "typescript"],
`# Pulumi AWS

## Lambda + API Gateway
\`\`\`typescript
import * as aws from "@pulumi/aws";
import * as apigateway from "@pulumi/aws-apigateway";

const fn = new aws.lambda.Function("api", {
    runtime: "nodejs20.x", handler: "index.handler",
    code: new pulumi.asset.FileArchive("./dist"),
    role: lambdaRole.arn,
    environment: { variables: { TABLE_NAME: table.name } },
});

const api = new apigateway.RestAPI("api", {
    routes: [
        { path: "/users", method: "GET", eventHandler: fn },
        { path: "/users", method: "POST", eventHandler: fn },
    ],
});
export const apiUrl = api.url;
\`\`\`

## DynamoDB
\`\`\`typescript
const table = new aws.dynamodb.Table("users", {
    attributes: [{ name: "id", type: "S" }],
    hashKey: "id",
    billingMode: "PAY_PER_REQUEST",
});
\`\`\`

## S3 + CloudFront for static sites
## RDS, ECS, EKS for more complex workloads`),

  s("deno-fresh", "Deno Fresh Framework", "Build full-stack web apps with Fresh on Deno. Islands, routes, and zero runtime overhead.", ["typescript", "frontend", "backend"],
`# Deno Fresh

## Setup: deno run -A https://fresh.deno.dev my-app

## Routes
\`\`\`typescript
// routes/api/posts.ts
export const handler: Handlers = {
    async GET(_req, ctx) {
        const posts = await db.query("SELECT * FROM posts");
        return new Response(JSON.stringify(posts));
    },
};
\`\`\`

## Islands (interactive components)
\`\`\`tsx
// islands/Counter.tsx
import { useSignal } from "@preact/signals";
export default function Counter() {
    const count = useSignal(0);
    return <button onClick={() => count.value++}>{count}</button>;
}
\`\`\`

## Zero JS shipped by default, islands hydrate on demand
## Built on Deno Deploy for edge hosting`),

  s("bun-hono-api", "Bun + Hono API", "Build fast APIs with Bun runtime and Hono framework.", ["typescript", "backend"],
`# Bun + Hono

## Setup
\`\`\`bash
bun create hono my-api
cd my-api && bun install && bun run dev
\`\`\`

## API
\`\`\`typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const app = new Hono();
app.use('*', cors());

app.get('/api/users', async (c) => {
    const users = await db.query('SELECT * FROM users');
    return c.json(users);
});

app.post('/api/users', zValidator('json', z.object({ name: z.string(), email: z.string().email() })),
    async (c) => {
        const { name, email } = c.req.valid('json');
        await db.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
        return c.json({ ok: true }, 201);
    });

export default app;
\`\`\`

## Bun.serve is ~3x faster than Node.js HTTP`),

  s("dagger-github-actions", "Dagger with GitHub Actions", "Run Dagger CI/CD pipelines in GitHub Actions for portable, testable builds.", ["devops", "coding"],
`# Dagger + GitHub Actions

## .github/workflows/ci.yml
\`\`\`yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dagger/dagger-for-github@v6
        with:
          verb: run
          args: node pipeline.ts
\`\`\`

## Pipeline
\`\`\`typescript
import { connect } from "@dagger.io/dagger";
connect(async (client) => {
    const src = client.host().directory(".");
    const node = client.container().from("node:20")
        .withDirectory("/app", src).withWorkdir("/app")
        .withExec(["npm", "ci"]);

    await node.withExec(["npm", "test"]).sync();
    await node.withExec(["npm", "run", "build"]).sync();
});
\`\`\`

## Same pipeline runs locally (dagger run) and in CI
## Built-in caching, no vendor lock-in`),

  s("nix-devshells", "Nix Dev Shells with direnv", "Auto-activate reproducible dev environments with Nix flakes and direnv.", ["devops", "coding"],
`# Nix + direnv

## .envrc
\`\`\`bash
use flake
\`\`\`

## flake.nix
\`\`\`nix
{
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.\${system};
    in {
      devShells.default = pkgs.mkShell {
        packages = with pkgs; [ nodejs_20 pnpm python311 postgresql_16 redis ];
        env.DATABASE_URL = "postgresql://localhost/myapp";
      };
    });
}
\`\`\`

## cd into directory → environment auto-activates
## Everyone on team gets exact same tools
## direnv allow once, then automatic`),
];

// ==========================================
// MAIN IMPORT FUNCTION
// ==========================================
async function main() {
  const db = createDb();
  let totalSkillsImported = 0;
  let totalReposImported = 0;
  let errors: string[] = [];

  // Part 1: GitHub repos
  console.log(`🚀 Part 1: Importing ${REPOS_TO_IMPORT.length} repos...\n`);

  for (let i = 0; i < REPOS_TO_IMPORT.length; i++) {
    const { owner, repo } = REPOS_TO_IMPORT[i];
    console.log(`[${i + 1}/${REPOS_TO_IMPORT.length}] ${owner}/${repo}`);

    try {
      const repoData = await githubFetch(`https://api.github.com/repos/${owner}/${repo}`);
      const defaultBranch = repoData.default_branch || "main";
      const treeData = await githubFetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);

      const skillPaths: string[] = [];
      for (const item of treeData.tree || []) {
        if (item.type === "blob" && (item.path.endsWith("/SKILL.md") || item.path === "SKILL.md")) {
          skillPaths.push(item.path);
        }
      }

      if (skillPaths.length === 0) {
        console.log(`  ⚠️ No SKILL.md found`);
        errors.push(`${owner}/${repo}: no SKILL.md`);
        await sleep(500);
        continue;
      }

      console.log(`  📂 Found ${skillPaths.length} SKILL.md files`);

      // Upsert user
      let [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.githubId, String(repoData.owner.id))).limit(1);
      let userId: string;
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const [byUsername] = await db.select({ id: users.id }).from(users).where(eq(users.username, repoData.owner.login)).limit(1);
        if (byUsername) {
          userId = byUsername.id;
        } else {
          const [created] = await db.insert(users).values({
            githubId: String(repoData.owner.id), username: repoData.owner.login,
            displayName: repoData.owner.login, avatarUrl: repoData.owner.avatar_url, role: "human",
          }).returning({ id: users.id });
          userId = created.id;
        }
      }

      // Upsert repo
      let [existingRepo] = await db.select({ id: repos.id }).from(repos).where(and(eq(repos.githubOwner, owner), eq(repos.githubRepoName, repo))).limit(1);
      let repoId: string;
      if (existingRepo) {
        repoId = existingRepo.id;
        await db.update(repos).set({ starCount: repoData.stargazers_count, updatedAt: new Date() }).where(eq(repos.id, repoId));
      } else {
        const [created] = await db.insert(repos).values({
          ownerId: userId, name: repo, displayName: repo,
          description: repoData.description || `Skills from ${owner}/${repo}`,
          githubRepoUrl: repoData.html_url, githubOwner: owner, githubRepoName: repo,
          starCount: repoData.stargazers_count, downloadCount: 0, weeklyInstalls: 0,
        }).returning({ id: repos.id });
        repoId = created.id;
        totalReposImported++;
      }

      // Import skills
      let skillsInRepo = 0;
      for (let j = 0; j < skillPaths.length; j += 5) {
        const batch = skillPaths.slice(j, j + 5);
        const results = await Promise.allSettled(
          batch.map(async (path) => {
            const contentRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers: { ...headers, Accept: "application/vnd.github.raw" } });
            if (!contentRes.ok) return null;
            return { path, content: await contentRes.text() };
          })
        );

        for (const result of results) {
          if (result.status !== "fulfilled" || !result.value) continue;
          const { path, content } = result.value;
          const parts = path.split("/");
          const dirName = parts.length >= 3 ? parts[parts.length - 2] : parts.length === 2 ? parts[0] : repo;
          const { data: fm, content: body } = matter(content);
          const name = (fm.name as string) || dirName;
          const description = ((fm.description as string) || "").slice(0, 500);
          const slug = dirName.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "unnamed";
          const fmTags: string[] = Array.isArray(fm.tags) ? fm.tags.map(String) : [];

          const [existing] = await db.select({ id: skills.id }).from(skills).where(and(eq(skills.repoId, repoId), eq(skills.slug, slug))).limit(1);
          if (existing) {
            await db.update(skills).set({ name, description: description || undefined, readme: body.trim(), tags: fmTags.length > 0 ? fmTags : undefined, updatedAt: new Date() }).where(eq(skills.id, existing.id));
          } else {
            await db.insert(skills).values({
              ownerId: userId, repoId, slug, name,
              description: description || `${name} skill from ${owner}/${repo}`,
              readme: body.trim(), tags: fmTags, isPublished: true, importedAt: new Date(), source: "github_import",
            });
            totalSkillsImported++;
            skillsInRepo++;
          }
        }
        await sleep(300);
      }
      console.log(`  ✅ ${skillsInRepo} new skills`);
      await sleep(500);
    } catch (err: any) {
      console.log(`  ❌ ${err.message}`);
      errors.push(`${owner}/${repo}: ${err.message}`);
      await sleep(1000);
    }
  }

  // Part 2: Curated skills
  console.log(`\n🎯 Part 2: Importing ${CURATED_SKILLS.length} curated skills...\n`);

  const curatedOwner = "skillshub-team";
  const curatedRepoName = "catalog-batch5";

  let [curatedUser] = await db.select({ id: users.id }).from(users).where(eq(users.username, curatedOwner)).limit(1);
  let curatedUserId: string;
  if (curatedUser) {
    curatedUserId = curatedUser.id;
  } else {
    const [created] = await db.insert(users).values({ username: curatedOwner, displayName: "SkillsHub Curated", role: "human" }).returning({ id: users.id });
    curatedUserId = created.id;
  }

  let [curatedRepo] = await db.select({ id: repos.id }).from(repos).where(and(eq(repos.githubOwner, curatedOwner), eq(repos.githubRepoName, curatedRepoName))).limit(1);
  let curatedRepoId: string;
  if (curatedRepo) {
    curatedRepoId = curatedRepo.id;
  } else {
    const [created] = await db.insert(repos).values({
      ownerId: curatedUserId, name: curatedRepoName, displayName: "Catalog Gap-Fillers Batch 5",
      description: "Curated skills filling catalog gaps: Tauri, PWA, Mocha/Chai, Kafka, Apache, CMake, Airflow/Spark, SAML/OIDC, Vue, Svelte, Deno/Bun, Supabase, Prisma, tRPC, Astro, Remix, Turborepo, Stripe, SendGrid, OpenTelemetry, Pulumi, Ansible, AI agents, Cloudflare Workers, Dagger, Nix",
      githubOwner: curatedOwner, githubRepoName: curatedRepoName,
      starCount: 0, downloadCount: 0, weeklyInstalls: 0,
    }).returning({ id: repos.id });
    curatedRepoId = created.id;
    totalReposImported++;
  }

  for (const skill of CURATED_SKILLS) {
    const [existing] = await db.select({ id: skills.id }).from(skills).where(and(eq(skills.repoId, curatedRepoId), eq(skills.slug, skill.slug))).limit(1);
    if (existing) {
      await db.update(skills).set({ name: skill.name, description: skill.description, readme: skill.readme.trim(), tags: skill.tags, updatedAt: new Date() }).where(eq(skills.id, existing.id));
      console.log(`  ♻️  Updated: ${skill.name}`);
    } else {
      await db.insert(skills).values({
        ownerId: curatedUserId, repoId: curatedRepoId, slug: skill.slug, name: skill.name,
        description: skill.description, readme: skill.readme.trim(), tags: skill.tags,
        isPublished: true, importedAt: new Date(), source: "github_import",
      });
      totalSkillsImported++;
      console.log(`  ✅ Created: ${skill.name}`);
    }
  }

  // Final count
  const [sc] = await db.select({ count: sql`count(*)` }).from(skills);
  const [rc] = await db.select({ count: sql`count(*)` }).from(repos);

  console.log(`\n${"=".repeat(50)}`);
  console.log(`🎉 Batch 5 import complete!`);
  console.log(`   New repos: ${totalReposImported}`);
  console.log(`   New skills: ${totalSkillsImported}`);
  console.log(`   Total skills in DB: ${sc.count}`);
  console.log(`   Total repos in DB: ${rc.count}`);
  if (errors.length > 0) {
    console.log(`   Errors (${errors.length}):`);
    errors.forEach((e) => console.log(`     - ${e}`));
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
