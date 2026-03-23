# Prisma ORM

## Setup
```bash
npm install prisma @prisma/client
npx prisma init
```

## Schema (prisma/schema.prisma)
```prisma
datasource db { provider = "postgresql" url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
}
```

## Migrations
```bash
npx prisma migrate dev --name init
npx prisma generate  # Regenerate client
```

## Queries
```typescript
const users = await prisma.user.findMany({ include: { posts: true } });
const user = await prisma.user.create({ data: { email: 'a@b.com', name: 'Alice' } });
await prisma.post.update({ where: { id: 1 }, data: { published: true } });
await prisma.user.delete({ where: { id: 1 } });
```

## Advanced: transactions, raw SQL, middleware, soft deletes
