# Payload CMS

## Overview

Payload CMS is a code-first headless CMS where collections and fields are defined in TypeScript, auto-generating an admin panel, REST/GraphQL APIs, and TypeScript types. It supports PostgreSQL, MongoDB, and SQLite, and integrates directly into Next.js applications with the Local API.

## Instructions

- When defining collections, create TypeScript config objects with `slug`, `fields`, `access`, and `hooks`, using field types like text, richText, relationship, upload, array, group, and blocks.
- When setting access control, use function-based permissions at the collection, field, and operation level (create, read, update, delete), and create reusable access functions like `isLoggedIn` and `isAdmin`.
- When building flexible pages, use blocks field type so editors compose pages from predefined block types, and define reusable field groups as functions for DRY configuration across collections.
- When managing content workflows, enable versions with `versions: { drafts: true }` for draft/published states and full revision history.
- When integrating with Next.js, use `@payloadcms/next` to run Payload inside the Next.js app, and use the Local API (`payload.find()`, `payload.create()`) in Server Components for typed, fast access without HTTP.
- When customizing the admin panel, replace specific components with custom React, add custom views for new pages, and configure live preview for real-time frontend content previewing.
- When building reusable content structures, use relationships over manual ID references for auto-resolution and validation, and define singleton globals for site settings, navigation, and footer.

## Examples

### Example 1: Build a blog CMS with Next.js

**User request:** "Set up Payload CMS for a blog with categories, authors, and rich text"

**Actions:**
1. Define `posts`, `authors`, and `categories` collections with relationships
2. Configure rich text editor with custom blocks (code, callout, image)
3. Enable drafts and versions on the posts collection
4. Integrate with Next.js using the Local API for Server Component data fetching

**Output:** A fully featured blog CMS with typed API, auto-generated admin panel, and Next.js integration.

### Example 2: Create a multi-role content workflow

**User request:** "Set up Payload with editor, reviewer, and admin roles with different permissions"

**Actions:**
1. Define user collection with role field (editor, reviewer, admin)
2. Create access control functions for each role and operation
3. Apply field-level access to restrict sensitive fields to admins
4. Add custom publish workflow actions (submit -> review -> publish)

**Output:** A role-based CMS where editors create, reviewers approve, and admins manage all content.

## Guidelines

- Define reusable field groups as functions for DRY configuration across collections.
- Use access control functions, not middleware; Payload enforces them on all entry points (REST, GraphQL, Local API).
- Enable versions on content collections; `versions: { drafts: true }` prevents accidental publishes.
- Use relationships over manual ID references; Payload auto-resolves and validates them.
- Use the Local API (`payload.find()`) in Next.js Server Components; it is faster than HTTP and fully typed.
- Keep admin customizations minimal; the auto-generated panel covers most needs.
- Use blocks for flexible page building so editors compose pages from predefined block types.