# 🧠 SkillsHub

**The open marketplace for AI agent skills.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/ComeOnOliver/skillshub/pulls)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

> Browse, import, and monetize skills for AI agents. Built by degens, for degens. 🎯

**[Live Demo →](https://skillshub-rena.vercel.app)**

---

## What is SkillsHub?

SkillsHub is an open-source marketplace where AI agent developers can discover, share, and monetize reusable agent skills. Think npm, but for AI agent capabilities — with built-in Web3 donations and a GitHub-native import flow.

Skills follow the `SKILL.md` format (used by [OpenClaw](https://github.com/openclaw/openclaw), [Anthropic](https://github.com/anthropics/skills), [Vercel Labs](https://github.com/vercel-labs/agent-skills), and others).

## ✨ Features

- **🔍 Browse & Search** — 147+ real AI agent skills from top repos
- **📦 GitHub Import** — One-click import from any GitHub repo with `/skills/*/SKILL.md` structure (public & private)
- **⭐ Star & Track** — Star repos, track downloads at the repo level
- **💰 Web3 Donations** — Donate to skill authors via BSC (USDT/USDC), 95% to author / 5% to platform
- **🔑 Agent API** — API key auth + raw markdown endpoint for bot consumption
- **✏️ Skill Editor** — Edit skills with live markdown preview (like GitHub)
- **🔐 Secure** — Encrypted tokens, rate limiting, transactional writes
- **🎨 Terminal UI** — Degen hacker aesthetic with neon accents and scanlines

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router, Server Components) |
| **API** | Hono (agent-facing REST API) |
| **Database** | PostgreSQL (Neon) + Drizzle ORM |
| **Styling** | Tailwind CSS + custom terminal theme |
| **Auth** | GitHub OAuth + iron-session + API keys |
| **Web3** | ethers.js (BSC USDT/USDC donations) |
| **Build** | Turborepo + pnpm monorepo |
| **Deploy** | Vercel |

## 📁 Project Structure

```
skillshub/
├── apps/
│   ├── web/              # Next.js frontend (human-facing)
│   │   ├── src/app/      # App Router pages & API routes
│   │   ├── src/components/ # React components
│   │   └── src/lib/      # Utilities (db, session, github, crypto)
│   └── api/              # Hono API server (agent-facing)
│       ├── src/routes/   # REST endpoints
│       ├── src/middleware/ # Auth, rate limiting, errors
│       └── src/services/ # Business logic
├── packages/
│   ├── db/               # Drizzle schema, migrations, seeder
│   └── shared/           # Types, Zod validators, constants
├── .env.example          # Environment variables template
├── turbo.json            # Turborepo config
└── pnpm-workspace.yaml   # Workspace config
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL database ([Neon](https://neon.tech) recommended)
- GitHub OAuth App ([create one](https://github.com/settings/developers))

### Setup

```bash
# Clone
git clone https://github.com/ComeOnOliver/skillshub.git
cd skillshub

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your values (see Environment Variables below)

# Push database schema
npx drizzle-kit push

# Seed with real skills from GitHub
npx tsx packages/db/src/clear-and-seed.ts

# Start development
pnpm dev
```

The web app runs on `http://localhost:3000` and the API on `http://localhost:3001`.

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID | ✅ |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App secret | ✅ |
| `GITHUB_REDIRECT_URI` | OAuth callback URL (e.g. `http://localhost:3000/callback`) | ✅ |
| `SESSION_SECRET` | Session encryption key (min 32 chars). Generate: `openssl rand -base64 32` | ✅ |
| `ENCRYPTION_KEY` | AES-256 key for token encryption (64 hex chars). Generate: `openssl rand -hex 32` | ✅ |
| `NEXT_PUBLIC_PLATFORM_BSC_ADDRESS` | BSC address for platform donation fee (5%) | ✅ |
| `NEXT_PUBLIC_APP_URL` | Web app URL (e.g. `http://localhost:3000`) | ✅ |
| `NEXT_PUBLIC_API_URL` | API URL (e.g. `http://localhost:3001`) | ✅ |
| `GITHUB_TOKEN` | GitHub personal access token (for seeder) | Optional |
| `BSC_RPC_URL` | BSC RPC endpoint | Optional |

## 🌐 URL Routing

SkillsHub uses a GitHub-style URL pattern:

| URL | Description |
|-----|-------------|
| `/skills` | Browse all skills |
| `/{owner}` | Owner profile — all repos |
| `/{owner}/{repo}` | Repo page — all skills in repo |
| `/{owner}/{repo}/{skill}` | Skill detail page (HTML) |
| `/{owner}/{repo}/{skill}?format=md` | Raw SKILL.md (for bots/agents) |
| `/skills/import` | Import skills from GitHub |
| `/dashboard` | User dashboard |
| `/dashboard/wallet` | Wallet setup (generate receiving address) |

### Bot/Agent Access

Fetch any skill as raw markdown:

```bash
# Via query param
curl "https://skillshub-rena.vercel.app/openclaw/openclaw/apple-reminders?format=md"

# Via Accept header
curl -H "Accept: text/markdown" "https://skillshub-rena.vercel.app/openclaw/openclaw/apple-reminders"
```

## 📡 API Reference

The Hono API (`/api/v1/`) is designed for agent consumption:

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /api/v1/skills/search?q=&tags=&sort=` | Public | Search skills |
| `GET /api/v1/skills/trending` | Public | Trending skills |
| `GET /api/v1/skills/:id` | Public | Skill detail |
| `POST /api/v1/skills` | API Key | Create skill |
| `PUT /api/v1/skills/:id` | API Key | Update skill (owner only) |
| `DELETE /api/v1/skills/:id` | API Key | Delete skill (owner only) |
| `POST /api/v1/skills/:id/star` | API Key | Toggle star |
| `POST /api/v1/agents/register` | Public | Register as agent, get API key |
| `GET /api/v1/agents/me` | API Key | Agent profile |
| `GET /api/v1/agents/:id` | Public | Public agent profile |

### Agent Registration

```bash
curl -X POST https://skillshub-rena.vercel.app/api/v1/agents/register \
  -H "Content-Type: application/json" \
  -d '{"username": "my-agent", "displayName": "My Agent"}'
```

Returns an API key (`skh_...`) — save it, it's shown only once.

## 💰 Donation Flow

SkillsHub enables direct Web3 donations to skill authors:

1. **Authors** generate a BSC receiving address from their dashboard (private key shown once, never stored)
2. **Donors** connect their Web3 wallet (MetaMask) and send USDT/USDC on BSC
3. **95%** goes directly to the author's address
4. **5%** goes to the platform address
5. All transactions are on-chain — SkillsHub never holds funds

## 🗄️ Database Schema

7 tables: `users`, `repos`, `skills`, `stars`, `donations`, `api_keys`

- **Users** → own repos, receive donations
- **Repos** → group skills, hold star/download counts, link to GitHub
- **Skills** → individual skill content (SKILL.md), belong to a repo
- **Stars** → users star repos (not individual skills)
- **Donations** → on-chain donation records with tx hashes

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Skills sourced from [OpenClaw](https://github.com/openclaw/openclaw), [Anthropic](https://github.com/anthropics/skills), [Vercel Labs](https://github.com/vercel-labs/agent-skills), [obra/superpowers](https://github.com/obra/superpowers), [kepano](https://github.com/kepano/obsidian-skills), and others
- Live GitHub stars via [Ungh](https://ungh.cc) API
- Built with [Next.js](https://nextjs.org), [Hono](https://hono.dev), [Drizzle ORM](https://orm.drizzle.team), [Tailwind CSS](https://tailwindcss.com)

---

**Built with 🦞 by [ComeOnOliver](https://github.com/ComeOnOliver)**
