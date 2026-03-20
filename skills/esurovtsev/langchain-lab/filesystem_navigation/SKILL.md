---
name: filesystem_navigation
description: Guidelines for systematically exploring and understanding directory structures.
---

# Filesystem Navigation

## When to Use This Skill

When you are asked to explore, understand, or map a project's file structure. This includes requests like "what is this project?", "show me the structure", or "help me find where X is".

## Strategy

### Start at the Root

Always begin by listing the top-level directory. The root reveals the project type faster than anything else:

- `README.md` or `README.rst` → start here, it's the author's own summary
- `requirements.txt`, `pyproject.toml`, `package.json` → tells you the language and dependencies
- `Dockerfile`, `docker-compose.yml` → the project is containerized
- `Makefile`, `justfile` → there are predefined commands to run
- `.env.example` → environment variables are needed; never read `.env` itself

### Explore Breadth Before Depth

List all top-level directories before diving into any single one. Build a mental map:

- `src/` or `app/` → application code lives here
- `tests/` or `test/` → test suite
- `config/` or `conf/` → configuration
- `docs/` → documentation
- `scripts/` or `bin/` → utility scripts
- `migrations/` or `alembic/` → database migrations

### Go Deeper with Purpose

Don't read every file. Choose what to read based on what you're trying to answer:

- To understand **what the project does** → README, then entry point
- To understand **how it's structured** → list `src/` recursively
- To understand **how to run it** → README, Makefile, Dockerfile, config
- To understand **dependencies** → requirements.txt, package.json, pyproject.toml

## Things to Avoid

- Don't assume a file's purpose from its name alone — `utils.py` could contain anything
- Don't read binary files (images, compiled files, databases)
- Don't read `.env` files — they may contain secrets
- Don't try to read `node_modules/`, `__pycache__/`, `.git/`, or other generated directories
- Don't list deeply nested directories all at once — go level by level

## Signals That Help

- A `__main__.py` or `if __name__ == "__main__"` block indicates an entry point
- A file named `app.py`, `main.py`, or `server.py` is usually the entry point
- `__init__.py` files in Python indicate a package; they may re-export key symbols
- Hidden files (`.gitignore`, `.flake8`, `.pre-commit-config.yaml`) reveal tooling choices
