# Svelte 5 Runes

## Reactivity
```svelte
<script>
let count = $state(0);
let doubled = $derived(count * 2);
$effect(() => { console.log('Count:', count); });
</script>
<button onclick={() => count++}>{count} (doubled: {doubled})</button>
```

## Props
```svelte
<script>
let { name, age = 25 }: { name: string; age?: number } = $props();
</script>
```

## Stores (shared state)
```typescript
// stores.svelte.ts
class CounterStore {
    count = $state(0);
    increment() { this.count++; }
}
export const counter = new CounterStore();
```
