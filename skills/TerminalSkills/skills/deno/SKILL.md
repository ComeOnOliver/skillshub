# Deno

## Overview

Deno is a secure JavaScript/TypeScript runtime with built-in tooling including a formatter, linter, test runner, and bundler. It features a permissions model that restricts file, network, and environment access by default, native TypeScript support without transpilation, and full web standards compatibility.

## Instructions

- When creating servers, use `Deno.serve()` for high-performance HTTP handling with Web Standards Request/Response, and enable parallel workers with `deno serve --parallel` for multi-core utilization.
- When configuring security, specify permissions explicitly (`--allow-read`, `--allow-net`, `--allow-env`) scoped to specific paths, hosts, or variable names. Never deploy with `--allow-all`.
- When managing dependencies, use JSR (`jsr:`) for versioned, type-checked packages, `npm:` specifier for npm packages, and configure import maps in `deno.json` for clean paths.
- When writing tests, use `Deno.test()` with `@std/assert` assertions, `@std/testing` for mocking, and `deno test --coverage` for coverage reports. Deno's sanitizers detect resource leaks automatically.
- When building CLI tools, use `deno compile` to produce standalone executables that cross-compile for Linux, macOS, and Windows with no runtime dependency.
- When deploying to the edge, use Deno Deploy with Deno KV for key-value storage, `Deno.cron()` for scheduled tasks, and queues for background processing.
- When using Deno KV, structure keys hierarchically (`["users", id, "profile"]`), use `atomic()` for transactions, and configure TTL with `expireIn` for automatic expiration.

## Examples

### Example 1: Build a REST API with Deno KV

**User request:** "Create an API with Deno that stores data in Deno KV"

**Actions:**
1. Create HTTP server with `Deno.serve()` and route matching
2. Open KV store with `Deno.openKv()` and define key structure
3. Implement CRUD operations using `kv.get()`, `kv.set()`, and `kv.atomic()`
4. Set explicit permissions in `deno.json` task definitions

**Output:** A secure API with embedded key-value storage, ready for Deno Deploy.

### Example 2: Compile a CLI tool for distribution

**User request:** "Create a Deno CLI tool that can be distributed as a single binary"

**Actions:**
1. Build the CLI with argument parsing using `@std/cli`
2. Add file and network permissions scoped to required resources
3. Write tests with `Deno.test()` and run with `deno test`
4. Compile to standalone binaries with `deno compile --target` for each platform

**Output:** Cross-platform standalone executables with no runtime dependency.

## Guidelines

- Always specify permissions explicitly in production; never deploy with `--allow-all`.
- Use `deno.json` imports map for clean import paths instead of raw URLs.
- Prefer JSR (`jsr:`) over URL imports for versioned, type-checked, immutable packages.
- Use `npm:` specifier for npm packages instead of CDN URLs.
- Run `deno fmt` and `deno lint` in CI for zero-config formatting and linting.
- Use `Deno.serve()` over third-party frameworks for simple APIs; it is faster and lighter.
- Compile to standalone binary with `deno compile` for distribution with no runtime dependency.