# SkillsHub Skills Directory

This directory contains **5,800+ AI agent skills** as individual SKILL.md files.

## Structure

```
skills/
  {github-owner}/
    {repo-name}/
      {skill-slug}/
        SKILL.md
```

## Contributing a Skill

1. Create a new directory: `skills/{your-github-username}/{your-repo}/{skill-name}/`
2. Add a `SKILL.md` file following the format below
3. Open a PR — we'll review and merge it

### SKILL.md Format

```markdown
---
name: my-skill-name
description: One-line description of when to use this skill
---

# Skill Name

## When to Use
Describe when an AI agent should use this skill.

## Prerequisites
What needs to be installed/configured.

## Workflow
Step-by-step instructions with code examples.

## Common Patterns
Typical usage patterns.

## Gotchas
Common mistakes and how to avoid them.
```

## Importing to Local Database

```bash
cd packages/db && npx tsx src/seed-from-skills-dir.ts
```
