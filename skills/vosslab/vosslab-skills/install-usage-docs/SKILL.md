# Install and usage docs

## Goal

Create minimal, correct stubs for:
- [docs/INSTALL.md](docs/INSTALL.md): setup steps, dependencies, environment requirements.
- [docs/USAGE.md](docs/USAGE.md): how to run the tool, CLI flags, practical examples.

Keep content evidence based. If evidence is missing, write a "Known gaps" task instead
of guessing.

## Inputs to request

- Primary run mode: CLI, library, or both, and which one is the main entry point.
- Supported platforms, if known, including any OS or shell constraints already stated.
- One or two common real workflows users should be able to do, described as concrete tasks.

## Workflow

1. Inspect evidence
   - Read [README.md](../../README.md) and [AGENTS.md](../../AGENTS.md) when present
     to learn purpose, constraints, and any required environment notes.
   - Look for entry points and run commands (scripts, [pyproject.toml](../../pyproject.toml),
     `setup.cfg`, `Makefile`, `tools/`, `bin/`) and note what a user actually runs.
   - Identify dependencies and install method (pip editable, requirements file, system deps),
     and only record what is confirmed by repo files.
2. Create or update docs
   - Create missing files, or trim and correct stale ones.
   - Keep doc naming under [docs/](../../docs/) consistent with repo conventions.
3. Keep stubs minimal
   - Prefer 2 to 6 bullets per section.
   - Prefer one primary path and keep alternates out unless the repo makes them explicit.
   - Include exact commands only when verifiable from repo evidence, not inferred.
   - Target 40 to 120 lines per doc, and prefer linking to deeper docs when needed.
4. Record uncertainty explicitly
   - Add a "Known gaps" section with verification tasks only, written as TODO-style checks.
   - Do not invent versions, OS support, or flags; leave them as gaps instead.
5. Require a verify step
   - [docs/INSTALL.md](docs/INSTALL.md) must include a "Verify install" section with
     one command that proves the install worked in a fresh environment.
   - If no verifiable command exists, add it as a "Known gaps" task instead of guessing.
6. Troubleshooting only with evidence
   - Add a troubleshooting subsection in [docs/INSTALL.md](docs/INSTALL.md) only when
     you can cite it from repo evidence (existing issues, error messages in scripts,
     known env vars, CI failures).
   - Otherwise do not include troubleshooting content or speculative fixes.
7. Document dry-run behavior when it exists
   - If scripts that modify files expose a `--dry-run` option, document it in
     [docs/USAGE.md](docs/USAGE.md).
   - Do not invent flags. If a dry-run is missing and would help, note it as a
     "Known gaps" task instead of adding unverified guidance.
8. Keep README scope separate
   - Do not move README content here. If README needs pruning or restructuring,
     use the readme-fix skill and keep INSTALL/USAGE focused on setup and run steps.
9. Update changelog
   - Record doc changes in [docs/CHANGELOG.md](../../docs/CHANGELOG.md) with a short,
     dated entry describing what changed.

## docs/INSTALL.md stub template

# Install

One paragraph: what "installed" means for this repo (CLI available, importable module, both).

## Requirements
- Bullet list of confirmed requirements (Python version, system tools, OS notes).
- If unknown, add a Known gaps item instead.

## Install steps
- Clone or obtain source (only if repo is not a pip package).
- Create venv (if repo standard) and name it consistently with repo conventions.
- Install dependencies (pip command supported by repo) and avoid unverified extras.
- Install the package (editable or normal) if applicable and supported by evidence.

## Verify install
- One command that proves install worked (for example, `python3 -m <module> --help`
  or import check).

## Troubleshooting
- Only include when supported by repo evidence.

## Known gaps
- Verification tasks only.

## docs/USAGE.md stub template

# Usage

One paragraph: what users do with the tool.

## Quick start
- 1 to 3 minimal examples for the primary workflow, written as short command blocks.
- Include inputs and expected outputs at a high level without guessing content.

## CLI
- If a CLI exists, show:
  - How to invoke it and where it lives in the repo.
  - 3 to 6 common flags or subcommands, only if confirmed in repo evidence.

## Examples
- 2 to 4 short examples that match real workflows.
- Prefer realistic filenames and paths that already exist in repo docs or scripts.

## Inputs and outputs
- Inputs: key file types, directories, or formats, with names that match repo usage.
- Outputs: key artifacts, where they appear, and what is generated, in plain terms.

## Known gaps
- Verification tasks only.

## Output

- Updated [docs/INSTALL.md](docs/INSTALL.md) and [docs/USAGE.md](docs/USAGE.md).
- Short report: created, updated, and known gaps.
