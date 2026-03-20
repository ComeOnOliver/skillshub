---
name: wp-plugin-development
description: "Architecture and development guidelines for WordPress plugins published on wordpress.org: file structure, plugin header, lifecycle hooks, Settings API, admin UI, custom post types, custom database tables, internationalization, plugin dependencies, and wordpress.org submission requirements. Based on the official WordPress Plugin Developer Handbook and Plugin Review Team guidelines."
compatibility: "WordPress 6.0+ / PHP 7.4+. Targets plugins for distribution on wordpress.org."
license: GPL-2.0-or-later
metadata:
  author: fernando-tellado
  version: "1.1"
---

# WordPress plugin development

## When to use

Use this skill when:

- Creating a new WordPress plugin from scratch
- Preparing a plugin for submission to wordpress.org
- Structuring plugin files and folders
- Implementing activation, deactivation, or uninstall routines
- Building admin settings pages with the Settings API
- Registering custom post types or taxonomies
- Creating custom database tables
- Making a plugin translation-ready
- Handling plugin dependencies (required plugins or PHP extensions)
- Reviewing code before wordpress.org submission

## Core development principles

### The plugin development mantra

```
Use WordPress APIs, never reinvent the wheel
Prefix everything, conflict with nothing
Clean up after yourself on uninstall
Leave no trace when disabled
```

### Key concepts

1. **Prefix everything**: All functions, classes, constants, and options must use a unique prefix to avoid conflicts
2. **WordPress APIs first**: Use WordPress functions over native PHP whenever an API exists
3. **Lifecycle awareness**: Know what runs on activation, deactivation, and uninstall — and keep them separate
4. **Settings API**: Never save options by hand; use the Settings API to register, validate, and store settings
5. **GPL compatibility**: All code and bundled libraries must be GPL-compatible for wordpress.org
6. **No inline assets**: Never print <script> or <style> tags directly with PHP — always use wp_enqueue_script() and wp_enqueue_style() with external files

### Prefixing rules

All functions, classes, constants, hooks, options, post types, taxonomy slugs, and script/style handles must use a unique prefix of **at least 4 characters**. The Plugin Review Team rejects plugins with short or generic prefixes.

| Element | Correct | Wrong |
|---------|---------|-------|
| Function | `ayudawp_get_settings()` | `wp_get_settings()`, `get_settings()` |
| Class | `AyudaWP_Settings` | `Settings`, `WP_Settings` |
| Constant | `AYUDAWP_VERSION` | `VERSION`, `MY_VERSION` |
| Option | `ayudawp_settings` | `settings`, `my_settings` |
| Post type | `ayudawp_event` | `event`, `my_event` |
| Hook | `ayudawp_after_save` | `after_save` |
| Script handle | `ayudawp-admin` | `admin-script` |

Do not use `wp_`, `wordpress_`, or `wc_` as prefixes — these are reserved by WordPress core and WooCommerce.

## Plugin file structure

A well-organized plugin is easier to review, maintain, and extend.

### Recommended structure

```
my-plugin/
├── my-plugin.php           # Main plugin file (bootstrap only)
├── readme.txt              # wordpress.org readme (required)
├── uninstall.php           # Uninstall logic (alternative to hook)
├── assets/
│   ├── css/
│   │   ├── admin.css
│   │   └── public.css
│   ├── js/
│   │   ├── admin.js
│   │   └── public.js
│   └── images/
├── includes/
│   ├── class-my-plugin.php         # Main plugin class
│   ├── class-my-plugin-admin.php   # Admin-specific functionality
│   ├── class-my-plugin-public.php  # Public-facing functionality
│   ├── class-my-plugin-cpt.php     # Custom post types / taxonomies
│   ├── class-my-plugin-db.php      # Custom database tables
│   └── class-my-plugin-settings.php # Settings API implementation
```

### Main plugin file

The main file is a bootstrap: it defines constants, checks requirements, and loads the rest.

```php
<?php
/**
 * Plugin Name:       My Plugin
 * Plugin URI:        https://example.com/my-plugin
 * Description:       A brief description of what the plugin does.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Your Name
 * Author URI:        https://example.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       my-plugin
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Plugin constants.
define( 'MYPLUGIN_VERSION',     '1.0.0' );
define( 'MYPLUGIN_FILE',        __FILE__ );
define( 'MYPLUGIN_DIR',         plugin_dir_path( __FILE__ ) );
define( 'MYPLUGIN_URL',         plugin_dir_url( __FILE__ ) );
define( 'MYPLUGIN_BASENAME',    plugin_basename( __FILE__ ) );

// Minimum requirements check.
function myplugin_meets_requirements() {
    if ( version_compare( PHP_VERSION, '7.4', '<' ) ) {
        return false;
    }
    if ( version_compare( get_bloginfo( 'version' ), '6.0', '<' ) ) {
        return false;
    }
    return true;
}

if ( ! myplugin_meets_requirements() ) {
    add_action( 'admin_notices', 'myplugin_requirements_notice' );
    return;
}

function myplugin_requirements_notice() {
    echo '<div class="notice notice-error"><p>' .
        esc_html__( 'My Plugin requires PHP 7.4+ and WordPress 6.0+.', 'my-plugin' ) .
        '</p></div>';
}

// Load the plugin.
require_once MYPLUGIN_DIR . 'includes/class-my-plugin.php';

// Lifecycle hooks must be registered in the main file, not inside a class.
register_activation_hook( MYPLUGIN_FILE,   array( 'My_Plugin', 'activate' ) );
register_deactivation_hook( MYPLUGIN_FILE, array( 'My_Plugin', 'deactivate' ) );

// Kick off.
My_Plugin::get_instance();
```
### Asset loading rules

WordPress plugins must load all JavaScript and CSS through the enqueue API using external files. Printing `<script>` or `<style>` tags directly in PHP output is forbidden — it bypasses WordPress dependency management, breaks Content Security Policy headers, prevents caching and deduplication, and is flagged by the Plugin Review Team.

```php
// WRONG: Inline script printed with PHP
add_action( 'wp_head', 'myplugin_bad_inline_script' );
function myplugin_bad_inline_script() {
    echo '<script>var config = { api: "https://example.com" };</script>';
}

// WRONG: Inline style printed with PHP
add_action( 'wp_head', 'myplugin_bad_inline_style' );
function myplugin_bad_inline_style() {
    echo '<style>.my-widget { color: red; }</style>';
}

// CORRECT: External JS file with data passed via wp_localize_script
wp_enqueue_script(
    'myplugin-frontend',
    MYPLUGIN_URL . 'assets/js/frontend.js',
    array(),
    MYPLUGIN_VERSION,
    true
);
wp_localize_script( 'myplugin-frontend', 'mypluginConfig', array(
    'api' => 'https://example.com',
) );

// CORRECT: External CSS file
wp_enqueue_style(
    'myplugin-frontend',
    MYPLUGIN_URL . 'assets/css/frontend.css',
    array(),
    MYPLUGIN_VERSION
);

// CORRECT: Small dynamic CSS via wp_add_inline_style (requires a registered stylesheet)
$custom_color = sanitize_hex_color( get_option( 'myplugin_color', '#333' ) );
wp_add_inline_style( 'myplugin-frontend', ".myplugin-widget { color: {$custom_color}; }" );

// CORRECT: Small dynamic JS via wp_add_inline_script (requires a registered script)
wp_add_inline_script( 'myplugin-frontend', 'console.log("loaded");', 'after' );
```

The only acceptable way to add small amounts of dynamic CSS or JS is through `wp_add_inline_style()` and `wp_add_inline_script()`, which attach the code to a properly enqueued handle.

### Plugin header requirements for wordpress.org

| Field | Required | Notes |
|-------|----------|-------|
| `Plugin Name` | Yes | Unique, descriptive |
| `Description` | Yes | Max 150 characters recommended |
| `Version` | Yes | Semantic versioning (1.0.0) |
| `Requires at least` | Yes | Minimum WordPress version |
| `Requires PHP` | Yes | Minimum PHP version |
| `Author` | Yes | Your name or company |
| `License` | Yes | Must be GPL-2.0-or-later or compatible |
| `Text Domain` | Yes | Must match the plugin folder slug |
| `Domain Path` | Deprecated | Do no add this line |

## Plugin lifecycle

### Activation hook

Runs when the plugin is activated. Use it to create database tables, set default options, and schedule cron events.

```php
// CORRECT: Activation - set up what the plugin needs to run
public static function activate() {
    // Check capabilities - prevents direct URL activation exploits
    if ( ! current_user_can( 'activate_plugins' ) ) {
        return;
    }

    // Create custom tables
    self::create_tables();

    // Set default options (only if they don't exist yet)
    if ( false === get_option( 'myplugin_settings' ) ) {
        add_option( 'myplugin_settings', array(
            'enabled' => true,
            'limit'   => 10,
        ), '', 'yes' ); // 'yes' = autoload
    }

    // Schedule cron events
    if ( ! wp_next_scheduled( 'myplugin_daily_task' ) ) {
        wp_schedule_event( time(), 'daily', 'myplugin_daily_task' );
    }

    // Store plugin version for future upgrade checks
    update_option( 'myplugin_version', MYPLUGIN_VERSION );

    // Flush rewrite rules if registering CPTs
    flush_rewrite_rules();
}

// WRONG: Never run heavy logic or queries during activation without guards
public static function activate() {
    $results = $wpdb->get_results( "SELECT * FROM {$wpdb->posts}" ); // Never!
    wp_remote_get( 'https://api.example.com/register' ); // Never!
}
```

### Deactivation hook

Runs when the plugin is deactivated. Clean up temporary data and scheduled events. Do NOT delete user data here.

```php
// CORRECT: Deactivation - stop scheduled tasks, clear transients
public static function deactivate() {
    if ( ! current_user_can( 'activate_plugins' ) ) {
        return;
    }

    // Remove scheduled cron events
    wp_clear_scheduled_hook( 'myplugin_daily_task' );

    // Clear transients
    delete_transient( 'myplugin_cache' );

    // Flush rewrite rules (remove CPT slugs from .htaccess)
    flush_rewrite_rules();

    // WRONG: Do NOT delete options or tables here - that is uninstall logic
}
```

### Uninstall logic

Runs only when the user deletes the plugin. This is where you permanently remove all plugin data.

```php
// OPTION A: uninstall.php in the plugin root (recommended for complex cleanup)
<?php
// Prevent direct access
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

// Delete options
delete_option( 'myplugin_settings' );
delete_option( 'myplugin_version' );

// Delete user meta
delete_metadata( 'user', 0, 'myplugin_preference', '', true );

// Drop custom tables
global $wpdb;
$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}myplugin_data" );

// Delete all plugin transients
$wpdb->query(
    "DELETE FROM {$wpdb->options}
     WHERE option_name LIKE '\_transient\_myplugin\_%'
     OR option_name LIKE '\_transient\_timeout\_myplugin\_%'"
);

// OPTION B: register_uninstall_hook() in main file (for simple cleanup only)
// register_uninstall_hook( MYPLUGIN_FILE, 'myplugin_uninstall' );
// Note: uninstall.php takes precedence over register_uninstall_hook()
```

### Lifecycle comparison

| Hook | When it runs | Use for |
|------|-------------|---------|
| `register_activation_hook` | On activation click | Create tables, default options, schedule cron |
| `register_deactivation_hook` | On deactivation click | Clear cron, flush rewrites, delete transients |
| `uninstall.php` | On plugin deletion | Delete all options, tables, user meta |
| `plugins_loaded` | Every request, after plugins load | Initialize plugin classes |
| `init` | Every request | Register CPTs, taxonomies, shortcodes |

## Main plugin class

Use a singleton to avoid multiple instantiations and keep global state controlled.

```php
<?php
// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Main plugin class.
 */
class My_Plugin {

    /** @var My_Plugin|null Singleton instance */
    private static $instance = null;

    /**
     * Get or create the singleton instance.
     */
    public static function get_instance(): self {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Private constructor - use get_instance().
     */
    private function __construct() {
        $this->load_dependencies();
        $this->define_hooks();
    }

    /**
     * Load required files.
     */
    private function load_dependencies(): void {
        require_once MYPLUGIN_DIR . 'includes/class-my-plugin-admin.php';
        require_once MYPLUGIN_DIR . 'includes/class-my-plugin-public.php';
        require_once MYPLUGIN_DIR . 'includes/class-my-plugin-cpt.php';
    }

    /**
     * Register all action and filter hooks.
     */
    private function define_hooks(): void {
        $admin  = new My_Plugin_Admin();
        $public = new My_Plugin_Public();
        $cpt    = new My_Plugin_CPT();

        // Admin hooks
        add_action( 'admin_menu',            array( $admin, 'add_admin_menu' ) );
        add_action( 'admin_init',            array( $admin, 'register_settings' ) );
        add_action( 'admin_enqueue_scripts', array( $admin, 'enqueue_assets' ) );

        // Public hooks
        add_action( 'wp_enqueue_scripts', array( $public, 'enqueue_assets' ) );
        add_shortcode( 'my_plugin',       array( $public, 'render_shortcode' ) );

        // CPT and taxonomy registration
        add_action( 'init', array( $cpt, 'register_post_types' ) );
        add_action( 'init', array( $cpt, 'register_taxonomies' ) );
    }

    /**
     * Activation callback (called from register_activation_hook in main file).
     */
    public static function activate(): void {
        // Activation logic here
        flush_rewrite_rules();
    }

    /**
     * Deactivation callback.
     */
    public static function deactivate(): void {
        wp_clear_scheduled_hook( 'myplugin_daily_task' );
        flush_rewrite_rules();
    }
}
```

## Hooks system

### Actions vs filters

```php
// ACTION: do something at a point in execution (no return value needed)
add_action( 'save_post', 'myplugin_on_save_post', 10, 2 );
function myplugin_on_save_post( int $post_id, WP_Post $post ): void {
    // Do something when a post is saved
}

// FILTER: modify a value and return it (always return the value!)
add_filter( 'the_content', 'myplugin_filter_content', 10, 1 );
function myplugin_filter_content( string $content ): string {
    // Modify and always return
    return $content . '<p>Added by plugin</p>';
}

// WRONG: Forgetting to return in a filter breaks the site
add_filter( 'the_content', function( $content ) {
    echo $content; // Never echo in a filter!
    // No return = null is returned, content disappears
} );
```

### Hook priorities

```php
// Default priority is 10. Lower = earlier, higher = later.
add_action( 'init', 'myplugin_early_init', 5 );   // Runs before default
add_action( 'init', 'myplugin_normal_init' );       // Priority 10 (default)
add_action( 'init', 'myplugin_late_init', 20 );    // Runs after default

// Number of accepted arguments (4th parameter)
add_action( 'save_post', 'myplugin_handler', 10, 3 ); // $post_id, $post, $update
```

### Removing hooks

```php
// To remove a hook added with a named function
remove_action( 'wp_head', 'wp_generator' );

// To remove a hook added with a class method - needs same instance
$instance = My_Plugin::get_instance();
remove_action( 'init', array( $instance, 'some_method' ) );

// WRONG: This does not work for anonymous functions (no reference)
$fn = function() { /* ... */ };
add_action( 'init', $fn );
remove_action( 'init', $fn ); // Works only if $fn is still in scope
```

## Settings API

The Settings API handles validation, storage, and security for plugin options. Never save options manually with `$_POST`.

### Complete Settings API implementation

```php
<?php
// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Handles plugin settings using the WordPress Settings API.
 */
class My_Plugin_Settings {

    /** @var string Option name in wp_options */
    const OPTION_NAME = 'myplugin_settings';

    /** @var string Settings page slug */
    const PAGE_SLUG = 'myplugin-settings';

    /** @var string Settings group (must match register_setting) */
    const OPTION_GROUP = 'myplugin_options_group';

    /**
     * Register settings, sections, and fields.
     * Hooked to admin_init.
     */
    public function register(): void {
        // Register the option with a sanitize callback
        register_setting(
            self::OPTION_GROUP,
            self::OPTION_NAME,
            array(
                'sanitize_callback' => array( $this, 'sanitize_settings' ),
                'default'           => $this->get_defaults(),
            )
        );

        // Add a section
        add_settings_section(
            'myplugin_general_section',
            __( 'General Settings', 'my-plugin' ),
            array( $this, 'render_general_section' ),
            self::PAGE_SLUG
        );

        // Add fields to the section
        add_settings_field(
            'myplugin_field_enabled',
            __( 'Enable feature', 'my-plugin' ),
            array( $this, 'render_field_enabled' ),
            self::PAGE_SLUG,
            'myplugin_general_section'
        );

        add_settings_field(
            'myplugin_field_limit',
            __( 'Results limit', 'my-plugin' ),
            array( $this, 'render_field_limit' ),
            self::PAGE_SLUG,
            'myplugin_general_section'
        );
    }

    /**
     * Sanitize all settings on save.
     * This is the only place where $_POST data is processed.
     *
     * @param  array $input Raw input from the form.
     * @return array Sanitized settings.
     */
    public function sanitize_settings( array $input ): array {
        $sanitized = $this->get_defaults();

        // Checkbox: present = true, absent = false
        $sanitized['enabled'] = isset( $input['enabled'] );

        // Integer with range validation
        if ( isset( $input['limit'] ) ) {
            $limit = absint( $input['limit'] );
            $sanitized['limit'] = ( $limit >= 1 && $limit <= 100 ) ? $limit : 10;
        }

        // Text field
        if ( isset( $input['api_key'] ) ) {
            $sanitized['api_key'] = sanitize_text_field( $input['api_key'] );
        }

        // Select with safelist validation
        $allowed_modes = array( 'simple', 'advanced' );
        if ( isset( $input['mode'] ) && in_array( $input['mode'], $allowed_modes, true ) ) {
            $sanitized['mode'] = $input['mode'];
        }

        return $sanitized;
    }

    /**
     * Get default settings values.
     */
    public function get_defaults(): array {
        return array(
            'enabled' => true,
            'limit'   => 10,
            'api_key' => '',
            'mode'    => 'simple',
        );
    }

    /**
     * Get a single setting value with fallback to default.
     *
     * @param  string $key Setting key.
     * @return mixed  Setting value.
     */
    public function get( string $key ) {
        $settings = get_option( self::OPTION_NAME, $this->get_defaults() );
        $defaults  = $this->get_defaults();
        return $settings[ $key ] ?? $defaults[ $key ] ?? null;
    }

    /**
     * Render the settings section description.
     */
    public function render_general_section(): void {
        echo '<p>' . esc_html__( 'Configure the general plugin behavior.', 'my-plugin' ) . '</p>';
    }

    /**
     * Render the "enabled" checkbox field.
     */
    public function render_field_enabled(): void {
        $value = $this->get( 'enabled' );
        printf(
            '<input type="checkbox" id="myplugin_field_enabled" name="%s[enabled]" value="1" %s>',
            esc_attr( self::OPTION_NAME ),
            checked( $value, true, false )
        );
        echo '<label for="myplugin_field_enabled">' .
             esc_html__( 'Enable the main feature', 'my-plugin' ) .
             '</label>';
    }

    /**
     * Render the "limit" number field.
     */
    public function render_field_limit(): void {
        $value = $this->get( 'limit' );
        printf(
            '<input type="number" id="myplugin_field_limit" name="%s[limit]" value="%d" min="1" max="100" class="small-text">',
            esc_attr( self::OPTION_NAME ),
            absint( $value )
        );
        echo '<p class="description">' .
             esc_html__( 'Number of results to show (1-100).', 'my-plugin' ) .
             '</p>';
    }
}
```

### Admin menu and settings page

```php
/**
 * Registers admin menu pages.
 * Hooked to admin_menu.
 */
public function add_admin_menu(): void {
    // Top-level menu page
    add_menu_page(
        __( 'My Plugin', 'my-plugin' ),         // Page title
        __( 'My Plugin', 'my-plugin' ),         // Menu title
        'manage_options',                         // Capability required
        'myplugin-settings',                     // Menu slug
        array( $this, 'render_settings_page' ), // Callback
        'dashicons-admin-generic',               // Icon
        80                                        // Position
    );

    // Submenu page (can also add submenus under existing menus)
    add_submenu_page(
        'myplugin-settings',                      // Parent slug
        __( 'My Plugin Settings', 'my-plugin' ), // Page title
        __( 'Settings', 'my-plugin' ),           // Menu title
        'manage_options',
        'myplugin-settings',
        array( $this, 'render_settings_page' )
    );
}

/**
 * Render the settings page.
 * settings_fields() and do_settings_sections() do all the heavy lifting.
 */
public function render_settings_page(): void {
    // Always check capabilities again before rendering
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( esc_html__( 'You do not have permission to access this page.', 'my-plugin' ) );
    }
    ?>
    <div class="wrap">
        <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>

        <?php settings_errors( 'myplugin_messages' ); ?>

        <form method="post" action="options.php">
            <?php
            // Output nonce, action, and option_page fields
            settings_fields( My_Plugin_Settings::OPTION_GROUP );

            // Output the registered sections and fields
            do_settings_sections( My_Plugin_Settings::PAGE_SLUG );

            submit_button( __( 'Save settings', 'my-plugin' ) );
            ?>
        </form>
    </div>
    <?php
}
```

## Custom post types and taxonomies

### Registering a custom post type

```php
/**
 * Registers custom post types.
 * Hooked to init.
 */
public function register_post_types(): void {
    $labels = array(
        'name'               => _x( 'Events', 'post type general name', 'my-plugin' ),
        'singular_name'      => _x( 'Event', 'post type singular name', 'my-plugin' ),
        'menu_name'          => _x( 'Events', 'admin menu', 'my-plugin' ),
        'add_new'            => __( 'Add new', 'my-plugin' ),
        'add_new_item'       => __( 'Add new event', 'my-plugin' ),
        'edit_item'          => __( 'Edit event', 'my-plugin' ),
        'not_found'          => __( 'No events found.', 'my-plugin' ),
        'not_found_in_trash' => __( 'No events found in trash.', 'my-plugin' ),
    );

    $args = array(
        'labels'             => $labels,
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_rest'       => true, // Required for Gutenberg support
        'menu_position'      => 5,
        'menu_icon'          => 'dashicons-calendar-alt',
        'supports'           => array( 'title', 'editor', 'thumbnail', 'excerpt' ),
        'has_archive'        => true,
        'rewrite'            => array( 'slug' => 'events' ),
        'capability_type'    => 'post',
    );

    register_post_type( 'myplugin_event', $args );
}

// IMPORTANT: Always flush rewrite rules on activation/deactivation when registering CPTs
// Do NOT call flush_rewrite_rules() directly on init - only on activation/deactivation
```

### Registering a custom taxonomy

```php
public function register_taxonomies(): void {
    $labels = array(
        'name'              => _x( 'Event Categories', 'taxonomy general name', 'my-plugin' ),
        'singular_name'     => _x( 'Event Category', 'taxonomy singular name', 'my-plugin' ),
        'search_items'      => __( 'Search event categories', 'my-plugin' ),
        'all_items'         => __( 'All event categories', 'my-plugin' ),
        'edit_item'         => __( 'Edit event category', 'my-plugin' ),
        'update_item'       => __( 'Update event category', 'my-plugin' ),
        'add_new_item'      => __( 'Add new event category', 'my-plugin' ),
        'not_found'         => __( 'No event categories found.', 'my-plugin' ),
    );

    register_taxonomy(
        'myplugin_event_cat',   // Taxonomy slug
        array( 'myplugin_event' ), // Post types it applies to
        array(
            'labels'            => $labels,
            'hierarchical'      => true,  // true = category-like, false = tag-like
            'public'            => true,
            'show_in_rest'      => true,  // Required for Gutenberg
            'show_admin_column' => true,
            'rewrite'           => array( 'slug' => 'event-category' ),
        )
    );
}
```

## Custom database tables

Only create custom tables when WordPress's existing data structures (posts, meta, options) genuinely cannot serve the use case.

### Creating tables with dbDelta

```php
/**
 * Creates or updates the custom database table.
 * Uses dbDelta() which handles both CREATE and ALTER safely.
 */
public static function create_tables(): void {
    global $wpdb;

    $table_name      = $wpdb->prefix . 'myplugin_data';
    $charset_collate = $wpdb->get_charset_collate();

    // dbDelta requires specific formatting:
    // - Two spaces before field definitions
    // - PRIMARY KEY must be uppercase
    // - Each line ends with a comma (except the last field before the closing paren)
    $sql = "CREATE TABLE {$table_name} (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL DEFAULT 0,
        post_id bigint(20) UNSIGNED NOT NULL DEFAULT 0,
        data longtext NOT NULL,
        status varchar(20) NOT NULL DEFAULT 'pending',
        created_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
        PRIMARY KEY  (id),
        KEY user_id (user_id),
        KEY post_id (post_id)
    ) {$charset_collate};";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta( $sql );

    // Store the table version for future upgrades
    update_option( 'myplugin_db_version', '1.0' );
}

/**
 * Run table upgrades when plugin version changes.
 * Hook to plugins_loaded.
 */
public function maybe_upgrade(): void {
    $installed = get_option( 'myplugin_db_version', '0' );

    if ( version_compare( $installed, '1.1', '<' ) ) {
        global $wpdb;
        $table = $wpdb->prefix . 'myplugin_data';

        // dbDelta handles adding new columns safely
        $sql = "CREATE TABLE {$table} (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id bigint(20) UNSIGNED NOT NULL DEFAULT 0,
            post_id bigint(20) UNSIGNED NOT NULL DEFAULT 0,
            data longtext NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'pending',
            priority tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
            created_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
            PRIMARY KEY  (id),
            KEY user_id (user_id)
        ) {$wpdb->get_charset_collate()};";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sql );

        update_option( 'myplugin_db_version', '1.1' );
    }
}
```

### dbDelta formatting rules

| Rule | Correct | Wrong |
|------|---------|-------|
| Field indentation | Two spaces | One space or tab |
| PRIMARY KEY spacing | `PRIMARY KEY  (id)` | `PRIMARY KEY (id)` |
| Index naming | `KEY user_id (user_id)` | `INDEX user_id (user_id)` |
| No trailing comma | Last field has no comma | Trailing comma on last field |
| Always use `$wpdb->prefix` | `{$wpdb->prefix}table` | Hardcoded `wp_table` |

## Internationalization

Every user-facing string must be wrapped in a localization function. This is mandatory for wordpress.org.

### Localization functions

| Function | Use case |
|----------|----------|
| `__( 'text', 'domain' )` | Return translated string |
| `_e( 'text', 'domain' )` | Echo translated string |
| `_x( 'text', 'context', 'domain' )` | With disambiguation context |
| `_n( 'singular', 'plural', $count, 'domain' )` | Singular/plural |
| `_nx( 'sing', 'plur', $count, 'context', 'domain' )` | Plural with context |
| `esc_html__( 'text', 'domain' )` | Return translated + escaped |
| `esc_html_e( 'text', 'domain' )` | Echo translated + escaped |
| `esc_attr__( 'text', 'domain' )` | Return for attribute context |

### i18n examples

```php
// CORRECT: All user-facing strings wrapped and escaped
echo '<h2>' . esc_html__( 'Plugin Settings', 'my-plugin' ) . '</h2>';

// CORRECT: Singular/plural
printf(
    /* translators: %d: number of items */
    esc_html( _n( '%d item found.', '%d items found.', $count, 'my-plugin' ) ),
    absint( $count )
);

// CORRECT: Context for disambiguation (same word, different meaning)
$label = _x( 'Draft', 'post status', 'my-plugin' );
$label = _x( 'Draft', 'button label', 'my-plugin' );

// CORRECT: Variable in translated string - use printf/sprintf, not concatenation
printf(
    /* translators: %s: user display name */
    esc_html__( 'Hello, %s!', 'my-plugin' ),
    esc_html( $user->display_name )
);

// WRONG: Concatenating strings breaks translation
echo esc_html__( 'Hello, ', 'my-plugin' ) . esc_html( $name ) . '!';

// WRONG: Translating variable content
$status = 'published';
echo esc_html__( $status, 'my-plugin' ); // Translators can't see this!
```

### Text domain rules for wordpress.org

```php
// CORRECT: Text domain is a string literal, matches plugin folder slug
__( 'text', 'my-plugin' );

// WRONG: Variable text domain - prevents string extraction
$domain = 'my-plugin';
__( 'text', $domain );

// The text domain in function calls MUST match the Text Domain header in the plugin file
// and the plugin folder name on wordpress.org
```

### Translation template generation

There is no need to generate a `.pot` file because de use of Domain Path is deprecated

`load_plugin_textdomain()` is not needed since WordPress 4.6.

## Plugin dependencies

### Checking for required plugins

```php
// CORRECT: Check on plugins_loaded (all plugins are loaded)
add_action( 'plugins_loaded', 'myplugin_check_dependencies' );

function myplugin_check_dependencies(): void {
    // Check if WooCommerce is active
    if ( ! class_exists( 'WooCommerce' ) ) {
        add_action( 'admin_notices', 'myplugin_woo_missing_notice' );
        // Optionally deactivate self
        deactivate_plugins( plugin_basename( MYPLUGIN_FILE ) );
        return;
    }

    // Check minimum WooCommerce version
    if ( defined( 'WC_VERSION' ) && version_compare( WC_VERSION, '7.0', '<' ) ) {
        add_action( 'admin_notices', 'myplugin_woo_version_notice' );
        return;
    }

    // All good - initialize the plugin
    My_Plugin::get_instance();
}

function myplugin_woo_missing_notice(): void {
    echo '<div class="notice notice-error"><p>' .
        sprintf(
            /* translators: %s: plugin name */
            esc_html__( 'My Plugin requires %s to be installed and active.', 'my-plugin' ),
            '<strong>WooCommerce</strong>'
        ) .
        '</p></div>';
}
```

### Checking for PHP extensions

```php
// In the main file, before loading anything
$missing_extensions = array();

if ( ! extension_loaded( 'curl' ) ) {
    $missing_extensions[] = 'cURL';
}
if ( ! extension_loaded( 'mbstring' ) ) {
    $missing_extensions[] = 'mbstring';
}

if ( ! empty( $missing_extensions ) ) {
    add_action( 'admin_notices', function() use ( $missing_extensions ) {
        echo '<div class="notice notice-error"><p>' .
            sprintf(
                /* translators: %s: comma-separated list of PHP extensions */
                esc_html__( 'My Plugin requires the following PHP extensions: %s', 'my-plugin' ),
                '<strong>' . esc_html( implode( ', ', $missing_extensions ) ) . '</strong>'
            ) .
            '</p></div>';
    } );
    return;
}
```

## wordpress.org submission requirements

### Common rejection reasons

| Issue | Fix |
|-------|-----|
| Unescaped output | Apply the correct `esc_*` function at every output point |
| Missing nonce verification | Add `check_admin_referer()` or `wp_verify_nonce()` to all form handlers |
| Using `$_POST` directly | Always sanitize with the appropriate `sanitize_*` function |
| Calling external URLs on every load | Cache responses with transients; move requests to cron |
| Hardcoded database prefix (`wp_`) | Always use `$wpdb->prefix` |
| `eval()` usage | Never use `eval()` — rejected automatically |
| Non-GPL bundled code | All included libraries must be GPL-compatible |
| Missing `ABSPATH` check | Add to every PHP file except the main plugin file |
| `error_reporting()` calls | Remove entirely; never ship debug code |
| Overwriting WordPress globals | Never modify `$wp_query`, `$wpdb`, etc. globally |
| `extract()` usage | Forbidden — creates unpredictable variable scope |
| Generic function/class names | Prefix everything with a unique identifier |
| Short or generic prefix (under 4 characters) | Use a unique prefix of at least 4 characters for all functions, classes, constants, hooks, and handles |
| Inline <script> or <style> tags in PHP | Use wp_enqueue_script() / wp_enqueue_style() with external files; use wp_add_inline_script() / wp_add_inline_style() only for small dynamic values |

### readme.txt structure

```
=== Plugin Name ===
Contributors: yourusername, secondcontributor
Tags: tag1, tag2, tag3, tag4, tag5
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Short description under 150 characters. No markup.

== Description ==

Full description of the plugin. Supports Markdown.

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/`.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Go to Settings > My Plugin to configure.

== Frequently Asked Questions ==

= How do I configure the plugin? =

Go to Settings > My Plugin.

== Screenshots ==

1. Screenshot description (matches screenshot-1.png in /assets/).

== Changelog ==

= 1.0.0 =
* Initial release.

== Upgrade Notice ==

= 1.0.0 =
Initial release.
```

### readme.txt rules for wordpress.org

- Maximum 5 tags
- Short description: 150 characters maximum, no HTML
- Upgrade notice: under 300 characters
- No Network header (means network-only activation, which is rarely correct)
- `Tested up to` must reflect the latest WordPress version you have tested
- `Stable tag` must match the actual tag in the SVN repository
- Changelog must be present and maintained
- No donation links unless approved by the Plugin Review Team

### Assets for the wordpress.org plugin page

Place these in the `/assets/` folder in the SVN root (not inside the plugin folder):

| File | Size | Format |
|------|------|--------|
| `banner-772x250.png` or `.jpg` | 772×250px | Plugin page banner |
| `banner-1544x500.png` or `.jpg` | 1544×500px | High-DPI banner |
| `icon-128x128.png` | 128×128px | Plugin icon |
| `icon-256x256.png` | 256×256px | High-DPI icon |
| `screenshot-1.png` | Any | Must match screenshots in readme |

## Debugging

### Debug constants

```php
// In wp-config.php for development (never ship with these enabled)
define( 'WP_DEBUG',         true );
define( 'WP_DEBUG_LOG',     true );  // Writes to /wp-content/debug.log
define( 'WP_DEBUG_DISPLAY', false ); // Never display errors on screen in production
define( 'SAVEQUERIES',      true );  // Logs all DB queries (expensive - dev only)
define( 'SCRIPT_DEBUG',     true );  // Loads unminified JS/CSS
```

### Logging in plugin code

```php
// CORRECT: Log only in debug mode
if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
    error_log( '[My Plugin] Unexpected value: ' . print_r( $value, true ) );
}

// CORRECT: Structured log with plugin prefix
function myplugin_log( string $message, $data = null ): void {
    if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
        return;
    }
    $entry = '[My Plugin] ' . $message;
    if ( null !== $data ) {
        $entry .= ' | ' . print_r( $data, true );
    }
    error_log( $entry );
}

// WRONG: Never ship debug output in production code
var_dump( $variable );
print_r( $variable );
echo '<pre>' . $output . '</pre>';
```

### Testing with WP_CLI

```bash
# Run a specific function for testing
wp eval 'var_dump( get_option( "myplugin_settings" ) );'

# Check cron events
wp cron event list

# Trigger cron manually
wp cron event run myplugin_daily_task

# Check plugin is installed correctly
wp plugin verify-checksums my-plugin

# Generate translation template
wp i18n make-pot . languages/my-plugin.pot
```

## Code review checklist

### File structure and header

- [ ] Main file has all required headers (`Plugin Name`, `Version`, `Requires at least`, `Requires PHP`, `License`, `Text Domain`)
- [ ] `Text Domain` matches the plugin folder slug
- [ ] All PHP files have `ABSPATH` check at the top
- [ ] Assets (CSS/JS) are in `/assets/` subfolder, not inline
- [ ] Includes are in `/includes/` subfolder, not all in the main file

### Lifecycle

- [ ] `register_activation_hook()` registered in the main file
- [ ] `register_deactivation_hook()` registered in the main file
- [ ] `uninstall.php` exists and removes all plugin data
- [ ] Cron events cleared on deactivation
- [ ] `flush_rewrite_rules()` called on activation and deactivation (if using CPTs)
- [ ] Default options use `add_option()`, not `update_option()`, on activation
- [ ] Plugin version stored in options for future upgrade checks

### Settings API

- [ ] `register_setting()` used with a sanitize callback
- [ ] `sanitize_callback` validates all fields before saving
- [ ] `settings_fields()` and `do_settings_sections()` used in settings form
- [ ] Settings page checks `current_user_can()` before rendering
- [ ] Single option array used instead of one `add_option()` per setting

### Custom post types and taxonomies

- [ ] CPTs and taxonomies registered on `init`, not earlier
- [ ] `show_in_rest => true` set for Gutenberg compatibility
- [ ] Slugs use plugin prefix to avoid conflicts
- [ ] `flush_rewrite_rules()` called on activation/deactivation

### Custom database tables

- [ ] `dbDelta()` used for table creation (not `$wpdb->query( 'CREATE TABLE...' )`)
- [ ] Two spaces before field definitions in the SQL
- [ ] `$wpdb->get_charset_collate()` appended to table definition
- [ ] `$wpdb->prefix` used, never hardcoded `wp_`
- [ ] Table version stored in options for upgrade management
- [ ] Tables dropped in `uninstall.php`

### Internationalization

- [ ] All user-facing strings wrapped in localization functions
- [ ] Text domain is a string literal matching the plugin slug
- [ ] Escaped combined functions used (`esc_html__()` not `__()`)
- [ ] `printf()` / `sprintf()` used for strings with variables (never concatenation)
- [ ] Translator comments added for strings with variables (`/* translators: %s: description */`)
- [ ] There is no need to generate a `.pot` file because de use of Domain Path is deprecated

### Hooks and architecture

- [ ] Unique prefix used for all functions, classes, hooks, and constants
- [ ] All prefixes are at least 4 characters long and unique
- [ ] Filters always return a value
- [ ] No `extract()` usage
- [ ] No `eval()` usage
- [ ] No overwriting WordPress globals
- [ ] Class-based organization with a single plugin bootstrap in the main file

### wordpress.org compliance

- [ ] `readme.txt` present with all required sections
- [ ] Maximum 5 tags in `readme.txt`
- [ ] Short description under 150 characters
- [ ] Upgrade text under 300 characters
- [ ] No Network header in `readme.txt`
- [ ] All bundled libraries are GPL-compatible
- [ ] No hardcoded calls to external services on every page load
- [ ] No inline <script> or <style> tags — all assets use wp_enqueue_* with external files
- [ ] No shipping of debug code (`var_dump`, `print_r`, `error_reporting()`)

## References

- [Plugin Developer Handbook](https://developer.wordpress.org/plugins/)
- [Plugin Basics](https://developer.wordpress.org/plugins/plugin-basics/)
- [Plugin Security](https://developer.wordpress.org/plugins/security/)
- [Hooks: Actions and Filters](https://developer.wordpress.org/plugins/hooks/)
- [Settings API](https://developer.wordpress.org/plugins/settings/settings-api/)
- [Custom Post Types](https://developer.wordpress.org/plugins/post-types/)
- [Taxonomies](https://developer.wordpress.org/plugins/taxonomies/)
- [Internationalization](https://developer.wordpress.org/plugins/internationalization/)
- [Plugin Submission Guidelines](https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/)
- [Common Plugin Review Issues](https://developer.wordpress.org/plugins/wordpress-org/common-issues/)
- [readme.txt Standard](https://developer.wordpress.org/plugins/wordpress-org/how-your-readme-txt-works/)
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/)
