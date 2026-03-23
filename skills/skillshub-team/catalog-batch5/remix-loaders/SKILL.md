# Remix Data Loading

## Loader (GET)
```typescript
export async function loader({ params, request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 1);
    const posts = await db.post.findMany({ skip: (page - 1) * 10, take: 10 });
    return json({ posts, page });
}
```

## Action (POST/PUT/DELETE)
```typescript
export async function action({ request }: ActionFunctionArgs) {
    const form = await request.formData();
    const intent = form.get('intent');
    if (intent === 'delete') {
        await db.post.delete({ where: { id: form.get('id') } });
    } else {
        await db.post.create({ data: { title: form.get('title') } });
    }
    return redirect('/posts');
}
```

## Streaming & Deferred
```typescript
export async function loader() {
    return defer({ fast: await getFast(), slow: getSlow() }); // slow loads async
}
```
