# Gutenberg Blocks in WP Rig

WP Rig features a built-in system for creating and managing theme-scoped Gutenberg blocks, powered by `@wordpress/create-block` and fully integrated with the theme's build system.

## Configuration & Support

Before scaffolding or modifying blocks, you **MUST** reference the `config/config.json`.

*   **Check Support:** Verify that `theme.enableBlocks` is set to `true`.
*   **Action Required:** If `enableBlocks` is `false`, you cannot scaffold blocks. Instruct the user to run `npm run theme:enable-blocks` before proceeding.

## Scaffolding a New Block

Use the `block:new` script to create a new block. By default, blocks are created in `assets/blocks/<slug>/`.

### Basic Command
```bash
npm run block:new -- <slug> --title="Block Title"
```
*Note: Include the `--` before arguments when using `npm run`.*

### Options
- `-d, --dynamic`: Create a dynamic block (server-side rendered via `render.php`).
- `--ts`: Use TypeScript for the block's source files (`.tsx`).
- `--view`: Add a frontend-only script (`view.js`).
- `--category <string>`: Block category (defaults to `widgets`).
- `--icon <string>`: Dashicon or SVG icon name.

**Example: Dynamic TypeScript Block**
```bash
npm run block:new -- my-hero --title="Hero Image" --dynamic --ts
```

## Filesystem Layout

Each block lives in its own directory under `assets/blocks/`:
- `block.json`: Metadata and asset registration.
- `src/index.(js|ts|tsx)`: Editor entry point.
- `src/edit.(js|ts|tsx)`: Block edit component.
- `style.css`: Frontend styles.
- `editor.css`: Editor-only styles.
- `render.php`: PHP template (only for dynamic blocks).
- `build/`: Compiled assets (generated automatically).

## Auto-Registration

WP Rig automatically discovers and registers blocks. You do **not** need to manually add PHP code to register your block if it's in the `assets/blocks` directory.

The `inc/Blocks/Component.php` class:
1. Scans `assets/blocks/*/block.json` on the `init` hook.
2. Automatically includes `render.php` if it exists.
3. Calls `register_block_type()` for each directory.

## Block Attributes & Wrapper

Use the provided template tags for consistent block output in `render.php`:

```php
<?php
// render.php example
$wrapper_attributes = wp_rig()->block_wrapper_attributes( [ 'my-custom-class' ], $attributes );
?>
<div <?php echo $wrapper_attributes; ?>>
    <h2><?php echo esc_html( $attributes['title'] ?? '' ); ?></h2>
</div>
```

## Verification & Iteration (Ralph Loop)

To ensure your block works as expected, leverage E2E testing:

1.  **Frontend Rendering**: Create a test in `tests/e2e/specs/` to verify the block renders on a page.
2.  **Visual Regression**: Use `npm run test:e2e:screenshot --SCREENSHOT_SELECTOR=".wp-block-wp-rig-my-block"` to verify the block's appearance.
3.  **Editor Integration**: Verify the block can be added in the editor and its attributes can be modified.

## Best Practices for Agents

1. **Always use the CLI**: Use `npm run block:new` instead of creating block files manually.
2. **Theme-scoped only**: Blocks should live in the theme, not as separate plugins, unless explicitly requested.
3. **Dynamic vs Static**: Use `--dynamic` when the block needs to display content that might change (like latest posts) or requires complex server-side logic.
4. **Namespace**: The namespace defaults to the theme slug. Do not override it unless necessary.
5. **Build Integration**: Always ensure `npm run dev` or `npm run build` is run after making changes to block source files.
