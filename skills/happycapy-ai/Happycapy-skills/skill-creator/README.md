# Skill Creator

A Claude Code skill for creating effective skills. Use when designing, structuring, or packaging skills with scripts, references, and assets.

## What This Does

**Skill Creator** guides you through creating effective skills for Claude Code. It provides comprehensive guidance on skill architecture, best practices, and workflow patterns to help you build production-ready skills.

### Key Features

- **Progressive Disclosure Design** — Efficient context management with three-level loading system
- **Bundled Resources** — Support for scripts, references, and assets
- **Validation Tools** — Automated skill validation and packaging scripts
- **Best Practices** — Proven patterns for workflows and output quality
- **Token Efficiency** — Guidance on keeping skills lean and context-aware

## Installation

### For Claude Code Users

Copy the skill files to your Claude Code skills directory:

```bash
# Create the skill directory
mkdir -p ~/.claude/skills/skill-creator

# Copy the files (or download from this repo)
cp SKILL.md ~/.claude/skills/skill-creator/
cp -r scripts ~/.claude/skills/skill-creator/
```

Then use it by typing `/skill-creator` in Claude Code.

### Manual Download

1. Download `SKILL.md` and the `scripts/` directory from this repo
2. Place them in `~/.claude/skills/skill-creator/`
3. Restart Claude Code

## Usage

### Create a New Skill

```
/skill-creator

> "I want to create a skill for processing PDF files"
```

The skill will guide you through:
1. Understanding concrete usage examples
2. Planning reusable resources (scripts, references, assets)
3. Initializing the skill structure
4. Writing effective SKILL.md content
5. Packaging and validating the skill

### Scripts Included

The skill includes helper scripts for skill development:

- **`init_skill.py`** — Generate new skill directory with proper structure
- **`package_skill.py`** — Validate and package skills into .skill files
- **`quick_validate.py`** — Validate skill structure and content

#### Initialize a New Skill

```bash
# Basic initialization
scripts/init_skill.py my-skill --path skills/public

# With specific resource directories
scripts/init_skill.py my-skill --path skills/public --resources scripts,references

# With example files
scripts/init_skill.py my-skill --path skills/public --resources scripts --examples
```

#### Package a Skill

```bash
# Package skill in current directory
scripts/package_skill.py path/to/skill-folder

# Package to specific output directory
scripts/package_skill.py path/to/skill-folder ./dist
```

## Core Principles

### Concise is Key

The context window is a shared resource. Only include information that Codex doesn't already have. Challenge each piece of content: "Does Codex really need this explanation?"

### Set Appropriate Degrees of Freedom

Match the level of specificity to the task:

- **High freedom** — Text-based instructions for flexible approaches
- **Medium freedom** — Pseudocode or scripts with parameters for preferred patterns
- **Low freedom** — Specific scripts for fragile, error-prone operations

### Progressive Disclosure

Skills use a three-level loading system:

1. **Metadata** — Always in context (name + description)
2. **SKILL.md body** — Loaded when skill triggers
3. **Bundled resources** — Loaded as needed by Codex

## Skill Structure

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter metadata (required)
│   │   ├── name: (required)
│   │   └── description: (required)
│   └── Markdown instructions (required)
└── Bundled Resources (optional)
    ├── scripts/          - Executable code (Python/Bash/etc.)
    ├── references/       - Documentation loaded into context as needed
    └── assets/           - Files used in output (templates, icons, fonts, etc.)
```

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Main skill instructions and guidance |
| `scripts/init_skill.py` | Initialize new skill directory structure |
| `scripts/package_skill.py` | Validate and package skills |
| `scripts/quick_validate.py` | Quick validation of skill structure |
| `license.txt` | Apache License 2.0 |

## Requirements

- [Claude Code](https://claude.ai/claude-code) CLI
- Python 3.6+ (for scripts)

## Philosophy

Effective skills follow these principles:

1. **Codex is already smart** — Only add context Codex doesn't have
2. **Token efficiency matters** — Keep SKILL.md under 500 lines
3. **Progressive disclosure** — Load content only when needed
4. **Concrete examples first** — Understand usage before building
5. **Iterate based on real usage** — Test and refine continuously

## Credits

Created by the OpenClaw team.

**Original Source:** [openclaw/openclaw](https://github.com/openclaw/openclaw/tree/main/skills/skill-creator)

## License

Apache License 2.0 — See `license.txt` for details.
