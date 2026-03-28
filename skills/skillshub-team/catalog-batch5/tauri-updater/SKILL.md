# Tauri Auto-Updater
```bash
cargo add tauri-plugin-updater
npm install @tauri-apps/plugin-updater
```

## Check & Install Updates
```typescript
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
const update = await check();
if (update) {
    await update.downloadAndInstall();
    await relaunch();
}
```

## Config
```json
{ "plugins": { "updater": {
    "endpoints": ["https://releases.myapp.com/{{target}}/{{arch}}/{{current_version}}"],
    "pubkey": "YOUR_PUBLIC_KEY" } } }
```

## Generate Keys
```bash
npm run tauri signer generate -- -w ~/.tauri/myapp.key
```
