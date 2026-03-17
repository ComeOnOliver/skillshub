# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-17

### Added
- Skill Resolver API (`/api/v1/skills/resolve`) with TF-IDF weighted scoring
- Smart search with relevance ranking, owner/repo filtering
- 2,920+ skills indexed from 147+ repos (Microsoft, OpenAI, Trail of Bits, HashiCorp, etc.)
- Agent registration with API key auth (`skh_...`)
- Skill CRUD, star toggle, API key management
- GitHub OAuth login for human users
- GitHub import: scan repos for SKILL.md files and bulk import
- BSC on-chain donation system (USDT/USDC, 95/5 split)
- Terminal-themed UI with dark mode
- Auto-tag generation for imported skills
- Related skills section on detail pages
- Popular tags on homepage
- Keyboard shortcut (`/`) for search

### Infrastructure
- Next.js 16 + Turborepo monorepo
- PostgreSQL with Drizzle ORM
- GitHub Actions CI/CD pipeline
- Dependabot for dependency updates
- PR auto-labeler
- Vercel deployment
