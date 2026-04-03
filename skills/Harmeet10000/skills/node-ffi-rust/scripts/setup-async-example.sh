#!/usr/bin/env bash
# Example: Async task to prevent event loop blocking

set -e

PROJECT_NAME="${1:-node-rust-async-example}"
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

cargo init --lib --name "${PROJECT_NAME//-/_}"

# Create Cargo.toml
cat > Cargo.toml << 'EOF'
[package]
name = "node_rust_async_example"
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

# Create Rust source with async task
cat > src/lib.rs << 'EOF'
use napi::{Env, Result, Task};
use napi_derive::napi;

struct ComputeTask {
    n: u32,
}

impl Task for ComputeTask {
    type Output = u64;
    type JsValue = napi::JsNumber;

    fn compute(&mut self) -> Result<Self::Output> {
        // CPU-intensive work (doesn't block event loop)
        Ok((0..self.n).fold(0, |acc, i| acc + i as u64))
    }

    fn resolve(self, env: Env, output: Self::Output) -> Result<Self::JsValue> {
        env.create_bigint_from_u64(output)
    }
}

#[napi]
pub fn expensive_computation(env: Env, n: u32) -> Result<napi::Object> {
    env.spawn(ComputeTask { n })
}

// Blocking version (for comparison)
#[napi]
pub fn expensive_computation_blocking(n: u32) -> u64 {
    (0..n).fold(0, |acc, i| acc + i as u64)
}
EOF

# Create package.json
cat > package.json << 'EOF'
{
  "name": "node-rust-async-example",
  "version": "1.0.0",
  "main": "index.js",
  "nativeBinding": "./index.node",
  "scripts": {
    "build": "napi build --release",
    "dev": "npm run build && node index.js"
  },
  "devDependencies": {
    "@napi-rs/cli": "^2.0.0"
  }
}
EOF

# Create test script
cat > index.js << 'EOF'
const binding = require('./index.node');

console.log('Testing async vs blocking:');

// Async (non-blocking)
console.log('\n1. Async computation (non-blocking):');
const start1 = Date.now();
binding.expensiveComputation(1_000_000_000).then(result => {
    const time = Date.now() - start1;
    console.log(`Result: ${result}, Time: ${time}ms`);
});

// Meanwhile, event loop is free
console.log('Event loop is responsive...');
setTimeout(() => {
    console.log('This runs immediately (not blocked)');
}, 10);

// Blocking (for comparison - DON'T DO THIS)
console.log('\n2. Blocking computation (blocks event loop):');
const start2 = Date.now();
const result = binding.expensiveComputationBlocking(1_000_000_000);
const time = Date.now() - start2;
console.log(`Result: ${result}, Time: ${time}ms`);
console.log('Event loop was frozen during computation');
EOF

echo "✓ Async example created: $PROJECT_NAME"
echo ""
echo "Next steps:"
echo "  cd $PROJECT_NAME"
echo "  npm install"
echo "  npm run dev"
