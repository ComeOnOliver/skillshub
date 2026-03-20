# Contributing to SkillsHub

Thank you for your interest in contributing to SkillsHub! This guide covers everything you need to get started.

## 🏗️ Project Overview

SkillsHub is the open registry for AI agent skills — describe your task and get the best-fit skill instantly.

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router, Server Components) |
| API | Next.js API Routes |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| Styling | Tailwind CSS |
| Auth | GitHub OAuth + iron-session + API keys |
| Build | Turborepo + pnpm monorepo |
| Hosting | Vercel |

### Project Structure

```
skillshub/
├── apps/
│   └── web/              # Next.js frontend + API routes
├── packages/
│   ├── db/               # Drizzle schema, migrations, seeder
│   └── shared/           # Types, validators, constants
├── scripts/              # Import scripts for indexing skills
```

---

## 🚀 Development Setup

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9
- **PostgreSQL** (local or Neon)

### Getting Started

```bash
# 1. Fork & clone the repository
git clone https://github.com/<your-username>/skillshub.git
cd skillshub

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
ln -s ../../.env apps/web/.env  # Next.js needs .env in its own directory
# Fill in your values (see .env.example for descriptions)

# 4. Push database schema
npx drizzle-kit push

# 5. Seed the database (optional, for local dev)
npx tsx packages/db/src/clear-and-seed.ts

# 6. Start the development server
pnpm dev
```

The app will be running at `http://localhost:3000`.

---

## 🧪 Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type checking
pnpm typecheck

# Lint
pnpm lint

# Build (checks everything compiles)
pnpm build
```

Make sure `pnpm build` passes before submitting a PR.

---

## 📦 Importing New Skills

SkillsHub indexes skills from GitHub repositories. To import skills from a new repo:

1. Check the `scripts/` directory for available import scripts
2. Use the import scripts to add a new source repository:
   ```bash
   # Import skills from a GitHub repo
   npx tsx scripts/import-repo.ts <owner>/<repo>
   ```
3. The importer will discover SKILL.md files, extract metadata, and index them
4. Submit a PR with the import if you want a new repo added to the registry

If you want to request a repo be indexed without doing it yourself, [open a Skill Import Request](https://github.com/ComeOnOliver/skillshub/issues/new?template=skill_import.yml).

---

## 🔀 Pull Request Guidelines

### Before You Start

1. Check [existing issues](https://github.com/ComeOnOliver/skillshub/issues) to avoid duplicate work
2. For new features, open a [feature request](https://github.com/ComeOnOliver/skillshub/issues/new?template=feature_request.yml) first to discuss the approach
3. For bugs, check if there's already an [open issue](https://github.com/ComeOnOliver/skillshub/issues?q=is%3Aissue+is%3Aopen)

### PR Process

1. **One feature per PR** — keep PRs focused and reviewable
2. **Create a feature branch** from `main` (`feature/your-feature` or `fix/your-fix`)
3. **Write descriptive commits** — use conventional commit style when possible:
   - `feat: add skill resolver caching`
   - `fix: handle empty search query`
   - `docs: update API examples`
4. **Link to the issue** — reference the issue in your PR description (`Closes #123`)
5. **Ensure CI passes** — `pnpm build` and `pnpm lint` must pass
6. **Update docs** if your change affects the API or user-facing behavior
7. Submit your PR with a clear description of what changed and why

### What Makes a Good PR

- Small, focused scope
- Clear description with context
- Tests for new functionality
- No unrelated changes mixed in

---

## 🎨 Code Style

- **TypeScript** — strict mode, avoid `any` types
- **ESLint** — run `pnpm lint` to check for issues
- **Prettier** — code is auto-formatted; run `pnpm format` or configure your editor
- **Imports** — use path aliases (`@/lib/...`, `@skillshub/db/...`)
- **Components** — Server Components by default, `"use client"` only when needed
- **Naming** — camelCase for variables/functions, PascalCase for components/types

---

## 💬 Questions & Help

- **GitHub Discussions** — [Ask a question or start a conversation](https://github.com/ComeOnOliver/skillshub/discussions)
- **GitHub Issues** — [Report bugs or request features](https://github.com/ComeOnOliver/skillshub/issues)
- **Code of Conduct** — This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md)

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
