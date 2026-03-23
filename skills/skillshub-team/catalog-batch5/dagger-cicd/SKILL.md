# Dagger CI/CD

## Setup
```bash
curl -L https://dl.dagger.io/dagger/install.sh | sh
npm install @dagger.io/dagger
```

## Pipeline (TypeScript)
```typescript
import { connect } from "@dagger.io/dagger";

connect(async (client) => {
    const src = client.host().directory(".", { exclude: ["node_modules", ".git"] });

    // Build
    const build = client.container()
        .from("node:20-alpine")
        .withDirectory("/app", src)
        .withWorkdir("/app")
        .withExec(["npm", "ci"])
        .withExec(["npm", "run", "build"]);

    // Test
    await build.withExec(["npm", "test"]).sync();

    // Publish
    const image = build.withEntrypoint(["node", "dist/index.js"]);
    await image.publish("ghcr.io/myorg/myapp:latest");
});
```

## Run: dagger run node pipeline.ts
## Works the same locally and in CI (GitHub Actions, GitLab, etc.)
## Caching built-in, reproducible builds
