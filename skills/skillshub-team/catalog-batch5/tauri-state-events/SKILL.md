# Tauri State & Events

## Shared State
```rust
use std::sync::Mutex;
use tauri::State;

struct AppState { counter: Mutex<i32> }

#[tauri::command]
fn increment(state: State<AppState>) -> i32 {
    let mut c = state.counter.lock().unwrap();
    *c += 1; *c
}

// Register: .manage(AppState { counter: Mutex::new(0) })
```

## Events (Rust → Frontend)
```rust
use tauri::{AppHandle, Emitter};
#[tauri::command]
async fn long_task(app: AppHandle) {
    for i in 0..100 {
        app.emit("progress", i).unwrap();
        tokio::time::sleep(std::time::Duration::from_millis(50)).await;
    }
}
```

```typescript
import { listen } from "@tauri-apps/api/event";
await listen<number>("progress", (e) => console.log(e.payload));
```

## Error Handling
```rust
#[tauri::command]
fn risky_op() -> Result<String, String> {
    Err("Something failed".into()) // Reaches frontend as error
}
```