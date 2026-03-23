# VS Code Port Monitor Configuration

Configure the VS Code Port Monitor extension to monitor development server ports in real-time with visual status indicators in your status bar.

**Extension**: [dkurokawa.vscode-port-monitor](https://github.com/dkurokawa/vscode-port-monitor)

## Core Concepts

### Port Monitor Features

- 🔍 **Real-time monitoring** - Live status bar display
- 🏷️ **Intelligent configuration** - Supports arrays, ranges, well-known ports
- 🛑 **Process management** - Kill processes using ports
- 🎨 **Customizable display** - Icons, colors, positioning
- 📊 **Multiple groups** - Organize ports by service/project

### Status Icons

- 🟢 = Port is in use (service running)
- ⚪️ = Port is free (service stopped)

---

## Configuration Workflow

### Step 1: Create Configuration File

Add configuration to `.vscode/settings.json`:

```json
{
  "portMonitor.hosts": {
    "GroupName": {
      "port": "label",
      "__CONFIG": { ... }
    }
  }
}
```

### Step 2: Choose a Template

Select from common scenarios (see examples/ directory):

| Scenario | Template File | Ports |
|----------|--------------|-------|
| Vite basic | `vite-basic.json` | 5173 (dev) |
| Vite with preview | `vite-with-preview.json` | 5173 (dev), 4173 (preview) |
| Full stack | `fullstack.json` | 5173, 4173, 3200 |
| Next.js | `nextjs.json` | 3000 (app), 3001 (api) |
| Microservices | `microservices.json` | Multiple groups |

### Step 3: Apply Configuration

1. Copy template content to `.vscode/settings.json`
2. Customize port numbers and labels for your project
3. Save file - Port Monitor will auto-reload

---

## Quick Start Examples

### Example 1: Vite Project

```json
{
  "portMonitor.hosts": {
    "Development": {
      "5173": "dev",
      "__CONFIG": {
        "compact": true,
        "bgcolor": "blue",
        "show_title": true
      }
    }
  },
  "portMonitor.statusIcons": {
    "inUse": "🟢 ",
    "free": "⚪️ "
  }
}
```

**Display**: `Development: [🟢 dev:5173]`

### Example 2: Microservices

```json
{
  "portMonitor.hosts": {
    "Frontend": {
      "3000": "react",
      "__CONFIG": { "compact": true, "bgcolor": "blue", "show_title": true }
    },
    "Backend": {
      "3001": "api",
      "5432": "postgres",
      "__CONFIG": { "compact": true, "bgcolor": "yellow", "show_title": true }
    }
  }
}
```

**Display**: `Frontend: [🟢 react:3000] Backend: [🟢 api:3001 | 🟢 postgres:5432]`

---

## Best Practices

### ✅ Do

- Use descriptive labels: `"5173": "dev"` not `"5173": "5173"`
- Add space after emojis: `"🟢 "` for better readability
- Group related ports: Frontend, Backend, Database
- Use compact mode for cleaner status bar
- Set reasonable refresh interval (3000-5000ms)

### ❌ Don't

- Reverse port-label format: `"dev": 5173` ❌
- Use empty group names
- Set refresh interval too low (<1000ms)
- Monitor too many ports (>10 per group)

---

## Common Issues

### Port Monitor Not Showing

1. Check extension is installed: `code --list-extensions | grep port-monitor`
2. Verify `.vscode/settings.json` syntax
3. Reload VS Code: `Cmd+Shift+P` → "Reload Window"

### Configuration Errors

Check port-label format is correct:
```json
// ✅ Correct
{"5173": "dev"}

// ❌ Wrong
{"dev": 5173}
```

For more troubleshooting, see `references/troubleshooting.md`

---

## Reference Materials

- **Configuration Options**: `references/configuration-options.md` - Detailed option reference
- **Troubleshooting**: `references/troubleshooting.md` - Common issues and solutions
- **Integrations**: `references/integrations.md` - Tool-specific configurations
- **Advanced Config**: `references/advanced-config.md` - Pattern matching, custom emojis
- **Examples**: `examples/` - Ready-to-use JSON configurations

---

## Workflow Summary

1. **Choose template** from examples/ directory based on your stack
2. **Copy to** `.vscode/settings.json`
3. **Customize** port numbers and labels
4. **Save** and verify status bar display
5. **Troubleshoot** if needed using references/troubleshooting.md

Port Monitor will automatically detect running services and update the status bar in real-time.
