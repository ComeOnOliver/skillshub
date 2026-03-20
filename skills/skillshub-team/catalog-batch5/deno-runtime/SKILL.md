# Deno

## Run
```bash
deno run --allow-net --allow-read server.ts
deno run --watch server.ts  # dev mode
```

## HTTP Server
```typescript
Deno.serve({ port: 8000 }, (req) => {
    const url = new URL(req.url);
    if (url.pathname === "/api/hello") return Response.json({ msg: "hello" });
    return new Response("Not Found", { status: 404 });
});
```

## Permissions: --allow-net, --allow-read, --allow-write, --allow-env
## Imports: import from "https://deno.land/std@0.220.0/..."
## deno.json for import maps, tasks, lint/fmt config
## Fresh framework for full-stack Deno web apps