# commitlint

## Overview
commitlint checks commit messages against conventional commit format (`type(scope): description`). Pairs with husky for Git hooks and standard-version/changesets for automated changelogs.

## Instructions

### Step 1: Setup
```bash
npm install -D @commitlint/cli @commitlint/config-conventional husky
npx husky init
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg
```

### Step 2: Configure
```javascript
// commitlint.config.js — Commit message rules
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore']],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-max-length': [2, 'always', 72],
  },
}
```

### Step 3: Valid Commits
```bash
git commit -m "feat(auth): add Google OAuth login"        # valid
git commit -m "fix(api): handle null response from /users" # valid
git commit -m "updated stuff"                              # rejected
```

## Guidelines
- Conventional commits enable automated changelog generation and semantic versioning.
- Use with husky to enforce at commit time, not just in CI.
- Types: feat (minor bump), fix (patch bump), BREAKING CHANGE (major bump).
