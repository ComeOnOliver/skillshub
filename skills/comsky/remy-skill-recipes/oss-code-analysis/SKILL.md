---
name: oss-code-analysis
description: >
  Explore open-source GitHub repository source trees via web browsing
  to analyze and compare feature implementations at the code level.
  Supports two modes: cross-project comparison and single-project deep dive.
  Use when evaluating how OSS projects implement a specific feature,
  choosing architecture patterns, or benchmarking implementation strategies.
license: MIT
compatibility:
  - Claude Code
  - Cursor
metadata:
  type: execution
  category: research
  maturity: draft
  estimated_time: 20 min
---

# Skill: OSS Code-Level Feature Analysis

**Type:** Execution

## Purpose

Explore open-source GitHub repositories at the **source code level** to understand
how specific features are implemented.

Two analysis modes:

- **Compare:** Analyze the same feature across multiple OSS projects
- **Deep Dive:** Deeply analyze a single project's feature implementation

The goal is to extract actionable implementation insights — not to copy code,
but to understand architectural decisions, trade-offs, and proven patterns.

---

## When to Use

- Before implementing a feature, to study how mature OSS projects solved it
- When choosing between architectural patterns and needing code-level evidence
- When evaluating libraries or frameworks by reading their internals
- When comparing implementation strategies across multiple projects
- When reverse-engineering how a specific OSS feature works under the hood

---

## When NOT to Use

- UX/interaction-level comparison (use `competitive-feature-benchmark` instead)
- Pricing, licensing, or business model comparison
- Projects hosted on private repositories without access
- Analyzing proprietary/closed-source software
- Simple API usage questions answerable from official documentation

---

## Inputs Required

Do not run this skill without:

- [ ] Target feature to analyze (name and scope)
- [ ] Analysis mode (`compare` or `deep-dive`)

Optional but recommended:

- [ ] GitHub repository URLs (1 for deep-dive, 2–5 for compare)
- [ ] Specific aspects to focus on (e.g., error handling, caching strategy)
- [ ] Our current implementation or design proposal for contextual comparison

If repository URLs are not provided, identify 3–5 relevant OSS projects via web search.

---

## Output Format

1. Repository Overview
2. Source Tree Map
3. Architecture Analysis
4. Key Code Walkthrough
5. Technology Stack Summary
6. Comparison Table (compare mode) / Findings Summary (deep-dive mode)
7. Strategic Recommendations

---

## Procedure

### Step 1 – Mode Selection & Input Validation

Confirm with the user:

- Which feature to analyze
- Which mode: `compare` or `deep-dive`
- Target repositories (URLs)

If repositories are not specified:

- Use web search to find 3–5 well-maintained OSS projects implementing the target feature
- Prefer projects with: >1k stars, recent commits within 6 months, clear documentation
- Present the candidate list to the user for confirmation before proceeding

---

### Step 2 – Repository Structure Exploration

For each target repository, browse the GitHub web interface:

**2-1. Project overview**

- Read the repository root page (README, top-level files)
- Note: star count, last commit date, primary language, license

**2-2. Directory tree mapping**

- Browse the top-level directory structure
- Identify architectural layers from folder names (e.g., `src/`, `lib/`, `internal/`, `packages/`)
- Map the folder hierarchy relevant to the target feature

**2-3. Build system & package configuration**

- Read dependency manifest files: `package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, `pom.xml`, etc.
- Note framework versions and key dependencies

#### GitHub Source Browsing Guide

Use these URL patterns for efficient navigation:

| Purpose | URL Pattern |
|---|---|
| Repository root | `https://github.com/{owner}/{repo}` |
| Directory listing | `https://github.com/{owner}/{repo}/tree/{branch}/{path}` |
| Raw file content | `https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}` |
| GitHub API (directory) | `https://api.github.com/repos/{owner}/{repo}/contents/{path}` |
| GitHub API (tree, recursive) | `https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1` |
| Search within repo | `https://github.com/{owner}/{repo}/search?q={keyword}&type=code` |

Preferred tools (in order of reliability):

1. `raw.githubusercontent.com` URLs for direct file content access (plain text, no HTML parsing)
2. GitHub API endpoints for directory trees and structured metadata (JSON responses)
3. `WebFetch` for GitHub pages when API is unavailable (HTML parsing may be needed)
4. `WebSearch` for finding relevant files when directory structure is unclear

---

### Step 3 – Entry Point & Core Module Identification

Locate the code that implements the target feature:

**3-1. Entry point discovery**

- Check README, CONTRIBUTING.md, or docs/ for architecture guides
- Look for obvious entry points: `main.*`, `index.*`, `app.*`, `server.*`
- Trace from CLI commands, API routes, or exported modules

**3-2. Feature-specific module location**

- Search for feature-related keywords in file/folder names
- Read import statements and module declarations to trace dependencies
- Follow the call chain from entry point to the target feature's core logic

**3-3. Key file inventory**

Produce a list of key files with their roles:

- **Compare mode:** 5–8 key files per repository (focus on the most
  relevant to the target feature)
- **Deep-dive mode:** 8–15 key files (broader coverage acceptable)

```
path/to/file.ts — Role description (e.g., "Main scheduler loop")
path/to/types.ts — Role description (e.g., "Core data structures")
```

---

### Step 4 – Code-Level Deep Reading

> **SCOPING RULE:** For each key file, first read **exported symbols,
> type signatures, and function headers only** (first pass).
> Then full-read only the functions/sections directly relevant to the
> target feature (second pass). For files exceeding 500 lines, always
> use line-range reading restricted to the relevant sections.
> Maximum full-read budget: **10 files per repository** in compare mode,
> **15 files** in deep-dive mode.

Read each key file and analyze:

#### A. Architecture Pattern

- Overall pattern: MVC, Clean Architecture, Hexagonal, Event-Driven, Pipeline, etc.
- Module boundaries and coupling strategy
- Dependency direction (inward vs outward)

#### B. Core Data Structures

- Primary types, interfaces, structs, or classes
- State management approach
- Data flow between modules

#### C. Key Algorithms & Logic

- Core processing logic and control flow
- Concurrency/parallelism strategy (if applicable)
- Performance-critical paths

#### D. Error Handling & Resilience

- Error propagation strategy (exceptions, Result types, error codes)
- Retry, fallback, and circuit breaker patterns
- Validation and input sanitization

#### E. Extension Points

- Plugin/middleware architecture
- Configuration and customization hooks
- Public API surface

---

### Step 5 – Technology Stack Analysis

Compile for each repository:

| Category | Details |
|---|---|
| Language & version | e.g., TypeScript 5.3, Rust 1.75 |
| Framework | e.g., Next.js 14, Actix-web 4 |
| Key libraries | Role of each major dependency |
| Build tooling | Bundler, compiler, task runner |
| Test framework | Unit, integration, E2E tools |
| CI/CD | Pipeline configuration if visible |

---

### Step 6 – Synthesis

#### Compare Mode: Comparative Table

Create a structured comparison across all analyzed repositories:

| Dimension | Repo A | Repo B | Repo C |
|---|---|---|---|
| Architecture pattern | | | |
| Core data model | | | |
| Key algorithm approach | | | |
| Error handling strategy | | | |
| Extension mechanism | | | |
| External dependencies | | | |
| Code complexity | | | |
| Test coverage approach | | | |

For each dimension, note the trade-offs of each approach.

#### Deep-Dive Mode: Findings Summary

Produce:

- Architecture diagram (Mermaid) showing module relationships
- Data flow diagram for the target feature
- Call chain from entry point to core logic
- Key design decisions and their rationale (inferred from code/comments)

---

### Step 7 – Strategic Recommendations

Answer:

1. Which implementation pattern is most suitable for our context and why?
2. What are the key trade-offs between the approaches observed?
3. What pitfalls or anti-patterns were found that we should avoid?
4. What design decisions should we adopt or adapt?
5. Are there reusable components or libraries worth considering?

Provide a clear, prioritized recommendation with justification.

---

## Guardrails

- If a repository is inaccessible (private, deleted, rate-limited), report the gap immediately and proceed with available repositories.
- Do not clone, fork, or download repositories. Analysis is read-only via web browsing.
- Do not fabricate code snippets or architecture details not found in the source.
- For large repositories (>10k files), restrict analysis scope to the target feature's relevant modules only.
- Always record the license type of each analyzed repository.
- Explicitly state when analysis is based on inference rather than direct code reading.
- Do not compare code quality subjectively without citing specific patterns or metrics.
- When quoting code snippets, always include the file path and approximate line range.

---

## Failure Patterns

Common bad outputs:

- Listing repositories without actually reading their source code
- Producing architecture descriptions based on README alone without verifying against actual code
- Comparing projects at different abstraction levels (one at code level, another at documentation level)
- Missing the comparison table in compare mode
- Ignoring error handling and edge case analysis
- Recommending a pattern without explaining trade-offs
- Analyzing the entire repository instead of focusing on the target feature
- Presenting outdated information from an old branch instead of the default branch
- Failing to distinguish between the project's public API and internal implementation

---

## Example 1 (Minimal Context)

**Input:**

Feature: real-time collaboration (CRDT-based)
Mode: compare
Repositories: not specified

**Output:**

1. Repository Overview: Yjs (14k stars, TypeScript), Automerge (3k stars, Rust+WASM), Diamond-types (1k stars, Rust)
2. Source Tree Map: core CRDT modules, network sync layers, storage adapters per project
3. Architecture Analysis:
   - Yjs: monolithic core with plugin-based extensions (awareness, undo-manager)
   - Automerge: Rust core compiled to WASM with thin JS wrapper
   - Diamond-types: pure Rust, optimized for text editing performance
4. Key Code Walkthrough: CRDT merge logic, operation encoding, conflict resolution per project
5. Technology Stack: Yjs (pure TS, no deps), Automerge (Rust + wasm-bindgen), Diamond-types (Rust, no runtime deps)
6. Comparison Table: architecture pattern, merge algorithm (Yjs: YATA, Automerge: RGA variant, Diamond: Fugue), memory model, WASM usage, extensibility, document size overhead
7. Strategic Recommendation: Yjs for rapid integration with existing JS ecosystem; Automerge for cross-platform with Rust performance; Diamond-types if text-only editing with maximum performance is the priority

---

## Example 2 (Realistic Scenario)

**Input:**

Feature: authentication middleware implementation
Mode: deep-dive
Repository: https://github.com/nextauthjs/next-auth
Focus: how session management and JWT handling are implemented internally

**Output:**

1. Repository Overview: NextAuth.js — 25k stars, TypeScript, ISC license, actively maintained with weekly releases
2. Source Tree Map:
   ```
   packages/
   ├── core/src/          — Framework-agnostic auth logic
   │   ├── lib/           — Session, CSRF, callback handlers
   │   ├── providers/     — OAuth, Email, Credentials provider implementations
   │   └── types.ts       — Core type definitions
   ├── next-auth/src/     — Next.js-specific adapter
   └── frameworks-*/      — SvelteKit, Express adapters
   ```
3. Architecture Analysis: Provider pattern with framework adapters. Core auth logic is framework-agnostic in `packages/core/`, each framework has a thin adapter layer. Session handling branches into JWT (stateless) and database (stateful) strategies via a strategy interface.
4. Key Code Walkthrough:
   - `packages/core/src/lib/actions/session.ts` — Session retrieval: decodes JWT or queries DB adapter based on `session.strategy` config
   - `packages/core/src/jwt.ts` — JWT encode/decode using `jose` library, supports JWE encryption
   - `packages/core/src/lib/actions/callback/index.ts` — OAuth callback flow: validates state, exchanges code for tokens, calls user-defined callbacks
   - `packages/core/src/providers/oauth.ts` — Generic OAuth provider with PKCE support, token endpoint configuration
5. Technology Stack: TypeScript 5.x, `jose` for JWT/JWE, `oauth4webapi` for OAuth 2.0, `@panva/hkdf` for key derivation, Turborepo monorepo, Vitest for testing
6. Findings Summary:
   - Mermaid architecture diagram showing Core → Provider → Adapter → Framework layer relationships
   - JWT flow: request → session middleware → decode JWT → validate expiry → attach to context → call user callback
   - Design decisions: framework-agnostic core enables multi-framework support; provider pattern allows easy addition of new OAuth providers; adapter pattern abstracts database operations
7. Strategic Recommendations:
   - Adopt the framework-agnostic core + thin adapter pattern for multi-framework auth libraries
   - The provider pattern with typed configuration objects is highly extensible — recommended for any pluggable authentication system
   - Consider: JWT-only strategy avoids database dependency but complicates token revocation; NextAuth solves this with short-lived JWTs + rotation

---

## Notes

**FAST MODE** (only if explicitly requested):

- Limit to 3 key files per repository
- Skip Step 5 (Technology Stack Analysis)
- In compare mode, limit to 3 repositories maximum

---

- This skill complements `competitive-feature-benchmark` which operates at the UX/interaction level. Use both together for a complete picture: code-level implementation (this skill) + user-facing design (competitive-feature-benchmark).
- For very large repositories, consider analyzing only the most recent tagged release rather than the HEAD of the default branch to ensure stability of analysis.
- GitHub API has rate limits (60 requests/hour unauthenticated, 5000/hour with token). If rate-limited, switch to `raw.githubusercontent.com` URLs or `WebFetch` on regular GitHub pages.
