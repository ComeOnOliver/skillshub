## [0.2.1] - 2026-04-03

### Data Import — Batch 8
- **4 new repos imported:**
  - `secondsky/claude-skills` — 212 skills (production-tested Claude Code skills)
  - `Harmeet10000/skills` — 151 skills
  - `happycapy-ai/Happycapy-skills` — 43 skills
  - `aiskillstore/marketplace` — 4,392 skills (455 unique owners)
- **Total: 4,798 new skills** from 4 new repos
- **New totals: ~15,000+ published skills from 245+ repos**

### Fixes
- Fix ESM compatibility in seed script (`__dirname` → `import.meta.url`)
- Fix seed script crash on non-directory entries in skills folder
- Fix missing `name` field when creating repos in seed script
- Add `skills/majiayu000/` to `.gitignore` (223K skills — too large for git, DB-only import planned)

## [0.2.0] - 2026-03-19

### Resolve Algorithm v2
- Replace TF-IDF with multi-field BM25 scoring (name ×5.0, description ×3.0, tags ×3.5)
- Compound term detection auto-generated from 5,300+ skill slugs + 60 curated phrases
- Anchor token detection — technology-specific terms weighted higher
- Vendor prefix penalty — 16 vendor prefixes penalized when not in query
- Composite rejection gate — returns matched:0 with noMatchReason instead of garbage
- Sigmoid confidence calibration — wrong results now show low confidence
- All v1 keyword pollution failures fixed (hook, feature, proxy, mcp)

### Performance
- In-memory skill cache with 5-minute TTL (700ms → ~300ms on cache hit)
- Pre-computed BM25 corpus stats (avgFieldLengths, documentFrequencies)
- Vercel edge cache (s-maxage=60, stale-while-revalidate=300)
- Server-Timing header for observability

### Rate Limiting
- Upstash Redis with sliding window algorithm
- Read endpoints: 60 req/min per IP
- Write endpoints: 20 req/min per IP
- Agent registration: 5 req/hour per IP
- X-RateLimit-Limit/Remaining/Reset + Retry-After headers
- Body size limit: 100KB max (413 Payload Too Large)
- Fail-open: Upstash outage doesn't crash the API

### Authentication
- Auth.js v5 migration (from arctic + iron-session)
- Google OAuth provider (new)
- Email magic link via Resend (new)
- Custom dark-themed verification page and branded email template

### Data
- Batch 7 import: 881 new skills from ComposioHQ, K-Dense-AI, App Store Connect, Eigent
- Total: 5,355 published skills from 227 repos

### Community & Infrastructure
- CONTRIBUTING.md, 3 issue templates (bug/feature/skill-import)
- 10 agent-friendly issues (#21-#30)
- GitHub Discussions enabled
- 3 awesome-list PRs submitted
- Auto-release on every push to main
- Dynamic version from package.json

# Changelog

All notable changes to this project will be documented in this file.

## [0.1.1] - 2026-03-19

### Security
- Add all 7 security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Disable X-Powered-By header
- Restrict CORS to app domain for write endpoints
- Escape JSON-LD output to prevent XSS via script tag injection
- Return JSON 404 for non-v1 API paths (prevent info leakage)

### Features
- Add JSON-LD structured data (WebSite, Organization, SoftwareSourceCode, CollectionPage)
- Add dynamic OpenGraph and Twitter Card meta tags per skill page
- Add SEO basics: robots.txt, dynamic sitemap (4,800+ URLs), metadataBase
- Add custom 404 page with dark terminal theme
- Add `/browse` → `/skills` redirect
- Add `/search` → `/skills` redirect with query param preservation
- Add aria-labels for accessibility (search input, copy button, login link)
- Add trending endpoint `period` parameter (day/week/month/all) — PR #20 by @anmolxlight

### Resolve Algorithm
- Add +35 exact skill name/slug match boost (up from +0)
- Add vendor prefix penalty (-15 for azure-/electric-/react- when vendor not in query)
- Add MCP skill filter (-30 when "mcp" not in query)
- Normalize confidence scores to 0-1 using max possible score
- Update homepage demo confidence to match recalibrated values

### Data Quality
- Remove 287 junk skills (templates, duplicates, test entries)
- Deduplicate skills by slug, keeping highest-star repo copy (34 inferior copies removed)
- Tighten auto-tagger: word-boundary matching, remove false-positive keywords
- Correct 6 wrong tags, add tags to 15 untagged trending skills
- Add skill deduplication check on creation (409 CONFLICT)

### Bug Fixes
- Return proper JSON body on 405 Method Not Allowed (all methods including PATCH)
- Return JSON error body on 404 for raw-skill fetch endpoint
- Return 400 validation error for empty/short search queries (preserve browse mode)
- Update API docs description to match actual counts (4,800+ skills from 200+ repos)
- Fix build: make all DB-dependent pages force-dynamic for CI compatibility
- Fix build: lazy session secret initialization (no throw at build time)
- Fix build: dynamic sitemap rendering (no DB query at build time)
- Pass SESSION_SECRET to CI build step

### Code Quality
- Resolve all 58 lint warnings and typecheck errors (0 remaining)
- Remove unused imports across 29 files
- Replace `<img>` with Next.js `<Image />` component
- Fix setState-in-effect anti-patterns

### Data Imports
- Batch 4-6 imports: 1,000+ new skills from curated repos
- Add 23 everyday skills for non-developers
- Chinese README (README.zh-CN.md)

## [0.1.0] - 2026-03-17

### Initial Release
- Skill registry with 5,000+ indexed skills from 200+ repos
- Resolve API: natural language task → best-matching skill
- Search, browse, trending endpoints
- GitHub OAuth authentication
- Skill publishing and management
- Trust system with feedback endpoints
- CI/CD pipeline (lint, typecheck, build, security audit)
