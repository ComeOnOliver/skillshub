# Arch docs

## Overview

Create or refresh architecture and file-structure documentation from the current repo state.
Base statements on observable files and configs, and record unknowns as verification tasks.

## Workflow

1. Inspect the repo
   - Read `README.md` and `AGENTS.md`.
   - Scan layout with `ls -1` and `ls -1 ./docs/`.
   - Use `rg --files` to get a fuller inventory when needed.
   - Identify languages, build tooling, entry points, and main executables.
   - Check common manifests (`pyproject.toml`, `pip_requirements.txt`, `package.json`,
     `Cargo.toml`, `go.mod`, `Makefile`) when present.
   - Locate core logic, scripts, and tests.
   - Check `.gitignore` for generated artifacts and caches.
   - Run `git status -suno` to see uncommitted changes.
2. Update policy
   - Remove stale details.
   - Keep accurate sections and restructure for clarity when needed.
   - State facts only; do not invent details.
   - If unclear, add a verification task in the "Known gaps" section.
3. Apply style and consistency
   - Follow `docs/MARKDOWN_STYLE.md` and `docs/REPO_STYLE.md`.
   - Use present tense, concrete paths, and relative links.
   - Link file and folder names to their repo paths when mentioned, so they are
     clickable for details. Markdown links are created using the syntax
     [link text](URL), where "link text" is the clickable text that appears in the
     document, and "URL" is the web address or file path the link points to. This
     allows users to navigate between different content easily. Use file-path link
     text so readers know the exact filename (good:
     [docs/MARKDOWN_STYLE.md](docs/MARKDOWN_STYLE.md), bad:
     [Style Guide for Markdown](docs/MARKDOWN_STYLE.md)). Only include a backticked
     path when the link text is not the path.
   - Prefer short, scannable bullets.
   - Only include commands verifiable from repo files.
   - Avoid non-ASCII characters unless explicitly required by existing docs.
   - Prefer ISO-8859-1 only when the repo already uses it.
4. Write `docs/CODE_ARCHITECTURE.md`
   - Title: "Code architecture"
   - Sections to include when applicable:
     - Overview
     - Major components (what, where, key dependencies)
     - Data flow (primary use case end-to-end)
     - Testing and verification (only if verifiable)
     - Extension points (where to add code/modules/integrations)
     - Known gaps (verification tasks only)
5. Write `docs/FILE_STRUCTURE.md`
   - Title: "File structure"
   - Sections to include when applicable:
     - Top-level layout (key dirs/files with one-line purpose)
     - Key subtrees (large directories that need clarification)
     - Generated artifacts (what/where/git ignored)
     - Documentation map (docs location and root docs)
     - Where to add new work (code/tests/docs/scripts/data)

## Repository structure

When showing a directory tree, use ASCII only. Do not use box drawing characters.

- Allowed: `|`, `+-`, `` `-``, spaces
- Not allowed: box-drawing characters such as U+251C, U+2500, U+2502, U+2514

Example (ASCII only):

```text
site_docs/
+- index.md
+- biochemistry/
|  `- topic01/
|     `- index.md
`- genetics/
   `- topic01/
      `- index.md
mkdocs.yml
```

6. Wrap up
   - Save both files.
   - Ensure `README.md` links to `docs/CODE_ARCHITECTURE.md` and
     `docs/FILE_STRUCTURE.md` (add links if missing).
   - Update `docs/CHANGELOG.md` with the change; create a minimal stub only when
     doc changes were made and the file is missing.
   - Summarize what changed and what could not be verified.
   - Note that docs-only changes do not require tests unless otherwise requested.

## Notes

- Prefer to trim and correct existing docs before rewriting from scratch.
- If the repo lacks needed evidence, add a "Known gaps" bullet with a verification task.

## Example requests

- "Update the architecture and file structure docs for this repo."
- "Create CODE_ARCHITECTURE.md and FILE_STRUCTURE.md based on current files."
- "Refresh the docs/FILE_STRUCTURE.md map after adding new folders."