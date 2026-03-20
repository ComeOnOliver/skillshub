---
name: wp-sage
description: Conventions for WordPress Bedrock + Sage + Acorn + Blade + Tailwind CSS 4 + Vite projects. Always-active rules.
user-invocable: false
---

# WP-Sage Stack — Bedrock + Sage + Acorn

## Stack

- **WordPress** 6.x + [Bedrock](https://roots.io/bedrock/)
- **PHP** 8.2+ (recommended 8.4)
- **Theme**: [Sage](https://roots.io/sage/) + [Acorn](https://roots.io/acorn/) ^5.0 — **Laravel Blade** templating
- **CSS**: Tailwind CSS 4 (CSS-first config via `@theme`, **prefix `{{PREFIX}}`**)
- **Bundler**: **Vite** (NOT Bud) — `laravel-vite-plugin` + `@roots/vite-plugin`
- **Custom Fields**: ACF Pro + [ACF Composer](https://github.com/log1x/acf-composer) (`log1x/acf-composer`)
- **Post Types/Taxonomies**: [Acorn Post Types](https://github.com/roots/acorn-post-types) (`roots/acorn-post-types`) + [Extended CPTs](https://github.com/johnbillion/extended-cpts) (`johnbillion/extended-cpts`)

## Typical project structure

```
{{THEME_DIR}}/
├── app/
│   ├── Blocks/              # ACF Composer blocks
│   ├── Fields/              # ACF Composer field groups
│   ├── Options/             # ACF Composer option pages
│   ├── Providers/ThemeServiceProvider.php
│   ├── View/Composers/      # View composers (App, Header, Footer, etc.)
│   ├── setup.php            # Theme setup (features, nav menus)
│   ├── filters.php
│   └── import.php           # Helper functions
├── config/
│   ├── acf.php              # ACF Composer configuration
│   └── post-types.php       # Post types and taxonomies registration
├── resources/
│   ├── views/
│   │   ├── layouts/app.blade.php
│   │   ├── components/      # Composite Blade components
│   │   ├── blocks/          # ACF/Gutenberg block templates
│   │   ├── sections/        # Header, footer
│   │   ├── partials/        # Content partials, cards
│   │   ├── common/          # Reusable utilities
│   │   └── forms/           # Form templates
│   ├── css/
│   │   ├── app.css          # CSS entry point
│   │   ├── common/          # theme.css, custom-properties.css, semantic-color.css, base.css
│   │   └── components/      # Atomic design: atoms/ molecules/ organisms/ design-system/
│   ├── js/
│   ├── images/ and fonts/
└── vite.config.js
```

## Prefix `{{PREFIX}}` — MANDATORY

| Type | Format | Example |
|------|--------|---------|
| Tailwind utilities | `{{PREFIX}}:{utility}` | `{{PREFIX}}:flex`, `{{PREFIX}}:p-4`, `{{PREFIX}}:md:grid` |
| CSS components | `{{PREFIX}}-{name}` | `.{{PREFIX}}-button`, `.{{PREFIX}}-card`, `.{{PREFIX}}-container` |
| Semantic utilities | `{{PREFIX}}-{cat}-{var}` | `{{PREFIX}}-content-01`, `{{PREFIX}}-background-primary` |

CSS import: `@import 'tailwindcss' prefix({{PREFIX}});`

## Approach

- **Utility-first**: don't create custom CSS classes when TW4 utilities suffice
- Use `@theme` variables — **never hardcode** colors, spacing, or fonts
- **Mobile-first**: base styles = mobile, then `{{PREFIX}}:md:`, `{{PREFIX}}:lg:`, `{{PREFIX}}:xl:`

## Naming

| Type | Convention |
|------|-----------|
| Blade files | kebab-case (`page-header-simple.blade.php`) |
| PHP classes | PascalCase |
| Helper functions | snake_case |
| Blade variables | camelCase |

## Code Style

- **PHP**: PSR-12 + Laravel Pint (`pint.json`)
- **JS/CSS/HTML**: Prettier (120 chars, single quotes, trailing comma ES5)
- **Blade**: blade-formatter (`.bladeformatterrc`)
- **Tailwind**: `prettier-plugin-tailwindcss` for class sorting

## Blade & View Composers

- Blade components are used with `@include()`, **not** `<x-component>`
- View Composers extend `Roots\Acorn\View\Composer`
- Composer method `with()` returns an array of data for the view
- Automatic registration via ThemeServiceProvider

## Post Types and Taxonomies (roots/acorn-post-types)

Post types and taxonomies are defined in `config/post-types.php` and automatically registered via **roots/acorn-post-types** using John Billion's **Extended CPTs** library.

**config/post-types.php structure**:
```php
return [
    'post_types' => [
        'cpt_name' => [
            'names' => [
                'singular' => 'Singular',
                'plural' => 'Plural',
                'slug' => 'cpt-name',
            ],
            'labels' => [...],  // Full WP labels
            'menu_icon' => 'dashicons-admin-post',
            'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
            'hierarchical' => false,
            'has_archive' => true,
            'show_in_rest' => true,
            'public' => true,
            'publicly_queryable' => true,
            'exclude_from_search' => false,
        ],
    ],
    'taxonomies' => [
        'tax_name' => [
            'post_types' => ['post', 'page', 'cpt_name'],
            'names' => [
                'singular' => 'Singular',
                'plural' => 'Plural',
            ],
            'labels' => [...],
            'hierarchical' => true,
            'show_in_rest' => true,
        ],
    ],
];
```

**Loading config in ThemeServiceProvider**:
```php
public function register()
{
    parent::register();

    $configPath = get_theme_file_path('config/post-types.php');
    if (is_file($configPath)) {
        $this->app->make('config')->set('post-types', require $configPath);
    }
}
```

**Best practices**:
- Always use Extended CPTs features (admin cols, filters, etc.)
- `hierarchical: true` for page-like post types
- `show_in_rest: true` for Gutenberg
- `exclude_from_search: true` only for internal CPTs
- Slugs always in English, labels localized

## ACF Composer — Field Groups

ACF field groups are defined as PHP classes in `app/Fields/` extending `Log1x\AcfComposer\Field`.

**Example app/Fields/ExampleFields.php**:
```php
<?php

namespace App\Fields;

use Log1x\AcfComposer\Builder;
use Log1x\AcfComposer\Field;

class ExampleFields extends Field
{
    public function fields(): array
    {
        $fields = Builder::make('example_fields');

        $fields
            ->setLocation()
                ->where('post_type', 'post');

        $fields
            ->addTab(__('General', '{{TEXT_DOMAIN}}'), [
                'placement' => 'top',
            ])
            ->addText('title', [
                'label' => __('Title', '{{TEXT_DOMAIN}}'),
                'instructions' => __('Enter a title', '{{TEXT_DOMAIN}}'),
                'required' => 1,
            ])
            ->addTextarea('description', [
                'label' => __('Description', '{{TEXT_DOMAIN}}'),
                'maxlength' => 300,
            ])
            ->addImage('image', [
                'label' => __('Image', '{{TEXT_DOMAIN}}'),
                'return_format' => 'array',
                'preview_size' => 'medium',
            ])
            ->addRepeater('items', [
                'label' => __('Items', '{{TEXT_DOMAIN}}'),
                'layout' => 'table',
                'button_label' => __('Add Item', '{{TEXT_DOMAIN}}'),
            ])
                ->addText('name')
                ->addTextarea('description')
                ->endRepeater();

        return $fields->build();
    }
}
```

**Location rules**:
```php
$fields
    ->setLocation()
        ->where('post_type', 'post')
        ->or('post_type', 'page')
        ->or('page_template', 'template-custom.blade.php');
```

**Useful commands**:
```bash
wp acorn acf:make field FieldName      # Generate field group
wp acorn acf:cache                     # Cache fields (prod)
wp acorn acorn ide:helpers             # PHPDoc autocomplete
```

## ACF Composer — Gutenberg Blocks

Blocks are defined in `app/Blocks/` extending `Log1x\AcfComposer\Block`.

**Example app/Blocks/ExampleBlock.php**:
```php
<?php

namespace App\Blocks;

use Log1x\AcfComposer\Block;
use Log1x\AcfComposer\Builder;

class ExampleBlock extends Block
{
    public $name = 'Example Block';
    public $description = 'Block description';
    public $category = 'theme';  // or 'common', 'formatting', etc.
    public $icon = 'admin-post';  // dashicon
    public $keywords = ['example', 'test'];
    public $post_types = ['page', 'post'];  // Restrict to specific CPTs

    // Supported alignments
    public $supports = [
        'align' => ['wide', 'full'],
        'mode' => false,  // Disable edit/preview toggle
        'jsx' => true,
    ];

    public function fields(): array
    {
        $fields = Builder::make('example_block');

        $fields
            ->addText('title', [
                'label' => __('Title', '{{TEXT_DOMAIN}}'),
            ])
            ->addWysiwyg('content', [
                'label' => __('Content', '{{TEXT_DOMAIN}}'),
            ]);

        return $fields->build();
    }

    // Data passed to the Blade template
    public function with(): array
    {
        return [
            'title' => $this->title,
            'content' => $this->content,
            'classes' => $this->classes,  // Automatic CSS classes
        ];
    }
}
```

**Template resources/views/blocks/example-block/example-block.blade.php**:
```blade
<div {!! $attributes !!}>
  <h2>{{ $title }}</h2>
  <div>{!! $content !!}</div>
</div>
```

**`$attributes` helper**: automatically generates `class`, `id`, `data-` attributes.

**Commands**:
```bash
wp acorn acf:make block BlockName      # Generate block + template
```

## ACF Composer — Option Pages

Option pages for theme/site settings in `app/Options/`.

**Example app/Options/ThemeSettings.php**:
```php
<?php

namespace App\Options;

use Log1x\AcfComposer\Builder;
use Log1x\AcfComposer\Options as Field;

class ThemeSettings extends Field
{
    public $name = 'Theme Settings';
    public $title = 'Settings | Theme';
    public $menu_slug = 'theme-settings';
    public $parent = 'options-general.php';  // Under "Settings"
    public $capability = 'manage_options';
    public $position = 30;
    public $redirect = false;

    public function fields(): array
    {
        $fields = Builder::make('theme_settings');

        $fields
            ->addTab(__('General', '{{TEXT_DOMAIN}}'))
            ->addText('site_phone', [
                'label' => __('Phone', '{{TEXT_DOMAIN}}'),
            ])
            ->addText('site_email', [
                'label' => __('Email', '{{TEXT_DOMAIN}}'),
            ]);

        return $fields->build();
    }
}
```

**Retrieving options**:
```php
$phone = get_field('site_phone', 'option');
```

**Commands**:
```bash
wp acorn acf:make options OptionsName  # Generate option page
```

## Vite Aliases

`@scripts` → js, `@styles` → css, `@fonts` → fonts, `@images` → images

## What NOT to do

- Don't forget the `{{PREFIX}}:` prefix on Tailwind utilities — it's mandatory
- Don't use `@apply` in CSS — prefer utilities in markup
- Don't hardcode colors, spacing, fonts — use `@theme` variables
- Don't regenerate existing components — check `{{COMPONENTS_CATALOG}}`
- Don't use `bud.config.js` — the bundler is **Vite**
- Don't modify `vite.config.js` without confirmation
- Don't generate JavaScript unless requested
- Don't use `<a role="button">` or clickable `<div>` — use native elements
- Don't remove `outline` on `:focus` without a visible alternative
- Don't omit `aria-hidden="true" focusable="false"` on decorative SVGs
- Don't add alt text to decorative images — use `alt=""`
- Don't use fixed heading levels in reusable components — make them parametric
- Don't register post types/taxonomies with `register_post_type()` — use `config/post-types.php`
- Don't create ACF field groups via JSON — use ACF Composer (`app/Fields/`)
- Don't register blocks with `register_block_type()` — use ACF Composer (`app/Blocks/`)
- Don't use `get_field()` directly in templates — pass data via `with()` in the Block/Composer

## Nunjucks → Blade Migration (if applicable)

If the project migrates from a Nunjucks design system:
- `.njk` → `.blade.php` in `resources/views/components/{atoms|molecules|organisms}/`
- `.js` → `resources/js/{atoms|molecules|organisms}/`
- `.css` → stay in `resources/css/components/` (unchanged)
- `.config.yml` → View Composer or `@include()` parameters
