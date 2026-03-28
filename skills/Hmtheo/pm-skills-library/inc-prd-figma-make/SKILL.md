---
name: inc-prd-figma-make
description: Convert Product Requirements Documents (PRDs) into functional Figma Make prototype instructions for product and UX design workflows. Use when a user provides a PRD (complete or partial) and needs structured, build-ready guidance for screens, user flows, states, interactions, data behavior, edge cases, and acceptance criteria mapping.
---

# PRD to Figma Make

Convert PRD content into implementation-oriented instructions that a designer can execute in Figma Make and an engineer can map to product behavior.

## Inputs

Accept any PRD format, including partial, inconsistent, or draft documents.

Extract and normalize these elements when present:
- Product area and objective/problem statement
- Personas, jobs-to-be-done, and scenarios
- Scope boundaries (in scope/out of scope)
- Functional requirements (FRs)
- Acceptance criteria (ACs)
- Risks, constraints, dependencies, and non-functional requirements
- Metrics/KPIs used to validate outcomes

If sections are missing, continue with explicit assumptions and unresolved questions.

## Workflow

1. Parse and structure the PRD
- Group information into: `Users`, `Goals`, `Core Flows`, `Data/Rules`, `Constraints`, `Success Signals`.
- Keep original requirement identifiers when present (for example `FR-4`, `AC-2`).

2. Build the experience model
- Identify primary user journeys and supporting journeys.
- Define entry points, decision points, empty states, error states, and edge conditions.
- Capture role/permission boundaries.

3. Map requirements to UI architecture
- Convert each journey into a screen-level flow.
- Define required screens/views and their purpose.
- For each screen, define: layout intent, key components, interaction logic, conditional behavior, and data dependencies.

4. Convert into Figma Make instructions
- Provide instructions as executable design tasks, not abstract product commentary.
- Use direct language such as: `Create`, `Add`, `Configure`, `Connect`, `Show`, `Hide`, `Validate`.
- Include interaction details: triggers, transitions, validation rules, and system responses.

5. Add traceability and validation
- Map each flow/screen back to FRs and ACs.
- Flag unsupported or ambiguous requirements.
- Provide a final checklist for prototype completeness.

## Output format

Return output using this exact section order.

### 1) Prototype Brief
- Product/feature name
- Prototype goal
- Primary personas
- Prototype scope (MVP only)

### 2) Assumptions and Open Questions
- Assumptions made due to missing PRD detail
- Open questions that block high-fidelity behavior

### 3) Information Architecture
- Screen inventory (name + purpose)
- Navigation model
- Permissions/role visibility

### 4) End-to-End Flows
For each flow:
- Flow name
- Persona
- Entry condition
- Steps (screen-by-screen)
- Decision branches
- Completion criteria
- Linked FR/AC IDs

### 5) Screen Specs for Figma Make
For each screen:
- Screen name
- User intent
- Components/regions
- Default state
- Interactive states (loading, empty, success, error, blocked)
- Interactions (trigger -> system response)
- Data fields and validation
- Accessibility/localization notes (if present in PRD)
- Linked FR/AC IDs

### 6) Edge Cases and Guardrails
- Edge case condition
- Expected UX/system behavior
- Safety/privacy/compliance treatment
- Linked FR/AC IDs

### 7) Prototype Build Sequence
- Ordered build plan for Figma Make (low-to-high fidelity)
- Reusable components to define first
- What to defer (out-of-scope)

### 8) Prototype Validation Checklist
- Functional checks mapped to ACs
- Risk checks mapped to PRD risks
- Coverage summary: covered / partial / missing

## Style rules

- Be concrete and operational.
- Avoid visual styling advice unless explicitly requested.
- Do not invent business rules if the PRD is silent; log assumptions instead.
- Preserve domain language from the PRD (for example, `Action Plan`, `Engagement dimension`).
- Prefer concise bullets over long paragraphs.

## Quality bar

Before finalizing, verify:
- Every core flow has at least one completion path and one failure/edge path.
- Every mandatory requirement in scope is represented in at least one flow or screen spec.
- Every acceptance criterion is testable in the prototype.
- Out-of-scope items are explicitly excluded from the build sequence.

