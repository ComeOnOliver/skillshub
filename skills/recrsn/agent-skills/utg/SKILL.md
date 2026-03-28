Check the diff against origin/main, and generate unit tests for the changed code
in this branch. Run `git fetch origin` to make sure git context is up-to-date.

Here is the list of files changed in this branch:
!`git diff --stat origin/main`

- Check existing test coverage for changed code; skip areas already well-covered
- Only generate tests for logic changes, not data structure or formatting changes
- Use the project's existing test framework and conventions
- Run the test suite with coverage after generating tests, and add more tests if coverage for changed code is low

**Testing guidelines:**

- Tests should be isolated — use mocks/stubs for external dependencies, but do not mock logging or telemetry
- Only test public API of modules/classes, not private/internal methods
- Follow existing test style and conventions in the codebase
