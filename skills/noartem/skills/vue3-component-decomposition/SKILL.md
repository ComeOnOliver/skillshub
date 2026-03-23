# Vue 3 Component Decomposition

Break large Vue 3 components into smaller, testable units without losing readability.

## When to Use

- Component is handling multiple concerns (UI rendering, fetching, form logic, filtering, side effects)
- `setup()` or `<script setup>` grows hard to scan
- Template contains complex expressions or repeated blocks
- Changes in one feature frequently break unrelated behavior

## Decomposition Workflow

1. Map responsibilities before moving code:
   - `view` (markup/presentational)
   - `state` (refs/reactive/computed)
   - `effects` (watch/watchEffect/lifecycle)
   - `io` (API calls)
2. Extract presentational subcomponents first.
3. Define explicit interfaces between parent and child (`props`, `emits`, `slots`).
4. Extract reusable stateful logic into composables.
5. Keep the parent as orchestrator of data flow and feature composition.

## Component Best Practices

- Use one component per file and multi-word component names.
- Keep template expressions simple; move complex expressions to computed values.
- Use `:key` with `v-for` and do not combine `v-if` with `v-for` on the same element.
- Use typed, explicit prop contracts and typed emits.
- Prefer `slots` for variable UI regions over boolean prop explosion.
- Keep child components focused on one UI concern.

## Composable Best Practices

- Name composables with `use` prefix (`useOrdersTable`, `useUserFilters`).
- Return a plain object of refs/computed/methods so destructuring preserves reactivity.
- Accept reactive inputs (value/ref/getter) and normalize with `toValue()`.
- If logic depends on reactive inputs, call `toValue()` in `watchEffect()` (or watch refs/getters directly).
- Perform DOM side effects in `onMounted()` and always clean up in `onUnmounted()`.
- Avoid hidden global mutable state unless intentionally building shared state.

## Suggested Structure

```text
src/
  components/
    feature/
      OrdersPage.vue               # orchestrator
      OrdersToolbar.vue            # presentational controls
      OrdersTable.vue              # table rendering
      OrdersTableRow.vue           # row rendering
  composables/
    useOrdersQuery.ts              # fetch/pagination/sort
    useOrdersFilters.ts            # filter state and derived query
    useOrdersSelection.ts          # row selection logic
```

## Guardrails

- Do not extract tiny wrappers with no independent value.
- Do not create "god composables"; split by business capability.
- Do not pass entire parent state into children; pass only required props.
- Do not mix business logic into presentational components.

## PR Checklist

- Parent component reads as feature orchestration, not implementation dump.
- Children have clear APIs and can be reasoned about in isolation.
- Composables have focused responsibilities and predictable return shapes.
- Side effects are cleaned up and SSR-safe.
- Template complexity is reduced and tests can target smaller units.

## References

- Vue docs: Composables - https://vuejs.org/guide/reusability/composables.html
- Vue style guide (outdated but still useful):
  - https://vuejs.org/style-guide/rules-essential.html
  - https://vuejs.org/style-guide/rules-strongly-recommended.html
