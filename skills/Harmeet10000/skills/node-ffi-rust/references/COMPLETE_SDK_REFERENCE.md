# Complete Node.js N-API + napi-rs Reference

## napi-rs Macros & Decorators

### Function Binding

```rust
use napi_derive::napi;

// Simple function
#[napi]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

// With Result
#[napi]
pub fn divide(a: i32, b: i32) -> napi::Result<i32> {
    if b == 0 {
        return Err(napi::Error::new(napi::Status::InvalidArg, "Division by zero"));
    }
    Ok(a / b)
}

// With Env (access to Node runtime)
#[napi]
pub fn create_object(env: napi::Env) -> napi::Result<napi::Object> {
    let mut obj = env.create_object()?;
    obj.set_named_property("key", env.create_string("value")?)?;
    Ok(obj)
}
```

### Struct Binding

```rust
#[napi(object)]
pub struct User {
    pub id: u32,
    pub name: String,
    pub email: String,
}

#[napi]
pub fn create_user(id: u32, name: String, email: String) -> User {
    User { id, name, email }
}
```

### Enum Binding

```rust
#[napi]
pub enum Status {
    Pending,
    Active,
    Inactive,
}

#[napi]
pub fn get_status() -> Status {
    Status::Active
}
```

---

## Type Mappings

### Primitives

```rust
i8, i16, i32, i64          → number (i64 → BigInt)
u8, u16, u32, u64          → number (u64 → BigInt)
f32, f64                    → number
bool                        → boolean
String                      → string
()                          → undefined
```

### Collections

```rust
Vec<T>                      → Array<T>
Vec<u8>                     → Buffer
HashMap<String, T>          → Object
Option<T>                   → T | null
Result<T, E>                → T (throws on Err)
```

### Special Types

```rust
napi::Env                   → Runtime context
napi::Object                → JS object
napi::Array                 → JS array
napi::Function              → JS function
napi::Buffer                → Node Buffer
napi::Ref<T>                → Reference (GC-safe)
napi::ThreadsafeFunction    → Callback from threads
```

---

## Common Patterns

### Pattern 1: Async Task

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
pub fn compute_async(env: Env, n: u32) -> Result<Object> {
    env.spawn(ComputeTask { n })
}
```

### Pattern 2: Threadsafe Callback

```rust
use napi::threadsafe_function::{ThreadsafeFunction, ThreadSafeFunctionCallMode};

#[napi]
pub fn call_from_thread(env: Env, callback: Function) -> Result<()> {
    let tsfn = callback.create_threadsafe_function(
        0,
        |ctx| {
            ctx.env.create_string("result from thread")
        },
    )?;

    std::thread::spawn(move || {
        tsfn.call(Ok(()), ThreadSafeFunctionCallMode::Blocking);
    });

    Ok(())
}
```

### Pattern 3: Buffer Processing

```rust
#[napi]
pub fn process_buffer(env: Env, data: &[u8]) -> Result<Buffer> {
    let mut result = env.create_buffer(data.len())?;
    for (i, byte) in data.iter().enumerate() {
        result[i] = byte.wrapping_add(1);
    }
    Ok(result)
}
```

### Pattern 4: Error Handling

```rust
use napi::{Error, Status};

#[napi]
pub fn risky_operation() -> Result<String> {
    std::panic::catch_unwind(|| {
        // risky code
        "success".to_string()
    })
    .map_err(|_| Error::new(Status::GenericFailure, "Operation panicked"))
}
```

---

## Build Configuration

### Cargo.toml

```toml
[package]
name = "my_native_module"
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
```

### package.json

```json
{
  "name": "my-native-module",
  "version": "1.0.0",
  "main": "index.js",
  "nativeBinding": "./index.node",
  "scripts": {
    "build": "napi build --release",
    "build:debug": "napi build",
    "prepublishOnly": "npm run build"
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
```

---

## Performance Benchmarks

### Boundary Overhead

| Operation | Time |
|-----------|------|
| Simple call (i32 → i32) | ~100ns |
| With Vec<u8> (1KB) | ~500ns |
| With struct marshaling | ~1µs |
| With string conversion | ~2µs |

### Optimization Impact

| Technique | Speedup |
|-----------|---------|
| Batch 100 calls → 1 call | 100x |
| Buffer vs Vec copy | 5x |
| Reuse buffer vs allocate | 3x |
| Task vs blocking | 10x (no freeze) |

---

## Debugging

### Enable Tracing

```bash
NODE_DEBUG=napi node index.js
```

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `thread panicked` | Unhandled panic | Use `catch_unwind` |
| `Event loop blocked` | Sync CPU work | Use `napi::Task` |
| `Segmentation fault` | Invalid memory access | Check buffer bounds |
| `Memory leak` | Callbacks not freed | Use `Ref<T>` + cleanup |
| `Type mismatch` | Wrong type mapping | Check type table |

---

## Resources

- [napi-rs Docs](https://napi.rs/)
- [Node.js N-API](https://nodejs.org/api/n_api.html)
- [Rust Book](https://doc.rust-lang.org/book/)
- [napi-rs Examples](https://github.com/napi-rs/napi-rs/tree/main/examples)
