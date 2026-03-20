# Remix

## Overview

Remix is a full-stack React framework built on web standards that uses nested routing, loader/action data patterns, and progressive enhancement to build fast, resilient applications. Forms work without JavaScript, nested routes load data in parallel, and error boundaries isolate failures to individual route segments.

## Instructions

- When building routes, use file-based nested routing where each route module contains both the UI and data layer, with `<Outlet />` for child routes and pathless layouts for shared UI without URL segments.
- When loading data, use `loader` functions that run server-side and return data with `json()`, `defer()`, or `redirect()`. Nested route loaders run in parallel to avoid client-server waterfalls.
- When handling mutations, use `action` functions triggered by `<Form method="post">`, return validation errors with appropriate HTTP status codes, and rely on automatic revalidation of all page loaders after actions.
- When enhancing UX, use `useFetcher()` for non-navigation mutations (like buttons, inline edits), `useNavigation()` for form submission state, and `fetcher.formData` for optimistic UI.
- When handling errors, add `ErrorBoundary` at every route level to prevent child errors from crashing the whole page, and use `isRouteErrorResponse()` to distinguish 404s from server errors.
- When managing auth, use `createCookieSessionStorage()` for encrypted sessions, redirect in loaders when unauthenticated, and leverage built-in CSRF protection.
- When deploying, choose the appropriate adapter (`@remix-run/node`, `@remix-run/cloudflare`, `@remix-run/deno`) and use Vite as the compiler.

## Examples

### Example 1: Build a CRUD app with progressive enhancement

**User request:** "Create a Remix app with task management and form-based mutations"

**Actions:**
1. Define nested routes for task list and task detail pages
2. Implement loaders for data fetching with parallel loading
3. Create actions for create, update, delete with validation error handling
4. Use `<Form>` for progressive enhancement and `useFetcher()` for inline edits

**Output:** A full-stack task app that works without JavaScript and is enhanced with JavaScript.

### Example 2: Deploy a Remix app to Cloudflare Workers

**User request:** "Set up a Remix app for edge deployment on Cloudflare"

**Actions:**
1. Configure `@remix-run/cloudflare` adapter in the project
2. Set up loaders using KV and D1 bindings from the context
3. Add streaming with `defer()` for slow data below the fold
4. Configure HTTP caching headers in loaders for CDN performance

**Output:** An edge-deployed Remix app with serverless data access and CDN caching.

## Guidelines

- Use `loader` for all data fetching; never use `useEffect` + `fetch` for initial page data.
- Use `<Form>` instead of `<form>` + `onSubmit` for progressive enhancement.
- Return proper HTTP status codes from loaders and actions (404, 400, 403), not just `json({ error })`.
- Use `useFetcher()` for mutations that should not trigger navigation (like/unlike, inline edits, search).
- Handle errors at every route level with `ErrorBoundary`; do not let child errors crash the whole page.
- Use `defer()` for slow data below the fold to show the page fast and stream non-critical data.
- Keep loaders and actions in the route file; co-location makes it easy to see what a route does.