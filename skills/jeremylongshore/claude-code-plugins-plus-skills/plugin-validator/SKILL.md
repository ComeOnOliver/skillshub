# Plugin Validator

## Purpose
Automatically validates Claude Code plugins against repository standards, checking structure, JSON schemas, frontmatter, permissions, security, and marketplace compliance - optimized for claude-code-plugins repository.

## Trigger Keywords
- "validate plugin"
- "check plugin"
- "plugin validation"
- "plugin errors"
- "lint plugin"
- "verify plugin"

## Validation Checks

### 1. Required Files
- ✅ `.claude-plugin/plugin.json` exists
- ✅ `README.md` exists and not empty
- ✅ `LICENSE` file exists
- ✅ At least one component directory (commands/, agents/, skills/, hooks/, mcp/)

### 2. Plugin.json Schema
```bash
# Required fields:
- name (kebab-case, lowercase, hyphens only)
- version (semantic versioning x.y.z)
- description (clear, concise)
- author.name
- author.email
- license (MIT, Apache-2.0, etc.)
- keywords (array, at least 2)

# Optional but recommended:
- repository (GitHub URL)
- homepage (docs URL)
```

### 3. Frontmatter Validation
**For Commands (commands/*.md):**
```yaml
---
name: command-name
description: Brief description
model: sonnet|opus|haiku
---
```

**For Agents (agents/*.md):**
```yaml
---
name: agent-name
description: Agent purpose
model: sonnet|opus|haiku
---
```

**For Skills (skills/*/SKILL.md):**
```yaml
---
name: Skill Name
description: What it does AND when to use it
allowed-tools: Tool1, Tool2, Tool3  # optional
---
```

### 4. Directory Structure
Validates proper hierarchy:
```
plugin-name/
├── .claude-plugin/          # Required
│   └── plugin.json          # Required
├── README.md                 # Required
├── LICENSE                   # Required
├── commands/                 # Optional
│   └── *.md
├── agents/                   # Optional
│   └── *.md
├── skills/                   # Optional
│   └── skill-name/
│       └── SKILL.md
├── hooks/                    # Optional
│   └── hooks.json
└── mcp/                      # Optional
    └── *.json
```

### 5. Script Permissions
```bash
# All .sh files must be executable
find . -name "*.sh" ! -perm -u+x
# Should return empty
```

### 6. JSON Validation
```bash
# All JSON must be valid
jq empty plugin.json
jq empty marketplace.extended.json
jq empty hooks/hooks.json
```

### 7. Security Scans
- ❌ No hardcoded secrets (API keys, tokens, passwords)
- ❌ No AWS keys (AKIA...)
- ❌ No private keys (BEGIN PRIVATE KEY)
- ❌ No dangerous commands (rm -rf /, eval())
- ❌ No suspicious URLs (non-HTTPS, IP addresses)

### 8. Marketplace Compliance
- ✅ Plugin listed in marketplace.extended.json
- ✅ Source path matches actual location
- ✅ Version matches between plugin.json and catalog
- ✅ Category is valid
- ✅ No duplicate plugin names

### 9. README Requirements
- ✅ Has installation instructions
- ✅ Has usage examples
- ✅ Has description section
- ✅ Proper markdown formatting
- ✅ No broken links

### 10. Path Variables
For hooks:
- ✅ Uses `${CLAUDE_PLUGIN_ROOT}` not absolute paths
- ✅ No hardcoded /home/ or /Users/ paths

## Validation Process

When activated, I will:

1. **Identify Plugin**
   - Detect plugin directory from context
   - Or ask user which plugin to validate

2. **Run Comprehensive Checks**
   ```bash
   # Structure validation
   ./scripts/validate-all.sh plugins/category/plugin-name/

   # JSON validation
   jq empty .claude-plugin/plugin.json

   # Frontmatter check
   python3 scripts/check-frontmatter.py

   # Permission check
   find . -name "*.sh" ! -perm -u+x

   # Security scan
   grep -r "password\|secret\|api_key" | grep -v placeholder
   ```

3. **Generate Report**
   - List all issues by severity (critical, high, medium, low)
   - Provide fix commands for each issue
   - Summary: PASSED or FAILED

## Validation Report Format

```
🔍 PLUGIN VALIDATION REPORT
Plugin: plugin-name
Location: plugins/category/plugin-name/

✅ PASSED CHECKS (8/10)
- Required files present
- Valid plugin.json schema
- Proper frontmatter format
- Directory structure correct
- No security issues
- Marketplace compliance
- README complete
- JSON valid

❌ FAILED CHECKS (2/10)
- Script permissions: 3 .sh files not executable
  Fix: chmod +x scripts/*.sh

- Marketplace version mismatch
  plugin.json: v1.2.0
  marketplace.extended.json: v1.1.0
  Fix: Update marketplace.extended.json to v1.2.0

⚠️  WARNINGS (1)
- README missing usage examples
  Recommendation: Add ## Usage section with examples

OVERALL: FAILED (2 critical issues)
Fix issues above before committing.
```

## Auto-Fix Capabilities

I can automatically fix:
- ✅ Script permissions (`chmod +x`)
- ✅ JSON formatting (`jq` reformat)
- ✅ Marketplace version sync
- ✅ Missing LICENSE (copy from root)

## Repository-Specific Checks

**For claude-code-plugins repo:**
- Validates against `.claude-plugin/marketplace.extended.json`
- Checks category folder matches catalog entry
- Ensures marketplace slug is `claude-code-plugins-plus`
- Validates against other plugins (no duplicates)
- Checks compliance with CLAUDE.md standards

## Integration with CI

Validation results match GitHub Actions:
- Same checks as `.github/workflows/validate-plugins.yml`
- Compatible with CI error format
- Can be run locally before pushing

## Examples

**User says:** "Validate the skills-powerkit plugin"

**I automatically:**
1. Run all validation checks
2. Identify 2 issues (permissions, version mismatch)
3. Provide fix commands
4. Report overall status: FAILED

**User says:** "Check if my plugin is ready to commit"

**I automatically:**
1. Detect plugin from context
2. Run comprehensive validation
3. Check marketplace compliance
4. Report: PASSED or list issues

**User says:** "Why is my plugin failing CI?"

**I automatically:**
1. Run same checks as CI
2. Identify exact failure
3. Provide fix command
4. Validate fix works