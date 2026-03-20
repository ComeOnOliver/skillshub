# Warning Fixture

## Secrets

- `MODRINTH_TOKEN`

```yaml
name: Warn Only
on:
  workflow_dispatch:
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - run: echo "ok"
```