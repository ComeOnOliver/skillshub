# Nuxt 3

## Setup: npx nuxi@latest init my-app

## File-Based Routing
pages/index.vue → /
pages/blog/[slug].vue → /blog/:slug

## Data Fetching
```vue
<script setup>
const { data } = await useFetch('/api/posts');
const { data: user } = await useAsyncData('user', () => $fetch('/api/me'));
</script>
```

## Server Routes
```typescript
// server/api/posts.get.ts
export default defineEventHandler(async () => {
    return await db.query.posts.findMany();
});
```

## Config
```typescript
export default defineNuxtConfig({
    modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
    routeRules: { '/': { prerender: true }, '/api/**': { cors: true } },
});
```
