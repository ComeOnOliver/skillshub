# Polyglot Test Generation Skill

An AI-powered skill that generates comprehensive, workable unit tests for any programming language using a coordinated multi-agent pipeline.

## When to Use This Skill

Use this skill when you need to:
- Generate unit tests for an entire project or specific files
- Improve test coverage for existing codebases
- Create test files that follow project conventions
- Write tests that actually compile and pass
- Add tests for new features or untested code

## How It Works

This skill coordinates multiple specialized agents in a **Research → Plan → Implement** pipeline:

### Pipeline Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     TEST GENERATOR                          │
│  Coordinates the full pipeline and manages state            │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌───────────┐  ┌───────────┐  ┌───────────────┐
│ RESEARCHER│  │  PLANNER  │  │  IMPLEMENTER  │
│           │  │           │  │               │
│ Analyzes  │  │ Creates   │  │ Writes tests  │
│ codebase  │→ │ phased    │→ │ per phase     │
│           │  │ plan      │  │               │
└───────────┘  └───────────┘  └───────┬───────┘
                                      │
                    ┌─────────┬───────┼───────────┐
                    ▼         ▼       ▼           ▼
              ┌─────────┐ ┌───────┐ ┌───────┐ ┌───────┐
              │ BUILDER │ │TESTER │ │ FIXER │ │LINTER │
              │         │ │       │ │       │ │       │
              │ Compiles│ │ Runs  │ │ Fixes │ │Formats│
              │ code    │ │ tests │ │ errors│ │ code  │
              └─────────┘ └───────┘ └───────┘ └───────┘
```

## Step-by-Step Instructions

### Step 1: Determine the User Request

Make sure you understand what user is asking and for what scope.
When the user does not express strong requirements for test style, coverage goals, or conventions, source the guidelines from [unit-test-generation.prompt.md](unit-test-generation.prompt.md). This prompt provides best practices for discovering conventions, parameterization strategies, coverage goals (aim for 80%), and language-specific patterns.

### Step 2: Invoke the Test Generator

Start by calling the `polyglot-test-generator` agent with your test generation request:

```
Generate unit tests for [path or description of what to test], following the [unit-test-generation.prompt.md](unit-test-generation.prompt.md) guidelines
```

The Test Generator will manage the entire pipeline automatically.

### Step 3: Research Phase (Automatic)

The `polyglot-test-researcher` agent analyzes your codebase to understand:
- **Language & Framework**: Detects C#, TypeScript, Python, Go, Rust, Java, etc.
- **Testing Framework**: Identifies MSTest, xUnit, Jest, pytest, go test, etc.
- **Project Structure**: Maps source files, existing tests, and dependencies
- **Build Commands**: Discovers how to build and test the project

Output: `.testagent/research.md`

### Step 4: Planning Phase (Automatic)

The `polyglot-test-planner` agent creates a structured implementation plan:
- Groups files into logical phases (2-5 phases typical)
- Prioritizes by complexity and dependencies
- Specifies test cases for each file
- Defines success criteria per phase

Output: `.testagent/plan.md`

### Step 5: Implementation Phase (Automatic)

The `polyglot-test-implementer` agent executes each phase sequentially:

1. **Read** source files to understand the API
2. **Write** test files following project patterns
3. **Build** using the `polyglot-test-builder` subagent to verify compilation
4. **Test** using the `polyglot-test-tester` subagent to verify tests pass
5. **Fix** using the `polyglot-test-fixer` subagent if errors occur
6. **Lint** using the `polyglot-test-linter` subagent for code formatting

Each phase completes before the next begins, ensuring incremental progress.

### Coverage Types
- **Happy path**: Valid inputs produce expected outputs
- **Edge cases**: Empty values, boundaries, special characters
- **Error cases**: Invalid inputs, null handling, exceptions

## State Management

All pipeline state is stored in `.testagent/` folder:

| File | Purpose |
|------|---------|
| `.testagent/research.md` | Codebase analysis results |
| `.testagent/plan.md` | Phased implementation plan |
| `.testagent/status.md` | Progress tracking (optional) |

## Examples

### Example 1: Full Project Testing
```
Generate unit tests for my Calculator project at C:\src\Calculator
```

### Example 2: Specific File Testing
```
Generate unit tests for src/services/UserService.ts
```

### Example 3: Targeted Coverage
```
Add tests for the authentication module with focus on edge cases
```

## Agent Reference

| Agent | Purpose | Tools |
|-------|---------|-------|
| `polyglot-test-generator` | Coordinates pipeline | runCommands, codebase, editFiles, search, runSubagent |
| `polyglot-test-researcher` | Analyzes codebase | runCommands, codebase, editFiles, search, fetch, runSubagent |
| `polyglot-test-planner` | Creates test plan | codebase, editFiles, search, runSubagent |
| `polyglot-test-implementer` | Writes test files | runCommands, codebase, editFiles, search, runSubagent |
| `polyglot-test-builder` | Compiles code | runCommands, codebase, search |
| `polyglot-test-tester` | Runs tests | runCommands, codebase, search |
| `polyglot-test-fixer` | Fixes errors | runCommands, codebase, editFiles, search |
| `polyglot-test-linter` | Formats code | runCommands, codebase, search |

## Requirements

- Project must have a build/test system configured
- Testing framework should be installed (or installable)
- VS Code with GitHub Copilot extension

## Troubleshooting

### Tests don't compile
The `polyglot-test-fixer` agent will attempt to resolve compilation errors. Check `.testagent/plan.md` for the expected test structure.

### Tests fail
Review the test output and adjust test expectations. Some tests may require mocking dependencies.

### Wrong testing framework detected
Specify your preferred framework in the initial request: "Generate Jest tests for..."