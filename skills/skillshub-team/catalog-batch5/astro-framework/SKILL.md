# Astro

## Setup: npm create astro@latest

## Pages (.astro files)
```astro
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
```

## Islands (interactive components)
```astro
---
import Counter from '../components/Counter.tsx';
---
<Counter client:load />      <!-- Hydrate on load -->
<Counter client:visible />   <!-- Hydrate when visible -->
<Counter client:idle />      <!-- Hydrate on idle -->
```

## Content Collections
```typescript
// src/content/config.ts
const blog = defineCollection({ schema: z.object({ title: z.string(), date: z.date() }) });
```

## Supports React, Vue, Svelte, Solid components in same project
## Static by default, opt-in SSR with adapters (Node, Vercel, Cloudflare)