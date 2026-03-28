# CI Release Fixture

## Required Secrets

- `MODRINTH_TOKEN`

```yaml
name: Broken Build
on:
  push:
    branches: ["main"]
steps:
  - run: echo path/to/workflows
  - env:
      CURSEFORGE_TOKEN: ${{ secrets.CURSEFORGE_TOKEN }}
    run: echo release
```
