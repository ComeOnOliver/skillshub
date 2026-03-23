# Turborepo Config

## pnpm-workspace.yaml
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

## Shared Package
```json
// packages/ui/package.json
{ "name": "@repo/ui", "exports": { ".": "./src/index.ts" } }
```

## Consuming Shared Package
```json
// apps/web/package.json
{ "dependencies": { "@repo/ui": "workspace:*" } }
```

## Filtering
```bash
turbo build --filter=web           # Build only web
turbo build --filter=web...        # Web + its dependencies
turbo build --filter=...[HEAD~1]   # Changed since last commit
```

## Remote Caching: turbo login && turbo link
## Or self-hosted: TURBO_REMOTE_CACHE_SIGNATURE_KEY + custom server
