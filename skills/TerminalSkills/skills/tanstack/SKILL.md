# TanStack

## Overview

The TanStack ecosystem provides type-safe client libraries for React: Query for declarative data fetching and caching, Router for fully typed routing with search parameters, Table for headless data tables with sorting/filtering/pagination, and Virtual for rendering large lists efficiently.

## Instructions

- When fetching data, use `useQuery()` with hierarchical query keys (e.g., `["users", userId, "posts"]`) and configure `staleTime` based on freshness needs (0 for real-time, 5 minutes for dashboards, Infinity for static data).
- When performing mutations, use `useMutation()` with `onSuccess` for cache invalidation via `queryClient.invalidateQueries()`, and `onMutate` for optimistic updates with rollback.
- When building tables, use TanStack Table's headless approach with typed column definitions, and combine with `@tanstack/react-virtual` for datasets with 10,000+ rows.
- When routing, use TanStack Router for fully typed route parameters and search params with Zod validation, file-based routes with automatic type generation, and route-level data loading.
- When handling pagination, use `useInfiniteQuery()` for infinite scroll or cursor-based patterns, and server-side pagination in TanStack Table.
- When prefetching, use `queryClient.prefetchQuery()` for anticipated navigation and `useSuspenseQuery()` for React Suspense integration.
- When virtualizing lists, use `@tanstack/react-virtual` with `estimateSize` for scroll position prediction and support for dynamic, variable-height items.

## Examples

### Example 1: Build a data dashboard with Query and Table

**User request:** "Create a dashboard with server-paginated data table and real-time stats"

**Actions:**
1. Set up TanStack Query with appropriate `staleTime` and refetch intervals for stats
2. Define TanStack Table with typed columns, server-side sorting and pagination
3. Implement filter controls with column filters and global search
4. Add optimistic updates for inline row editing with mutation rollback

**Output:** A dashboard with efficient data fetching, server-managed table pagination, and instant edit feedback.

### Example 2: Add type-safe routing with data prefetching

**User request:** "Set up TanStack Router with typed search parameters and data preloading"

**Actions:**
1. Define routes with typed parameters and Zod-validated search params
2. Add route loaders for data fetching with built-in caching
3. Configure `<Link>` components with type-checked params and search params
4. Enable prefetching on hover for instant navigation

**Output:** A fully typed routing layer where invalid params cause TypeScript errors at compile time.

## Guidelines

- Use query key factories for consistent cache keys: `const userKeys = { all: ["users"], detail: (id) => ["users", id] }`.
- Set `staleTime` based on data freshness needs: 0 for real-time, 5 minutes for dashboards, Infinity for static data.
- Always define `onError` for mutations; silent failures confuse users.
- Use `placeholderData` instead of `initialData` for loading states; placeholder does not write to cache.
- Use TanStack Table with `@tanstack/react-virtual` for large datasets; do not render thousands of DOM nodes.
- Keep query functions pure: they receive `queryKey` and return data with no side effects.
- Use `queryClient.invalidateQueries()` after mutations instead of manual cache updates for simplicity.
