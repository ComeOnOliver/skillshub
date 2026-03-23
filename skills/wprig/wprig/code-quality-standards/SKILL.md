# Code Quality Standards in WP Rig

WP Rig enforces high code quality through a suite of automated linting, static analysis, and formatting tools. Adhering to these standards ensures that the theme is secure, performant, and maintainable.

## PHP Quality Tools

### 1. PHP Coding Standards (PHPCS)
Used to enforce the WordPress Coding Standards.
- **Run Checks**: `composer check:phpcs`
- **Auto-Fix**: `composer fix:phpcs`

### 2. PHP Static Analysis (PHPStan)
Identifies potential bugs and type mismatches without executing the code.
- **Run Analysis**: `composer check:phpstan`

### 3. PHP Automated Refactoring (Rector)
Automates code updates and applies modern PHP best practices.
- **Run Checks**: `composer check:rector`
- **Apply Fixes**: `composer fix:rector`

## JavaScript & CSS Quality Tools

### 1. Prettier
Automated code formatting for JS, CSS, and JSON.
- **Run Checks**: `npm run lint:prettier`
- **Auto-Fix**: `npm run fix:prettier`

### 2. ESLint
Enforces coding standards for JavaScript and React components.
- **Run Checks**: `npm run lint:js`
- **Auto-Fix**: `npm run fix:js`

### 3. Stylelint
Enforces coding standards for CSS.
- **Run Checks**: `npm run lint:css`
- **Auto-Fix**: `npm run fix:css`

## Comprehensive Quality Check

Run all quality checks in a single command:
```bash
npm run lint
```
(This usually runs JS/CSS linting and formatting)

To run all PHP-related checks:
```bash
composer check
```

## Best Practices for Agents

1. **Verify Before Submit**: Always run the relevant linting command before submitting code changes.
2. **Fix First**: Use the automated "fix" commands (`composer fix:phpcs`, `npm run fix:js`, etc.) to resolve trivial issues.
3. **Analyze Results**: Carefully review PHPStan and PHPCS outputs. Do not ignore errors; they often point to real bugs or security vulnerabilities.
4. **Follow Docblock Standards**: Ensure all PHP classes and methods have proper docblocks with `@param` and `@return` types.
5. **Modern PHP**: Use the `rector` tool to identify opportunities to modernize code patterns (e.g., using typed properties, arrow functions).
6. **No "Suppressions"**: Avoid using suppression comments (like `phpcs:ignore` or `eslint-disable`) unless there is a documented, technical reason for doing so.
7. **Consistent Formatting**: Always use Prettier to ensure consistent code style across the entire project.
