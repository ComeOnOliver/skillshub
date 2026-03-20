---
name: wp-plugin-development
description: WordPress plugin development — architecture, hooks, Settings API, security, data, and lifecycle. Always-active rules when working on plugins or mu-plugins.
user-invocable: false
---

# WordPress Plugin Development

Skill for creating and maintaining WordPress plugins. Covers architecture, lifecycle (activation/deactivation/uninstallation), Settings API, security, and data storage.

## When to use

Apply this skill when the task involves:

- Creating or restructuring a plugin (bootstrap, namespace, classes)
- Adding hooks, actions, and filters
- Managing activation, deactivation, and uninstallation
- Creating settings pages with the Settings API
- Implementing security (nonce, capability, sanitization, escaping)
- Data storage (options, custom tables, migrations)

## Prerequisites

Before starting, verify:

- Plugin path (under `plugins/` or `mu-plugins/`)
- Whether the site is single or multisite
- Minimum WordPress and PHP version of the project
- Any dependencies (Composer, external libraries)

## Procedure

### 1) Predictable architecture

**Fundamental rules**:

- **Single bootstrap**: the main file with the plugin header is the only entry point
- **No side-effects on load**: do not execute logic in the `require` — register everything on hooks
- **Dedicated loader**: use a class or function to register all hooks in a centralized location
- **Separate admin code**: protect admin code with `is_admin()` or specific hooks (`admin_init`, `admin_menu`) to reduce frontend overhead

```php
<?php
/**
 * Plugin Name: {{PROJECT_NAME}} — Custom functionality
 * Description: Custom extensions for the project.
 * Version:     1.0.0
 * Author:      Developer
 * Text Domain: {{TEXT_DOMAIN}}
 * Requires PHP: 8.2
 */

declare(strict_types=1);

// Prevent direct access.
defined('ABSPATH') || exit;

// Load dependencies.
require_once __DIR__ . '/src/bootstrap.php';
```

**Recommended structure**:

```
my-plugin/
├── my-plugin.php           # Header + require bootstrap
├── src/
│   ├── bootstrap.php       # Register hooks and load classes
│   ├── Admin/              # Admin pages, settings
│   ├── Frontend/           # Shortcode, template tags
│   ├── REST/               # REST endpoints (if present)
│   └── Includes/           # Utilities, helpers
├── assets/                 # Compiled CSS/JS
├── languages/              # .pot/.po/.mo files
├── templates/              # PHP templates for output
└── uninstall.php           # Data cleanup on uninstallation
```

### 2) Lifecycle — Activation, deactivation, uninstallation

Lifecycle hooks are **delicate** — errors here block plugin activation.

**Rules**:

- Register `register_activation_hook` and `register_deactivation_hook` in the main file, **not** inside other hooks
- Call `flush_rewrite_rules()` **only** after registering CPTs/rewrite rules
- Uninstallation must be explicit and safe

```php
// In the main plugin file.
register_activation_hook(__FILE__, function (): void {
    // Create tables, initial options, roles.
    add_option('my_plugin_version', '1.0.0');

    // If you register CPTs, register them BEFORE flushing.
    register_custom_post_types();
    flush_rewrite_rules();
});

register_deactivation_hook(__FILE__, function (): void {
    // Remove cron, flush rules.
    wp_clear_scheduled_hook('my_plugin_cron');
    flush_rewrite_rules();
});
```

**Uninstallation** — prefer `uninstall.php` (safer than `register_uninstall_hook`):

```php
// uninstall.php
defined('WP_UNINSTALL_PLUGIN') || exit;

delete_option('my_plugin_version');
delete_option('my_plugin_settings');
// Remove custom tables if present.
```

### 3) Settings API — Settings pages

Always use the native Settings API to manage options:

```php
add_action('admin_init', function (): void {
    register_setting('my_plugin_options', 'my_plugin_settings', [
        'type'              => 'array',
        'sanitize_callback' => 'sanitize_plugin_settings',
        'default'           => [
            'api_url'   => '',
            'per_page'  => 10,
            'active'    => false,
        ],
    ]);

    add_settings_section(
        'my_plugin_general',
        __('General Settings', '{{TEXT_DOMAIN}}'),
        null,
        'my_plugin_options'
    );

    add_settings_field(
        'api_url',
        __('URL API', '{{TEXT_DOMAIN}}'),
        'render_api_url_field',
        'my_plugin_options',
        'my_plugin_general'
    );
});

function sanitize_plugin_settings(array $input): array {
    return [
        'api_url'   => esc_url_raw($input['api_url'] ?? ''),
        'per_page'  => absint($input['per_page'] ?? 10),
        'active'    => !empty($input['active']),
    ];
}
```

- `register_setting()` with `sanitize_callback` for every option group
- `esc_url_raw()` for URLs, `absint()` for integers, `sanitize_text_field()` for strings
- Use `get_option('my_plugin_settings')` to read

### 4) Security baseline (always)

These rules apply **to all** plugin/theme code:

#### Validate input / Escape output

```php
// INPUT — sanitize early.
$title  = sanitize_text_field(wp_unslash($_POST['title'] ?? ''));
$email  = sanitize_email($_POST['email'] ?? '');
$url    = esc_url_raw($_POST['url'] ?? '');
$html   = wp_kses_post($_POST['content'] ?? '');

// OUTPUT — escape late.
echo esc_html($title);
echo esc_attr($value);
echo esc_url($link);
echo wp_kses_post($html_content);
```

#### Nonce to prevent CSRF

```php
// In the form.
wp_nonce_field('my_plugin_save', 'my_plugin_nonce');

// In the handler.
if (!wp_verify_nonce($_POST['my_plugin_nonce'] ?? '', 'my_plugin_save')) {
    wp_die(__('Security verification failed.', '{{TEXT_DOMAIN}}'));
}
```

#### Capability check for authorization

```php
// ALWAYS check capabilities, not roles.
if (!current_user_can('manage_options')) {
    wp_die(__('You do not have permission for this action.', '{{TEXT_DOMAIN}}'));
}
```

#### Secure SQL

```php
// NEVER concatenate strings in SQL queries.
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}my_table WHERE status = %s AND amount > %d",
        $status,
        $min_amount
    )
);
```

### 5) Data storage

| Data type | Where to store | When |
|-----------|---------------|------|
| Plugin configuration | `wp_options` with `get_option`/`update_option` | Few values, frequent access |
| Per-post metadata | `postmeta` with `get_post_meta`/`update_post_meta` | Data tied to a single post |
| Structured/relational data | Custom table `$wpdb->prefix . 'my_table'` | Many records, complex queries, performance |
| Temporary cache | Transients (`get_transient`/`set_transient`) | API results, expensive calculations |

**Migrations and upgrades** — always save a schema version:

```php
function my_plugin_upgrade_check(): void {
    $current = get_option('my_plugin_db_version', '0');
    if (version_compare($current, '1.1.0', '<')) {
        my_plugin_upgrade_110();
        update_option('my_plugin_db_version', '1.1.0');
    }
}
add_action('plugins_loaded', 'my_plugin_upgrade_check');
```

**Cron tasks** — ensure idempotency:

```php
// Register the event if it does not exist.
if (!wp_next_scheduled('my_plugin_cron')) {
    wp_schedule_event(time(), 'daily', 'my_plugin_cron');
}

add_action('my_plugin_cron', function (): void {
    // Idempotent logic — safe to run multiple times.
});
```

## Verification checklist

- [ ] The plugin activates without fatal errors or notices
- [ ] Settings save and read correctly
- [ ] Nonce and capability checks are present on every form/action
- [ ] Uninstallation removes the plugin's data (and only that)
- [ ] `sanitize_callback` defined for every `register_setting`
- [ ] No direct access to `$_POST`/`$_GET` without sanitization
- [ ] No SQL queries with string concatenation
- [ ] The project lint/test passes (Pint, PHPUnit if present)

## Common errors and solutions

| Problem | Likely cause | Solution |
|---------|-------------|----------|
| Activation hook not executed | Registered inside another hook, not in the main file | Move `register_activation_hook` to the main .php file |
| Settings not saved | Setting not registered, wrong option group, nonce failed | Verify `register_setting()`, check group and nonce |
| Security regression | Nonce present but capability check missing | Always add **both**: nonce + `current_user_can()` |
| Custom table not created | `dbDelta()` not called correctly | Verify SQL syntax and that `dbDelta` receives queries as a string |
| Plugin slow on frontend | Admin code loaded on every request | Protect with `is_admin()` or admin-specific hooks |

## What NOT to do

- **Do not** execute logic at `require`/`include` — register everything on hooks
- **Do not** use `extract()` — it makes code unreadable and insecure
- **Do not** hardcode paths with `ABSPATH . 'wp-content/'` — use `plugin_dir_path()`, `plugin_dir_url()`
- **Do not** create custom tables for data that would fit in `wp_options` or `postmeta`
- **Do not** trust `$_POST`/`$_GET`/`$_REQUEST` without sanitization
- **Do not** use `wp_die()` as the only error handling — return `WP_Error` when possible
- **Do not** forget the text domain `'{{TEXT_DOMAIN}}'` in translatable strings
