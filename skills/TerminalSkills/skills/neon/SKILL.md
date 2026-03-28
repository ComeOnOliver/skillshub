# Neon

## Overview

Neon provides serverless PostgreSQL with scale-to-zero compute, database branching, and an HTTP-based driver for edge runtimes. It offers full PostgreSQL compatibility including extensions like pgvector, with features like copy-on-write branching for development workflows and automatic preview deployment databases.

## Instructions

- When setting up connections, use the pooled connection string (`-pooler` suffix) for serverless functions and the direct connection string for long-running Node.js servers.
- When creating development workflows, use database branching (`neon branches create`) to give each feature or PR its own isolated database that inherits schema from the parent branch.
- When deploying to edge runtimes (Cloudflare Workers, Vercel Edge), use `@neondatabase/serverless` which communicates over HTTP instead of TCP sockets.
- When integrating with ORMs, use `@prisma/adapter-neon` for Prisma or `drizzle-orm/neon-serverless` for Drizzle, and reserve raw SQL for complex queries and migrations.
- When enabling AI features, install the `pgvector` extension at project creation for vector embeddings and ANN search.
- When configuring scaling, set `autosuspend_delay` to 300s for development and 0 (never suspend) for production, and configure compute autoscaling between 0.25 and 8 CU.
- When running migrations, apply them on the main branch so feature branches inherit schema changes automatically.

## Examples

### Example 1: Set up Neon with Drizzle ORM for a Next.js app

**User request:** "Connect my Next.js project to Neon using Drizzle ORM"

**Actions:**
1. Create a Neon project and obtain the pooled connection string
2. Install `@neondatabase/serverless` and `drizzle-orm`
3. Configure Drizzle with the Neon serverless adapter
4. Define schema and run initial migration on the main branch

**Output:** A type-safe database layer using Drizzle with Neon that works in both server components and edge functions.

### Example 2: Set up branch-per-PR workflow

**User request:** "Automatically create a database branch for each pull request"

**Actions:**
1. Configure Neon-Vercel integration for automatic branch creation
2. Set up CI script using `neonctl branches create --name pr-$PR_NUMBER`
3. Pass branch connection string as environment variable to preview deployment
4. Add cleanup step to delete branch when PR is closed

**Output:** An isolated database branch for each PR with automatic lifecycle management.

## Guidelines

- Always use the pooled connection string (`-pooler` suffix) for serverless functions to avoid exhausting connection limits.
- Use `@neondatabase/serverless` for edge runtimes; use standard `pg` for long-running Node.js servers.
- Create database branches for each feature or PR; never develop against the main branch.
- Enable `pgvector` extension at project creation if vector search will be needed.
- Set `autosuspend_delay` to 300s for dev and 0 for production.
- Use Drizzle or Prisma with the Neon adapter; use raw SQL only for complex queries and migrations.
- Run migrations on the main branch; feature branches inherit schema automatically.
