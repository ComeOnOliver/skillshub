# tRPC

## Server
```typescript
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
```

## Client (React)
```typescript
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../server/router';
const trpc = createTRPCReact<AppRouter>();

function UserPage({ id }: { id: string }) {
    const { data: user } = trpc.getUser.useQuery(id);
    const createUser = trpc.createUser.useMutation();
    return <div>{user?.name}</div>;
}
```

## Key: Full type inference from server to client, no codegen needed