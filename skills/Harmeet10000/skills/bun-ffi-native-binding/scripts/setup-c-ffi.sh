#!/usr/bin/env bash
# Example: C FFI with dynamic library loading

set -e

PROJECT_NAME="${1:-bun-c-ffi-example}"
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Initialize Bun project
bun init -y

# Create directory structure
mkdir -p src/{c,ts} build

# Create C source file
cat > src/c/crypto.c << 'EOF'
#include <stdint.h>
#include <string.h>

// Simple XOR cipher for demonstration
void xor_cipher(uint8_t *data, size_t len, uint8_t key) {
    for (size_t i = 0; i < len; i++) {
        data[i] ^= key;
    }
}

// Calculate checksum
uint32_t checksum(const uint8_t *data, size_t len) {
    uint32_t sum = 0;
    for (size_t i = 0; i < len; i++) {
        sum += data[i];
    }
    return sum;
}

// Reverse bytes in buffer
void reverse_buffer(uint8_t *data, size_t len) {
    for (size_t i = 0; i < len / 2; i++) {
        uint8_t tmp = data[i];
        data[i] = data[len - 1 - i];
        data[len - 1 - i] = tmp;
    }
}
EOF

# Compile C library
cat > build.sh << 'EOF'
#!/bin/bash
set -e

echo "Building C FFI library..."

# Compile to shared library
gcc -shared -fPIC -O2 \
  src/c/crypto.c \
  -o build/libcrypto.so

echo "✓ Built build/libcrypto.so"
echo "Run: bun run index.ts"
EOF

chmod +x build.sh

# Create TypeScript FFI loader
cat > index.ts << 'EOF'
import { dlopen, FFIType } from "bun:ffi";

// Load the C library
const lib = dlopen("./build/libcrypto.so", {
  xor_cipher: {
    args: [FFIType.ptr, FFIType.usize, FFIType.u8],
    returns: FFIType.void,
  },
  checksum: {
    args: [FFIType.ptr, FFIType.usize],
    returns: FFIType.u32,
  },
  reverse_buffer: {
    args: [FFIType.ptr, FFIType.usize],
    returns: FFIType.void,
  },
});

console.log("Testing C FFI:");

// Test 1: XOR cipher
const data1 = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
console.log(`Original: ${new TextDecoder().decode(data1)}`);
lib.symbols.xor_cipher(data1, data1.length, 42);
console.log(`XOR encrypted: ${Array.from(data1).join(",")}`);
lib.symbols.xor_cipher(data1, data1.length, 42); // Decrypt
console.log(`Decrypted: ${new TextDecoder().decode(data1)}`);

// Test 2: Checksum
const data2 = new Uint8Array([1, 2, 3, 4, 5]);
const sum = lib.symbols.checksum(data2, data2.length);
console.log(`\nChecksum of [1,2,3,4,5]: ${sum}`);

// Test 3: Reverse buffer
const data3 = new Uint8Array([1, 2, 3, 4, 5]);
console.log(`\nBefore reverse: ${Array.from(data3).join(",")}`);
lib.symbols.reverse_buffer(data3, data3.length);
console.log(`After reverse: ${Array.from(data3).join(",")}`);
EOF

# Create package.json
cat > package.json << 'EOF'
{
  "name": "bun-c-ffi-example",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "./build.sh",
    "dev": "bun run --watch index.ts",
    "start": "bun run index.ts"
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
