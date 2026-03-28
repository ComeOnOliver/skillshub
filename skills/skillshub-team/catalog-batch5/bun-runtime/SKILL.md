# Bun

## Run & Dev
```bash
bun run index.ts
bun --watch index.ts
```

## HTTP Server (fastest in JS ecosystem)
```typescript
Bun.serve({
    port: 3000,
    fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/api") return Response.json({ ok: true });
        return new Response("Hello!");
    },
});
```

## Package Manager: bun install (25x faster than npm)
## Bundler: bun build ./index.ts --outdir ./dist
## Test Runner: bun test
```typescript
import { test, expect } from "bun:test";
test("math", () => { expect(2 + 2).toBe(4); });
```

## SQLite built-in: import { Database } from "bun:sqlite";
