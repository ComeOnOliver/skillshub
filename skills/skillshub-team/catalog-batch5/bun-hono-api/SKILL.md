# Bun + Hono

## Setup
```bash
bun create hono my-api
cd my-api && bun install && bun run dev
```

## API
```typescript
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
```

## Bun.serve is ~3x faster than Node.js HTTP