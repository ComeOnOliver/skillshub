# GitHub Actions Skill

This skill helps write and modify GitHub Actions workflows and custom actions.

## Workflow Basics

Workflows are YAML files stored in `.github/workflows/`. They define automated processes triggered by events.

### Minimal Workflow Structure

```yaml
name: CI                          # Optional: Display name
on: push                          # Trigger event(s)
jobs:
  build:                          # Job ID (must be unique)
    runs-on: ubuntu-latest        # Runner environment
    steps:
      - uses: actions/checkout@v5 # Use an action
      - run: echo "Hello"         # Run a command
```

## Triggers (on:)

### Common Events

```yaml
on: push                              # Any push
on: [push, pull_request]              # Multiple events
on:
  push:
    branches: [main, 'releases/**']   # Branch filter
    paths: ['src/**']                 # Path filter
  pull_request:
    types: [opened, synchronize]      # Activity types
  workflow_dispatch:                  # Manual trigger
    inputs:
      environment:
        description: 'Deploy target'
        required: true
        type: choice
        options: [dev, staging, prod]
  schedule:
    - cron: '0 0 * * *'               # Daily at midnight UTC
```

### Key Events Reference

| Event | Use Case |
|-------|----------|
| `push` | Commits pushed to branches/tags |
| `pull_request` | PR opened, updated, closed |
| `pull_request_target` | PR from fork (runs in base context) |
| `workflow_dispatch` | Manual trigger with inputs |
| `workflow_call` | Reusable workflow |
| `schedule` | Cron-based scheduling |
| `release` | Release published/created |
| `workflow_run` | After another workflow completes |

## Jobs

### Job Dependencies and Outputs

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.value }}
    steps:
      - id: version
        run: echo "value=1.0.0" >> "$GITHUB_OUTPUT"

  deploy:
    needs: build                      # Depends on build job
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying ${{ needs.build.outputs.version }}"
```

### Job Conditions

```yaml
jobs:
  deploy:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
```

### Matrix Strategy

```yaml
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        node: [18, 20]
        exclude:
          - os: windows-latest
            node: 18
        include:
          - os: ubuntu-latest
            node: 20
            coverage: true
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
```

## Steps

### Using Actions

```yaml
steps:
  - uses: actions/checkout@v5           # Public action (owner/repo@ref)
  - uses: actions/checkout@8f4b7f84...  # Pin to commit SHA (most secure)
  - uses: ./.github/actions/my-action   # Local action
  - uses: docker://alpine:3.8           # Docker image
```

### Running Commands

```yaml
steps:
  - run: npm install
  - run: |
      echo "Multi-line"
      echo "commands"
    shell: bash
    working-directory: ./app
```

### Step Conditions

```yaml
steps:
  - run: echo "Always runs"
    if: always()

  - run: echo "On failure"
    if: failure()

  - run: echo "Main branch only"
    if: github.ref == 'refs/heads/main'

  - run: echo "Not cancelled"
    if: ${{ !cancelled() }}
```

## Expressions and Contexts

### Expression Syntax

Use `${{ expression }}` to evaluate expressions. In `if:` conditions, `${{ }}` is optional.

### Common Contexts

| Context | Description |
|---------|-------------|
| `github.*` | Workflow run info (ref, sha, actor, repository) |
| `env.*` | Environment variables |
| `vars.*` | Repository/org variables |
| `secrets.*` | Secrets |
| `steps.<id>.outputs.*` | Step outputs |
| `needs.<job>.outputs.*` | Job outputs |
| `matrix.*` | Matrix values |
| `runner.*` | Runner info (os, arch) |

### Useful Expressions

```yaml
# Context access
${{ github.event_name }}
${{ github.ref_name }}
${{ github.sha }}
${{ github.actor }}

# Conditionals
${{ github.ref == 'refs/heads/main' }}
${{ contains(github.event.head_commit.message, '[skip ci]') }}
${{ startsWith(github.ref, 'refs/tags/') }}

# Default values
${{ github.head_ref || github.run_id }}

# JSON manipulation
${{ toJSON(github.event) }}
${{ fromJSON(needs.job1.outputs.matrix) }}
```

### Built-in Functions

| Function | Example |
|----------|---------|
| `contains(search, item)` | `contains(github.event.issue.labels.*.name, 'bug')` |
| `startsWith(str, value)` | `startsWith(github.ref, 'refs/tags/')` |
| `endsWith(str, value)` | `endsWith(github.repository, '-demo')` |
| `format(str, ...)` | `format('Hello {0}', github.actor)` |
| `join(array, sep)` | `join(matrix.os, ', ')` |
| `toJSON(value)` | `toJSON(steps.test.outputs)` |
| `fromJSON(str)` | `fromJSON(needs.setup.outputs.matrix)` |
| `hashFiles(path)` | `hashFiles('**/package-lock.json')` |

## Secrets and Variables

### Accessing Secrets

```yaml
steps:
  - run: echo "Token: $TOKEN"
    env:
      TOKEN: ${{ secrets.MY_TOKEN }}

  - uses: some-action@v1
    with:
      api-key: ${{ secrets.API_KEY }}
```

### Environment Variables

```yaml
env:                              # Workflow-level
  NODE_ENV: production

jobs:
  build:
    env:                          # Job-level
      CI: true
    steps:
      - run: echo $MY_VAR
        env:                      # Step-level
          MY_VAR: value
```

### Setting Outputs

```yaml
steps:
  - id: set-output
    run: echo "result=success" >> "$GITHUB_OUTPUT"

  - run: echo "${{ steps.set-output.outputs.result }}"
```

## Runners

Common labels: `ubuntu-latest`, `windows-latest`, `macos-latest`. Self-hosted: `runs-on: [self-hosted, linux, x64]`. See `references/RUNNERS.md` for full specs.

## Permissions

```yaml
permissions:
  contents: read
  pull-requests: write
  id-token: write         # Required for OIDC

# Or disable all
permissions: {}
```

## Concurrency

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

## Artifacts and Caching

### Upload/Download Artifacts

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: build-output
    path: dist/

- uses: actions/download-artifact@v4
  with:
    name: build-output
```

### Dependency Caching

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-npm-
```

## Environments

```yaml
jobs:
  deploy:
    environment:
      name: production
      url: https://example.com
    runs-on: ubuntu-latest
```

## Reusable Workflows

### Calling a Reusable Workflow

```yaml
jobs:
  call-workflow:
    uses: owner/repo/.github/workflows/reusable.yml@main
    with:
      input1: value
    secrets:
      token: ${{ secrets.TOKEN }}
```

### Creating a Reusable Workflow

```yaml
on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
    secrets:
      token:
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying to ${{ inputs.environment }}"
        env:
          TOKEN: ${{ secrets.token }}
```

## Common Patterns

### Checkout and Setup

```yaml
steps:
  - uses: actions/checkout@v5
  - uses: actions/setup-node@v4
    with:
      node-version: '20'
      cache: 'npm'
  - run: npm ci
```

### Conditional on File Changes

```yaml
on:
  push:
    paths:
      - 'src/**'
      - '!src/**/*.md'
```

### Run on Tag Push

```yaml
on:
  push:
    tags:
      - 'v*'
```

## Workflow Commands Quick Reference

```bash
# Step outputs (use in later steps via steps.<id>.outputs.<name>)
echo "name=value" >> "$GITHUB_OUTPUT"

# Set environment variable for subsequent steps
echo "VAR_NAME=value" >> "$GITHUB_ENV"

# Job summary (supports markdown)
echo "### Build Results :rocket:" >> "$GITHUB_STEP_SUMMARY"
echo "| Test | Status |" >> "$GITHUB_STEP_SUMMARY"
echo "| --- | --- |" >> "$GITHUB_STEP_SUMMARY"
echo "| Unit | Passed |" >> "$GITHUB_STEP_SUMMARY"

# Add to PATH for subsequent steps
echo "/path/to/tool" >> "$GITHUB_PATH"

# Log annotations
echo "::error file=app.js,line=10::Something failed"
echo "::warning::Deprecation notice"
echo "::notice::FYI message"

# Mask a value from logs
echo "::add-mask::$SECRET_VALUE"
```

See `references/WORKFLOW-COMMANDS.md` for full details including `::group::`, `::debug::`, multiline values, and GITHUB_STATE.

## Key Limits

| Limit | Value |
|-------|-------|
| Workflow run time | 35 days |
| Job execution time | 6 hours (self-hosted: unlimited) |
| Matrix combinations | 256 per workflow |
| Concurrent jobs (Free) | 20 (macOS: 5) |
| Concurrent jobs (Team/Enterprise) | 60 (macOS: 5) |
| Workflow file size | 512 KB |
| Caches total per repo | 10 GB |
| Artifact retention | 90 days (configurable) |
| Log retention | 400 days (configurable to 90) |

See `references/LIMITS.md` for full limits including API rates and storage quotas.

## Troubleshooting

1. **Workflow not triggering**: Check branch/path filters, verify file is in `.github/workflows/`
2. **Permission denied**: Add required `permissions:` block
3. **Secret not found**: Verify secret name matches exactly (case-sensitive)
4. **Step output empty**: Ensure using `>> "$GITHUB_OUTPUT"` (not deprecated set-output)
5. **Matrix job failing**: Check `exclude`/`include` syntax and values
6. **Debug logging**: Re-run workflow with `ACTIONS_RUNNER_DEBUG: true` or `ACTIONS_STEP_DEBUG: true`

## References

Core:
- `references/WORKFLOW-SYNTAX.md` - Full workflow YAML syntax
- `references/EXPRESSIONS.md` - Contexts, functions, operators
- `references/TRIGGERS.md` - Event types and filtering
- `references/WORKFLOW-COMMANDS.md` - GITHUB_OUTPUT, GITHUB_ENV, annotations, job summaries
- `references/LIMITS.md` - Time limits, quotas, rate limits by plan

Build and deploy:
- `references/ACTIONS.md` - Creating custom actions (JS, Docker, composite)
- `references/RUNNERS.md` - Runner specs, self-hosted configuration
- `references/PATTERNS.md` - Common workflow patterns
- `references/LANGUAGE-CI.md` - CI setup per language (Node, Python, Java, Go, Rust, Ruby, .NET, Swift)
- `references/PUBLISHING.md` - Publish to npm, PyPI, Docker Hub, GHCR, Maven Central
- `references/CLOUD-DEPLOYMENTS.md` - Deploy to AWS, Azure, GCP with OIDC

Security and ops:
- `references/SECURITY.md` - Secrets, OIDC (AWS/Azure/GCP), attestations, script injection
- `references/MIGRATION.md` - Migrate from Jenkins, Travis CI, CircleCI, GitLab, Azure DevOps
- `references/ENTERPRISE.md` - ARC, runner groups, larger runners, billing, private networking