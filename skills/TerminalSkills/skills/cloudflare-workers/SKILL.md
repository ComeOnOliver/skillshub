# Cloudflare Workers

## Overview

Cloudflare Workers enables building and deploying applications at the edge with sub-millisecond cold starts. The platform leverages the Workers runtime alongside storage services like KV, D1, R2, Durable Objects, and Queues to build globally distributed, low-latency applications.

## Instructions

- When asked to create a Worker, scaffold with `wrangler init` using ES Module syntax (`export default { fetch }`) and set `compatibility_date` in `wrangler.toml`.
- When configuring storage, recommend KV for read-heavy key-value caching, D1 for relational data with SQL, R2 for S3-compatible object storage with zero egress fees, and Durable Objects for strongly consistent state coordination.
- When setting up local development, use `wrangler dev` with hot reload and local KV/D1/R2 simulation.
- When deploying, use `wrangler deploy` and configure routes, bindings, and build settings in `wrangler.toml`.
- When managing secrets, use `wrangler secret put KEY_NAME` and type bindings with an `Env` interface.
- When optimizing performance, leverage the Cache API (`caches.default`), Smart Placement, streaming responses with `TransformStream`, and HTMLRewriter for HTML transformation.
- When handling background work, use `ctx.waitUntil()` for fire-and-forget async tasks like analytics or logging.
- When building AI features, use Workers AI for edge inference, AI Gateway for multi-provider management, and Vectorize for RAG pipelines.

## Examples

### Example 1: Create an edge API with KV caching

**User request:** "Set up a Cloudflare Worker that serves cached API responses from KV"

**Actions:**
1. Scaffold a new Worker project with `wrangler init`
2. Configure KV namespace binding in `wrangler.toml`
3. Implement fetch handler with KV read/write and cache-control headers
4. Test locally with `wrangler dev`

**Output:** A Worker that checks KV for cached data, falls back to origin, and stores results in KV with TTL.

### Example 2: Deploy a scheduled data sync Worker

**User request:** "Build a Worker that runs on a schedule to sync data from an external API into D1"

**Actions:**
1. Configure Cron Trigger in `wrangler.toml`
2. Create D1 database and migration with schema
3. Implement `scheduled()` handler that fetches external data and inserts into D1
4. Use `ctx.waitUntil()` for non-blocking cleanup tasks

**Output:** A Worker with cron-triggered data synchronization and D1 storage.

## Guidelines

- Always set `compatibility_date` in `wrangler.toml` to pin runtime behavior.
- Use ES Module syntax (`export default`) over Service Worker syntax.
- Type all environment bindings with an `Env` interface for type safety.
- Handle errors gracefully with proper HTTP status codes instead of unhandled exceptions.
- Use `ctx.waitUntil()` for fire-and-forget async work that should not block the response.
- Prefer D1 over KV for relational data; use KV for simple key-value caching.
- Set appropriate `Cache-Control` headers and leverage Cloudflare's edge cache.