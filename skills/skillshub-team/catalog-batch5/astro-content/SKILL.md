# Astro Content Collections

## Define Collection
```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';
const blog = defineCollection({
    type: 'content',
    schema: z.object({ title: z.string(), date: z.date(), tags: z.array(z.string()).optional() }),
});
export const collections = { blog };
```

## Content Files
```markdown
---
title: My First Post
date: 2024-01-15
tags: [typescript, astro]
---
# Hello World
Content here...
```

## Query
```astro
---
import { getCollection } from 'astro:content';
const posts = await getCollection('blog');
const sorted = posts.sort((a, b) => b.data.date - a.data.date);
---
{sorted.map(post => <a href={`/blog/${post.slug}`}>{post.data.title}</a>)}
```
