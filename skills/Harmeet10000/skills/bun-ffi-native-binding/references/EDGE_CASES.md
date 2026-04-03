# Edge Cases & Sharp Corners

Critical gotchas when building Bun FFI bindings.

## 1. Exception Boundaries

**Problem**: Native panics crash the entire runtime.

**Wrong:**
```zig
pub fn divide(a: i32, b: i32) i32 {
    return a / b; // panics on b=0
}
```

**Correct:**
```zig
pub fn divide(global: *jsc.JSGlobalObject, a: i32, b: i32) !i32 {
    if (b == 0) {
        return global.throwPretty("Division by zero", .{});
    }
    return a / b;
}
```

**Rule**: Always catch errors and convert to JS exceptions via `global.throwPretty()`.

---

## 2. Memory Ownership

**Problem**: Unclear who owns/frees allocated memory.

**Bad:**
```zig
pub fn allocateBuffer() [*]u8 {
    var buf = allocator.alloc(u8, 1024);
    return buf.ptr; // JS has no way to free this
}
```

**Good Option 1 — Return JS object:**
```zig
pub fn allocateBuffer(global: *jsc.JSGlobalObject) !*jsc.JSValue {
    var buf = allocator.alloc(u8, 1024);
    return global.createArrayBuffer(buf);
}
```

**Good Option 2 — Provide free function:**
```zig
pub fn freeBuffer(ptr: [*]u8, len: usize) void {
    allocator.free(ptr[0..len]);
}
```

**Rule**: Either return JS-managed objects or expose explicit `free()` APIs.

---

## 3. Struct Alignment

**Problem**: JS engines assume specific memory layouts.

**Wrong:**
```zig
const Point = struct {
    x: f64,
    y: u8, // misaligned
};
```

**Correct:**
```zig
const Point = struct {
    x: f64,
    y: f64, // aligned
};
```

**Rule**: Avoid passing structs directly. Use primitive parameters or typed arrays.

---

## 4. GC Interaction

**Problem**: JS garbage collector may move/free objects while native code holds references.

**Wrong:**
```zig
var jsRef: *jsc.JSValue = undefined;

pub fn storeRef(ref: *jsc.JSValue) void {
    jsRef = ref; // GC may free this later
}
```

**Correct:**
```zig
pub fn processRef(ref: *jsc.JSValue) !void {
    // Use ref immediately, don't store
    // Or use JSValueProtect/JSValueUnprotect
}
```

**Rule**: Never hold raw JS references across async boundaries. Pin if necessary.

---

## 5. Thread Safety

**Problem**: Bun runs on an event loop. Spawning threads that call JS functions crashes the runtime.

**Wrong:**
```zig
pub fn asyncWork() void {
    var thread = try std.Thread.spawn(.{}, fn() {
        global.callFunction(...); // CRASH
    });
}
```

**Correct:**
```zig
pub fn asyncWork(global: *jsc.JSGlobalObject) !void {
    // Do work in native thread
    var result = expensiveComputation();
    
    // Route callback through event loop
    global.scheduleCallback(fn() {
        global.callFunction(...); // Safe
    });
}
```

**Rule**: Never call JS functions from spawned threads. Use event loop callbacks.

---

## 6. ABI Compatibility

**Problem**: Calling convention mismatch between Zig and C.

**Wrong:**
```zig
pub fn myFunction(a: i32) i32 {
    return a * 2;
}
```

**Correct:**
```zig
pub fn myFunction(a: i32) callconv(.C) i32 {
    return a * 2;
}
```

**Rule**: Always use `callconv(.C)` for C interop.

---

## 7. Type Mismatches

**Problem**: Zig types don't map cleanly to JS types.

**Zig → JS Mapping:**
- `i32` → `number`
- `f64` → `number`
- `bool` → `boolean`
- `[*]u8` → `Uint8Array`
- `[]const u8` → `string` (UTF-8)

**Wrong:**
```zig
pub fn process(data: [*]u8) void { } // Ambiguous length
```

**Correct:**
```zig
pub fn process(data: [*]u8, len: usize) void { } // Explicit length
```

**Rule**: Always pass length for pointers. Use typed arrays for buffers.

---

## 8. Async Boundaries

**Problem**: Native code can't await JS promises.

**Wrong:**
```zig
pub fn fetchData() !*jsc.JSValue {
    var promise = global.callFunction(fetchFn);
    // Can't await here
    return promise;
}
```

**Correct:**
```zig
pub fn fetchData(global: *jsc.JSGlobalObject, callback: *jsc.JSValue) !void {
    var promise = global.callFunction(fetchFn);
    promise.then(callback); // Chain callback
}
```

**Rule**: Use callbacks or return promises, don't try to await in native code.

---

## 9. Performance Cliffs

**Problem**: Unexpected slowdowns from hidden allocations.

**Slow:**
```zig
pub fn process(data: [*]u8, len: usize) !void {
    var buf = try allocator.alloc(u8, len); // Per-call allocation
    defer allocator.free(buf);
    // ...
}
```

**Fast:**
```zig
var buffer: [4096]u8 = undefined;

pub fn process(data: [*]u8, len: usize) !void {
    // Reuse stack buffer
    @memcpy(buffer[0..len], data[0..len]);
}
```

**Rule**: Profile allocations. Reuse buffers. Use stack when possible.

---

## 10. Version Stability

**Problem**: Changing struct layouts breaks consumers.

**Bad:**
```zig
pub const Config = struct {
    timeout: u32,
    retries: u32,
    // Added new field — breaks ABI
    maxConnections: u32,
};
```

**Good:**
```zig
pub const ConfigV1 = struct {
    timeout: u32,
    retries: u32,
};

pub const ConfigV2 = struct {
    timeout: u32,
    retries: u32,
    maxConnections: u32,
};
```

**Rule**: Version your APIs. Never modify struct layouts in-place.
