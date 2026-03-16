# SkillsHub — Optimized Implementation Plan

## Context

The original plan.md describes a 10-day build for an AI agent skills marketplace. This optimized plan restructures the phases to deliver a working vertical slice by day 2 (instead of day 7), cuts non-essential MVP complexity, and identifies parallelization opportunities.

---

## Key Simplifications vs Original Plan

| Original | Optimized | Why |
|---|---|---|
| 4 auth methods at launch | 2: GitHub OAuth + API keys | Magic links add email infra; agent self-register is just a POST returning an API key |
| JWT sessions | iron-session (encrypted cookies) | No token refresh, no XSS via localStorage |
| BSC + SUI wallets | BSC only | One chain to get right; SUI added post-launch |
| skill_versions table | Deferred; single manifest JSONB in skills | YAGNI until there's demand |
| magic_links table | Deferred | No email auth at launch |
| Full deposit monitoring | Stub: BSCScan API polling every 60s | No custom node needed |
| Next.js calls Hono API | Next.js imports packages/db directly | No network hop, no CORS; Hono API is for agents only |

**Result:** 6 tables instead of 8, 2 auth flows instead of 4, 1 chain instead of 2.

---

## Monorepo Structure

```
skillshub/
  turbo.json
  pnpm-workspace.yaml
  package.json
  .env.example

  packages/
    db/                          # Drizzle schema, migrations, client
      src/
        schema.ts               # All 6 table definitions
        migrate.ts
        client.ts
        seed.ts
      drizzle/
      drizzle.config.ts

    shared/                      # Shared types + validators
      src/
        types.ts
        validators.ts            # Zod schemas (API + frontend contract)
        constants.ts

  apps/
    api/                         # Hono server (agent-facing)
      src/
        index.ts
        middleware/
          auth.ts                # API key auth
          error.ts
          rate-limit.ts
        routes/
          skills.ts
          auth.ts
          agents.ts
          donations.ts
          withdrawals.ts
          api-keys.ts
        services/
          crypto.ts              # BSC wallet gen + encryption
          github.ts
          skills.ts
        lib/
          session.ts

    web/                         # Next.js (human-facing)
      src/app/
        layout.tsx
        page.tsx                 # Landing
        (auth)/login/page.tsx
        (auth)/callback/page.tsx
        skills/page.tsx          # Browse + search
        skills/[id]/page.tsx     # Detail
        skills/publish/page.tsx
        dashboard/page.tsx
        dashboard/api-keys/page.tsx
        dashboard/skills/page.tsx
        dashboard/earnings/page.tsx
        agents/[id]/page.tsx
      src/components/
        ui/                      # shadcn
        skill-card.tsx
        search-bar.tsx
        star-button.tsx
        nav.tsx
```

**Architecture decision:** Next.js server components import `packages/db` directly for reads. Hono API exists purely for agents/external consumers. This avoids maintaining two auth systems.

---

## Database Schema (6 tables)

**users:** `id`, `github_id`, `email`, `username`, `display_name`, `avatar_url`, `role` (human|agent), `bio`, `bsc_address`, `bsc_private_key_enc`, `balance_usdc`, `trust_score`, `is_verified`, `created_at`, `updated_at`

**skills:** `id`, `owner_id` (FK), `slug`, `name`, `description`, `readme`, `manifest` (jsonb), `tags` (text[]), `star_count`, `download_count`, `is_published`, `created_at`, `updated_at`

**stars:** `id`, `user_id` (FK), `skill_id` (FK), `created_at` — UNIQUE(user_id, skill_id)

**donations:** `id`, `from_user_id` (FK), `to_user_id` (FK), `skill_id` (FK), `chain`, `tx_hash`, `amount`, `token`, `status` (pending|confirmed|failed), `created_at`

**api_keys:** `id`, `user_id` (FK), `name`, `key_hash` (unique), `key_prefix`, `last_used_at`, `revoked_at`, `created_at`

**withdrawals:** `id`, `user_id` (FK), `chain`, `to_address`, `amount`, `token`, `tx_hash`, `status` (pending|processing|completed|failed), `created_at`

**Critical indexes:** GIN on `skills.name`/`skills.description` (pg_trgm), GIN on `skills.tags`, composite on (`star_count` DESC, `created_at` DESC), unique on `api_keys.key_hash`, unique on `users.github_id`.

---

## Phased Build

### Phase 0 — Scaffold (Day 1 morning, ~3h)

**Deliverables:**
- Monorepo init: pnpm workspace + turbo.json
- `packages/db`: Drizzle schema for 6 tables, migration runner
- `apps/api`: Hono boots, `GET /health` returns 200
- `apps/web`: Next.js + Tailwind + shadcn initialized
- Neon DB provisioned, first migration applied
- `.env.example` documented

**Verify:** `pnpm dev` starts both apps; `curl localhost:3001/health` = 200; `localhost:3000` renders.

---

### Phase 1 — Vertical Slice: Skills + Search (Day 1 afternoon + Day 2, ~12h)

**Backend:**
- `GET /api/v1/skills/search?q=&tags=&sort=&page=` (pg_trgm)
- `GET /api/v1/skills/:id`
- `GET /api/v1/skills/trending` (star_count desc, last 30 days)
- `POST /api/v1/skills` (temporarily open for seeding)
- Seed script: 20-30 realistic skills

**Frontend:**
- Browse page (`/skills`) with search bar, tag filters, pagination
- Detail page (`/skills/[id]`) with markdown readme, stars, tags, author
- Skill card + search bar components
- Nav bar with logo + search + login placeholder

**Verify:** Visit `/skills`, search works, click through to detail page. API < 100ms.

---

### Phase 2 — Auth + Publish (Days 3-4, ~12h)

**Backend:**
- GitHub OAuth flow (use arctic library)
- iron-session middleware for web sessions
- API key gen: `POST /api/v1/auth/api-keys` (returns `skh_...` once, stores SHA-256 hash)
- API key auth middleware: `Authorization: Bearer skh_...`
- Agent self-register: `POST /api/v1/agents/register` returns API key
- Lock `POST /api/v1/skills` behind auth
- `PUT /api/v1/skills/:id`, `DELETE /api/v1/skills/:id` (owner only)
- `POST`/`DELETE /api/v1/skills/:id/star` + denormalized count update

**Frontend:**
- Login page + OAuth callback
- Session-aware nav (avatar when logged in)
- Publish form (`/skills/publish`)
- Star button (optimistic update)
- Dashboard landing page

**Verify:** Full OAuth flow works; publish a skill; star/unstar; API key auth via curl; agent registration via curl.

---

### Phase 3 — Crypto + Donations (Days 5-6, ~10h)

**Backend:**
- BSC wallet generation on user/agent creation (`ethers.Wallet.createRandom()`)
- AES-256-GCM encryption for private keys (Node crypto)
- `POST /api/v1/skills/:id/donate` returns owner's BSC address + pending donation record
- `GET /api/v1/agents/me/balance`
- `POST /api/v1/agents/me/withdraw` (creates request, initially manual processing)
- Background polling: BSCScan API check for incoming USDC/USDT, confirm donations, credit balances

**Frontend:**
- Donate button on skill detail (shows BSC address + QR code)
- Dashboard earnings page (balance, donation history)
- Dashboard withdrawal form
- Dashboard API keys page (list, create, revoke)

**Verify:** New user gets BSC address; donate flow shows valid address; manually confirmed donation updates balance.

---

### Phase 4 — Agent Experience + Hardening (Days 7-8, ~10h)

**Backend:**
- Rate limiting (in-memory sliding window per API key)
- Trust score: `stars_received + (donations * 2) + (skills * 5) + (age_days * 0.1)`
- Agent public profiles: `GET /api/v1/agents/:id`
- Registration rate limits (10/IP/hour)
- Input validation hardened (Zod on all endpoints)
- Consistent error format: `{ error: { code, message } }`

**Frontend:**
- Agent profile page (`/agents/[id]`)
- Trending/leaderboard page
- Loading, error, empty states on all pages
- Mobile responsive polish

**Verify:** Rate limiting returns 429; agent profile renders; all errors consistent format.

---

### Phase 5 — Polish + Launch (Days 9-10, ~8h)

**Deliverables:**
- Landing page (hero, value prop, features)
- OpenAPI spec (via `@hono/zod-openapi`)
- API docs page (Scalar or Swagger UI)
- README + setup instructions
- Seed 50+ skills for production
- Deploy: API to Railway, Web to Vercel, DB on Neon
- Smoke test the 10 critical paths on production

**Verify:** Production URLs load; OAuth works; search returns results; publish flow end-to-end.

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| Private key security | AES-256-GCM encryption at rest; env var for key; never log; upgrade to KMS before real funds |
| Scope creep | Strictly enforce MVP cuts above; everything else is post-launch |
| Session across API + Web domains | Next.js manages its own sessions; Hono uses API keys only; no cross-domain auth needed |
| pg_trgm at scale | Fine for thousands; plan Meilisearch migration at 100k+ skills |
| BSC deposit reliability | BSCScan API polling; accept 1-2 min delay; no custom node |

---

## Day-by-Day Calendar

| Day | Focus | End-of-Day State |
|---|---|---|
| 1 | Scaffold + schema + skills API + browse page | Monorepo boots, DB has tables, first pages render |
| 2 | Search + detail page + seed data | User can search and view skills in browser |
| 3 | GitHub OAuth + sessions + API keys | User can log in, see dashboard |
| 4 | Publish form + star/unstar + agent register | Full CRUD working; agents can register |
| 5 | BSC wallets + donation endpoint | Wallets generated, donation address shown |
| 6 | Balance + withdrawal + dashboard earnings | Dashboard shows balance and earnings |
| 7 | Rate limiting + trust score + agent profiles | Abuse prevention, agent profiles visible |
| 8 | UI polish: states + responsive + leaderboard | All pages polished, mobile works |
| 9 | Landing page + API docs + deploy | Production live, docs available |
| 10 | Smoke tests + seed data + launch | Live and usable |
