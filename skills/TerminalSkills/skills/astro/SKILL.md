# Astro

## Overview

Astro is a web framework for building content-driven websites that ships zero JavaScript by default. Its island architecture hydrates only interactive components, achieving excellent Lighthouse scores while supporting React, Vue, Svelte, or any UI framework where interactivity is needed.

## Instructions

- When creating pages, use file-based routing in `src/pages/` with `.astro`, `.md`, or `.mdx` files, and organize shared structure in `src/layouts/`.
- When adding interactivity, use client directives on framework components: prefer `client:visible` or `client:idle` over `client:load` since most components do not need immediate hydration.
- When managing content, define Content Collections in `src/content/` with strict Zod schemas using `defineCollection()`, and query with `getCollection()` and `getEntry()`.
- When choosing rendering modes, default to static (SSG) for marketing and content pages, use `output: "server"` for dynamic pages, or use hybrid rendering with per-page `export const prerender = false`.
- When optimizing images, use the `<Image>` component from `astro:assets` for automatic format conversion (WebP/AVIF), resizing, and lazy loading instead of raw `<img>` tags.
- When adding page transitions, enable View Transitions with `<ViewTransitions />` for SPA-like navigation without shipping a client-side router.
- When integrating UI frameworks, install the appropriate integration (`@astrojs/react`, `@astrojs/vue`, `@astrojs/svelte`) and use Astro components for static content, reaching for framework components only when interactivity is required.

## Examples

### Example 1: Build a blog with Content Collections

**User request:** "Create an Astro blog with type-safe Markdown content"

**Actions:**
1. Define a blog Content Collection with Zod schema for frontmatter (title, date, tags, author)
2. Create dynamic route `src/pages/blog/[slug].astro` with `getStaticPaths()`
3. Build blog index page querying `getCollection("blog")` with sorting
4. Add layout with SEO meta tags, navigation, and View Transitions

**Output:** A statically generated blog with validated content, clean URLs, and smooth page transitions.

### Example 2: Add interactive components to a static site

**User request:** "Add a React search component to my Astro documentation site"

**Actions:**
1. Install `@astrojs/react` integration
2. Create the React search component with state and event handling
3. Add the component to the page with `client:idle` directive
4. Pass static data as props from the Astro page frontmatter

**Output:** A documentation site that is fully static except for the interactive search island.

## Guidelines

- Use Astro components (`.astro`) for static content; only use React/Vue/Svelte when interactivity is needed.
- Default to `client:visible` or `client:idle` over `client:load` for hydration directives.
- Define Content Collections with strict Zod schemas to catch content errors at build time.
- Use `astro:assets` `<Image>` over raw `<img>` tags for automatic optimization.
- Keep layouts thin with shared `<head>`, navigation, and footer; put page-specific content in pages.
- Use hybrid rendering: static for marketing pages, SSR only for personalized or dynamic pages.
- Enable View Transitions for SPA-like navigation without shipping a router.
