# Turborepo

## Overview

Turborepo is a high-performance build system for JavaScript/TypeScript monorepos that intelligently caches task outputs, parallelizes execution across CPU cores, and ensures teams only rebuild what has changed. It integrates with npm, yarn, and pnpm workspaces.

## Instructions

- When setting up a monorepo, define tasks in `turbo.json` with `dependsOn` for ordering, use `^` prefix for topological dependencies (e.g., `"dependsOn": ["^build"]`), and specify `outputs` for cacheable artifacts.
- When configuring caching, define `outputs` arrays for each task (`["dist/**", ".next/**"]`), list all build-affecting environment variables in `env` or `globalEnv`, and set up Remote Cache for cross-developer sharing.
- When filtering workspaces, use `--filter=@app/web` to target specific packages, `--filter=...[HEAD~1]` for changed packages, and `turbo run build --graph` to visualize the dependency graph.
- When optimizing Docker builds, use `turbo prune --scope=@app/web` to generate a minimal Docker context containing only the targeted package and its dependencies.
- When setting up CI/CD, enable Remote Cache for cross-PR cache sharing, use `--dry-run=json` for pipeline analysis, and leverage incremental builds that only rebuild packages affected by PR changes.
- When organizing shared packages, create focused internal packages (`@repo/ui`, `@repo/db`, `@repo/auth`) with shared `tsconfig` and ESLint configs.

## Examples

### Example 1: Set up a new Turborepo monorepo

**User request:** "Initialize a monorepo with a Next.js app and shared UI library"

**Actions:**
1. Set up pnpm workspace with `apps/web` and `packages/ui` directories
2. Configure `turbo.json` with `build`, `dev`, `lint`, and `typecheck` tasks
3. Define task dependencies and cache outputs for each task
4. Create shared `tsconfig` base in `packages/tsconfig`

**Output:** A monorepo with parallel builds, intelligent caching, and shared configuration.

### Example 2: Optimize Docker builds for deployment

**User request:** "Create a Dockerfile for deploying one service from our Turborepo monorepo"

**Actions:**
1. Run `turbo prune --scope=@app/api` to generate minimal context
2. Create multi-stage Dockerfile using the pruned output
3. Install dependencies and build only the targeted package
4. Configure cache mounts for faster rebuilds

**Output:** A lean Docker image containing only the service and its dependencies, not the full monorepo.

## Guidelines

- Always define `outputs` for cacheable tasks; use empty `outputs: []` for side-effect-only tasks like `lint`.
- List all environment variables in `env` or `globalEnv` that affect build output.
- Use `^` prefix in `dependsOn` for tasks that consume dependency outputs (build, typecheck).
- Keep internal packages small and focused: `@repo/ui`, `@repo/db`, `@repo/auth`.
- Use `turbo prune` for Docker builds; never copy the entire monorepo into a container.
- Set up Remote Cache in CI for cross-developer and cross-PR cache sharing.