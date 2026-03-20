---
name: github-cli
description: Use this skill for any GitHub-related task. Always read it before using gh. It contains the default commands and operating rules for working with GitHub through the local gh CLI.
---

# GitHub CLI

## When to Use This Skill

Use this skill for GitHub-related tasks when working through the local `gh` CLI.

Examples:
- inspect the authenticated user's repositories
- read a repository README to understand the project
- inspect repository metadata
- work with issues or pull requests

## Core Rules

- Always read this skill before using `gh`.
- Prefer short, single-purpose shell commands.
- Do not start read-only inspection tasks with composite shell scripts.
- Use `GH_PAGER=cat` by default.
- Use `NO_COLOR=1 CLICOLOR=0` when output will be parsed or piped.
- Prefer `--json` and `--jq` when available.
- Do not guess flags from memory. If syntax is uncertain, run `GH_PAGER=cat gh --help` or the relevant subcommand help first.
- Do not use `gh auth status --show-token`.

## Shell Discipline

- Prefer one `gh` action per shell call.
- Avoid `$(...)`, `while read`, long `&&` chains, and large inline scripts for routine inspection.
- Inspect first, then summarize.
- If a command fails, simplify the next step instead of making the command longer.

## Typical Use Cases

### 1. Get the Authenticated User

Use this when the task says "my repos", "my PRs", or similar.

```bash
GH_PAGER=cat gh api user -q '.login'
```

### 2. Get General Understanding of a Project

Start with the repository README. This is the default way to get basic project understanding.

Use this exact command:

```bash
GH_PAGER=cat gh api repos/<owner>/<repo>/readme --jq '.content' | base64 --decode
```

Rules:
- Use this as the default README command.
- Do not try `gh repo view --json readme`.
- Only try another approach if this README command fails.

### 3. Get Recent Repositories for an Account

For recent GitHub activity, use structured output first.

```bash
GH_PAGER=cat NO_COLOR=1 CLICOLOR=0 gh repo list <owner> --limit 100 --json name,nameWithOwner,isFork,updatedAt --jq 'map(select(.isFork == false)) | sort_by(.updatedAt) | reverse | .[:3]'
```

Important:
- This uses `updatedAt`, which means recent GitHub-side updates.
- If you specifically need recent code work rather than generic repo updates, use `pushed_at` via `gh api` instead.

Recent code work example:

```bash
GH_PAGER=cat NO_COLOR=1 CLICOLOR=0 gh api 'users/<owner>/repos?per_page=100&sort=pushed' -q 'map(select(.fork == false)) | .[:3] | map({name: .name, full_name: .full_name, pushed_at: .pushed_at})'
```

### 4. Inspect Repository Metadata

Use `gh repo view` for high-level metadata, not for README content.

```bash
GH_PAGER=cat gh repo view <owner>/<repo> --json name,description,url,updatedAt,pushedAt
```

### 5. List Pull Requests or Issues

```bash
GH_PAGER=cat gh pr list --json number,title,state,author
GH_PAGER=cat gh issue list --json number,title,state,assignees
```

If the built-in command does not expose the fields you need, use `gh api`.

## If Something Fails

- If syntax is uncertain, inspect help before retrying:

```bash
GH_PAGER=cat gh --help
GH_PAGER=cat gh repo --help
GH_PAGER=cat gh repo list --help
GH_PAGER=cat gh api --help
```

- After one syntax failure, inspect help instead of guessing again.
- If a high-level command is too limited, switch to `gh api`.
- If README retrieval fails, report that the README is unavailable and continue if enough evidence remains.

## Safety

- Never print tokens or secret env vars.
- Prefer read-only commands unless the user explicitly asks for changes.
- Before write operations, inspect the target state first.
