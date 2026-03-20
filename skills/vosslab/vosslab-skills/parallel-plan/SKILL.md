# Parallel Plan

## Overview

Use this skill as a lightweight implementation profile of `manager-make-new-plan` for current in-flight work.
Its purpose is simple: do not try to do complex tasks alone; split into independent workstreams and use help.
Keep the same core terminology (milestone/workstream/work package/patch), but reduce process weight so teams can start quickly.
The ultimate goal is to reduce implementation wall time, not to maximize process, parallelism theater, or document volume.

## Terminology Contract

- Milestone: short planning window for the current task.
- Workstream: parallel lane with one clear owner.
- Work package: assignment-sized chunk a single coder can finish.
- Patch: reviewable change set used for progress reporting.

## Core Nudge

- If a task has 2 or more separable tracks, split it.
- If one person is becoming the bottleneck, split it.
- If independence is unclear, do prerequisite work first, then split the rest.
- Prefer asking for help early rather than debugging integration late.
- Judge every split by one question: will this reduce elapsed time to a correct implementation?

## Relationship to Manager Planning

- `manager-make-new-plan` is the full manager-grade planning workflow.
- `parallel-plan` is the lightweight operational version for active execution.
- Use the same language and dependency discipline, but with less document overhead and faster dispatch.

## Choose Execution Mode

- Decide between `orchestration-only` and `real parallel execution`.
- Choose the mode that minimizes elapsed time to a validated result.
- Use `orchestration-only` when environment limits prevent true concurrency. Still split into independent streams and write complete stream briefs.
- Use `real parallel execution` when streams can run at the same time in isolated sessions/worktrees or a single batched multi-task dispatch.
- If briefing, coordination, and merge overhead exceed likely time savings, do not parallelize.

## Tooling and State

- Keep execution tooling non-prescriptive.
- Treat `tmux` as an optional helper, not a requirement.
- Accept any equivalent mechanism that provides true concurrent execution and isolation.
- Default to lightweight text artifacts for task state (stream briefs, stream reports, unified plan).
- Make the orchestrator choose report paths per run; do not hardcode a global fixed path.
- Use collision-safe naming for report paths (for example: run id + stream id + timestamp/random suffix).
- Prefer repo-local temp directories or other orchestrator-selected temp locations when practical.
- Add a task database (`sqlite`/Berkeley DB) only when cross-session resume or external query requirements are explicit.

## Repo Agent Awareness

- Before assigning owners, inspect the repo-root `agents/` directory if it exists.
- Treat those `agents/*.md` files as the available role catalog for this repo, not as decorative docs.
- Prefer assigning workstreams to actual available agent roles from that catalog.
- Read the agent files themselves before dispatch so role assignment reflects real capabilities and constraints, not just filenames.
- If the repo has no `agents/` directory, fall back to generic owner labels.
- If the repo has both specialized and generic agents, prefer the most specialized agent that fits the stream.

In this repo, the currently available root agents and their intended uses are:
- `orchestrator`: split larger tasks into parallel subagents and synthesize outputs before code changes.
- `parallelizer`: coordinate parallel teams with messaging; good for active multi-stream execution.
- `planner`: write plans and docs only; never production code or tests.
- `architect`: approve or reject cross-cutting design changes and resolve design disputes.
- `coder`: implement production code from approved plans; no self-approval and no architectural redesign.
- `integrator`: merge completed work, resolve conflicts, and maintain branch stability.
- `reviewer`: read-only review and plan auditing; cannot modify production files.
- `tester`: create and run tests; only modify files under `tests/`.
- `monitor`: detect stalls, crashes, and deadlocks; read-only on code.
- `scheduler`: trigger recurring workflows and retries; not for implementation or diagnosis.
- `maintainer`: cleanup, lint maintenance, and index regeneration; not for feature work or architecture.

## Workflow

1. Resolve shared prerequisites first.
- Identify shared contracts (types, interfaces, schemas, migration order).
- Execute shared prerequisites in the orchestrator main context.
- Complete shared prerequisites before parallel dispatch.

2. Define independent workstreams.
- Assign each stream a clear goal, scope boundary, and owned files/directories.
- Give each stream a named owner and, when available, an explicit agent role selected from the repo-root `agents/` directory.
- Merge or re-scope any streams that would modify the same files.
- Prefer `coder` for production implementation streams.
- Prefer `tester` only for test work under `tests/`.
- Prefer `reviewer` for read-only code review, audit, and plan-conformance checks.
- Prefer `integrator` for merge sequencing, conflict resolution, and stabilization after streams complete.
- Prefer `planner` for documentation-only planning outputs.
- Prefer `architect` for streams that exist solely to settle a cross-cutting design decision.
- Prefer `monitor` for observing progress, stalls, and deadlocks rather than fixing code.
- Prefer `scheduler` only for recurring or retry-oriented coordination tasks.
- Prefer `maintainer` for cleanup, lint maintenance, and derived-index regeneration.
- Prefer the smallest number of streams that materially lowers wall time; more streams are not automatically better.

3. Dispatch correctly.
- For real parallel execution, launch streams concurrently in one batch dispatch or separate isolated sessions.
- Do not send stream tasks sequentially if true parallelism is required.

4. Enforce file-backed standardized stream outputs.
- Assign each stream an orchestrator-selected unique report path in the stream brief.
- Require each stream to write its full report only to the provided path.
- Require each stream to return only a compact handoff message with status, report path, validation status, and a short bullet summary.
- Require deep research streams to put full findings in report files and return only the compact handoff in chat.
- Reject stream responses that paste full reports or large logs inline.

5. Synthesize one ordered plan.
- Synthesize only after all stream validations pass; if any validation fails, stop and fix before synthesis.
- Read stream report files from orchestrator-assigned paths and merge them into one milestone execution sequence with checkpoints.
- Add integration risks, dependency notes, and fallback handling.

6. Gate before implementation.
- Confirm no unresolved cross-stream dependencies remain.
- Confirm each checkpoint has explicit verification commands.
- Confirm all expected stream report files exist and are readable before synthesis.

## Lightweight Minimum Output

Use this minimum structure when speed matters:
1. Milestone objective (one paragraph)
2. Workstreams (owner, agent role if available, scope boundary, dependencies)
3. Work packages per workstream (small, assignable)
4. Patch plan (`Patch 1`, `Patch 2`, ...)
5. Checkpoints with verification commands

Do not skip dependency declarations. Milestone numbers are labels, not ordering.
Ordering must be explicit through dependencies and gates.

## Independence Rules

- Parallelize only streams that do not depend on each other in-flight outputs.
- Do not parallelize streams that edit the same files or the same mutable state.
- If independence is uncertain, serialize that portion.
- Prefer finishing dependency-establishing work first, then parallelizing the rest.
- Do not split work purely to keep more agents busy; idle agents are cheaper than merge-heavy fake parallelism.

## Orchestrator Memory Rules

- Do not request full stream reports inline in orchestrator chat.
- Use file-path handoff first; read files on demand during synthesis.
- Default final handoffs to short bullet lists (`3-6` bullets).
- Cap stream handoff size (for example, `<=1 KB` plus report path).
- Keep verbose command output and diagnostics inside report files, not in handoff messages.

## Required Output Contract

Require this structure from each stream handoff message:
1. Status
2. Report file path
3. Summary (`3-6` bullets)
4. Validation status (`pass`/`fail`)
5. Blocking issues (optional)

Require this structure inside each stream report file:
1. Assumptions
2. Decisions
3. Concrete next steps
4. Changed files
5. Validation performed

Then synthesize:
1. Ordered unified plan
2. Checkpoints with pass/fail criteria
3. Integration risks and mitigations

## Templates

Use the reusable templates in `references/parallel_plan_templates.md` for:
- stream brief format
- compact stream handoff format
- stream report file format
- synthesis and checkpoint checklist
- anti-pattern checks for fake parallelism and memory overload