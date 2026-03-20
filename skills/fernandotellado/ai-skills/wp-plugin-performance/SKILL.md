---
name: wp-plugin-performance
description: "Performance guidelines for WordPress plugin development: database optimization, object caching, conditional asset loading, efficient hooks, HTTP requests, WP-Cron, AJAX/REST optimization, and common anti-patterns. Based on official WordPress Developer Resources and WP VIP documentation."
compatibility: "WordPress 6.0+ / PHP 7.4+. Applies to plugins and custom code."
license: GPL-2.0-or-later
metadata:
  author: fernando-tellado
  version: "1.0"
---

# WordPress plugin performance

## When to use

Use this skill when:

- Developing new WordPress plugins
- Optimizing existing plugin code for better performance
- Working with database queries (WP_Query, $wpdb, options)
- Implementing caching strategies (object cache, transients)
- Loading assets (scripts, styles) efficiently
- Creating AJAX handlers or REST API endpoints
- Scheduling background tasks with WP-Cron
- Making external HTTP requests from plugins
- Reviewing code before deployment to high-traffic sites

## Core performance principles

### The performance mantra

```
Query only what you need
Cache expensive operations
Load assets conditionally
Avoid work on every request
```

### Key concepts

1. **Bounded queries**: Always limit results with `posts_per_page` or similar
2. **Object caching**: Store expensive computations for reuse across requests
3. **Conditional loading**: Enqueue scripts/styles only where needed
4. **Context awareness**: Check `is_admin()`, page conditions before heavy operations
5. **Async processing**: Move slow tasks to WP-Cron or background processes

## Database queries

Efficient database queries are the foundation of plugin performance.

### WP_Query optimization

| Parameter | Purpose |
|-----------|---------|
| `posts_per_page` | Limit results (never use -1 in production) |
| `no_found_rows` | Skip counting total rows when not paginating |
| `update_post_meta_cache` | Set false if not using post meta |
| `update_post_term_cache` | Set false if not using taxonomies |
| `fields` | Request only 'ids' or 'id=>parent' when full objects not needed |
| `cache_results` | Keep true unless intentionally bypassing cache |

### WP_Query examples

```php
// CORRECT: Optimized query for displaying 10 posts
$query = new WP_Query( array(
    'post_type'              => 'post',
    'posts_per_page'         => 10,
    'no_found_rows'          => true, // Skip SQL_CALC_FOUND_ROWS if not paginating
    'update_post_meta_cache' => false, // Skip if not using meta
    'update_post_term_cache' => false, // Skip if not using terms
) );

// CORRECT: Get only post IDs for a lightweight lookup
$post_ids = get_posts( array(
    'post_type'      => 'product',
    'posts_per_page' => 100,
    'fields'         => 'ids',
    'no_found_rows'  => true,
) );

// WRONG: Unbounded query - will crash on large sites
$all_posts = get_posts( array(
    'post_type'      => 'post',
    'posts_per_page' => -1, // Never do this in production!
) );
```

### When pagination is needed

```php
// CORRECT: With pagination - need found_rows for page links
$paged = get_query_var( 'paged' ) ? get_query_var( 'paged' ) : 1;

$query = new WP_Query( array(
    'post_type'      => 'post',
    'posts_per_page' => 10,
    'paged'          => $paged,
    // no_found_rows defaults to false - we need the count
) );

// Display pagination
echo paginate_links( array(
    'total' => $query->max_num_pages,
) );
```

### Avoid query_posts()

```php
// WRONG: Never use query_posts() - breaks main query and pagination
query_posts( 'cat=5' );

// CORRECT: Use pre_get_posts filter to modify main query
add_action( 'pre_get_posts', 'ayudawp_modify_main_query' );
function ayudawp_modify_main_query( $query ) {
    if ( ! is_admin() && $query->is_main_query() && $query->is_home() ) {
        $query->set( 'cat', 5 );
    }
}

// CORRECT: Use WP_Query for secondary queries
$custom_query = new WP_Query( array( 'cat' => 5 ) );
```

### Meta queries optimization

Meta queries scan unindexed columns. Use them sparingly.

```php
// WRONG: Complex meta query on every page load
$query = new WP_Query( array(
    'meta_query' => array(
        'relation' => 'AND',
        array(
            'key'     => 'color',
            'value'   => 'red',
            'compare' => '=',
        ),
        array(
            'key'     => 'size',
            'value'   => array( 'S', 'M', 'L' ),
            'compare' => 'IN',
        ),
    ),
) );

// CORRECT: Use taxonomy for filterable attributes
register_taxonomy( 'product_color', 'product', array( /* ... */ ) );
register_taxonomy( 'product_size', 'product', array( /* ... */ ) );

$query = new WP_Query( array(
    'tax_query' => array(
        'relation' => 'AND',
        array(
            'taxonomy' => 'product_color',
            'field'    => 'slug',
            'terms'    => 'red',
        ),
        array(
            'taxonomy' => 'product_size',
            'field'    => 'slug',
            'terms'    => array( 's', 'm', 'l' ),
        ),
    ),
) );
```

### Post exclusion patterns

```php
// WRONG: Large post__not_in arrays are slow
$query = new WP_Query( array(
    'post__not_in' => $hundreds_of_ids, // Slow!
) );

// CORRECT: Fetch all, filter in PHP (faster for large exclusions)
$posts = get_posts( array(
    'posts_per_page' => 100,
    'fields'         => 'ids',
) );

$filtered = array_diff( $posts, $excluded_ids );
```

### Direct database queries

```php
// CORRECT: Use $wpdb->prepare() with proper placeholders
global $wpdb;

$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT ID, post_title FROM {$wpdb->posts} 
         WHERE post_type = %s AND post_status = %s 
         LIMIT %d",
        'product',
        'publish',
        100
    )
);

// WRONG: LIKE with leading wildcard - full table scan
$wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->posts} WHERE post_title LIKE %s",
        '%' . $wpdb->esc_like( $search ) . '%' // Leading % = slow
    )
);

// CORRECT: Trailing wildcard only when possible
$wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->posts} WHERE post_title LIKE %s",
        $wpdb->esc_like( $search ) . '%' // Trailing % = can use index
    )
);
```

### Validate before querying

```php
// WRONG: Query with potentially falsy ID
$post_id = get_some_id(); // Might return false, null, or 0
$query = new WP_Query( array( 'p' => intval( $post_id ) ) ); // p=0 returns posts!

// CORRECT: Validate before querying
$post_id = get_some_id();
if ( ! empty( $post_id ) && is_numeric( $post_id ) ) {
    $query = new WP_Query( array( 'p' => absint( $post_id ) ) );
}
```

## Options and autoload

WordPress loads all autoloaded options on every page request.

### Autoload guidelines

| Data type | Autoload | Reason |
|-----------|----------|--------|
| Plugin settings (small) | Yes | Needed on most requests |
| Feature flags | Yes | Checked frequently |
| Large serialized data | No | Bloats memory on every request |
| Rarely used data | No | Only load when needed |
| Cached API responses | No | Use transients instead |

### Managing autoload

```php
// CORRECT: Small settings - autoload is fine (default)
add_option( 'ayudawp_settings', array(
    'enabled' => true,
    'limit'   => 10,
) );

// CORRECT: Large data - disable autoload
add_option( 'ayudawp_large_data', $large_array, '', 'no' );

// CORRECT: Update existing option's autoload status
global $wpdb;
$wpdb->update(
    $wpdb->options,
    array( 'autoload' => 'no' ),
    array( 'option_name' => 'ayudawp_large_data' )
);

// Check total autoloaded size (for debugging)
$autoload_size = $wpdb->get_var(
    "SELECT SUM(LENGTH(option_value)) FROM {$wpdb->options} WHERE autoload = 'yes'"
);
// Target: under 800KB total
```

### Avoid frequent option writes

```php
// WRONG: Writing options on every page view
add_action( 'wp_head', 'ayudawp_bad_tracking' );
function ayudawp_bad_tracking() {
    $count = get_option( 'page_views', 0 );
    update_option( 'page_views', $count + 1 ); // DB write every request!
}

// CORRECT: Buffer in object cache, flush periodically
add_action( 'shutdown', 'ayudawp_buffer_tracking' );
function ayudawp_buffer_tracking() {
    wp_cache_incr( 'page_views_buffer', 1, 'ayudawp_stats' );
}

// Flush buffer via cron (hourly)
add_action( 'ayudawp_flush_stats', 'ayudawp_flush_view_buffer' );
function ayudawp_flush_view_buffer() {
    $buffered = wp_cache_get( 'page_views_buffer', 'ayudawp_stats' );
    if ( $buffered ) {
        $current = get_option( 'page_views', 0 );
        update_option( 'page_views', $current + $buffered );
        wp_cache_delete( 'page_views_buffer', 'ayudawp_stats' );
    }
}
```

## Object cache

Object cache stores data in memory for the duration of a request (or persistently with Redis/Memcached).

### Object cache functions

| Function | Purpose |
|----------|---------|
| `wp_cache_get()` | Retrieve cached value |
| `wp_cache_set()` | Store value in cache |
| `wp_cache_add()` | Store only if key doesn't exist |
| `wp_cache_delete()` | Remove cached value |
| `wp_cache_incr()` | Increment numeric value |
| `wp_cache_get_multiple()` | Batch retrieve (WP 5.5+) |
| `wp_using_ext_object_cache()` | Check if persistent cache available |

### Caching expensive operations

```php
// CORRECT: Cache expensive function results
function ayudawp_get_complex_data( $user_id ) {
    $cache_key = 'complex_data_' . $user_id;
    $cache_group = 'ayudawp_data';
    
    $data = wp_cache_get( $cache_key, $cache_group );
    
    if ( false === $data ) {
        // Expensive operation
        $data = ayudawp_calculate_complex_data( $user_id );
        
        // Cache for 1 hour
        wp_cache_set( $cache_key, $data, $cache_group, HOUR_IN_SECONDS );
    }
    
    return $data;
}

// CORRECT: Invalidate cache when data changes
add_action( 'profile_update', 'ayudawp_clear_user_cache' );
function ayudawp_clear_user_cache( $user_id ) {
    wp_cache_delete( 'complex_data_' . $user_id, 'ayudawp_data' );
}
```

### Expensive functions to cache

These WordPress functions are slow and should be cached:

```php
// WRONG: Uncached expensive lookups
$post_id = url_to_postid( $url ); // Expensive!
$attachment_id = attachment_url_to_postid( $url ); // Very expensive!
$count = count_user_posts( $user_id ); // DB query each time
$oembed = wp_oembed_get( $url ); // External HTTP request

// CORRECT: Wrapper with cache
function ayudawp_cached_url_to_postid( $url ) {
    $cache_key = 'url_to_postid_' . md5( $url );
    $post_id = wp_cache_get( $cache_key, 'ayudawp_urls' );
    
    if ( false === $post_id ) {
        $post_id = url_to_postid( $url );
        wp_cache_set( $cache_key, $post_id, 'ayudawp_urls', DAY_IN_SECONDS );
    }
    
    return $post_id;
}

function ayudawp_cached_oembed( $url ) {
    $cache_key = 'oembed_' . md5( $url );
    $html = wp_cache_get( $cache_key, 'ayudawp_embeds' );
    
    if ( false === $html ) {
        $html = wp_oembed_get( $url );
        if ( $html ) {
            wp_cache_set( $cache_key, $html, 'ayudawp_embeds', DAY_IN_SECONDS );
        }
    }
    
    return $html;
}
```

### Batch cache operations

```php
// WRONG: Multiple cache calls in loop
foreach ( $user_ids as $user_id ) {
    $data = wp_cache_get( 'user_data_' . $user_id, 'ayudawp' ); // N calls
}

// CORRECT: Batch retrieve (WP 5.5+)
$cache_keys = array();
foreach ( $user_ids as $user_id ) {
    $cache_keys[] = 'user_data_' . $user_id;
}

$cached_data = wp_cache_get_multiple( $cache_keys, 'ayudawp' ); // 1 call
```

## Transients

Transients provide expiring key-value storage. Without persistent object cache, they use the options table.

### Transients vs object cache

| Feature | Transients | Object cache |
|---------|------------|--------------|
| Expiration | Built-in | Optional |
| Persistence | Database (or object cache) | Memory (or persistent) |
| Use case | Data that expires | Request-level caching |
| Without Redis/Memcached | Uses wp_options | Non-persistent |

### Transient best practices

```php
// CORRECT: API response caching
function ayudawp_get_external_data() {
    $transient_key = 'ayudawp_api_data';
    $data = get_transient( $transient_key );
    
    if ( false === $data ) {
        $response = wp_remote_get( 'https://api.example.com/data' );
        
        if ( ! is_wp_error( $response ) ) {
            $data = json_decode( wp_remote_retrieve_body( $response ), true );
            set_transient( $transient_key, $data, HOUR_IN_SECONDS );
        }
    }
    
    return $data;
}

// WRONG: Dynamic transient keys - causes table bloat without object cache
foreach ( $users as $user ) {
    set_transient( 'user_cache_' . $user->ID, $data, HOUR_IN_SECONDS );
    // 10,000 users = 10,000 rows in wp_options!
}

// CORRECT: Use object cache for user-specific data
foreach ( $users as $user ) {
    wp_cache_set( 'user_cache_' . $user->ID, $data, 'ayudawp_users', HOUR_IN_SECONDS );
}
```

### Check object cache availability

```php
// CORRECT: Adapt strategy based on environment
function ayudawp_cache_large_data( $key, $data, $expiration ) {
    if ( wp_using_ext_object_cache() ) {
        // Persistent object cache available - use transient (backed by object cache)
        set_transient( $key, $data, $expiration );
    } else {
        // No persistent cache - avoid bloating wp_options
        // Use filesystem cache or skip caching for this data
        ayudawp_file_cache_set( $key, $data, $expiration );
    }
}
```

## Conditional asset loading

Load scripts and styles only where they are needed.

### Enqueue patterns

```php
// WRONG: Assets load on every page
add_action( 'wp_enqueue_scripts', 'ayudawp_bad_enqueue' );
function ayudawp_bad_enqueue() {
    wp_enqueue_script( 'ayudawp-gallery', AYUDAWP_URL . 'assets/js/gallery.js' );
    wp_enqueue_style( 'ayudawp-gallery', AYUDAWP_URL . 'assets/css/gallery.css' );
}

// CORRECT: Load only on pages with gallery shortcode
add_action( 'wp_enqueue_scripts', 'ayudawp_conditional_enqueue' );
function ayudawp_conditional_enqueue() {
    global $post;
    
    if ( is_singular() && has_shortcode( $post->post_content, 'ayudawp_gallery' ) ) {
        wp_enqueue_script( 'ayudawp-gallery', AYUDAWP_URL . 'assets/js/gallery.js', array(), AYUDAWP_VERSION, true );
        wp_enqueue_style( 'ayudawp-gallery', AYUDAWP_URL . 'assets/css/gallery.css', array(), AYUDAWP_VERSION );
    }
}

// CORRECT: Load on specific page templates
add_action( 'wp_enqueue_scripts', 'ayudawp_template_assets' );
function ayudawp_template_assets() {
    if ( is_page_template( 'template-contact.php' ) ) {
        wp_enqueue_script( 'ayudawp-contact-form', AYUDAWP_URL . 'assets/js/contact.js', array(), AYUDAWP_VERSION, true );
    }
}
```

### Block-based conditional loading

```php
// CORRECT: Enqueue only when block is present
function ayudawp_register_block_assets() {
    register_block_type( 'ayudawp/custom-block', array(
        'editor_script' => 'ayudawp-block-editor',
        'editor_style'  => 'ayudawp-block-editor-style',
        'script'        => 'ayudawp-block-frontend', // Only loads when block is used
        'style'         => 'ayudawp-block-style',     // Only loads when block is used
    ) );
}
add_action( 'init', 'ayudawp_register_block_assets' );
```

### Dequeue unnecessary assets

```php
// CORRECT: Remove assets not needed on specific pages
add_action( 'wp_enqueue_scripts', 'ayudawp_dequeue_unused', 100 );
function ayudawp_dequeue_unused() {
    // Remove block library CSS on pages without blocks
    if ( ! has_blocks() ) {
        wp_dequeue_style( 'wp-block-library' );
    }
    
    // Remove WooCommerce assets from non-shop pages
    if ( function_exists( 'is_woocommerce' ) ) {
        if ( ! is_woocommerce() && ! is_cart() && ! is_checkout() && ! is_account_page() ) {
            wp_dequeue_style( 'woocommerce-general' );
            wp_dequeue_style( 'woocommerce-layout' );
            wp_dequeue_script( 'wc-cart-fragments' );
        }
    }
}
```

### Admin assets

```php
// CORRECT: Load admin assets only on plugin pages
add_action( 'admin_enqueue_scripts', 'ayudawp_admin_assets' );
function ayudawp_admin_assets( $hook ) {
    // Only load on our settings page
    if ( 'settings_page_ayudawp-settings' !== $hook ) {
        return;
    }
    
    wp_enqueue_style( 'ayudawp-admin', AYUDAWP_URL . 'assets/css/admin.css', array(), AYUDAWP_VERSION );
    wp_enqueue_script( 'ayudawp-admin', AYUDAWP_URL . 'assets/js/admin.js', array( 'jquery' ), AYUDAWP_VERSION, true );
}
```

## Efficient hooks

Avoid expensive operations in frequently-called hooks.

### Hook execution frequency

| Hook | Frequency | Suitable for |
|------|-----------|--------------|
| `plugins_loaded` | Every request | Class initialization, early setup |
| `init` | Every request | Register post types, taxonomies |
| `wp_loaded` | Every request | After all plugins loaded |
| `wp` | Frontend requests | Query-dependent setup |
| `template_redirect` | Frontend, before output | Redirects, access control |
| `admin_init` | Admin requests | Admin-only initialization |
| `wp_head` | Frontend, in head | Meta tags, early scripts |
| `wp_footer` | Frontend, in footer | Late scripts |
| `shutdown` | Every request, end | Cleanup, logging |

### Context-aware hooks

```php
// WRONG: Expensive operation runs on every request
add_action( 'init', 'ayudawp_expensive_init' );
function ayudawp_expensive_init() {
    $data = ayudawp_fetch_remote_config(); // HTTP request on every page!
    // Process data...
}

// CORRECT: Check context before expensive operations
add_action( 'init', 'ayudawp_smart_init' );
function ayudawp_smart_init() {
    // Skip for AJAX, cron, REST API if not needed
    if ( wp_doing_ajax() || wp_doing_cron() || defined( 'REST_REQUEST' ) ) {
        return;
    }
    
    // Skip for admin if frontend-only feature
    if ( is_admin() ) {
        return;
    }
    
    // Now run the operation
    ayudawp_frontend_only_setup();
}

// CORRECT: Use appropriate hook for the task
add_action( 'template_redirect', 'ayudawp_check_access' );
function ayudawp_check_access() {
    // Runs only on frontend, after query is set up
    if ( is_singular( 'premium_content' ) && ! ayudawp_user_has_access() ) {
        wp_redirect( home_url( '/subscribe/' ) );
        exit;
    }
}
```

### Lazy loading patterns

```php
// CORRECT: Initialize expensive objects only when needed
class AyudaWP_Heavy_Feature {
    private static $instance = null;
    
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // Expensive initialization here
    }
}

// Hook that triggers lazy loading
add_action( 'ayudawp_feature_needed', function() {
    AyudaWP_Heavy_Feature::get_instance()->run();
} );
```

### Admin notices optimization

```php
// WRONG: Check conditions on every admin page
add_action( 'admin_notices', 'ayudawp_check_requirements' );
function ayudawp_check_requirements() {
    $requirements = ayudawp_expensive_requirements_check(); // Runs on every admin page!
    if ( ! $requirements['met'] ) {
        echo '<div class="notice notice-error">...</div>';
    }
}

// CORRECT: Cache requirement checks
add_action( 'admin_notices', 'ayudawp_cached_requirements_notice' );
function ayudawp_cached_requirements_notice() {
    $cache_key = 'ayudawp_requirements_check';
    $requirements = get_transient( $cache_key );
    
    if ( false === $requirements ) {
        $requirements = ayudawp_expensive_requirements_check();
        set_transient( $cache_key, $requirements, HOUR_IN_SECONDS );
    }
    
    if ( ! $requirements['met'] ) {
        echo '<div class="notice notice-error">...</div>';
    }
}

// Clear cache when relevant options change
add_action( 'update_option_ayudawp_settings', function() {
    delete_transient( 'ayudawp_requirements_check' );
} );
```

## External HTTP requests

HTTP requests to external APIs can significantly slow down page loads.

### HTTP request best practices

```php
// WRONG: No timeout, no error handling
$response = wp_remote_get( 'https://api.example.com/data' );
$body = wp_remote_retrieve_body( $response );

// CORRECT: Set timeout, handle errors, cache response
function ayudawp_fetch_api_data() {
    $cache_key = 'ayudawp_api_response';
    $cached = get_transient( $cache_key );
    
    if ( false !== $cached ) {
        return $cached;
    }
    
    $response = wp_remote_get( 'https://api.example.com/data', array(
        'timeout' => 5, // 5 seconds max
        'sslverify' => true,
    ) );
    
    if ( is_wp_error( $response ) ) {
        // Log error, return fallback
        error_log( 'AyudaWP API error: ' . $response->get_error_message() );
        return ayudawp_get_fallback_data();
    }
    
    $code = wp_remote_retrieve_response_code( $response );
    if ( 200 !== $code ) {
        error_log( 'AyudaWP API returned: ' . $code );
        return ayudawp_get_fallback_data();
    }
    
    $body = wp_remote_retrieve_body( $response );
    $data = json_decode( $body, true );
    
    if ( json_last_error() !== JSON_ERROR_NONE ) {
        return ayudawp_get_fallback_data();
    }
    
    // Cache successful response
    set_transient( $cache_key, $data, HOUR_IN_SECONDS );
    
    return $data;
}
```

### Move HTTP requests to background

```php
// WRONG: Sync API call blocks page load
add_action( 'save_post', 'ayudawp_notify_external_service' );
function ayudawp_notify_external_service( $post_id ) {
    wp_remote_post( 'https://api.example.com/notify', array(
        'body' => array( 'post_id' => $post_id ),
    ) ); // Blocks until complete!
}

// CORRECT: Schedule for background processing
add_action( 'save_post', 'ayudawp_schedule_notification' );
function ayudawp_schedule_notification( $post_id ) {
    if ( ! wp_next_scheduled( 'ayudawp_send_notification', array( $post_id ) ) ) {
        wp_schedule_single_event( time(), 'ayudawp_send_notification', array( $post_id ) );
    }
}

add_action( 'ayudawp_send_notification', 'ayudawp_do_notification' );
function ayudawp_do_notification( $post_id ) {
    wp_remote_post( 'https://api.example.com/notify', array(
        'body'    => array( 'post_id' => $post_id ),
        'timeout' => 30, // Can be longer in background
    ) );
}
```

## WP-Cron

WP-Cron runs on page requests by default. Configure it properly for reliability.

### WP-Cron configuration

```php
// In wp-config.php: Disable WordPress cron trigger
define( 'DISABLE_WP_CRON', true );

// Set up real server cron instead:
// * * * * * cd /path/to/wordpress && wp cron event run --due-now > /dev/null 2>&1
// Or:
// * * * * * curl -s https://example.com/wp-cron.php?doing_wp_cron > /dev/null 2>&1
```

### Scheduling events correctly

```php
// WRONG: Schedule without checking if already scheduled
add_action( 'init', 'ayudawp_schedule_tasks' );
function ayudawp_schedule_tasks() {
    wp_schedule_event( time(), 'hourly', 'ayudawp_hourly_task' ); // Creates duplicates!
}

// CORRECT: Check before scheduling
add_action( 'init', 'ayudawp_schedule_tasks' );
function ayudawp_schedule_tasks() {
    if ( ! wp_next_scheduled( 'ayudawp_hourly_task' ) ) {
        wp_schedule_event( time(), 'hourly', 'ayudawp_hourly_task' );
    }
}

// CORRECT: Schedule on activation, clear on deactivation
register_activation_hook( __FILE__, 'ayudawp_activate' );
function ayudawp_activate() {
    if ( ! wp_next_scheduled( 'ayudawp_hourly_task' ) ) {
        wp_schedule_event( time(), 'hourly', 'ayudawp_hourly_task' );
    }
}

register_deactivation_hook( __FILE__, 'ayudawp_deactivate' );
function ayudawp_deactivate() {
    wp_clear_scheduled_hook( 'ayudawp_hourly_task' );
}
```

### Batch processing for large datasets

```php
// WRONG: Process all items in one cron run
add_action( 'ayudawp_sync_users', 'ayudawp_sync_all_users' );
function ayudawp_sync_all_users() {
    $users = get_users(); // 50,000 users = timeout!
    foreach ( $users as $user ) {
        ayudawp_sync_user( $user );
    }
}

// CORRECT: Process in batches with rescheduling
add_action( 'ayudawp_sync_users_batch', 'ayudawp_sync_users_batch' );
function ayudawp_sync_users_batch() {
    $batch_size = 100;
    $offset = (int) get_option( 'ayudawp_sync_offset', 0 );
    
    $users = get_users( array(
        'number' => $batch_size,
        'offset' => $offset,
    ) );
    
    // No more users - reset and stop
    if ( empty( $users ) ) {
        delete_option( 'ayudawp_sync_offset' );
        return;
    }
    
    // Process batch
    foreach ( $users as $user ) {
        ayudawp_sync_user( $user );
    }
    
    // Update offset and schedule next batch
    update_option( 'ayudawp_sync_offset', $offset + $batch_size );
    wp_schedule_single_event( time() + 30, 'ayudawp_sync_users_batch' );
}
```

### Custom cron intervals

```php
// Add custom interval
add_filter( 'cron_schedules', 'ayudawp_custom_cron_intervals' );
function ayudawp_custom_cron_intervals( $schedules ) {
    $schedules['fifteen_minutes'] = array(
        'interval' => 15 * MINUTE_IN_SECONDS,
        'display'  => __( 'Every 15 minutes', 'ayudawp' ),
    );
    return $schedules;
}
```

## AJAX and REST API optimization

### AJAX best practices

```php
// WRONG: POST request for read-only operation
jQuery.post( ajaxurl, {
    action: 'ayudawp_get_data',
    nonce: ayudawp.nonce
}, function( response ) {
    // POST requests bypass page cache
});

// CORRECT: GET request for read operations (cacheable)
jQuery.get( ayudawp.rest_url + 'ayudawp/v1/data', {
    _wpnonce: ayudawp.nonce
}, function( response ) {
    // GET requests can be cached
});
```

### Avoid polling patterns

```php
// WRONG: Polling creates self-DDoS
setInterval( function() {
    fetch( '/wp-json/ayudawp/v1/updates' );
}, 5000 ); // 12 requests/minute per user!

// CORRECT: Use WebSockets, Server-Sent Events, or long-polling with backoff
let pollInterval = 5000;
const maxInterval = 60000;

function pollUpdates() {
    fetch( '/wp-json/ayudawp/v1/updates' )
        .then( response => response.json() )
        .then( data => {
            if ( data.hasUpdates ) {
                // Process updates, reset interval
                pollInterval = 5000;
            } else {
                // Exponential backoff
                pollInterval = Math.min( pollInterval * 1.5, maxInterval );
            }
            setTimeout( pollUpdates, pollInterval );
        } );
}
```

### REST API optimization

```php
// CORRECT: Optimized REST endpoint
register_rest_route( 'ayudawp/v1', '/items', array(
    'methods'             => 'GET',
    'callback'            => 'ayudawp_get_items',
    'permission_callback' => '__return_true', // Public endpoint
    'args'                => array(
        'per_page' => array(
            'default'           => 10,
            'sanitize_callback' => 'absint',
            'validate_callback' => function( $value ) {
                return $value > 0 && $value <= 100;
            },
        ),
    ),
) );

function ayudawp_get_items( $request ) {
    $per_page = $request->get_param( 'per_page' );
    
    // Use object cache
    $cache_key = 'items_' . $per_page;
    $items = wp_cache_get( $cache_key, 'ayudawp_api' );
    
    if ( false === $items ) {
        $items = get_posts( array(
            'post_type'      => 'item',
            'posts_per_page' => $per_page,
            'no_found_rows'  => true,
            'fields'         => 'ids',
        ) );
        
        wp_cache_set( $cache_key, $items, 'ayudawp_api', 5 * MINUTE_IN_SECONDS );
    }
    
    return rest_ensure_response( $items );
}
```

## Common anti-patterns

### PHP anti-patterns

```php
// WRONG: O(n) array search
if ( in_array( $value, $large_array ) ) { // Also missing strict mode
    // ...
}

// CORRECT: O(1) lookup with isset
$lookup = array_flip( $large_array );
if ( isset( $lookup[ $value ] ) ) {
    // ...
}

// Or with strict comparison
if ( in_array( $value, $large_array, true ) ) {
    // ...
}
```

```php
// WRONG: Heredoc prevents late escaping
$html = <<<HTML
<div class="widget">
    <h3>{$title}</h3>
    <p>{$content}</p>
</div>
HTML;

// CORRECT: Escape at output
printf(
    '<div class="widget"><h3>%s</h3><p>%s</p></div>',
    esc_html( $title ),
    wp_kses_post( $content )
);
```

### Cache bypass issues

```php
// WRONG: Sessions bypass full page cache
session_start(); // Entire site becomes uncacheable!

// CORRECT: Use WordPress user meta or custom cookies handled at edge
update_user_meta( get_current_user_id(), 'preference', $value );

// WRONG: Setting cookies on public pages
setcookie( 'visitor_tracking', $id ); // Prevents caching for this user

// CORRECT: Use localStorage in JavaScript, or track server-side only for logged-in users
```

### N+1 query problems

```php
// WRONG: Query in template loop
while ( have_posts() ) {
    the_post();
    $author_data = get_userdata( get_the_author_meta( 'ID' ) ); // Query per post!
    $custom_field = get_post_meta( get_the_ID(), 'custom', true ); // Query per post!
}

// CORRECT: Prime caches before loop
$post_ids = wp_list_pluck( $posts, 'ID' );
$author_ids = wp_list_pluck( $posts, 'post_author' );

update_meta_cache( 'post', $post_ids ); // Single query for all meta
cache_users( $author_ids ); // Single query for all authors

while ( have_posts() ) {
    the_post();
    // Now these use cached data
    $author_data = get_userdata( get_the_author_meta( 'ID' ) );
    $custom_field = get_post_meta( get_the_ID(), 'custom', true );
}
```

## Measurement and profiling

### Query Monitor

Query Monitor is the essential tool for WordPress performance debugging.

Key panels to check:
- **Queries**: Identify slow queries, duplicates, queries by component
- **Request**: Time breakdown by component
- **Transients**: Transient usage and database hits
- **HTTP API Calls**: External requests and timing
- **Hooks & Actions**: Hook execution order and timing

### Debug constants

```php
// In wp-config.php for development
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false );
define( 'SAVEQUERIES', true ); // Logs all queries (disable in production!)
define( 'SCRIPT_DEBUG', true );
```

### Custom timing

```php
// Measure execution time
function ayudawp_measure_operation() {
    $start = microtime( true );
    
    // Operation to measure
    ayudawp_expensive_operation();
    
    $elapsed = microtime( true ) - $start;
    
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        error_log( sprintf( 'AyudaWP operation took %.4f seconds', $elapsed ) );
    }
}
```

### Server-Timing header

```php
// Add Server-Timing header for browser DevTools
add_action( 'send_headers', 'ayudawp_add_server_timing' );
function ayudawp_add_server_timing() {
    global $timestart;
    
    $total = microtime( true ) - $timestart;
    
    header( sprintf( 'Server-Timing: total;dur=%.2f', $total * 1000 ) );
}
```

## Code review checklist

### Database queries

- [ ] All queries have bounded results (`posts_per_page` is set)
- [ ] No `posts_per_page => -1` in production code
- [ ] `no_found_rows => true` used when not paginating
- [ ] Meta caches disabled if not using meta (`update_post_meta_cache => false`)
- [ ] Term caches disabled if not using terms (`update_post_term_cache => false`)
- [ ] No `query_posts()` usage
- [ ] Input validated before querying (no falsy IDs)
- [ ] Meta queries replaced with taxonomies where possible

### Caching

- [ ] Expensive operations wrapped with object cache
- [ ] Transients used for expiring data, not user-specific data
- [ ] No dynamic transient keys without persistent object cache
- [ ] Cache invalidation implemented when data changes
- [ ] `wp_cache_get_multiple()` used for batch operations

### Options

- [ ] Large data stored with `autoload => no`
- [ ] No frequent option writes on frontend
- [ ] Option updates batched where possible

### Assets

- [ ] Scripts/styles enqueued conditionally
- [ ] Assets loaded only on pages where needed
- [ ] Admin assets limited to plugin pages
- [ ] Unused assets dequeued

### Hooks

- [ ] No expensive operations in `init`, `plugins_loaded`
- [ ] Context checks before heavy operations (`is_admin()`, etc.)
- [ ] Lazy loading for expensive objects

### HTTP requests

- [ ] All requests have timeout set
- [ ] Error handling for failed requests
- [ ] Responses cached when appropriate
- [ ] Sync requests moved to background when possible

### WP-Cron

- [ ] `wp_next_scheduled()` checked before scheduling
- [ ] Events cleared on plugin deactivation
- [ ] Long-running tasks use batch processing
- [ ] DISABLE_WP_CRON recommended in documentation

### AJAX/REST

- [ ] GET used for read operations
- [ ] No polling patterns (or proper backoff implemented)
- [ ] Responses cached where appropriate
- [ ] Endpoints have proper validation

### General

- [ ] No `session_start()` usage
- [ ] No cookies set on public pages
- [ ] Strict comparison used (`===`, `in_array(..., true)`)
- [ ] No N+1 query patterns in loops

## References

- [WordPress Performance Optimization](https://developer.wordpress.org/advanced-administration/performance/optimization/)
- [WordPress Caching](https://developer.wordpress.org/advanced-administration/performance/cache/)
- [PHP Optimization](https://developer.wordpress.org/advanced-administration/performance/php/)
- [Plugin Best Practices](https://developer.wordpress.org/plugins/plugin-basics/best-practices/)
- [WP_Query Class Reference](https://developer.wordpress.org/reference/classes/wp_query/)
- [Transients API](https://developer.wordpress.org/apis/transients/)
- [WP_Object_Cache](https://developer.wordpress.org/reference/classes/wp_object_cache/)
- [WP-Cron](https://developer.wordpress.org/plugins/cron/)
- [WordPress VIP Performance Docs](https://docs.wpvip.com/performance/)
- [Query Monitor Plugin](https://querymonitor.com/)
