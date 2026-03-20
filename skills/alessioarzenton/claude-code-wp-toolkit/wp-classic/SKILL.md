---
name: wp-classic
description: Conventions for WordPress Bedrock projects with classic PHP theme (no Sage/Acorn/Blade). Always-active rules.
user-invocable: false
---

# WP-Classic Stack — Bedrock + Classic PHP Theme

## Stack

- **WordPress** 6.x + [Bedrock](https://roots.io/bedrock/)
- **PHP** 8.2+ (recommended 8.4)
- **Theme**: Classic WordPress theme — PHP templates, no Blade
- **CSS**: Tailwind CSS 4 (optional) or vanilla CSS (prefix `{{PREFIX}}` if configured)
- **Bundler**: Webpack/Gulp or none (check `package.json`)
- **Custom Fields**: ACF Pro (GUI backend) — if configured
- **Post Types/Taxonomies**: `register_post_type()` / `register_taxonomy()` in `inc/post-types.php`

## Typical project structure

```
{{THEME_DIR}}/
├── templates/            # Page templates (page-*.php, single-*.php, archive-*.php)
├── parts/                # Reusable template partials
├── inc/
│   ├── post-types.php    # CPT and taxonomy registration
│   ├── acf-blocks.php    # ACF blocks (if ACF active)
│   ├── helpers.php       # Helper functions
│   └── enqueue.php       # Scripts and styles enqueue
├── assets/
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript
│   ├── images/           # Images
│   └── fonts/            # Fonts
├── acf-json/             # Exported ACF field groups (if ACF active)
├── functions.php         # Theme setup, hooks, filters, require inc/*
├── style.css             # Main stylesheet (with theme header)
├── header.php            # Global header
├── footer.php            # Global footer
├── sidebar.php           # Sidebar (if present)
├── index.php             # Fallback template
├── front-page.php        # Homepage
├── page.php              # Generic pages
├── single.php            # Single post
├── archive.php           # Archive
├── search.php            # Search results
└── 404.php               # Error page
```

## Prefix `{{PREFIX}}` (if configured)

If the project uses a Tailwind CSS 4 prefix:

| Type | Format | Example |
|------|--------|---------|
| Tailwind utilities | `{{PREFIX}}:{utility}` | `{{PREFIX}}:flex`, `{{PREFIX}}:p-4` |
| CSS components | `{{PREFIX}}-{name}` | `.{{PREFIX}}-button`, `.{{PREFIX}}-card` |
| Semantic utilities | `{{PREFIX}}-{cat}-{var}` | `{{PREFIX}}-content-01` |

## Approach

- Use the WordPress **template hierarchy** (`page-{slug}.php`, `single-{cpt}.php`, etc.)
- Template partials with `get_template_part('parts/name', 'variant')` — never hardcoded paths
- Avoid complex logic in templates — move to `inc/helpers.php`
- Use WordPress Coding Standards (WPCS)

## Naming

| Type | Convention |
|------|-----------|
| Template files | kebab-case (`page-about.php`, `single-bando.php`) |
| Functions | snake_case with theme prefix (`mytheme_setup()`, `mytheme_enqueue()`) |
| PHP classes | PascalCase |
| Constants | UPPER_SNAKE_CASE |

## Code Style

- **PHP**: WordPress Coding Standards (PHPCS + WPCS)
- **JS/CSS**: Prettier
- **PHP indentation**: tabs (WPCS standard)

## Templates and Components

- Components are included with `get_template_part('parts/name', $args)` (WP 5.5+)
- Pass data to templates with the third `$args` parameter:
  ```php
  get_template_part('parts/card', 'post', [
      'title' => get_the_title(),
      'excerpt' => get_the_excerpt(),
      'thumbnail_id' => get_post_thumbnail_id(),
  ]);
  ```
- In the partial template, access data with `$args`:
  ```php
  $title = $args['title'] ?? '';
  $excerpt = $args['excerpt'] ?? '';
  ```

## Post Types and Taxonomies

Registered in `inc/post-types.php` with native WordPress functions.

**Example**:
```php
function mytheme_register_post_types() {
    register_post_type('bando', [
        'labels' => [
            'name' => __('Bandi', '{{TEXT_DOMAIN}}'),
            'singular_name' => __('Bando', '{{TEXT_DOMAIN}}'),
        ],
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
        'menu_icon' => 'dashicons-media-document',
        'rewrite' => ['slug' => 'bandi'],
    ]);
}
add_action('init', 'mytheme_register_post_types');
```

## Standard ACF (if configured)

### ACF Blocks

Registered with `acf_register_block_type()` in `inc/acf-blocks.php`:

```php
function mytheme_register_acf_blocks() {
    if (!function_exists('acf_register_block_type')) return;

    acf_register_block_type([
        'name' => 'hero',
        'title' => __('Hero', '{{TEXT_DOMAIN}}'),
        'description' => __('Hero block with image and text', '{{TEXT_DOMAIN}}'),
        'render_template' => 'parts/blocks/hero.php',
        'category' => 'theme',
        'icon' => 'cover-image',
        'keywords' => ['hero', 'banner'],
        'supports' => ['align' => ['wide', 'full']],
    ]);
}
add_action('acf/init', 'mytheme_register_acf_blocks');
```

### Block template

```php
<?php
// parts/blocks/hero.php
$title = get_field('title');
$image = get_field('image');
$classes = 'block-hero';
if (!empty($block['className'])) $classes .= ' ' . $block['className'];
if (!empty($block['align'])) $classes .= ' align' . $block['align'];
?>
<section class="<?php echo esc_attr($classes); ?>">
    <h2><?php echo esc_html($title); ?></h2>
    <?php if ($image): ?>
        <img src="<?php echo esc_url($image['url']); ?>"
             alt="<?php echo esc_attr($image['alt']); ?>">
    <?php endif; ?>
</section>
```

### Field Groups

Created from the ACF Pro GUI. If configured, exported to `acf-json/` for version control.

```php
// In functions.php or inc/acf.php
function mytheme_acf_json_save_point($path) {
    return get_stylesheet_directory() . '/acf-json';
}
add_filter('acf/settings/save_json', 'mytheme_acf_json_save_point');
```

## Enqueue Scripts and Styles

```php
// inc/enqueue.php
function mytheme_enqueue_assets() {
    $theme_version = wp_get_theme()->get('Version');

    wp_enqueue_style(
        '{{TEXT_DOMAIN}}-style',
        get_stylesheet_uri(),
        [],
        $theme_version
    );

    wp_enqueue_script(
        '{{TEXT_DOMAIN}}-main',
        get_theme_file_uri('assets/js/main.js'),
        [],
        $theme_version,
        true
    );
}
add_action('wp_enqueue_scripts', 'mytheme_enqueue_assets');
```

## What NOT to do

- Don't use `@include()` or Blade syntax — this theme uses plain PHP
- Don't use View Composers or Acorn — they are not installed
- Don't use `bud.config.js` or `vite.config.js` without verifying first
- Don't hardcode colors if CSS variables exist — use `var(--color-*)`
- Don't use `<a role="button">` or clickable `<div>` — use native elements
- Don't remove `outline` on `:focus` without a visible alternative
- Don't omit `aria-hidden="true" focusable="false"` on decorative SVGs
- Don't add alt text to decorative images — use `alt=""`
- Don't register post types inline in `functions.php` — use `inc/post-types.php`
- Don't create ACF field groups via complex PHP code — use the GUI and `acf-json/`
- Don't use fixed heading levels in reusable components — make them parametric
- Don't use `echo` without escaping — always `esc_html()`, `esc_attr()`, `esc_url()`, `wp_kses_post()`
