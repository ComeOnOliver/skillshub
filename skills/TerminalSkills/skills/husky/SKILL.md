# Husky

## Overview
Husky manages Git hooks from package.json. Run linters, formatters, tests, and commit checks automatically before commits and pushes.

## Instructions

### Step 1: Setup
```bash
npm install -D husky lint-staged
npx husky init
```

### Step 2: Pre-commit Hook
```bash
# .husky/pre-commit — Run lint-staged before each commit
npx lint-staged
```

```json
// package.json — lint-staged configuration
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,md,json}": ["prettier --write"]
  }
}
```

### Step 3: Pre-push Hook
```bash
# .husky/pre-push — Run tests before pushing
npm test
```

## Guidelines
- Husky v9+ uses .husky/ directory with plain shell scripts.
- lint-staged runs linters only on staged files — fast even in large repos.
- Don't run full test suite in pre-commit (too slow); save it for pre-push or CI.