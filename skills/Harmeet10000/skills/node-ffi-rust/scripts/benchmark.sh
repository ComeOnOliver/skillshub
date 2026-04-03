#!/usr/bin/env bash
# Benchmark: Measure FFI overhead vs pure JS

set -e

PROJECT_NAME="${1:-node-rust-benchmark}"
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

cargo init --lib --name "${PROJECT_NAME//-/_}"

# Create Cargo.toml
cat > Cargo.toml << 'EOF'
[package]
name = "node_rust_benchmark"
version = "0.1.0"
edition = "2021"

[dependencies]
napi = { version = "2", features = ["napi8"] }
napi-derive = "2"

[lib]
crate-type = ["cdylib"]

[profile.release]
lto = true
opt-level = 3
EOF

# Create Rust source
cat > src/lib.rs << 'EOF'
use napi_derive::napi;

#[napi]
pub fn sum_loop(iterations: u32) -> u64 {
    let mut sum: u64 = 0;
    for i in 0..iterations {
        sum += i as u64;
    }
    sum
}

#[napi]
pub fn sum_array(data: Vec<u32>) -> u32 {
    data.iter().sum()
}

#[napi]
pub fn process_buffer(data: Vec<u8>) -> Vec<u8> {
    data.iter().map(|b| b.wrapping_add(1)).collect()
}
EOF

# Create package.json
cat > package.json << 'EOF'
{
  "name": "node-rust-benchmark",
  "version": "1.0.0",
  "main": "benchmark.js",
  "nativeBinding": "./index.node",
  "scripts": {
    "build": "napi build --release",
    "bench": "npm run build && node benchmark.js"
  },
  "devDependencies": {
    "@napi-rs/cli": "^2.0.0"
  }
}
EOF

# Create benchmark script
cat > benchmark.js << 'EOF'
const binding = require('./index.node');

console.log('=== Benchmark 1: Call Overhead ===\n');

const iterations = 1_000_000;
const warmup = 10_000;

// Warmup
for (let i = 0; i < warmup; i++) {
  binding.sumLoop(100);
}

// Measure Rust FFI
const start1 = performance.now();
for (let i = 0; i < iterations; i++) {
  binding.sumLoop(100);
}
const rust_time = performance.now() - start1;

// Measure pure JS
const start2 = performance.now();
for (let i = 0; i < iterations; i++) {
  let sum = 0;
  for (let j = 0; j < 100; j++) {
    sum += j;
  }
}
const js_time = performance.now() - start2;

console.log(`Rust FFI (1M calls):  ${rust_time.toFixed(2)}ms`);
console.log(`Pure JS (1M calls):   ${js_time.toFixed(2)}ms`);
console.log(`Overhead per call:    ${((rust_time - js_time) / iterations * 1000).toFixed(2)}µs`);

// Benchmark 2: Array processing
console.log('\n=== Benchmark 2: Array Processing ===\n');

const sizes = [100, 1000, 10000];

for (const size of sizes) {
  const data = new Array(size).fill(0).map((_, i) => i);

  // Rust FFI
  const start3 = performance.now();
  for (let i = 0; i < 10000; i++) {
    binding.sumArray(data);
  }
  const rust_array_time = performance.now() - start3;

  // Pure JS
  const start4 = performance.now();
  for (let i = 0; i < 10000; i++) {
    let sum = 0;
    for (let j = 0; j < size; j++) {
      sum += data[j];
    }
  }
  const js_array_time = performance.now() - start4;

  console.log(`Array size: ${size}`);
  console.log(`  Rust FFI: ${rust_array_time.toFixed(2)}ms`);
  console.log(`  Pure JS:  ${js_array_time.toFixed(2)}ms`);
  console.log(`  Speedup:  ${(js_array_time / rust_array_time).toFixed(2)}x\n`);
}

// Benchmark 3: Buffer processing
console.log('=== Benchmark 3: Buffer Processing ===\n');

const buffer_sizes = [1024, 10240, 102400];

for (const size of buffer_sizes) {
  const buffer = Buffer.alloc(size);
  for (let i = 0; i < size; i++) {
    buffer[i] = i % 256;
  }

  // Rust FFI
  const start5 = performance.now();
  for (let i = 0; i < 1000; i++) {
    binding.processBuffer(buffer);
  }
  const rust_buffer_time = performance.now() - start5;

  // Pure JS
  const start6 = performance.now();
  for (let i = 0; i < 1000; i++) {
    const result = Buffer.alloc(size);
    for (let j = 0; j < size; j++) {
      result[j] = (buffer[j] + 1) & 0xFF;
    }
  }
  const js_buffer_time = performance.now() - start6;

  console.log(`Buffer size: ${size} bytes`);
  console.log(`  Rust FFI: ${rust_buffer_time.toFixed(2)}ms`);
  console.log(`  Pure JS:  ${js_buffer_time.toFixed(2)}ms`);
  console.log(`  Speedup:  ${(js_buffer_time / rust_buffer_time).toFixed(2)}x\n`);
}

console.log('=== Insights ===');
console.log('- Small functions: JS overhead dominates');
console.log('- Large arrays: Rust wins significantly');
console.log('- Batch operations: Minimize FFI calls');
console.log('- Buffer processing: Rust excels with large payloads');
EOF

echo "✓ Benchmark project created: $PROJECT_NAME"
echo ""
echo "Next steps:"
echo "  cd $PROJECT_NAME"
echo "  npm install"
echo "  npm run bench"
