# Dagger + GitHub Actions

## .github/workflows/ci.yml
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dagger/dagger-for-github@v6
        with:
          verb: run
          args: node pipeline.ts
```

## Pipeline
```typescript
import { connect } from "@dagger.io/dagger";
connect(async (client) => {
    const src = client.host().directory(".");
    const node = client.container().from("node:20")
        .withDirectory("/app", src).withWorkdir("/app")
        .withExec(["npm", "ci"]);

    await node.withExec(["npm", "test"]).sync();
    await node.withExec(["npm", "run", "build"]).sync();
});
```

## Same pipeline runs locally (dagger run) and in CI
## Built-in caching, no vendor lock-in
