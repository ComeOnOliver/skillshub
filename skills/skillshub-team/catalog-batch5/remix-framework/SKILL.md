# Remix

## Routes with Data Loading
```typescript
// app/routes/posts.$slug.tsx
export async function loader({ params }: LoaderFunctionArgs) {
    const post = await db.post.findUnique({ where: { slug: params.slug } });
    if (!post) throw new Response("Not Found", { status: 404 });
    return json(post);
}

export default function PostPage() {
    const post = useLoaderData<typeof loader>();
    return <article><h1>{post.title}</h1><div>{post.body}</div></article>;
}
```

## Form Actions
```typescript
export async function action({ request }: ActionFunctionArgs) {
    const form = await request.formData();
    await db.comment.create({ data: { body: form.get('body') as string } });
    return redirect('/posts');
}

export default function NewComment() {
    return <Form method="post"><textarea name="body" /><button type="submit">Post</button></Form>;
}
```

## Error Boundaries, nested layouts, streaming, deferred data loading
