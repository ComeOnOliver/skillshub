# Tauri Multi-Window

## Create Windows from Frontend
```typescript
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
const win = new WebviewWindow("settings", {
    url: "/settings", title: "Settings",
    width: 600, height: 400, center: true, resizable: false,
});
win.once("tauri://error", (e) => console.error(e));
```

## Window Controls
```typescript
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
const win = getCurrentWebviewWindow();
await win.minimize();
await win.maximize();
await win.hide();
await win.show();
await win.setTitle("New Title");
```

## Close to Tray
```typescript
await win.onCloseRequested(async (event) => {
    event.preventDefault();
    await win.hide(); // Minimize to tray instead
});
```