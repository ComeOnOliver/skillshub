# Complete Bun FFI SDK Reference

## Zig Bindgen Types

### Primitive Types

```ts
import { t } from "bindgen";

t.i8, t.i16, t.i32, t.i64      // signed integers
t.u8, t.u16, t.u32, t.u64      // unsigned integers
t.f32, t.f64                    // floats
t.bool                          // boolean
t.void                          // void return
t.cstring                       // C string (null-terminated)
t.ptr                           // generic pointer
t.globalObject                  // JSGlobalObject
```

### Complex Types

```ts
t.array(t.i32, 10)             // fixed array
t.struct({                      // struct
  x: t.f64,
  y: t.f64,
})
t.pointer(t.u8)                // pointer to type
```

### Function Definition

```ts
import { fn } from "bindgen";

export const myFunc = fn({
  args: {
    global: t.globalObject,
    value: t.i32,
    data: t.pointer(t.u8),
  },
  ret: t.i32,
});
```

---

## C FFI (bun:ffi)

### FFIType Enum

```ts
import { FFIType } from "bun:ffi";

FFIType.i8, FFIType.i16, FFIType.i32, FFIType.i64
FFIType.u8, FFIType.u16, FFIType.u32, FFIType.u64
FFIType.f32, FFIType.f64
FFIType.bool
FFIType.void
FFIType.cstring
FFIType.ptr
FFIType.function
```

### dlopen() API

```ts
import { dlopen, FFIType } from "bun:ffi";

const lib = dlopen("./lib.so", {
  functionName: {
    args: [FFIType.i32, FFIType.i32],
    returns: FFIType.i32,
  },
});

lib.symbols.functionName(1, 2);
```

### Typed Arrays

```ts
// Zero-copy buffer passing
const buffer = new Uint8Array(1024);
lib.symbols.processBuffer(buffer, buffer.length);

// Supported typed arrays
Uint8Array, Int8Array
Uint16Array, Int16Array
Uint32Array, Int32Array
Float32Array, Float64Array
BigUint64Array, BigInt64Array
```

---

## Zig JSC API (Partial)

### Global Object

```zig
pub fn myFunc(global: *jsc.JSGlobalObject) !void {
    // Create values
    var num = global.createNumber(42);
    var str = global.createString("hello");
    var obj = global.createObject();
    
    // Call functions
    var result = global.callFunction(fn, args);
    
    // Throw exceptions
    return global.throwPretty("Error message", .{});
}
```

### Memory Management

```zig
// Allocate JS-managed buffer
var buf = try global.createArrayBuffer(data);

// Protect from GC
global.protectValue(jsValue);
global.unprotectValue(jsValue);
```

---

## Performance Benchmarks

### Bridge Overhead (Bun 1.0+)

| Operation | Time |
|-----------|------|
| Simple call (i32 → i32) | ~20ns |
| With typed array (1KB) | ~100ns |
| With struct marshaling | ~500ns |
| With string conversion | ~1µs |

### Optimization Impact

| Technique | Speedup |
|-----------|---------|
| Batch 100 calls → 1 call | 100x |
| Typed array vs JSON | 10x |
| Stack buffer vs heap | 5x |
| Reuse buffer vs allocate | 3x |

---

## Common Patterns

### Pattern 1: Batch Processing

```ts
// JS side
const data = new Uint32Array([1, 2, 3, 4, 5]);
const sum = lib.symbols.sumArray(data, data.length);
```

```zig
// Zig side
pub fn sumArray(ptr: [*]u32, len: usize) callconv(.C) u32 {
    var sum: u32 = 0;
    for (0..len) |i| {
        sum +|= ptr[i];
    }
    return sum;
}
```

### Pattern 2: Error Handling

```ts
// JS side
try {
    lib.symbols.riskyOperation();
} catch (e) {
    console.error(e.message);
}
```

```zig
// Zig side
pub fn riskyOperation(global: *jsc.JSGlobalObject) !void {
    if (someError) {
        return global.throwPretty("Operation failed", .{});
    }
}
```

### Pattern 3: Callback

```ts
// JS side
const callback = (result) => console.log(result);
lib.symbols.asyncWork(callback);
```

```zig
// Zig side
pub fn asyncWork(global: *jsc.JSGlobalObject, cb: *jsc.JSValue) !void {
    var result = expensiveComputation();
    global.scheduleCallback(fn() {
        global.callFunction(cb, .{result});
    });
}
```

---

## Debugging

### Enable Tracing

```bash
BUN_DEBUG_FFI=1 bun run index.ts
```

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `SIGSEGV` | Null pointer dereference | Check pointer validity |
| `SIGABRT` | Panic in native code | Add error handling |
| `Type mismatch` | Wrong FFIType | Verify type mapping |
| `Segfault on GC` | Holding JS reference | Use callbacks instead |

---

## Resources

- [Bun FFI Docs](https://bun.sh/docs/ffi)
- [Zig Language](https://ziglang.org/)
- [JSC API Reference](https://github.com/oven-sh/bun/tree/main/src/jsc)
