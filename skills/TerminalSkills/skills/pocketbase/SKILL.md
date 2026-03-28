# PocketBase

## Overview

PocketBase is an open-source backend packaged as a single binary, providing an embedded SQLite database, real-time subscriptions, file storage, and built-in authentication. It auto-generates REST APIs for collections and is ideal for shipping full-stack applications with minimal infrastructure complexity.

## Instructions

- When defining collections, choose the appropriate type: base collections for standard CRUD, auth collections for user management with email/password and OAuth2, and view collections for read-only SQL-backed queries.
- When building client integrations, use the JavaScript/TypeScript SDK with `pb.collection("name").getList()` for queries, `.subscribe()` for real-time updates, and `expand` parameter for fetching related data in a single request.
- When configuring permissions, set API rules on every collection (`listRule`, `viewRule`, `createRule`, `updateRule`, `deleteRule`) using filter syntax like `@request.auth.id = user.id` for row-level security.
- When extending functionality, add JavaScript hooks (`onBeforeCreateRecord`, `onAfterUpdateRecord`) for business logic, custom routes with `routerAdd()`, and cron jobs with `cronAdd()`.
- When deploying, run the single binary with `./pocketbase serve`, mount `pb_data/` as a Docker volume, and use Caddy or Nginx for HTTPS termination.
- When backing up, copy the `pb_data/` directory or use the built-in backup API before running migrations.
- When scaling, note that SQLite handles approximately 50,000 concurrent reads; for write-heavy workloads exceeding 100K daily active users, consider PostgreSQL alternatives.

## Examples

### Example 1: Build an MVP backend with authentication

**User request:** "Set up a PocketBase backend with user auth and a posts collection"

**Actions:**
1. Create an auth collection for users with email/password and Google OAuth2
2. Create a posts collection with title, body, and relation to users
3. Set API rules: anyone can list/view, only authenticated authors can create/update/delete their own posts
4. Configure the JS SDK for client-side CRUD and auth flows

**Output:** A fully functional backend with auth, permissions, and auto-generated REST API.

### Example 2: Add real-time features

**User request:** "Enable live updates for a chat application using PocketBase"

**Actions:**
1. Create a messages collection with text, sender relation, and room field
2. Set up SSE subscription with `pb.collection("messages").subscribe("*", callback)`
3. Configure API rules for room-based access control
4. Handle client auto-reconnect with exponential backoff

**Output:** A real-time chat backend with live message delivery via Server-Sent Events.

## Guidelines

- Always set API rules on every collection; default is admin-only (`null`), which breaks client access.
- Use `expand` parameter instead of multiple API calls for related data.
- Validate inputs in hooks (`onBeforeCreateRecord`) for business logic beyond schema validation.
- Back up `pb_data/` before migrations since SQLite migrations are irreversible.
- Use view collections for complex queries instead of client-side joins.
- Keep hooks lightweight; heavy processing should run async or in cron jobs.
