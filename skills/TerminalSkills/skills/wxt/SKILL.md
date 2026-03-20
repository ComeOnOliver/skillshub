# WXT

## Overview

WXT is a Vite-based framework for building browser extensions — think "Next.js for extensions." File-based entrypoints, hot reload, TypeScript-first, and it outputs a single extension that works on Chrome (MV3), Firefox (MV2/MV3), Safari, and Edge. No more manually editing manifest.json or reloading the extension after every change.

## When to Use

- Building a browser extension for Chrome, Firefox, or all browsers
- Want hot reload during development (not manual reload)
- Need TypeScript + React/Vue/Svelte in your extension
- Migrating from Manifest V2 to V3
- Want one codebase that targets multiple browsers

## Instructions

### Setup

```bash
npx wxt@latest init my-extension
cd my-extension
npm install
npm run dev  # Opens Chrome with hot-reloading extension
```

### Project Structure

```
my-extension/
├── entrypoints/
│   ├── popup/           # Popup UI (click extension icon)
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── App.tsx
│   ├── options/         # Options page
│   │   ├── index.html
│   │   └── main.tsx
│   ├── content.ts       # Content script (runs on web pages)
│   └── background.ts    # Service worker (background logic)
├── public/
│   └── icon/
│       ├── 16.png
│       ├── 48.png
│       └── 128.png
├── wxt.config.ts
└── package.json
```

### Content Script

```typescript
// entrypoints/content.ts — Runs on matched web pages
/**
 * Content scripts have access to the DOM of the page.
 * Define which URLs to match with the `matches` export.
 */
export default defineContentScript({
  matches: ["*://*.github.com/*"],  // Run on GitHub pages
  main() {
    // Add a custom button to every GitHub PR page
    const prHeader = document.querySelector(".gh-header-actions");
    if (prHeader) {
      const btn = document.createElement("button");
      btn.textContent = "🤖 AI Review";
      btn.className = "btn btn-sm";
      btn.onclick = async () => {
        const diff = document.querySelector(".diff-view")?.textContent;
        // Send to background for API call
        const review = await browser.runtime.sendMessage({
          type: "REVIEW_PR",
          diff: diff?.slice(0, 5000),
        });
        alert(review.summary);
      };
      prHeader.prepend(btn);
    }
  },
});
```

### Background Service Worker

```typescript
// entrypoints/background.ts — Persistent background logic
/**
 * Service worker handles API calls, alarms, and message routing.
 * No DOM access here — communicate with content scripts via messaging.
 */
export default defineBackground(() => {
  // Handle messages from content scripts
  browser.runtime.onMessage.addListener(async (msg, sender) => {
    if (msg.type === "REVIEW_PR") {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await storage.getItem("local:apiKey")}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: `Review this diff:\n${msg.diff}` }],
        }),
      });
      const data = await response.json();
      return { summary: data.choices[0].message.content };
    }
  });

  // Periodic tasks with alarms
  browser.alarms.create("check-notifications", { periodInMinutes: 5 });
  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "check-notifications") {
      // Check for updates, show badge
      const count = await checkNotifications();
      if (count > 0) {
        browser.action.setBadgeText({ text: String(count) });
      }
    }
  });
});
```

### Popup UI (React)

```tsx
// entrypoints/popup/App.tsx — Extension popup with React
import { useState, useEffect } from "react";

export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    storage.getItem<string>("local:apiKey").then((key) => {
      if (key) setApiKey(key);
    });
  }, []);

  const save = async () => {
    await storage.setItem("local:apiKey", apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ width: 300, padding: 16 }}>
      <h2>🤖 AI PR Reviewer</h2>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="OpenAI API Key"
        style={{ width: "100%" }}
      />
      <button onClick={save} style={{ marginTop: 8 }}>
        {saved ? "✅ Saved!" : "Save Key"}
      </button>
    </div>
  );
}
```

### Build for Multiple Browsers

```bash
# Development (Chrome with hot reload)
npm run dev

# Development for Firefox
npm run dev:firefox

# Build for all browsers
npm run build          # Chrome MV3
npm run build:firefox  # Firefox MV2/MV3

# Zip for store submission
npm run zip
npm run zip:firefox
```

## Examples

### Example 1: Build a productivity extension

**User prompt:** "Build a Chrome extension that blocks distracting websites during focus time."

The agent will create a WXT extension with a popup for configuring blocked sites and focus timer, a content script that shows a block page on matched domains, and background alarms for timer management.

### Example 2: Content enhancement extension

**User prompt:** "Build an extension that adds AI-powered summaries to any article page."

The agent will create a content script that detects article content, a floating sidebar UI, and background API calls to summarize text.

## Guidelines

- **File-based entrypoints** — file name and location determine the extension component
- **`browser.*` API** — WXT polyfills Chrome and Firefox differences automatically
- **`storage` helper** — type-safe extension storage with `storage.getItem/setItem`
- **Hot reload works** — `npm run dev` reloads content scripts and popup on save
- **MV3 service workers** — background scripts are service workers (no persistent state)
- **`matches` for content scripts** — define URL patterns where scripts should inject
- **Message passing** — content script ↔ background communication via `browser.runtime.sendMessage`
- **One codebase, all browsers** — build targets handle manifest differences
- **Icons at 16/48/128px** — required for Chrome Web Store