# Bun

## Overview

Bun is an all-in-one JavaScript/TypeScript runtime that replaces Node.js, npm, webpack, and Jest with a single binary. It provides native TypeScript support, a high-performance HTTP server (`Bun.serve()`), a fast package manager, a bundler, and a Jest-compatible test runner with dramatically faster performance.

## Instructions

- When creating HTTP servers, use `Bun.serve()` which handles 100K+ req/s with built-in WebSocket support, TLS, and streaming responses.
- When managing packages, use `bun install` (10-30x faster than npm), `bun add`, `bun remove`, and prefer `bun.lock` (text format) for readable git diffs.
- When bundling, use `Bun.build()` with appropriate target (`"browser"`, `"bun"`, `"node"`), enable code splitting with `splitting: true`, and configure tree shaking.
- When writing tests, use `bun test` with Jest-compatible API (`describe`, `it`, `expect`), snapshot testing, mocking with `mock.module()`, and `--coverage` for code coverage.
- When doing file I/O, prefer `Bun.file()` and `Bun.write()` over Node.js `fs` for significantly faster file operations, and use `Bun.Glob` for pattern matching.
- When handling authentication, use `Bun.password.hash()` and `Bun.password.verify()` for bcrypt/argon2 instead of npm packages.
- When migrating from Node.js, replace `node` with `bun` in scripts, keep `package.json` unchanged, and note that most npm packages work without modifications. Use `bun:sqlite` for embedded databases instead of SQLite npm packages.

## Examples

### Example 1: Build a high-performance API server

**User request:** "Create a REST API using Bun's built-in HTTP server"

**Actions:**
1. Create server with `Bun.serve()` and route handler
2. Parse JSON bodies with `request.json()` and return `Response` objects
3. Add WebSocket upgrade for real-time features
4. Use `Bun.password` for auth and `bun:sqlite` for data storage

**Output:** A fast API server using only Bun built-ins with no external dependencies.

### Example 2: Migrate a Node.js project to Bun

**User request:** "Switch my Express project from Node.js to Bun"

**Actions:**
1. Replace `npm install` with `bun install` in CI and local setup
2. Update `package.json` scripts to use `bun run` instead of `node`
3. Replace `dotenv` with Bun's built-in `.env` loading
4. Switch test runner from Jest to `bun test` with same test files

**Output:** A Bun-powered project with faster installs, startup, and test execution.

## Guidelines

- Use `Bun.serve()` for new HTTP servers; it is significantly faster than Express on Bun.
- Prefer `Bun.file()` and `Bun.write()` over Node.js `fs` for file operations.
- Use `bun:sqlite` for local data instead of adding SQLite npm packages.
- Use `Bun.password` for auth instead of `bcrypt`/`argon2` npm packages for zero native dependencies.
- Keep `bun.lock` (text format) in git for readable diffs.
- Test with `bun test` instead of Jest for the same API with dramatically faster execution.
- When targeting browsers, use `Bun.build()` with `target: "browser"`.