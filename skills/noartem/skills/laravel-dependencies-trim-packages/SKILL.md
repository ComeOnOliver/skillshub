# Trim Dependencies

- Audit packages: `composer show --tree` and remove unused ones
- Prefer first-party or built-in features before adding new packages
- Regularly update; pin major versions via constraints and test

```
composer remove vendor/package
```