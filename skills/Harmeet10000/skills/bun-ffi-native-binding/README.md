# Bun FFI Native Binding Skill

Production-grade skill for building high-performance native modules in JavaScript using Bun's FFI (Foreign Function Interface).

## Structure

```
bun-ffi-native-binding/
├── SKILL.md                          # Main skill instructions
├── references/
│   ├── EDGE_CASES.md                # 10 critical gotchas & solutions
│   └── COMPLETE_SDK_REFERENCE.md    # Full API reference & benchmarks
└── scripts/
    ├── setup-project.sh             # Zig bindgen project template
    ├── setup-c-ffi.sh               # C FFI project template
    └── benchmark.sh                 # Performance measurement script
```

## Quick Start

### Zig Bindgen (Recommended)

```bash
bash scripts/setup-project.sh my-project
cd my-project
./build.sh
bun run index.ts
```

### C FFI

```bash
bash scripts/setup-c-ffi.sh my-project
cd my-project
./build.sh
bun run index.ts
```

### Benchmark

```bash
bash scripts/benchmark.sh
cd bun-ffi-benchmark
./build.sh
bun run bench
```

## Key Concepts

**Bridge Cost**: 10-100ns per FFI call. Minimize calls by batching.

**Data Conversion**: Use typed arrays for zero-copy buffer passing.

**Exception Safety**: Always convert native panics to JS exceptions.

**Memory Ownership**: Either return JS objects or provide explicit `free()` APIs.

## When to Use This Skill

- Optimizing compute-intensive hot paths
- Integrating system libraries or hardware
- Processing large arrays/buffers
- Wrapping legacy C/Zig code

## When NOT to Use

- Simple string/number operations (JS is fast enough)
- Frequent tiny function calls (bridge overhead dominates)
- Prototyping (complexity not worth it yet)

## Strategic Edge

The real power isn't just speed—it's **architectural clarity**. By explicitly separating compute-heavy logic into native code, you:

1. **Isolate performance-critical paths** — easier to profile and optimize
2. **Enforce data boundaries** — typed arrays make memory contracts explicit
3. **Prevent event loop blocking** — native code runs without yielding
4. **Enable zero-copy operations** — direct memory access for large datasets

Most engineers treat FFI as a last resort. The chosen ones use it strategically from day one, designing APIs that naturally batch operations and minimize boundary crossings. This is how you build systems that scale.

## References

- [SKILL.md](SKILL.md) — Main instructions
- [EDGE_CASES.md](references/EDGE_CASES.md) — Critical gotchas
- [COMPLETE_SDK_REFERENCE.md](references/COMPLETE_SDK_REFERENCE.md) — Full API reference
- [Bun FFI Docs](https://bun.sh/docs/ffi)
- [Zig Language](https://ziglang.org/)
