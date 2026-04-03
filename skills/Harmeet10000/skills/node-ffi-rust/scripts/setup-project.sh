#!/usr/bin/env bash
# Setup: Node.js + Rust FFI project template

set -e

PROJECT_NAME="${1:-node-rust-ffi-example}"
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Initialize Rust library
cargo init --lib --name "${PROJECT_NAME//-/_}"

# Create Cargo.toml
cat > Cargo.toml << 'EOF'
[package]
name = "node_rust_ffi_example"
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
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[napi]
pub fn multiply(a: i32, b: i32) -> i32 {
    a * b
}

#[napi]
pub fn process_buffer(data: Vec<u8>) -> Vec<u8> {
    data.iter().map(|b| b.wrapping_add(1)).collect()
}

#[napi]
pub fn sum_array(data: Vec<u32>) -> u32 {
    data.iter().sum()
}

#[napi(object)]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

#[napi]
pub fn distance(p1: Point, p2: Point) -> f64 {
    let dx = p1.x - p2.x;
    let dy = p1.y - p2.y;
    (dx * dx + dy * dy).sqrt()
}
EOF

# Create package.json
cat > package.json << 'EOF'
{
  "name": "node-rust-ffi-example",
  "version": "1.0.0",
  "main": "index.js",
  "nativeBinding": "./index.node",
  "scripts": {
    "build": "napi build --release",
    "build:debug": "napi build",
    "dev": "npm run build:debug && node index.js",
    "start": "npm run build && node index.js"
  },
  "devDependencies": {
    "@napi-rs/cli": "^2.0.0"
  },
  "napi": {
    "binaryName": "index",
    "targets": [
      "x86_64-unknown-linux-gnu",
      "aarch64-unknown-linux-gnu",
      "x86_64-apple-darwin",
      "aarch64-apple-darwin",
      "x86_64-pc-windows-msvc"
    ]
  }
}
EOF

# Create index.js
cat > index.js << 'EOF'
const binding = require('./index.node');

console.log('Testing Node.js + Rust FFI:');
console.log(`add(5, 3) = ${binding.add(5, 3)}`);
console.log(`multiply(5, 3) = ${binding.multiply(5, 3)}`);

const buffer = Buffer.from([1, 2, 3, 4, 5]);
console.log(`processBuffer([1,2,3,4,5]) = ${binding.processBuffer(buffer)}`);

const data = [1, 2, 3, 4, 5];
console.log(`sumArray([1,2,3,4,5]) = ${binding.sumArray(data)}`);

const p1 = { x: 0, y: 0 };
const p2 = { x: 3, y: 4 };
console.log(`distance((0,0), (3,4)) = ${binding.distance(p1, p2)}`);
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
/target
*.node
node_modules/
*.swp
*.swo
.DS_Store
EOF

echo "✓ Project created: $PROJECT_NAME"
echo ""
echo "Next steps:"
echo "  cd $PROJECT_NAME"
echo "  npm install"
echo "  npm run dev"
