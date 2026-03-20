---
name: wp-cli-ops
description: WordPress operations with WP-CLI — search-replace, plugin/theme management, cron, cache, DB export/import, automation. Always-active rules when using wp commands.
user-invocable: false
---

# WP-CLI and Operations

Skill for the safe and effective use of WP-CLI in day-to-day WordPress operations. Covers migrations, plugin/theme management, cron, cache, database, and automation patterns.

## When to use

Apply this skill when the task involves:

- `wp search-replace` (URL change, domain migration, protocol switch)
- Database export/import (`wp db *`)
- Plugin and theme management (install, activate, update)
- Cron: list events, manual execution, debugging
- Cache and rewrite flush
- Automation scripts and `wp-cli.yml`

## Prerequisites

Before starting, verify:

- **Environment**: dev, staging, or production — and whether it is safe to run commands
- **Targeting**: `--path=<wordpress-root>` to point to the correct installation
- **Constraints**: acceptable downtime, DB write permissions, maintenance window

## Procedure

### 0) Guardrails — confirm environment and blast radius

WP-CLI commands can be **destructive**. Before any write operation:

1. **Confirm the environment** (dev/staging/prod)
2. **Verify targeting** — does the path point to the right site?
3. **Back up before risky operations**

```bash
# Verify where you are.
wp core version
wp option get siteurl
wp option get blogname

# Verify you are targeting the right site.
wp eval "echo get_home_url();"
```

**Golden rule**: if you are unsure about the environment, **do not** run write commands.

### 1) URL migration / search-replace

The safe sequence for changing URLs in the database:

```bash
# 1. Back up BEFORE anything.
wp db export backup-pre-migration.sql

# 2. Dry-run — see what would change without touching the DB.
wp search-replace 'https://vecchio-dominio.it' 'https://nuovo-dominio.it' --dry-run --report-changed-only

# 3. If the dry-run is ok, execute.
wp search-replace 'https://vecchio-dominio.it' 'https://nuovo-dominio.it' --report-changed-only

# 4. Flush cache and rewrite after migration.
wp cache flush
wp rewrite flush
```

**Beware of serialized data**: `wp search-replace` handles serialization automatically. **Do not** use manual SQL tools for search-replace — they break serialized data.

**Useful flags**:

| Flag | Usage |
|------|-------|
| `--dry-run` | Simulate without modifying (ALWAYS first) |
| `--report-changed-only` | Show only tables with changes |
| `--all-tables` | Include non-WordPress tables (custom plugins) |
| `--precise` | Slower but handles complex serializations better |
| `--skip-columns=<col>` | Exclude specific columns |

### 2) Plugin and theme management

```bash
# List plugins with status.
wp plugin list --format=table

# Install and activate.
wp plugin install advanced-custom-fields --activate

# Update all (dev/staging).
wp plugin update --all
wp theme update --all

# Deactivate a plugin.
wp plugin deactivate plugin-problematico

# Check status.
wp plugin status
```

**In production**: update one plugin at a time, verify after each one.

### 3) Database — export, import, query

```bash
# Full export (backup).
wp db export backup-$(date +%Y%m%d-%H%M%S).sql

# Export with gzip (smaller files).
wp db export - | gzip > backup.sql.gz

# Import.
wp db import backup.sql

# Direct queries (read-only for debugging).
wp db query "SELECT COUNT(*) FROM $(wp db prefix)posts WHERE post_type = 'bando' AND post_status = 'publish'"

# Database size.
wp db size --tables --format=table
```

**Never** run `wp db reset` in production without a verified backup.

### 4) Cron — diagnosis and debugging

```bash
# List all scheduled cron events.
wp cron event list --format=table

# Run a single event (for debugging).
wp cron event run mio_plugin_cron_event

# Count "due now" events (if too many, there is a problem).
wp cron event list --format=count --fields=hook --status=due

# Test: is the cron system working?
wp cron test
```

- If there are too many "due now" events: probably `DISABLE_WP_CRON` is true but the system crontab is not configured
- For heavy tasks: system crontab is better than `wp-cron.php` via HTTP

### 5) Cache and rewrite

```bash
# Flush object cache.
wp cache flush

# Flush rewrite rules (after changing CPTs/taxonomies).
wp rewrite flush

# Regenerate rewrite rules and show them.
wp rewrite list --format=table

# Flush expired transients.
wp transient delete --expired
```

### 6) Automation — wp-cli.yml and scripts

Create a `wp-cli.yml` in the project root for shared defaults:

```yaml
# wp-cli.yml
path: web/wp          # For Bedrock
url: https://mio-sito.ddev.site
color: true
```

**Automation script** with logging and stop-on-error:

```bash
#!/bin/bash
set -euo pipefail

LOG_FILE="ops-$(date +%Y%m%d-%H%M%S).log"

log() {
    echo "[$(date +%H:%M:%S)] $*" | tee -a "$LOG_FILE"
}

log "Starting operations..."

# Backup.
log "Backing up database..."
wp db export "backup-$(date +%Y%m%d).sql"

# Update plugins.
log "Updating plugins..."
wp plugin update --all 2>&1 | tee -a "$LOG_FILE"

# Flush cache.
log "Flushing cache..."
wp cache flush
wp rewrite flush

log "Operations completed."
```

## Quick reference commands

```bash
# Quick site info.
wp core version && wp option get siteurl && wp plugin list --status=active --format=count

# Generate a test admin user (dev only).
wp user create admin-test admin@test.local --role=administrator --user_pass=test123

# Regenerate thumbnails.
wp media regenerate --yes

# Export content as WXR.
wp export --dir=.

# Verify core file integrity.
wp core verify-checksums

# Search for a string in the database.
wp db search "stringa-da-trovare" --format=table
```

## Verification checklist

- [ ] Environment confirmed before write operations
- [ ] Backup performed before risky operations
- [ ] `--dry-run` executed before `search-replace`
- [ ] Site URL correct after migration (`wp option get siteurl`)
- [ ] Plugins/themes in the expected state
- [ ] Cron working (`wp cron test`)
- [ ] Cache flushed where necessary

## Common errors and solutions

| Problem | Likely cause | Solution |
|---------|-------------|----------|
| "This does not seem to be a WordPress installation" | Wrong `--path`, missing `wp-config.php` | Verify the path and that WP is installed |
| Search-replace breaks serialized data | Used manual SQL tool instead of `wp search-replace` | Restore backup, use `wp search-replace` with `--precise` |
| Command hits the wrong site | Missing or wrong `--url` (multisite) | Always specify `--url` in multisite environments |
| "Error: 'cache' is not a registered wp command" | WP-CLI too old or incomplete installation | Update WP-CLI: `wp cli update` |
| Cron not executing | `DISABLE_WP_CRON` true without system crontab | Configure crontab: `*/5 * * * * wp cron event run --due-now` |

## What NOT to do

- **Do not** run `wp db reset` or `wp db drop` without a verified backup
- **Do not** run `wp search-replace` without `--dry-run` first
- **Do not** update plugins in production without having tested in staging
- **Do not** assume `--path` is correct — always verify with `wp option get siteurl`
- **Do not** use `wp-cron.php` via HTTP for heavy tasks in production — use system crontab
- **Do not** run `wp cache flush` during traffic spikes without reason
