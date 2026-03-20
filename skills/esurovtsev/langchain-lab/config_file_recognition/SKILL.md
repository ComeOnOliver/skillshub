---
name: config_file_recognition
description: How to find, read, and audit configuration files — includes concrete investigation steps like grepping for env vars, checking for hardcoded secrets, and mapping external service dependencies.
---

# Config File Recognition

## When to Use This Skill

When you need to understand how a project is configured, what external services it depends on, what environment variables it requires, or whether there are configuration issues (hardcoded secrets, missing defaults, inconsistent settings).

## Step-by-Step Investigation

### Step 1: Find All Config Files

Use `glob_search` to locate config files across the project:

- `glob_search(pattern="**/.env*")` — environment files
- `glob_search(pattern="**/*.json", path="config/")` — JSON config
- `glob_search(pattern="**/Dockerfile*")` — container config
- `glob_search(pattern="**/*.yaml")` or `**/*.yml` — YAML config
- `glob_search(pattern="**/requirements*.txt")` — Python dependencies
- `glob_search(pattern="**/package.json")` — Node.js dependencies

### Step 2: Read Safe Config Files First

Read in this priority order:

1. **`.env.example`** — safe to read, shows what variables the app expects
2. **`config/` directory files** — JSON/YAML config for services, servers, etc.
3. **`requirements.txt` / `package.json`** — dependencies reveal what services are used
4. **`Dockerfile` / `docker-compose.yml`** — runtime environment, ports, services

**Never read `.env` files** — they may contain real secrets.

### Step 3: Grep for Configuration Patterns in Code

Use `grep_search` to understand how config is consumed:

- `grep_search(query="os.getenv|os.environ|dotenv")` — find env var usage in Python
- `grep_search(query="process.env")` — find env var usage in JavaScript/Node
- `grep_search(query="localhost|127.0.0.1")` — find hardcoded local URLs
- `grep_search(query="port|PORT")` — find port configuration
- `grep_search(query="SECRET|KEY|TOKEN|PASSWORD")` — check for sensitive values in code

### Step 4: Map External Dependencies

From the config files and grep results, build a picture of:

- **Required environment variables** — list each with its purpose (from `.env.example` and `getenv` calls)
- **External services** — databases, APIs, caches (from connection strings and config)
- **Ports** — what ports the app listens on and connects to
- **API keys / credentials needed** — which services require authentication

### Step 5: Check for Issues

Look for common configuration problems:

- **Hardcoded secrets** — API keys, passwords, or tokens directly in source code (not in env vars)
- **Missing `.env.example`** — if code uses env vars but no example file documents them
- **Inconsistent ports** — frontend configured to call one port, backend listening on another
- **Hardcoded URLs** — `localhost` or IP addresses that won't work in production
- **Unpinned dependencies** — `requirements.txt` without version pins

## Report Format

Structure your findings as:

1. **Config Files Found** — list with brief purpose of each
2. **Environment Variables** — table of variable name, purpose, where it's used
3. **External Services** — what the app connects to and how
4. **Ports & URLs** — network configuration summary
5. **Issues Found** — any problems discovered (hardcoded secrets, missing config, etc.)

## Things to Avoid

- Never read `.env` files — they contain real secrets
- Never display actual secret values even if found in code — just note their location
- Don't assume config values are current — they might be defaults overridden at runtime
- Don't confuse `requirements.txt` (dependencies) with `config.yaml` (runtime settings)
