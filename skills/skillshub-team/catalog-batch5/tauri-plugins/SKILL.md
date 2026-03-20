# Tauri Plugins
Extend Tauri with official plugins for system access.

## Install
```bash
npm install @tauri-apps/plugin-fs @tauri-apps/plugin-dialog @tauri-apps/plugin-store
cargo add tauri-plugin-fs tauri-plugin-dialog tauri-plugin-store
```

## Filesystem
```typescript
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
const content = await readTextFile(filePath);
await writeTextFile(filePath, JSON.stringify(data));
```

## Dialogs
```typescript
import { open, save, confirm } from "@tauri-apps/plugin-dialog";
const file = await open({ filters: [{ name: "Images", extensions: ["png", "jpg"] }] });
const yes = await confirm("Delete this?", { title: "Confirm", kind: "warning" });
```

## Persistent Store
```typescript
import { Store } from "@tauri-apps/plugin-store";
const store = new Store("settings.json");
await store.set("theme", "dark");
await store.save();
```

## System Tray
```rust
use tauri::tray::TrayIconBuilder;
TrayIconBuilder::new()
    .icon(app.default_window_icon().unwrap().clone())
    .menu(&menu)
    .on_menu_event(|app, event| { /* handle */ })
    .build(app)?;
```

## Capabilities (permissions)
```json
{ "identifier": "default", "windows": ["main"],
  "permissions": ["core:default", "fs:default", "dialog:default"] }
```