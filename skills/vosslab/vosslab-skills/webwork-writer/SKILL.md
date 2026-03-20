# WebWork Question Authoring

## Overview

Use this skill to author or adjust PG/PGML problems with the local WebWork renderer, repo rules, and the docs in references/.

## Workflow

1) Identify the target repo and file, then read the relevant doc references.
2) Apply the PGML structure and rules from the WebWork author guide.
3) Make edits in the problem file and update docs/CHANGELOG.md in the target repo.
4) Render with `-r` using the local renderer API to visually confirm layout and checkbox behavior (prerequisite).
5) Lint or render with the local renderer API when the change affects PGML output.

## Core Rules (from repo docs)

- Use PGML-first structure with inline grading; keep setup, answers, and PGML text in separate sections.
- PGML is single-pass: do not build PGML tag wrappers inside Perl strings. If a variable contains HTML, render it with `[$var]*`.
- HTML whitelist blocks `table`, `tr`, `td`; use flexbox divs or niceTables instead.
- For matching problems on PG 2.17, use PopUp widgets and HTML-only `MODES(TeX => '', HTML => ...)` wrappers for layout.
- Prefer local `PGrandom` seeded with `problemSeed` for deterministic randomization; avoid `SRAND` unless you want to reset the global RNG; sort hash keys before random selection.
- Avoid MathJax color macros; use HTML spans and CSS for color.
- Always render with `-r` to visually confirm layout and checkbox behavior before reporting results.

## Reference Files

- Read references/repos.md to locate local repos and paths.
- Read references/docs.md for the required WebWork authoring docs.
- Read references/linting.md to run renderer API linting.
- Check bundled reference docs and examples; render them when needed to confirm renderer capabilities (for example, whether a macro is present).

## Notes

- Keep solution text plain when exporting to systems that do not render HTML.
- For matching problems, use the PG 2.17-safe patterns documented in docs/webwork.