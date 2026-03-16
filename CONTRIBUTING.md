# Contributing to SkillsHub

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. **Fork & clone** the repository
2. **Install dependencies:** `pnpm install`
3. **Set up environment:** `cp .env.example .env` and fill in values
4. **Push schema:** `npx drizzle-kit push`
5. **Seed data:** `npx tsx packages/db/src/clear-and-seed.ts`
6. **Start dev server:** `pnpm dev`

## Project Structure

- `apps/web/` — Next.js frontend
- `apps/api/` — Hono API server
- `packages/db/` — Database schema & seeder
- `packages/shared/` — Shared types & validators

## Code Style

- **TypeScript** — strict mode, no `any` types
- **Formatting** — use your editor's default (Prettier-compatible)
- **Imports** — use path aliases (`@/lib/...`, `@skillshub/db/...`)
- **Components** — Server Components by default, `"use client"` only when needed

## Making Changes

### Bug Fixes

1. Check [existing issues](https://github.com/ComeOnOliver/skillshub/issues) first
2. Create an issue if one doesn't exist
3. Fork, fix, and submit a PR referencing the issue

### New Features

1. Open a [feature request](https://github.com/ComeOnOliver/skillshub/issues/new?template=feature_request.md) first
2. Discuss the approach before writing code
3. Implement and submit a PR

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear, descriptive commits
3. Ensure `pnpm build` passes (run from root)
4. Update documentation if needed
5. Submit a PR with a clear description of changes

## Reporting Issues

- Use the [bug report template](https://github.com/ComeOnOliver/skillshub/issues/new?template=bug_report.md)
- Include steps to reproduce
- Include expected vs actual behavior
- Include environment details (OS, Node version, browser)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## Questions?

Open a [discussion](https://github.com/ComeOnOliver/skillshub/discussions) or reach out via issues.
