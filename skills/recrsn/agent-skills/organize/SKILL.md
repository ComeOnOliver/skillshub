Check the diff against origin/main, and identify large files that were added or
modified in this branch. Run `git fetch origin` to make sure git context is
up-to-date.

Here is the list of files changed in this branch:
!`git diff --name-only origin/main`

For each changed file, read the full file and determine if it should be split
based on the language conventions below. Then execute the splits, updating all
imports and references across the project.

## When to split

- Files over ~300 lines are candidates; over ~500 should almost always be split
- Files with multiple unrelated concepts or public exports
- Keep tightly coupled code together — don't split just to hit a line count
- Helper/utility functions used by only one caller stay with the caller
- One major class/component per file (applies across all languages)
- Group small related types (enums, data classes) together

## Language-specific additions

### TypeScript / JavaScript / React

- Colocate component styles and tests alongside the component
- Redux: ducks pattern — one slice file per domain
- Shared types/interfaces go in `types.ts`; barrel exports (`index.ts`) for directory API

### Swift / SwiftUI

- Previews stay with their view; protocols and default extensions can share a file

### Java / Kotlin

- Inner classes stay with outer class unless large and used externally
- Kotlin: data classes used by only one file can stay

### Python

- Separate CLI entry points from library code

### Go

- Group by responsibility: types, handlers, middleware
- Keep interfaces near dependents, not implementations
- Test files mirror source files (`foo.go` → `foo_test.go`)

## Rules

- Only split files touched by the branch diff
- Preserve external behavior exactly; all existing imports must continue to work
- Follow the project's existing naming and directory conventions over the guidelines above
- Do not rename exported symbols — only move them
- Update all imports, references, and re-exports; verify no circular dependencies
- Run the project's linter/formatter if configured
- When in doubt, leave the code together

Report at the end with a brief summary of files split and the rationale.