# Edge Cases & Sharp Corners

Critical gotchas when building Node.js + Rust native modules.

## 1. Rust Panics Crossing FFI

**Problem**: Panics crash the entire Node.js process.

**Wrong:**
```rust
#[napi]
pub fn divide(a: i32, b: i32) -> i32 {
    a / b  // panics on b=0
}
```

**Correct:**
```rust
use napi::{Result, Error, Status};

#[napi]
pub fn divide(a: i32, b: i32) -> Result<i32> {
    if b == 0 {
        return Err(Error::new(Status::InvalidArg, "Division by zero"));
    }
    Ok(a / b)
}
```

**Or with catch_unwind:**
```rust
use std::panic;

#[napi]
pub fn risky_operation() -> Result<String> {
    let result = panic::catch_unwind(|| {
        // risky code
        "success".to_string()
    });
    
    match result {
        Ok(val) => Ok(val),
        Err(_) => Err(Error::new(Status::GenericFailure, "Operation panicked")),
    }
}
```

**Rule**: Always return `Result<T>`. Never let panics escape.

---

## 2. Event Loop Blocking

**Problem**: Long-running Rust code freezes the entire Node.js server.

**Wrong:**
```rust
#[napi]
pub fn expensive_computation(n: u32) -> u64 {
    // Blocks event loop for seconds
    (0..n).fold(0, |acc, i| acc + i as u64)
}
```

**Correct with napi::Task:**
```rust
use napi::Task;

struct ComputeTask {
    n: u32,
}

impl Task for ComputeTask {
    type Output = u64;
    type JsValue = napi::JsNumber;

    fn compute(&mut self) -> napi::Result<Self::Output> {
        Ok((0..self.n).fold(0, |acc, i| acc + i as u64))
    }

    fn resolve(self, env: napi::Env, output: Self::Output) -> napi::Result<Self::JsValue> {
        env.create_bigint_from_u64(output)
    }
}

#[napi]
pub fn expensive_computation(env: Env, n: u32) -> Result<Object> {
    env.spawn(ComputeTask { n })
}
```

**Or with worker threads:**
```rust
use std::thread;

#[napi]
pub fn cpu_intensive(env: Env, n: u32) -> Result<Object> {
    let (tx, rx) = std::sync::mpsc::channel();
    
    thread::spawn(move || {
        let result = (0..n).fold(0, |acc, i| acc + i as u64);
        let _ = tx.send(result);
    });
    
    env.spawn(async move {
        rx.recv().unwrap()
    })
}
```

**Rule**: Use `napi::Task` for CPU-bound work. Never block the event loop.

---

## 3. Buffer Ownership

**Problem**: Holding references to Node buffers after function returns causes use-after-free.

**Wrong:**
```rust
static mut BUFFER_REF: Option<Vec<u8>> = None;

#[napi]
pub fn store_buffer(data: Vec<u8>) {
    unsafe {
        BUFFER_REF = Some(data);  // Dangling reference
    }
}
```

**Correct Option 1 — Copy data:**
```rust
#[napi]
pub fn process_buffer(data: Vec<u8>) -> Vec<u8> {
    // Process and return new data
    data.iter().map(|b| b.wrapping_add(1)).collect()
}
```

**Correct Option 2 — Use reference:**
```rust
use napi::Ref;

#[napi]
pub fn create_reference(env: Env, data: Vec<u8>) -> Result<Ref<Vec<u8>>> {
    env.create_reference(data)
}

#[napi]
pub fn get_reference(env: Env, reference: Ref<Vec<u8>>) -> Result<Vec<u8>> {
    reference.borrow(env).map(|r| r.clone())
}
```

**Rule**: Either copy data or use `Ref<T>` for ownership. Never hold raw pointers.

---

## 4. Async Callbacks from Threads

**Problem**: Calling JS from arbitrary Rust threads crashes the runtime.

**Wrong:**
```rust
#[napi]
pub fn spawn_thread(callback: Function) -> Result<()> {
    std::thread::spawn(move || {
        callback.call(None, &[]);  // CRASH
    });
    Ok(())
}
```

**Correct:**
```rust
use napi::threadsafe_function::{ThreadsafeFunction, ThreadSafeFunctionCallMode};

#[napi]
pub fn spawn_thread(env: Env, callback: Function) -> Result<()> {
    let tsfn = callback.create_threadsafe_function(
        0,
        |ctx| {
            ctx.env.create_string("result")
        },
    )?;

    std::thread::spawn(move || {
        tsfn.call(Ok(()), ThreadSafeFunctionCallMode::Blocking);
    });

    Ok(())
}
```

**Rule**: Use `ThreadsafeFunction` for callbacks from threads. Never call JS directly from threads.

---

## 5. Cross-Platform Builds

**Problem**: Native modules must be compiled for each platform/architecture.

**Platforms needed:**
- Linux x64, arm64
- macOS x64, arm64 (Apple Silicon)
- Windows x64

**Solution 1 — Prebuilt binaries:**
```json
{
  "name": "my-native-module",
  "scripts": {
    "build": "napi build --release",
    "prepublishOnly": "npm run build"
  },
  "napi": {
    "binaryName": "index",
    "targets": ["x86_64-unknown-linux-gnu", "aarch64-unknown-linux-gnu", "x86_64-apple-darwin", "aarch64-apple-darwin", "x86_64-pc-windows-msvc"]
  }
}
```

**Solution 2 — CI/CD:**
```yaml
# .github/workflows/build.yml
jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    steps:
      - uses: actions/checkout@v3
      - uses: actions-rs/toolchain@v1
      - run: npm run build
      - uses: actions/upload-artifact@v3
```

**Rule**: Provide prebuilt binaries or use CI to build for all platforms.

---

## 6. Struct Layout & ABI Stability

**Problem**: Rust struct layouts are not stable across versions. Changing fields breaks ABI.

**Wrong:**
```rust
#[napi(object)]
pub struct Config {
    pub timeout: u32,
    pub retries: u32,
    // Added new field — breaks ABI
    pub max_connections: u32,
}
```

**Correct:**
```rust
#[napi(object)]
pub struct ConfigV1 {
    pub timeout: u32,
    pub retries: u32,
}

#[napi(object)]
pub struct ConfigV2 {
    pub timeout: u32,
    pub retries: u32,
    pub max_connections: u32,
}

#[napi]
pub fn process_config_v1(config: ConfigV1) -> String {
    format!("timeout: {}", config.timeout)
}

#[napi]
pub fn process_config_v2(config: ConfigV2) -> String {
    format!("timeout: {}, max: {}", config.timeout, config.max_connections)
}
```

**Or use repr(C):**
```rust
#[repr(C)]
pub struct StableConfig {
    pub timeout: u32,
    pub retries: u32,
}
```

**Rule**: Version your structs. Use `#[repr(C)]` for C interop. Never modify layouts in-place.

---

## 7. Type Mismatches

**Problem**: Rust types don't map cleanly to JavaScript types.

**Rust → JS Mapping:**
- `i32, u32` → `number`
- `i64, u64` → `BigInt` (or string)
- `f64` → `number`
- `bool` → `boolean`
- `String` → `string`
- `Vec<T>` → `Array<T>`
- `Vec<u8>` → `Buffer`

**Wrong:**
```rust
#[napi]
pub fn process(data: Vec<u8>) -> Vec<u8> {
    // Works but inefficient for large buffers
}
```

**Better:**
```rust
use napi::Env;

#[napi]
pub fn process(env: Env, data: &[u8]) -> Result<Buffer> {
    let mut result = env.create_buffer(data.len())?;
    result.copy_from_slice(data);
    Ok(result)
}
```

**Rule**: Use `Buffer` for binary data. Use `Vec<u8>` only for small payloads.

---

## 8. Memory Leaks from Callbacks

**Problem**: Callbacks held in Rust can prevent garbage collection.

**Wrong:**
```rust
static mut CALLBACKS: Vec<Function> = Vec::new();

#[napi]
pub fn register_callback(callback: Function) {
    unsafe {
        CALLBACKS.push(callback);  // Leaks memory
    }
}
```

**Correct:**
```rust
use napi::Ref;
use std::sync::Mutex;

thread_local! {
    static CALLBACKS: Mutex<Vec<Ref<Function>>> = Mutex::new(Vec::new());
}

#[napi]
pub fn register_callback(env: Env, callback: Function) -> Result<()> {
    let reference = env.create_reference(callback)?;
    CALLBACKS.with(|cbs| {
        cbs.lock().unwrap().push(reference);
    });
    Ok(())
}

#[napi]
pub fn clear_callbacks() {
    CALLBACKS.with(|cbs| {
        cbs.lock().unwrap().clear();
    });
}
```

**Rule**: Use `Ref<T>` for JS objects. Always provide cleanup functions.

---

## 9. Performance Cliffs

**Problem**: Hidden allocations or copies destroy performance.

**Slow:**
```rust
#[napi]
pub fn process_large_buffer(data: Vec<u8>) -> Vec<u8> {
    // Copies entire buffer
    let mut result = data.clone();
    for byte in &mut result {
        *byte = byte.wrapping_add(1);
    }
    result
}
```

**Fast:**
```rust
#[napi]
pub fn process_large_buffer(env: Env, data: &[u8]) -> Result<Buffer> {
    let mut result = env.create_buffer(data.len())?;
    for (i, byte) in data.iter().enumerate() {
        result[i] = byte.wrapping_add(1);
    }
    Ok(result)
}
```

**Rule**: Profile allocations. Use references where possible. Minimize copies.

---

## 10. Version Stability

**Problem**: Changing napi-rs versions can break builds.

**Solution:**
```toml
[dependencies]
napi = "=2.12.0"  # Pin exact version
napi-derive = "=2.12.0"
```

**Rule**: Pin napi-rs versions. Test on all supported Node.js versions.
