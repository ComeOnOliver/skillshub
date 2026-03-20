# Deno Fresh

## Setup: deno run -A https://fresh.deno.dev my-app

## Routes
```typescript
// routes/api/posts.ts
export const handler: Handlers = {
    async GET(_req, ctx) {
        const posts = await db.query("SELECT * FROM posts");
        return new Response(JSON.stringify(posts));
    },
};
```

## Islands (interactive components)
```tsx
// islands/Counter.tsx
import { useSignal } from "@preact/signals";
export default function Counter() {
    const count = useSignal(0);
    return <button onClick={() => count.value++}>{count}</button>;
}
```

## Zero JS shipped by default, islands hydrate on demand
## Built on Deno Deploy for edge hosting