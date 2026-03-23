---
name: Quality Assurance Standards
description: Standards for maintaining code hygiene, automated checks, and testing integrity.
metadata:
  labels: [quality-assurance, testing, linting, code-quality]
  triggers:
    keywords: [test, qa, lint, quality, assurance]
---

# Quality Assurance - High-Density Standards

Standards for maintaining code hygiene, automated checks, and testing integrity.

## **Priority: P1 (MAINTENANCE)**

Standards for maintaining code quality, automated checks, and testing integrity.

## 🔍 Code Quality & Linting

- **Zero Tolerance**: Treat all linter warnings/infos as fatal errors in CI.
- **Automated Formatting**: Enforce strict formatting on every commit using hooks.
- **Type Safety**: Never use `any` or `dynamic` unless absolutely necessary. Use specific interfaces/types for all data boundaries.
- **Dead Code**: Proactively remove unused imports, variables, and deprecated methods.

## 🧪 Testing & TDD

- **F-I-R-S-T**: Test must be Fast, Independent, Repeatable, Self-Validating, and Timely.
- **TDD (Red-Green-Refactor)**: See our dedicated [TDD Skill](../tdd/SKILL.md) for strict cycle enforcement.
- **Edge Cases**: Always test null/empty states, boundary limits, and error conditions.
- **Mock Dependencies**: Isolate code by mocking external systems (APIs, DBs) to ensure deterministic results.

## 🔺 The Test Pyramid

- **Unit Tests (70%)**: Fast, isolated, test individual functions/classes. (TDD focus).
- **Integration Tests (20%)**: Test interactions between modules (e.g., Service + DB).
- **E2E Tests (10%)**: Slow, realistic, test user flows from UI to Backend.

## 🎯 Risk-Based Testing

- **Prioritize Critical Paths**: Login, Payments, Data Integrity must have the highest coverage.
- **Impact Analysis**: Ask "What happens if this fails?" If the answer is "Data Loss", test it thoroughly.

## 🛠 Refactoring & Code Reviews

- **Code Smells**: Proactively refactor duplicated code, long methods (>20 lines), and "god classes".
- **Incremental Changes**: Perform small, behavior-preserving transformations (Extract Method, Rename Variable).
- **Quality Gate**: Use peer reviews to share knowledge and catch logic errors before merging.
- **Constructive Feedback**: Critique the code, not the author. Explain the "why" behind suggestions.

## 🛠 Automation & Hooks

- **Pre-commit Hooks**: Validate linting, formatting, and unit tests before every push.
- **Documentation**: Keep public APIs documented. Use triple-slash/JSDoc.
- **Strict Dependencies**: Lock versions in `pubspec.lock` / `package-lock.json` / `pnpm-lock.yaml`.

## 🚫 Anti-Patterns

- **Broken Window**: `**No Ignoring Warnings**: Leaving "small" lint errors leads to codebase rot.`
- **Testing Implementation**: `**No Testing Internals**: Changes to private methods shouldn't break tests.`
- **Manual QA Dependency**: `**No "Test-Last"**: Verification must be automated and continuous, not a final manual gate.`
- **Magic Strings**: `**No Hardcoded IDs**: Use constants or generated keys for accessibility/test IDs.`

## 📚 References

- [TDD Cycle & Feedback Examples](references/TDD_FEEDBACK.md)

