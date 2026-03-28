# Read Repo Rules

## Overview
Provide strict, one-sentence summaries of key repo instruction files, obeying exact output formatting and missing-file stop conditions.

## Workflow
1. Verify each provided file path exists (use `ls <paths>` or `test -f`, no recursive listings). If any missing, output `MISSING: <path>` and stop.
2. Read AGENTS.md, docs/REPO_STYLE.md, and docs/PYTHON_STYLE.md normally (use `sed -n "1,200p"` or similar).
3. For docs/CHANGELOG.md, identify the latest dated entry and read only that entry section (from its heading to the line before the next dated heading, or end of file).
4. Produce exactly one sentence per file that states the high-level purpose and what it specifies for an AI agent to do.
5. Output lines in the exact order and prefix required by the prompt (for example `AGENTS: ...`, `REPO_STYLE: ...`, `PYTHON_STYLE: ...`, `CHANGELOG: ...`).
6. If the prompt says output exactly these lines or otherwise forbids extra text, do not add anything else.
7. If the prompt allows extra text, append the follow-up question: do you (the agent) now know how to run code? is there a source_me.sh file or similar
8. Never use `ls -R` or recursive listings; only list the explicit paths provided.
