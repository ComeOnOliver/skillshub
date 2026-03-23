# Prisma Advanced

## Transactions
```typescript
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
```

## Raw SQL
```typescript
const result = await prisma.$queryRaw`SELECT * FROM users WHERE age > ${minAge}`;
```

## Middleware
```typescript
prisma.$use(async (params, next) => {
    if (params.action === 'delete') { params.action = 'update'; params.args.data = { deleted: true }; }
    return next(params);
});
```

## Performance: select only needed fields, use cursor-based pagination, connection pooling
