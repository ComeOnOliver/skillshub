# Sanity

## Overview

Sanity is a structured content platform with real-time collaboration, GROQ querying, and a customizable React-based Studio. Content is stored in the Content Lake with CDN delivery, Portable Text for structured rich content, and visual editing capabilities for live frontend previews.

## Instructions

- When defining schemas, use `defineType()` and `defineField()` with validation rules, model content for reuse by separating pages from content blocks, and use references over inline objects for shared content.
- When querying data, write GROQ queries with projections to fetch only needed fields, use the `->` dereference operator for joined data, and set `useCdn: true` for production reads.
- When customizing Sanity Studio, configure desk structure for sidebar navigation, add custom input components for specialized editing, and create custom publish workflows with actions.
- When building rich content, use Portable Text which is structured data (not HTML) that renders on any platform, with customizable toolbar, custom blocks, and inline objects.
- When integrating with Next.js, use `next-sanity` with ISR, preview mode, and visual editing, and `@sanity/visual-editing` for click-to-edit overlays in the frontend.
- When managing environments, use datasets (production, staging, development) for content isolation, GROQ-powered webhooks for filtered build triggers, and set `apiVersion` to a specific date to avoid breaking changes.
- When handling images, use Sanity's image with hotspot for focal point selection and `sanity-image-url` for generating responsive image URLs with transforms.

## Examples

### Example 1: Build a content-driven marketing site

**User request:** "Set up Sanity with Next.js for a marketing site with modular page builder"

**Actions:**
1. Define page, hero, feature, CTA, and testimonial schemas as reusable block types
2. Configure Sanity Studio with desk structure and live preview
3. Set up `next-sanity` with ISR and GROQ queries for each page type
4. Enable visual editing with `@sanity/visual-editing` for click-to-edit overlays

**Output:** A modular marketing site where editors build pages from reusable content blocks with live preview.

### Example 2: Implement real-time content preview

**User request:** "Add live preview to our Sanity + Next.js site so editors see changes as they type"

**Actions:**
1. Configure Sanity Studio's Presentation tool for side-by-side editing
2. Set up `@sanity/visual-editing` in the Next.js frontend for click-to-edit overlays
3. Use `client.listen()` for real-time content updates in preview mode
4. Configure draft content display with `!(_id in path("drafts.**"))` filtering

**Output:** A live editing experience where content changes appear in the frontend as editors type.

## Guidelines

- Use `defineType()` and `defineField()` for schema definitions; they provide TypeScript types for the Studio.
- Model content for reuse: separate pages from content blocks so blocks can appear on any page.
- Use references over inline objects for content that appears in multiple places.
- Query with GROQ projections to fetch only needed fields, not entire documents.
- Use the CDN API (`useCdn: true`) for production reads; it is free and fast.
- Set `apiVersion` to a specific date to avoid breaking changes.
- Use Portable Text for rich content; it is structured data that renders on any platform.