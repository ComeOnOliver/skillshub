# Unit test starter (Python3 + pytest)

## Overview

Create thorough, deterministic Python 3 unit tests with pytest by scanning the repo for
Python files, then iterating file-by-file and function-by-function to add tests where
behavior is testable without filesystem IO or network access.

This skill can be slow and may take hours on large repos.

## Hard constraints

- No filesystem IO in tests (no reading/writing real files, no `tmp_path`).
- No network access in tests (no HTTP, sockets, internet APIs).
- Deterministic tests only (no time/randomness unless fully mocked).
- Avoid brittle tests that assert unstable logging/printing unless clearly part of the
  function contract.

## Inputs to request

- Whether to scan the entire repo or exclude known folders (for example generated code,
  vendored code, or `old/` archives).
- Whether there are modules that must never be imported during tests (side effects).
- Any existing pytest config (`pytest.ini`, `pyproject.toml`) and whether tests already
  exist under `tests/`.

## Workflow

1. Confirm pytest baseline
   - Prefer pytest for Python 3 repos unless the repo clearly uses something else.
   - Check for an existing `tests/` folder and any pytest config.
   - If `tests/` does not exist, create it.
2. Determine repo root and discovery command
   - Define `REPO_ROOT` as the current git/workspace root.
   - Discover Python files using `find` (repo-rooted) and iterate in a stable order:
     ```bash
     find "${REPO_ROOT}" -name "*.py" -type f | sort
     ```
   - Apply reasonable exclusions when needed (but keep using `find`), for example:
     `.git/`, `__pycache__/`, `.venv/`, `venv/`, `build/`, `dist/`, `node_modules/`.
3. Choose a one-to-one test file mapping
   - Create one pytest file per source file to keep mapping straightforward.
   - Naming rule (repo-relative path to ASCII-safe filename):
     - Source: `pkg/sub/mod.py`
     - Test: `tests/test_pkg__sub__mod.py`
   - If a source file is untestable under constraints, still create the test module
     with a single `pytest.skip(..., allow_module_level=True)` explaining why.
4. Make imports work (create `tests/conftest.py` when needed)
   - Prefer importing modules the same way the repo imports them.
   - If tests cannot import local modules (no installed package, no package layout),
     create `tests/conftest.py` to add `REPO_ROOT` (and optionally `tests/`) to
     `sys.path`:
     ```python
     #!/usr/bin/env python3
     """
     Pytest config to ensure local imports work without installation.
     """

     from __future__ import annotations

     # Standard Library
     import os
     import sys

     #============================================


     REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
     if REPO_ROOT not in sys.path:
     	sys.path.insert(0, REPO_ROOT)

     TESTS_DIR = os.path.abspath(os.path.dirname(__file__))
     if TESTS_DIR not in sys.path:
     	sys.path.insert(0, TESTS_DIR)
     ```
   - Keep `conftest.py` minimal and repo-wide; do not add per-test hacks.
   - If imports trigger libraries that write caches/config under the user's home
     directory (for example matplotlib), set environment variables early in
     `conftest.py` to redirect them to a temp location (avoid asserting on these side
     effects in tests; this is only to keep the test environment clean).
5. For each Python file: decide whether it is safe to import
   - Prefer importable modules over scripts with side effects.
   - If import triggers work (CLI execution, network, file reads, subprocess), avoid
     importing at module import-time and mark the test module skipped with a reason.
   - When possible, test by importing specific functions/classes from the module
     rather than executing the script entrypoint.
6. For each function/method: triage testability
   - Enumerate functions and methods (top-level `def`, and simple class methods).
   - Skip and document functions that:
     - read/write files or depend on the filesystem (`open`, `pathlib.Path(...).read_*`,
       `os.listdir`, `glob`, etc.)
     - call network/internet (`requests`, `urllib`, `http.client`, `socket`, etc.)
     - spawn processes (`subprocess`, `os.system`)
     - depend on real time or randomness and cannot be safely mocked
     - require complex external services or heavyweight frameworks
7. Write tests for testable functions (table-driven first)
   - Prefer `@pytest.mark.parametrize` for input/output grids.
   - Cover, at minimum:
     - 1 to 3 "core" cases (typical inputs)
     - 1 edge case (empty, None, boundary, unusual whitespace, extremes)
     - 1 negative case when the function explicitly rejects inputs or raises
   - Assertions:
     - Use plain `assert` for values/invariants.
     - Use `pytest.raises(ExpectedError)` for exceptions.
     - Use `match=` only when the message is stable and part of the contract.
   - Avoid duplicating the full function logic in the test; assert observable results
     and key branches.
8. Keep tests deterministic
   - Do not let tests depend on the local machine environment.
   - If the module reads environment variables, use `monkeypatch` to set them.
   - If a function depends on `time.time()` or `random.*`, monkeypatch those calls so
     results are stable.
9. Run tests incrementally (long-running allowed)
   - Prefer targeted runs while generating tests:
     ```bash
     /opt/homebrew/opt/python@3.12/bin/python3.12 -m pytest tests/test_pkg__sub__mod.py
     ```
   - Expect this process to be long on large repos; keep a simple progress log of:
     file -> functions tested -> functions skipped (with reasons).
10. Record changes
   - If files were created or changed, record the change in
     [docs/CHANGELOG.md](docs/CHANGELOG.md) when the file exists.

## Output

- A per-file summary (tested functions, skipped functions, and why).
- New `tests/test_*.py` files (one per source file) that match repo style.
- A `tests/conftest.py` only when needed for local imports.
- Commands to run a single test module and the full suite with `python3 -m pytest`.

## Quality bar

- Deterministic, small, and readable tests per source file.
- No filesystem IO or network access in tests.
- No speculation: only write tests for behavior you can justify from the code; if
  unclear, skip with a precise reason in the test module.
