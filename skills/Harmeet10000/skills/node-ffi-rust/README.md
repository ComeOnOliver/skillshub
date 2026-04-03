# Node.js FFI Rust Skill

Production-grade skill for building high-performance native modules in Node.js using Rust and N-API via napi-rs.

## Structure

```
node-ffi-rust/
├── SKILL.md                          # Main skill instructions
├── references/
│   ├── EDGE_CASES.md                # 10 critical gotchas & solutions
│   └── COMPLETE_SDK_REFERENCE.md    # Full API reference & benchmarks
└── scripts/
    ├── setup-project.sh             # Basic project template
    ├── setup-async-example.sh       # Async task example
    └── benchmark.sh                 # Performance measurement script
```

## Quick Start

### Basic Project

```bash
bash scripts/setup-project.sh my-project
cd my-project
npm install
npm run dev
```

### Async (Non-blocking)

```bash
bash scripts/setup-async-example.sh my-project
cd my-project
npm install
npm run dev
```

### Benchmark

```bash
bash scripts/benchmark.sh
cd node-rust-benchmark
npm install
npm run bench
```

## Key Concepts

**Boundary Overhead**: 100-300ns per FFI call. Minimize calls by batching.

**Event Loop Safety**: Use `napi::Task` for CPU-intensive work to prevent freezing.

**Buffer Efficiency**: Use `Buffer` for binary data, not `Vec<u8>`.

**Panic Safety**: Always wrap risky code with `catch_unwind`.

**Memory Ownership**: Use `Ref<T>` for JS objects held in Rust.

## When to Use This Skill

- CPU-intensive operations (crypto, compression, math)
- System integration (OS-level operations)
- Large data processing (batch operations)
- Event loop safety (offload blocking work)
- Wrapping existing Rust/C libraries

## When NOT to Use

- Simple string/number operations (JS is fast enough)
- Frequent tiny function calls (boundary overhead dominates)
- Prototyping (complexity not worth it yet)
- One-off scripts (build overhead not justified)

## Architecture

```
JS → V8 → N-API → Rust → N-API → V8 → JS
```

Rust runs at native speed. N-API handles type conversion and memory safety.

## Strategic Edge

The real power isn't just speed—it's **architectural clarity**. By explicitly separating compute-heavy logic into Rust:

1. **Isolate performance-critical paths** — easier to profile and optimize
2. **Prevent event loop blocking** — async tasks keep server responsive
3. **Enable zero-copy operations** — direct buffer access for large datasets
4. **Enforce type safety** — Rust's type system catches bugs at compile time

Most engineers treat FFI as a last resort. The chosen ones use it strategically from day one, designing APIs that naturally batch operations and minimize boundary crossings. This is how you build systems that scale.

## References

- [SKILL.md](SKILL.md) — Main instructions
- [EDGE_CASES.md](references/EDGE_CASES.md) — Critical gotchas
- [COMPLETE_SDK_REFERENCE.md](references/COMPLETE_SDK_REFERENCE.md) — Full API reference
- [napi-rs Docs](https://napi.rs/)
- [Node.js N-API](https://nodejs.org/api/n_api.html)
