# Hono on Workers

```typescript
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
```

## Middleware, route groups, validation with zod, WebSocket support
