Check the diff against origin/main, and review the changed code for cohesiveness.
Run `git fetch origin` to make sure git context is up-to-date.

Here is the list of files changed in this branch:
!`git diff --name-only origin/main`

For each changed file, read the full file and assess whether the modifications
maintain or improve cohesion. Then execute refactors to fix any issues found.

## What to look for

- Functions/methods that handle multiple unrelated concerns
- Classes that gained responsibilities outside their original purpose
- Modules that mix abstraction levels (e.g., business logic interleaved with I/O)
- Logic added to a file/module where it doesn't conceptually belong
- New dependencies between modules that should be independent; functions reaching into other modules' internals; shared mutable state across boundaries
- Related logic for a single feature scattered unnecessarily; duplicated logic that should be consolidated

## Rules

- Only refactor code touched by the branch diff — do not reorganize unrelated code
- Preserve external behavior exactly; no functional changes
- Follow existing project conventions for file organization and naming
- Do not create new files unless a clear, existing organizational pattern calls for it
- Run the project's linter/formatter after refactoring if one is configured

Report at the end with a brief summary of refactors performed.
