---
name: wp-performance-backend
description: WordPress backend performance optimization — profiling, queries, object cache, autoload, cron, and remote HTTP. Always-active rules when investigating slowness issues.
user-invocable: false
---

# WordPress Backend Performance

Skill for diagnosing and resolving backend performance issues in WordPress 6.x+. Complementary to the `performance` skill (which covers frontend/Core Web Vitals). This one focuses on: server-side profiling, database queries, object cache, autoload options, cron, and remote HTTP calls.

## When to use

Apply this skill when:

- A page, REST endpoint, or admin screen is slow (high TTFB)
- A profiling plan and tool recommendations are needed
- Optimizing DB queries, autoloaded options, object cache, cron tasks, or remote HTTP calls
- The symptom is intermittent or tied to logged-in vs anonymous users

**Do not use for**: frontend asset optimization (CSS/JS/images), Core Web Vitals, lazy loading — see the `performance` skill.

## Prerequisites

Before starting, verify:

- **Environment**: dev, staging, or production — and whether you can make changes (install plugins, change config)
- **How to target the installation**: WordPress root path (`--path=<path>` for WP-CLI)
- **Symptom**: which URL/REST route/admin screen is slow, when it happens (always vs sporadic, logged-in vs anonymous)
- **WP-CLI available**: required for advanced profiling commands

## Procedure

### 0) Guardrails — measure first, avoid risky operations

1. **Confirm whether you can perform write operations** (install plugins, change config, flush cache)
2. **Identify a reproducible target** (URL or REST route) and capture a baseline:

```bash
# Baseline with curl (TTFB).
curl -o /dev/null -s -w "TTFB: %{time_starttransfer}s\nTotal: %{time_total}s\n" "https://esempio.test/bandi/"

# With WP-CLI profile (if available).
wp profile stage --url="https://esempio.test/bandi/"
```

3. **Do not enable `SAVEQUERIES` or `WP_DEBUG` in production** without explicit approval — they cause significant overhead

### 1) Quick diagnostics (before deep profiling)

If you have WP-CLI with the `wp doctor` plugin:

```bash
# Quick check — identifies common issues.
wp doctor check

# Issues it detects:
# - Autoload bloat (autoloaded options > 1MB)
# - SAVEQUERIES/WP_DEBUG active in production
# - Too many active plugins
# - Core/plugin/theme updates available
```

If you don't have `wp doctor`, check manually:

```bash
# Autoload size.
wp db query "SELECT SUM(LENGTH(option_value)) as total FROM $(wp db prefix)options WHERE autoload = 'yes'" --skip-column-names

# Active plugin count.
wp plugin list --status=active --format=count

# WP and PHP version.
wp core version && wp eval "echo PHP_VERSION;"
```

### 2) Deep profiling

**Order of preference**:

#### A) WP-CLI Profile (without browser)

```bash
# Where does the time go? (bootstrap / main_query / template).
wp profile stage --url="https://esempio.test/bandi/"

# Which hooks are slow?
wp profile hook --url="https://esempio.test/bandi/" --spotlight

# Test a specific code path.
wp profile eval 'get_posts(["post_type" => "bando", "posts_per_page" => 50]);'
```

#### B) Query Monitor (headless usage via REST)

Query Monitor can be used without a browser via REST response headers:

```bash
# Authenticate and inspect x-qm-* headers.
curl -s -D - "https://esempio.test/wp-json/wp/v2/posts" \
  -H "Authorization: Basic $(echo -n 'user:app-password' | base64)" \
  | grep -i 'x-qm'
```

#### C) Xdebug/XHProf + Blackfire

For PHP-level profiling — requires server configuration. Coordinate with hosting/DevOps.

### 3) Fixes by category (address the dominant bottleneck)

Use the profiling output to choose **one** main category:

#### A) Database queries

**Common issues**:

| Problem | Diagnosis | Solution |
|---------|-----------|----------|
| Too many queries | Query count > 50 per page | Identify N+1 patterns, use `update_meta_cache()` |
| Slow queries | Individual queries > 100ms | Add indexes, avoid complex `meta_query` |
| Expensive `meta_query` | `LIKE` or `NOT EXISTS` on postmeta | Consider custom taxonomy instead of meta |
| N+1 on post meta | `get_post_meta()` in loop without pre-cache | Use `update_postmeta_cache()` before the loop |

```php
// BEFORE — N+1 pattern (1 query for each post in the loop).
foreach ($posts as $post) {
    $stato = get_post_meta($post->ID, 'stato_bando', true);
}

// AFTER — Pre-cache + loop (2 total queries).
update_postmeta_cache(wp_list_pluck($posts, 'ID'));
foreach ($posts as $post) {
    $stato = get_post_meta($post->ID, 'stato_bando', true);
}
```

#### B) Autoload options

Options with `autoload = 'yes'` are loaded **on every request**:

```bash
# Identify the largest autoloaded options.
wp db query "SELECT option_name, LENGTH(option_value) as size FROM $(wp db prefix)options WHERE autoload = 'yes' ORDER BY size DESC LIMIT 20"
```

- If you find blobs > 100KB: consider disabling autoload or moving the data
- Plugins like `rewrite_rules`, `active_plugins`, `widget_*` are normally autoloaded

```php
// Disable autoload for a heavy option.
wp_set_option_autoload('mia_opzione_pesante', false);
```

#### C) Object cache

If there is no **persistent object cache** (Redis, Memcached), the cache is in-memory only for the single request:

```bash
# Check if an object cache drop-in exists.
wp eval "echo file_exists(WP_CONTENT_DIR . '/object-cache.php') ? 'YES' : 'NO';"
```

- **Without persistent cache**: every request re-runs all queries -> high impact on high-traffic sites
- **With persistent cache**: verify hit rate and key sizes

```php
// Use wp_cache for data that is expensive to compute.
$risultati = wp_cache_get('bandi_attivi_conteggio', '{{TEXT_DOMAIN}}');
if (false === $risultati) {
    $risultati = calcola_bandi_attivi();
    wp_cache_set('bandi_attivi_conteggio', $risultati, '{{TEXT_DOMAIN}}', HOUR_IN_SECONDS);
}
```

#### D) Remote HTTP calls

Calls to external APIs during page rendering are a performance killer:

- Add **short timeouts**: `'timeout' => 5` (WordPress default: 5s, but some plugins increase it)
- **Cache the responses** with transients:

```php
function get_dati_esterni(): array {
    $cached = get_transient('dati_api_esterna');
    if (false !== $cached) {
        return $cached;
    }

    $response = wp_remote_get('https://api.esempio.it/dati', ['timeout' => 5]);
    if (is_wp_error($response)) {
        return []; // Graceful fallback.
    }

    $dati = json_decode(wp_remote_retrieve_body($response), true);
    set_transient('dati_api_esterna', $dati, HOUR_IN_SECONDS);
    return $dati;
}
```

- **Never** call external APIs in a loop — use batch or a single request

#### E) Cron

```bash
# List scheduled cron events.
wp cron event list

# Run a single event for debugging.
wp cron event run mio_evento_cron
```

- Reduce "due now" event spikes — distribute the schedules
- Avoid cron tasks that do heavy work in the HTTP request path
- For long-running tasks: consider `wp cron event run` from the system (crontab) instead of `wp-cron.php`

### 4) Verification (repeat the same measurement)

```bash
# Same measurement as the baseline.
curl -o /dev/null -s -w "TTFB: %{time_starttransfer}s\nTotal: %{time_total}s\n" "https://esempio.test/bandi/"

# Or with WP-CLI.
wp profile stage --url="https://esempio.test/bandi/"
```

- Compare numbers before/after (same environment, same URL)
- Verify that functional behavior has not changed
- If the fix is risky, release behind a feature flag or gradually

## WordPress 6.9 — Performance improvements

Keep these changes in mind when profiling:

- **On-demand CSS for classic themes**: classic themes now load CSS only for blocks used on the page (previously only block themes). CSS payload reduction of 30-65%
- **Block themes without render-blocking assets**: themes like Twenty Twenty-Four can load with zero blocking CSS (inline styles from theme.json)
- **Increased CSS inline threshold**: more small stylesheets are inlined, reducing blocking requests

## Verification checklist

- [ ] Baseline and post-fix measurements captured (same environment, same URL)
- [ ] `wp doctor check` clean (or improved) if available
- [ ] No new PHP errors or warnings in the logs
- [ ] No cache flush needed for correctness (flushing should be a last resort)
- [ ] Functional behavior unchanged after optimization
- [ ] Query count reduced (goal: < 50 for a standard page)

## Common errors and solutions

| Problem | Likely cause | Solution |
|---------|-------------|----------|
| No improvement after the fix | Measured different URL/site, cache masking the result, stale opcode cache | Verify `--url` targeting, flush OPcache, repeat |
| Noisy profiling data | Background tasks, cold caches, few samples | Eliminate variables, test with warm caches, take more measurements |
| `SAVEQUERIES` causes overhead | Enabled in production | Disable immediately — use only in dev/staging |
| Object cache not working | Missing drop-in or Redis/Memcached server down | Verify `object-cache.php` and cache server status |

## What NOT to do

- **Do not** optimize without measuring first — profiling comes before the fix
- **Do not** enable `SAVEQUERIES` or `WP_DEBUG` in production without approval
- **Do not** install plugins or run load tests in production without coordination
- **Do not** flush cache during traffic without reason
- **Do not** add MySQL indexes blindly — verify with `EXPLAIN` first
- **Do not** cache everything indiscriminately — invalid cache is worse than no cache
