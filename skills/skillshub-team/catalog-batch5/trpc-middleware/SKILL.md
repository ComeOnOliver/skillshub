# tRPC Middleware

## Auth Middleware
```typescript
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
```

## Rate Limiting
```typescript
const rateLimited = t.middleware(async ({ ctx, next }) => {
    const key = ctx.ip;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 60);
    if (count > 100) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
    return next();
});
```

## Error Handling, logging, input validation with Zod