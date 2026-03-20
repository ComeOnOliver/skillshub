# Tauri App Setup
Build cross-platform desktop apps with Tauri v2.

## Quick Start
```bash
npm create tauri-app@latest my-app -- --template react-ts
cd my-app && npm install && npm run tauri dev
```

## Project Structure
```
src-tauri/src/lib.rs    # Rust commands
src-tauri/tauri.conf.json # App config
src/                     # Web frontend
```

## Rust Commands (IPC)
```rust
#[tauri::command]
fn greet(name: &str) -> String { format!("Hello, {}!", name) }

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!()).expect("error");
}
```

```typescript
import { invoke } from "@tauri-apps/api/core";
const msg = await invoke<string>("greet", { name: "World" });
```

## Config (tauri.conf.json)
```json
{ "productName": "MyApp", "version": "0.1.0", "identifier": "com.myapp",
  "app": { "windows": [{ "title": "My App", "width": 1024, "height": 768 }] },
  "bundle": { "active": true, "targets": "all" } }
```

## Build
```bash
npm run tauri build  # Output in src-tauri/target/release/bundle/
```

- Tauri v2 supports desktop + mobile (iOS/Android)
- ~600KB bundle vs Electron's ~150MB
- Use capabilities/ for security permissions