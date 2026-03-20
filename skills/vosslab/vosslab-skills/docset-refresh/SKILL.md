# Docset refresh

## Overview

Check the full documentation set, create or update only what is justified by the repo,
and keep outputs concise, scannable, and evidence based.

## Workflow

1. Read the rules and inventory
   - Read `AGENTS.md`, `docs/REPO_STYLE.md`, and `docs/MARKDOWN_STYLE.md`.
   - List `docs/` contents and root docs (`AGENTS.md`, `README.md`, `LICENSE`).
2. Check required root docs
   - If missing, flag them. Only create stubs when explicitly asked:
     - `AGENTS.md`
     - `README.md`
     - `LICENSE`
3. Check recommended common docs
   - For each of the following, create or update only when the repo scope supports
     truthful content. If evidence is missing, add a short stub with "Known gaps"
     tasks instead of guessing.
     - `docs/CHANGELOG.md`
     - `docs/CODE_ARCHITECTURE.md`
     - `docs/FILE_STRUCTURE.md`
     - `docs/INSTALL.md`
     - `docs/NEWS.md`
     - `docs/RELATED_PROJECTS.md`
     - `docs/RELEASE_HISTORY.md`
     - `docs/ROADMAP.md`
     - `docs/TODO.md`
     - `docs/TROUBLESHOOTING.md`
     - `docs/USAGE.md`
4. Check centrally maintained docs
   - Verify presence and exactness only. Do not edit content.
     - `docs/AUTHORS.md`
     - `docs/MARKDOWN_STYLE.md`
     - `docs/PYTHON_STYLE.md`
     - `docs/REPO_STYLE.md`
5. Check less common docs
   - Create only when evidence exists in the repo:
     - `docs/COOKBOOK.md`
     - `docs/DEVELOPMENT.md`
     - `docs/FAQ.md`
6. Choose a file I/O strategy
   - Use only one of these unless there is a clear need for more:
     - `docs/INPUT_FORMATS.md`
     - `docs/OUTPUT_FORMATS.md`
     - `docs/FILE_FORMATS.md`
   - Add `docs/YAML_FILE_FORMAT.md` only when YAML is a real interface surface.
7. Flag docs that should not exist
   - If present, recommend relocation or deletion:
     - `CONTRIBUTING.md` (prefer `docs/DEVELOPMENT.md`)
     - `CODE_OF_CONDUCT.md`
     - `COMMUNITY.md`
     - Templates
     - `SECURITY.md`
8. Check repo specific docs
   - Create only when the repo clearly needs them (for example `docs/CONTAINER.md`,
     `docs/ENGINES.md`).
9. Apply naming and style rules
   - Use ALL CAPS with underscores under `docs/`.
   - Keep links relative and descriptive.
   - Use present tense, short bullets, and avoid speculation.
10. Update changelog
    - If `docs/CHANGELOG.md` is missing, create a minimal stub only when this run
      created or updated docs; otherwise flag it as missing.
    - Record doc changes in `docs/CHANGELOG.md` with a dated entry.
11. Provide a short report
    - Created: list new docs.
    - Updated: list updated docs.
    - Flagged: list docs to relocate or delete.
    - Known gaps: list verification tasks only.

## Minimal stub template

- Title in sentence case.
- One paragraph describing scope and audience.
- Sections with 2 to 6 bullets each, one idea per bullet.
- "Known gaps" section when evidence is missing, with tasks only.