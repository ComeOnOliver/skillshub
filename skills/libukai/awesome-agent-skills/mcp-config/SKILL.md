# MCP Configuration Management

## Overview

This skill helps you properly configure MCP servers in Claude Code. It ensures MCP servers are configured in the right location and scope to avoid unnecessary context pollution across all sessions.

## Critical Concepts

### Two Valid Configuration Locations

**ONLY these two locations are valid for MCP configuration:**

1. **User/Local scope**: `~/.claude.json`
   - In the `mcpServers` field (global for all projects)
   - Or under specific project paths (project-specific in user config)

2. **Project scope**: `.mcp.json` in your project root
   - Checked into source control
   - Only affects the current project

### ⚠️ Important Rules

- **DO NOT configure MCPs in `~/.claude.json` global `mcpServers`** - This loads MCPs in ALL sessions and wastes context space
- **DO configure MCPs in project-level `.mcp.json`** - This only loads MCPs when working in that specific project
- **Avoid `settings.json` for MCP control** - The `permissions.allow` field can override disabled settings and cause confusion

## When to Use This Skill

Invoke this skill when:
- Adding a new MCP server to a project
- Removing/disabling an MCP server
- MCP servers are loading when they shouldn't be
- Need to clean up MCP configuration
- Want to understand why an MCP is or isn't loading

## Quick Start

| Task | Example |
|------|---------|
| Add MCP to current project | "添加 pencil MCP 到当前项目" |
| Remove MCP from all projects | "从所有项目中移除 shadcn-studio-mcp" |
| Check MCP configuration | "检查当前的 MCP 配置" |
| Clean up global MCPs | "清理全局 MCP 配置" |

---

## Configuration Workflow

### 1. Check Current MCP Status

First, understand what MCPs are currently loaded:

```bash
# Check user-level configuration
cat ~/.claude.json | grep -A 20 '"mcpServers"' | head -25

# Check project-level configuration
cat .mcp.json 2>/dev/null || echo "No project .mcp.json found"

# Check settings.json (should NOT have MCP config)
cat ~/.claude/settings.json | grep -A 5 '"permissions"'
```

### 2. Add MCP to Current Project

**Best Practice**: Always add MCPs at project level

Create or edit `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "server-name": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "package-name"],
      "env": {
        "API_KEY": "your-key-here"
      }
    }
  }
}
```

### 3. Remove MCP Configuration

**From global config** (`~/.claude.json`):

```python
import json

with open('/Users/likai/.claude.json', 'r') as f:
    data = json.load(f)

# Remove from global mcpServers
if 'mcpServers' in data and 'server-name' in data['mcpServers']:
    del data['mcpServers']['server-name']
    print(f"Removed server-name from global config")

with open('/Users/likai/.claude.json', 'w') as f:
    json.dump(data, f, indent=2)
```

**From project config** (`.mcp.json`):

```python
import json

try:
    with open('.mcp.json', 'r') as f:
        data = json.load(f)

    if 'mcpServers' in data and 'server-name' in data['mcpServers']:
        del data['mcpServers']['server-name']

    with open('.mcp.json', 'w') as f:
        json.dump(data, f, indent=2)
    print("Removed server-name from project config")
except FileNotFoundError:
    print("No .mcp.json found in project")
```

### 4. Clean Up settings.json

Remove any MCP-related permissions that might override configuration:

```python
import json

with open('/Users/likai/.claude/settings.json', 'r') as f:
    data = json.load(f)

# Remove permissions block if it contains MCP references
if 'permissions' in data:
    if 'allow' in data['permissions']:
        data['permissions']['allow'] = [
            item for item in data['permissions']['allow']
            if not item.startswith('mcp__')
        ]
        if not data['permissions']['allow']:
            del data['permissions']

with open('/Users/likai/.claude/settings.json', 'w') as f:
    json.dump(data, f, indent=2)
```

---

## Common MCP Servers

### Pencil (Design Tool)

```json
{
  "mcpServers": {
    "pencil": {
      "command": "/Users/likai/.vscode/extensions/highagency.pencildev-0.6.29/out/mcp-server-darwin-arm64",
      "args": ["--app", "visual_studio_code"],
      "env": {},
      "type": "stdio"
    }
  }
}
```

### Shadcn Studio

```json
{
  "mcpServers": {
    "shadcn-studio-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "shadcn-studio-mcp",
        "API_KEY=your-api-key",
        "EMAIL=your-email"
      ],
      "env": {}
    }
  }
}
```

### Unsplash

```json
{
  "mcpServers": {
    "unsplash": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@microlee666/unsplash-mcp-server"],
      "env": {
        "UNSPLASH_ACCESS_KEY": "your-access-key"
      }
    }
  }
}
```

---

## Troubleshooting

### Problem: MCP loads in all sessions

**Cause**: MCP is configured in `~/.claude.json` global `mcpServers`

**Solution**:
1. Remove from `~/.claude.json` global config
2. Add to project-level `.mcp.json` instead
3. Restart Claude Code session

### Problem: MCP won't disable despite `"disabled": true`

**Cause**: `permissions.allow` in `settings.json` overrides disabled setting

**Solution**:
1. Remove MCP from `settings.json` permissions
2. Remove the entire `permissions` block if empty
3. Restart Claude Code session

### Problem: MCP configuration conflicts

**Cause**: MCP configured in multiple locations with different settings

**Solution**:
1. Check all three locations: `~/.claude.json`, `.mcp.json`, `settings.json`
2. Keep configuration in ONE place only (prefer `.mcp.json`)
3. Remove from other locations

### Problem: Can't find where MCP is configured

**Diagnostic commands**:

```bash
# Search all possible locations
echo "=== Global Config ==="
grep -A 10 '"mcpServers"' ~/.claude.json | head -15

echo "=== Project Config ==="
cat .mcp.json 2>/dev/null || echo "No .mcp.json"

echo "=== Settings ==="
grep -A 5 '"permissions"' ~/.claude/settings.json 2>/dev/null || echo "No permissions"

echo "=== Project Settings ==="
grep -A 5 '"permissions"' .claude/settings.json 2>/dev/null || echo "No project settings"
```

---

## Best Practices

1. ✅ **Always use project-level `.mcp.json`** for project-specific MCPs
2. ✅ **Keep `~/.claude.json` global `mcpServers` empty** to avoid context pollution
3. ✅ **Avoid MCP configuration in `settings.json`** - use it only for permissions if needed
4. ✅ **Restart Claude Code after configuration changes** to ensure they take effect
5. ✅ **Check into source control** - Commit `.mcp.json` so team members get the same MCPs
6. ❌ **Never use `disabled: true`** - Just remove the MCP configuration entirely
7. ❌ **Don't mix configuration locations** - Pick one place and stick to it

---

## Configuration Priority

When Claude Code loads MCPs, it follows this priority:

1. Project-level `.mcp.json` (highest priority)
2. User-level `~/.claude.json` project-specific config
3. User-level `~/.claude.json` global `mcpServers`
4. `settings.json` permissions can override all of the above

**Recommendation**: Use only project-level `.mcp.json` to avoid confusion.

---

## Example: Complete Cleanup and Reconfiguration

```bash
# 1. Clean up global config
python3 << 'EOF'
import json
with open('/Users/likai/.claude.json', 'r') as f:
    data = json.load(f)
data['mcpServers'] = {}
with open('/Users/likai/.claude.json', 'w') as f:
    json.dump(data, f, indent=2)
print("✓ Cleaned global mcpServers")
EOF

# 2. Clean up settings.json
python3 << 'EOF'
import json
with open('/Users/likai/.claude/settings.json', 'r') as f:
    data = json.load(f)
if 'permissions' in data:
    del data['permissions']
with open('/Users/likai/.claude/settings.json', 'w') as f:
    json.dump(data, f, indent=2)
print("✓ Cleaned settings.json permissions")
EOF

# 3. Create project-level config
cat > .mcp.json << 'EOF'
{
  "mcpServers": {
    "your-mcp-name": {
      "type": "stdio",
      "command": "your-command",
      "args": [],
      "env": {}
    }
  }
}
EOF
echo "✓ Created project .mcp.json"

# 4. Restart Claude Code
echo "⚠️  Please restart Claude Code for changes to take effect"
```

---

## Summary

- **Two valid locations**: `~/.claude.json` and `.mcp.json`
- **Best practice**: Use project-level `.mcp.json` only
- **Avoid**: Global `mcpServers` in `~/.claude.json` (wastes context)
- **Avoid**: MCP config in `settings.json` (causes conflicts)
- **Always restart** Claude Code after configuration changes