# Bptools Question Authoring

## Overview

Use this skill to author regular bptools-based Python generators in `biology-problems`.
Follow the repo's shared generator patterns and verify output with small local runs.

## Workflow

1) Identify scope and load references
- Confirm the target script(s), question type(s), and output format(s).
- Read `references/repos.md` and `references/docs.md` first.
- Read `bptools.py` and `docs/QUESTION_FUNCTION_INDEX.md` for the shared helper API surface.
- Load optional domain guides only when the task touches that domain.

2) Start from known patterns
- Reuse the nearest template in `references/templates.md`.
- Keep a script structure with `parse_arguments()`, `write_question()`, and `main()`.
- Use shared parser helpers from `bptools` for consistent CLI flags.

3) Implement with bptools primitives
- Build prompts/choices as plain strings and lists.
- Format questions with the relevant `bptools.formatBB_*` function.
- Use `bptools.collect_and_write_questions(...)` and `bptools.make_outfile(...)`.
- Respect anti-cheat defaults and only override intentionally.

4) Validate behavior
- Run the modified generator with a small count (for example `-d 1`).
- Check produced BBQ text for formatting and expected answer keys.
- Run relevant tests for edited code paths.

5) Finish cleanly
- Update `docs/CHANGELOG.md` in `biology-problems` for code or doc changes.
- Keep generated artifacts out of git (`bbq-*.txt`, `qti*.zip`, `selftest-*.html`).

## Core Rules

- Treat `docs/QUESTION_AUTHORING_GUIDE.md` as the primary authoring reference.
- Maintain Python style required by this repo: tabs for indentation, ASCII comments, `main()` entrypoint.
- Keep randomness well mixed for student-facing content; avoid predictable round-robin selection unless explicitly requested for reproducibility/debugging.
- Keep Blackboard sanitizer compatibility patterns (split comments in JS function declarations) when present in existing generators.
- If output behavior is unclear, inspect both `bptools.py` and the corresponding `qti_package_maker` writer/validator paths before changing format logic.

## Reference Files

- Read `references/docs.md` for required and optional biology-problems guides.
- Read `references/repos.md` for local repo paths and high-value files.
- Read `references/api_surface.md` for common bptools and qti_package_maker touchpoints.
- Read `references/templates.md` for starter template locations.

## Notes

- Prefer minimal, targeted changes over broad refactors.
- Reuse existing helper utilities instead of copying formatting logic into each script.
- When the request includes new question families (matching sets, MC statements, pedigrees, phylogenetic trees, PubChem), load the matching optional guide before editing.