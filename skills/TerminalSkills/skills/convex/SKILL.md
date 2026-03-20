# Convex

## Overview

Convex is a reactive backend platform where database queries, mutations, and actions are defined in TypeScript and data automatically syncs to connected clients in real-time. It eliminates WebSocket code, polling, and cache invalidation, providing ACID transactions and optimistic updates out of the box.

## Instructions

- When defining schemas, use `defineSchema()` with `defineTable()` and typed validators (`v.string()`, `v.number()`, `v.id("tableName")`), and define indexes for all filtered and sorted queries.
- When writing functions, use queries for reads (automatically reactive), mutations for writes (transactional, triggers reactive updates), and actions for external API calls (non-transactional).
- When building React UIs, use `useQuery()` for reactive data subscriptions that auto-update, `useMutation()` for writes with optimistic updates, and `usePaginatedQuery()` for infinite scroll.
- When handling authentication, use `convex-auth` for built-in auth or integrate Clerk/Auth0, and validate user identity at the start of every mutation with `ctx.auth.getUserIdentity()`.
- When processing background work, use `ctx.scheduler.runAfter()` for delayed execution and cron jobs for recurring tasks instead of making mutations slow.
- When storing files, use `ctx.storage.store()` for upload and `ctx.storage.getUrl()` for serving URLs without S3 or CDN configuration.
- When implementing search, use full-text search indexes with `searchIndex()` or vector search with `vectorIndex()` for AI/RAG applications, with metadata filtering.

## Examples

### Example 1: Build a real-time chat application

**User request:** "Create a real-time chat app with Convex and React"

**Actions:**
1. Define `messages` table with schema, author reference, and timestamp index
2. Create a query function that returns messages sorted by timestamp
3. Create a mutation for sending messages with auth validation
4. Use `useQuery()` in React to subscribe to messages with automatic real-time updates

**Output:** A chat application where messages appear instantly for all connected users without WebSocket code.

### Example 2: Add full-text and vector search

**User request:** "Implement search across articles with both keyword and semantic search"

**Actions:**
1. Define search index on article body field with `searchIndex()`
2. Define vector index on embedding field with `vectorIndex()`
3. Create query functions for text search and vector similarity search
4. Combine metadata filtering with search for scoped results

**Output:** A dual search system supporting both keyword matching and semantic similarity queries.

## Guidelines

- Use schema validation in production: `defineSchema()` catches type errors at deploy time, not runtime.
- Define indexes for all filtered/sorted queries to ensure efficient data access.
- Use queries for reads, mutations for writes, actions for external APIs; never mix concerns.
- Keep mutations small and fast since they hold a database lock; move heavy processing to actions.
- Use `ctx.scheduler.runAfter()` for background work instead of making mutations slow.
- Validate user identity at the start of every mutation to prevent unauthorized writes.
- Use optimistic updates for interactive UIs; the client sees the change instantly while the server confirms.