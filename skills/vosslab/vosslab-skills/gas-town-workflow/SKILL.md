# Gas Town workflow

Gas Town is a role-based multi-agent coordination system. It maps theatrical role names to Claude Code agent types and uses convoy patterns to decompose work into atomic, trackable units. This skill teaches agents how to coordinate using Gas Town conventions within Claude Code's task and messaging system.

## Core principles

### GUPP (Gas Town Universal Propulsion Principle)

If there is work on your hook, you must run it. Agents autonomously proceed with available work without waiting for external input. GUPP is the heartbeat of autonomous operation. In Claude Code terms: if a task is assigned to you, start it immediately.

### MEOW (Molecular Expression of Work)

Break large goals into detailed, atomic instructions. Every piece of work should be decomposed into trackable units that agents can execute autonomously. In Claude Code terms: use TaskCreate to break work into single-responsibility tasks with clear done-when criteria.

### NDI (Nondeterministic Idempotence)

Orchestration of potentially unreliable processes toward useful outcomes. Persistent tasks and oversight agents (monitor, scheduler) guarantee eventual workflow completion even when individual operations fail. Retry and escalate, do not silently drop work.

## Role mapping

This repo maps Gas Town theatrical roles to Claude Code agent types. Each role has a defined authority boundary and escalation target.

| Gas Town role | Agent | Primary responsibility |
| --- | --- | --- |
| Crew | coder | Production code, small doc updates |
| Refinery | integrator | Merge, rebase, conflict resolution |
| Witness | monitor | Observe progress, detect stalls, report |
| Deacon | scheduler | Trigger workflows, retry blocked/stalled tasks |
| Dogs | maintainer | Cleanup, lint, index regeneration |
| -- | reviewer | Read-only code review and plan auditing |
| -- | tester | Tests, coverage, validation |
| -- | architect | Cross-cutting design approval |
| -- | planner | Plans and docs only, never production code |
| -- | orchestrator | Parallel task coordination |

For the full role authority table and escalation paths, read [references/role-map.md](references/role-map.md).

## Convoy patterns

A convoy groups related tasks into a logical unit of work. Convoys track batched work from start to finish.

### Creating a convoy

1. Create a parent task describing the convoy goal.
2. Create child tasks for each step, tagged with the target role in the subject line.
3. Set dependencies with `addBlockedBy` so tasks execute in order.
4. Assign tasks to agents matching the tagged role.

### Subject-line tagging

Tag the target role in every task subject:

```
[CODER] Implement token refresh flow
[TESTER] Write tests for token refresh
[REVIEWER] Audit refresh flow changes
[INTEGRATOR] Merge token refresh branch
```

### Task description format

Every task description must include:

```
Role: coder | tester | reviewer | integrator | ...
Convoy: <initiative-name>
Done when:
- <objective criterion 1>
- <objective criterion 2>
```

For ready-made convoy templates, read [references/convoy-templates.md](references/convoy-templates.md).

## Task routing

### Claiming tasks

1. Check TaskList for unblocked tasks matching your role.
2. Claim the highest-priority unblocked task for your role.
3. Use task ID order as a tie-breaker when priority is equal.
4. Mark the task `in_progress` with TaskUpdate before starting work.
5. Never work on tasks assigned to another agent.

### Routing rules

| Task type | Route to |
| --- | --- |
| Production code changes | coder |
| Test creation or coverage | tester |
| Code review or plan audit | reviewer |
| Merge or conflict resolution | integrator |
| Design decisions | architect |
| Plan creation or doc-only changes | planner |
| Lint, cleanup, index regen | maintainer |
| Workflow triggers, retries | scheduler |
| Progress monitoring, stall detection | monitor |
| Parallel task coordination | orchestrator |

## Escalation rules

When an agent encounters work outside its authority boundary, it must escalate rather than attempt the work. Escalation uses SendMessage to notify the target agent or TaskCreate to file the issue.

| Agent | Escalates to | When |
| --- | --- | --- |
| coder | architect | Design conflict or architectural question |
| coder | planner | Ambiguous or incomplete task |
| coder | orchestrator | Blocked execution dependency |
| integrator | human | Failed merge after retry |
| monitor | orchestrator | Stuck worker detected |
| monitor | human | Systemic failure |
| maintainer | -- | No arch decisions, no features |
| scheduler | -- | Does not diagnose; monitor does that |
| tester | coder | Test reveals production bug |
| reviewer | planner | Plan drift or missing plan |
| planner | architect | Architecture decision needed |

## Communication patterns

### When to use SendMessage

- Escalation: notifying another agent of a blocker or problem.
- Coordination: asking a peer for information needed to proceed.
- Completion signals: telling the team lead a task is done.
- Shutdown requests: asking a teammate to wrap up.

### When to use TaskUpdate

- Marking tasks `in_progress`, `completed`, or adding comments.
- Setting dependencies between tasks.
- Assigning or reassigning task ownership.

### When to use TaskCreate

- Filing discovered work that is outside your current task scope.
- Breaking a large task into smaller subtasks.
- Recording a blocker that needs another role's attention.

Do not use broadcast messages for routine communication. Send direct messages to the specific agent who needs the information.

## Completion discipline

Agents must explicitly signal their state. Silent idleness with assigned work is the idle polecat heresy -- a critical failure mode.

### Required signals

| State | Action |
| --- | --- |
| Task finished | Mark task `completed` via TaskUpdate. Send completion message to team lead. |
| Task blocked | Note the blocker in the task description via TaskUpdate. Create a blocker task via TaskCreate. Send message to the blocking agent. |
| Task requires escalation | Send escalation message to the target agent. Note escalation in the task description. |
| No more work available | Check TaskList. If nothing is available, notify team lead and wait for assignment. |

### Completion checklist

1. Verify your work meets the done-when criteria in the task description.
2. Run relevant tests (coder, tester) or checks (reviewer, maintainer).
3. Mark the task `completed` via TaskUpdate.
4. Check TaskList for the next available task matching your role.
5. If no tasks remain, notify the team lead.

## Terminology

Gas Town uses theatrical terminology mapped to Claude Code concepts:

| Gas Town term | Claude Code equivalent |
| --- | --- |
| Bead | Claude Task |
| Hook | Role-filtered task queue |
| Slinging | Task creation and assignment (TaskCreate + TaskUpdate with owner) |
| Convoy | Grouped set of related tasks |
| Nudging | SendMessage between agents |
| Patrol | Periodic health check cycle |

For the full glossary with mappings, read [references/glossary.md](references/glossary.md).

## Quick start

1. If your environment supports teams, create one with TeamCreate (orchestrator or parallelizer only).
2. Create convoy tasks with TaskCreate, using subject-line tags and the task description format.
3. Set dependencies with TaskUpdate `addBlockedBy`.
4. Spawn agents matching the tagged roles.
5. Assign tasks to agents with TaskUpdate `owner`.
6. Agents follow GUPP: claim work, execute, signal completion, claim next task.
7. Monitor agent uses TaskList to detect stalls and escalate.
8. When all convoy tasks are complete, shut down teammates.
