# Multiline Flow Fixture

## Required Secrets

- `MODRINTH_TOKEN`

```yaml
name: Matrix Build
on:
  push:
    branches: ["main"]
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include: [
          { platform: fabric, dir: fabric },
          { platform: neoforge, dir: neoforge }
        ]
    steps:
      - uses: actions/checkout@v4
      - env:
          MODRINTH_TOKEN: ${{ secrets.MODRINTH_TOKEN }}
        run: ./gradlew :${{ matrix.dir }}:build --no-daemon
```