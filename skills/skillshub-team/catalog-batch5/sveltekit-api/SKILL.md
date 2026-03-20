# SvelteKit APIs

## API Routes
```typescript
// src/routes/api/posts/+server.ts
export async function GET() {
    const posts = await db.post.findMany();
    return json(posts);
}
export async function POST({ request }) {
    const { title, body } = await request.json();
    const post = await db.post.create({ data: { title, body } });
    return json(post, { status: 201 });
}
```

## Load Functions
```typescript
// +page.server.ts
export async function load({ params }) {
    return { post: await db.post.findUnique({ where: { slug: params.slug } }) };
}
```

## Form Actions
```typescript
export const actions = {
    create: async ({ request }) => {
        const data = await request.formData();
        await db.post.create({ data: { title: data.get('title') } });
    },
    delete: async ({ request }) => {
        const data = await request.formData();
        await db.post.delete({ where: { id: data.get('id') } });
    },
};
```