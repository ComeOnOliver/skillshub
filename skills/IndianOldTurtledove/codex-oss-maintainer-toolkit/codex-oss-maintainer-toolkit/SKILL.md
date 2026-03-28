# Codex OSS Maintainer Toolkit

Use this skill to turn an open-source repository into a Codex-friendly maintainer workspace.

## Quick Start

```bash
./install.sh --project --target /path/to/repo --yes
./install.sh --global --yes
python3 scripts/init_skill.py issue-triage
python3 scripts/quick_validate.py .codex/skills/issue-triage
```

## What This Skill Optimizes

- project-level `AGENTS.md`
- maintainer-focused Codex skills
- issue triage and bug-investigation workflows
- PR review and release-note prompts
- reusable verification commands
- cross-session dev docs for long-running tasks

## Recommended Workflow

1. **Audit the repository**
   - Identify maintainer bottlenecks: issue triage, review latency, release friction, repeated debugging.
   - Map the folders that need project-specific instructions.

2. **Write AGENTS.md close to the work**
   - Keep global instructions short.
   - Add repo-specific rules, validation commands, and ownership notes.
   - Prefer operational guidance over abstract philosophy.

3. **Move repeatable tasks into skills or scripts**
   - Use `scripts/init_skill.py` for reusable task playbooks.
   - Put durable procedures in `references/`.
   - Put deterministic checks in `templates/automation/` or project scripts.

4. **Design for maintainers, not demos**
   - Prioritize issue triage, review, release, dependency updates, and regression checks.
   - Keep verification commands next to the workflow that needs them.

5. **Validate before shipping**
   - Run targeted checks.
   - Search for stale branding or paths.
   - Keep templates and examples in sync.

## Maintainer Workflow Patterns

### Issue Triage

- summarize the report
- classify bug vs feature vs support request
- link affected paths and owners
- propose the next maintainer action

### PR Review

- inspect diff boundaries first
- check architecture, tests, rollback risk, and release notes
- produce actionable comments instead of generic praise

### Debugging

- reproduce first
- inspect the failing path before editing
- test one hypothesis at a time
- verify both the fix and the absence of regressions

### Release Notes

- group changes by user-facing impact
- capture migrations, flags, or rollout constraints
- link verification commands and rollback notes

## Files to Read When Needed

- `references/workflows.md`: multi-step maintainer workflow patterns
- `references/output-patterns.md`: structured output formats for triage, review, and release communication
- `templates/AGENTS.md`: project bootstrap template
- `templates/automation/README.md`: helper script usage

## Validation Checklist

- [ ] `AGENTS.md` matches the repository layout
- [ ] public docs use Codex/OpenAI terminology consistently
- [ ] skills are concise and validated
- [ ] automation scripts have explicit inputs and outputs
- [ ] examples and templates stay synchronized
