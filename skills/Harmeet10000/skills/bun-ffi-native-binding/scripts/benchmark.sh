#!/usr/bin/env bash
# Benchmark: Measure FFI overhead vs pure JS

set -e

PROJECT_NAME="${1:-bun-ffi-benchmark}"
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

bun init -y

# Create C library
mkdir -p src/c build

cat > src/c/bench.c << 'EOF'
#include <stdint.h>

// Tight loop in C
uint64_t sum_loop(uint32_t iterations) {
    uint64_t sum = 0;
    for (uint32_t i = 0; i < iterations; i++) {
        sum += i;
    }
    return sum;
}

// Array processing
uint32_t sum_array(const uint32_t *data, size_t len) {
    uint32_t sum = 0;
    for (size_t i = 0; i < len; i++) {
        sum += data[i];
    }
    return sum;
}
EOF

# Compile
cat > build.sh << 'EOF'
#!/bin/bash
gcc -shared -fPIC -O3 src/c/bench.c -o build/libbench.so
EOF

chmod +x build.sh

# Create benchmark
cat > benchmark.ts << 'EOF'
import { dlopen, FFIType } from "bun:ffi";

const lib = dlopen("./build/libbench.so", {
  sum_loop: {
    args: [FFIType.u32],
    returns: FFIType.u64,
  },
  sum_array: {
    args: [FFIType.ptr, FFIType.usize],
    returns: FFIType.u32,
  },
});

// Benchmark 1: Function call overhead
console.log("=== Benchmark 1: Call Overhead ===");

const iterations = 1_000_000;
const warmup = 10_000;

// Warmup
for (let i = 0; i < warmup; i++) {
  lib.symbols.sum_loop(100);
}

// Measure C FFI
const start1 = performance.now();
for (let i = 0; i < iterations; i++) {
  lib.symbols.sum_loop(100);
}
const c_time = performance.now() - start1;

// Measure pure JS
const start2 = performance.now();
for (let i = 0; i < iterations; i++) {
  let sum = 0;
  for (let j = 0; j < 100; j++) {
    sum += j;
  }
}
const js_time = performance.now() - start2;

console.log(`C FFI (1M calls):  ${c_time.toFixed(2)}ms`);
console.log(`Pure JS (1M calls): ${js_time.toFixed(2)}ms`);
console.log(`Overhead per call: ${((c_time - js_time) / iterations * 1000).toFixed(2)}µs`);

// Benchmark 2: Array processing
console.log("\n=== Benchmark 2: Array Processing ===");

const sizes = [100, 1000, 10000];

for (const size of sizes) {
  const data = new Uint32Array(size);
  for (let i = 0; i < size; i++) {
    data[i] = i;
  }

  // C FFI
  const start3 = performance.now();
  for (let i = 0; i < 10000; i++) {
    lib.symbols.sum_array(data, data.length);
  }
  const c_array_time = performance.now() - start3;

  // Pure JS
  const start4 = performance.now();
  for (let i = 0; i < 10000; i++) {
    let sum = 0;
    for (let j = 0; j < size; j++) {
      sum += data[j];
    }
  }
  const js_array_time = performance.now() - start4;

  console.log(`\nArray size: ${size}`);
  console.log(`  C FFI:   ${c_array_time.toFixed(2)}ms`);
  console.log(`  Pure JS: ${js_array_time.toFixed(2)}ms`);
  console.log(`  Speedup: ${(js_array_time / c_array_time).toFixed(2)}x`);
}

console.log("\n=== Insights ===");
console.log("- Small functions: JS overhead dominates");
console.log("- Large arrays: C wins significantly");
console.log("- Batch operations: Minimize FFI calls");
EOF

cat > package.json << 'EOF'
{
  "name": "bun-ffi-benchmark",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "./build.sh",
    "bench": "bun run benchmark.ts"
  }
}
EOF

echo "✓ Benchmark project created: $PROJECT_NAME"
echo ""
echo "Next steps:"
echo "  cd $PROJECT_NAME"
echo "  bun install"
echo "  ./build.sh"
echo "  bun run bench"
