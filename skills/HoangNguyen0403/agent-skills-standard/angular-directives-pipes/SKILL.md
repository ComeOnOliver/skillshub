# Directives & Pipes

## **Priority: P2 (MEDIUM)**

## Principles

- **Composition**: Use `hostDirectives` to compose behaviors onto components/directives without inheritance.
- **Pure Pipes**: Pipes must be `pure: true` (default). They cache results based on input reference.
- **Directive Logic**: Encapsulate reusable DOM manipulation or behavioral logic in Directives (e.g., `appFocusTrap`, `appTooltip`).

## Guidelines

- **Signal Inputs**: Directives also support signal inputs.
- **Standalone**: All Pipes and Directives must be standalone.

## References

- [Composition](references/composition.md)


## 🚫 Anti-Patterns

- Do NOT use standard patterns if specific project rules exist.
- Do NOT ignore error handling or edge cases.