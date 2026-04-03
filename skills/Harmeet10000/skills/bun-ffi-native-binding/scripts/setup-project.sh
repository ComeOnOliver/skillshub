#!/usr/bin/env bash
# Example: Set up a Bun + Zig FFI project from scratch

set -e

PROJECT_NAME="${1:-bun-ffi-example}"
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Initialize Bun project
bun init -y

# Add Zig build tools
bun add -d @zig/build

# Create directory structure
mkdir -p src/{zig,ts} build

# Create Zig source file
cat > src/zig/math.zig << 'EOF'
const std = @import("std");
const jsc = @import("jsc");

pub fn add(global: *jsc.JSGlobalObject, a: i32, b: i32) !i32 {
    return std.math.add(i32, a, b) catch {
        return global.throwPretty("Integer overflow", .{});
    };
}

pub fn multiply(global: *jsc.JSGlobalObject, a: i32, b: i32) !i32 {
    return std.math.mul(i32, a, b) catch {
        return global.throwPretty("Integer overflow", .{});
    };
}

pub fn sumArray(ptr: [*]u32, len: usize) callconv(.C) u32 {
    var sum: u32 = 0;
    for (0..len) |i| {
        sum +|= ptr[i];
    }
    return sum;
}
EOF

# Create TypeScript bindings
cat > src/ts/bindings.ts << 'EOF'
import { t, fn } from "bindgen";

export const add = fn({
  args: { global: t.globalObject, a: t.i32, b: t.i32 },
  ret: t.i32,
});

export const multiply = fn({
  args: { global: t.globalObject, a: t.i32, b: t.i32 },
  ret: t.i32,
});

export const sumArray = fn({
  args: { ptr: t.pointer(t.u32), len: t.usize },
  ret: t.u32,
});
EOF

# Create main index file
cat > index.ts << 'EOF'
import { add, multiply, sumArray } from "bun:math";

console.log("Testing Bun FFI with Zig:");
console.log(`add(5, 3) = ${add(5, 3)}`);
console.log(`multiply(5, 3) = ${multiply(5, 3)}`);

const data = new Uint32Array([1, 2, 3, 4, 5]);
console.log(`sumArray([1,2,3,4,5]) = ${sumArray(data, data.length)}`);
EOF

# Create build script
cat > build.sh << 'EOF'
#!/bin/bash
set -e

echo "Building Zig FFI module..."

# Compile Zig to shared library
zig build-lib src/zig/math.zig \
  -dynamic \
  -fPIC \
  -O ReleaseFast \
  -femit-bin=build/libmath.so

echo "✓ Built build/libmath.so"
echo "Run: bun run index.ts"
EOF

chmod +x build.sh

# Create package.json scripts
cat > package.json << 'EOF'
{
  "name": "bun-ffi-example",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "./build.sh",
    "dev": "bun run --watch index.ts",
    "start": "bun run index.ts"
  },
  "devDependencies": {
    "@zig/build": "latest"
  }
}
EOF

echo "✓ Project created: $PROJECT_NAME"
echo ""
echo "Next steps:"
echo "  cd $PROJECT_NAME"
echo "  bun install"
echo "  ./build.sh"
echo "  bun run index.ts"
