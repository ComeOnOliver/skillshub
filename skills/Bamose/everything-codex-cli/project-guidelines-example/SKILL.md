---
name: project-guidelines-example
description: Example project-specific skill for the Ongize monorepo (Next.js + Cloudflare Workers + Drizzle).
---

# Project Guidelines Skill (Ongize Example)

This is an example of a project-specific skill. Use this as a template for your own projects.

Based on the local Ongize monorepo.

---

## When to Use

Reference this skill when working on the Ongize repo. Project skills contain:
- Architecture overview
- File structure
- Code patterns
- Testing and quality workflow
- Deployment workflow

---

## Architecture Overview

**Tech Stack:**
- **Monorepo**: Turborepo + pnpm workspaces
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Mantine, Tailwind 4
- **Backend**: Cloudflare Workers (Hono + Zod OpenAPI)
- **Database**: Neon Postgres with Drizzle ORM (Kysely for complex SQL)
- **Auth**: better-auth
- **Background Jobs**: Trigger.dev
- **Tooling**: Biome, TypeScript, Lefthook, Commitlint
- **Deployment**: OpenNext on Cloudflare (web/app) + Wrangler for API

**Services:**
```
┌────────────────────────────┐    ┌────────────────────────────┐
│      Frontend (website)    │    │        Frontend (app)      │
│  Next.js + React + Mantine │    │  Next.js + React + Mantine │
└───────────────┬────────────┘    └───────────────┬────────────┘
                │                                 │
                └───────────────┬────────────────┘
                                ▼
┌─────────────────────────────────────────────────┐
│               API (Cloudflare)                  │
│         Hono + Zod OpenAPI + TypeScript         │
└───────────────────────┬─────────────────────────┘
                        ▼
              ┌──────────────────┐
              │ Postgres (Neon)  │
              │ Drizzle + Kysely │
              └──────────────────┘

Other services: S3 (files), Resend (email), Twilio (SMS), Trigger.dev (jobs)
```

---

## File Structure

```
ongize/
├── apps/
│   ├── website/            # Marketing site (Next.js)
│   ├── app/                # Main product (Next.js)
│   └── api/                # Cloudflare Workers API (Hono)
├── packages/
│   └── shared/             # Shared types, utilities, styles
├── scripts/                # Tooling scripts (type generation, etc.)
├── docs/                   # Documentation
├── turbo.json              # Turbo pipelines
├── pnpm-workspace.yaml     # Workspaces
└── biome.json              # Lint/format rules
```

---

## Code Patterns

### API Response Format (Hono)

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

app.get('/health', (c) => {
  const response: ApiResponse<{ status: string }> = {
    success: true,
    data: { status: 'ok' },
  }
  return c.json(response)
})
```

### Database Access (Drizzle)

```typescript
import { db } from '@/db'
import { users } from '@/db/schema'

// Typed query from schema
const rows = await db.select().from(users)
```

### Frontend API Calls (TypeScript)

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    return await response.json()
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
```

### Shared Types

Use `packages/shared` for cross-app types, utilities, and shared styles.

---

## Testing and Quality

**Quality checks:**
```bash
pnpm lint
pnpm check-types
```

**Type generation:**
```bash
pnpm generate:types
```

**E2E tests (when configured):**
```bash
# Add Playwright config under apps/app when needed
pnpm --filter @ongize/app exec playwright test
```

---

## Deployment Workflow

```bash
# Website (Next.js on Cloudflare)
pnpm --filter @ongize/website deploy

# App (Next.js on Cloudflare)
pnpm --filter @ongize/app deploy

# API (Cloudflare Workers)
pnpm --filter @ongize/api deploy
```

---

## Environment Variables

- Per-app `.env` files live under `apps/app` and `apps/api`.
- Cloudflare bindings live in `apps/*/wrangler.jsonc`.
- Do not commit secrets; use Cloudflare secrets or CI env vars.

---

## Critical Rules

1. Immutability over mutation
2. TDD for new features and fixes
3. 80%+ coverage target
4. Many small files (200-400 lines typical)
5. No console.log in production code
6. Proper error handling with try/catch
7. Input validation with Zod

---

## Related Skills

- `coding-standards/` - General coding best practices
- `backend-patterns/` - API and database patterns
- `frontend-patterns/` - React and Next.js patterns
- `tdd-workflow/` - Test-driven development methodology

