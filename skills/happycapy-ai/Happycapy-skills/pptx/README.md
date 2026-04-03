# pptx

A Claude Code skill for creating polished PowerPoint presentations directly from a topic or content description.

## What This Does

**pptx** generates professional `.pptx` files using HTML as an invisible internal design intermediate. You describe your content, and the skill outputs a ready-to-use PowerPoint presentation with distinctive aesthetics and clean layouts.

### Key Features

- **Direct PPTX Output** — The final deliverable is always a `.pptx` file, never HTML
- **Distinctive Design** — Bold, unique aesthetics (dark editorial, pastel geometry, neon cyber, etc.)
- **Smart Layout** — Automatic slide layouts with proper spacing and typography
- **Bilingual Support** — Works with both English and Chinese content
- **Theme-Aware** — Extracts and applies consistent color themes across all slides

## Installation

### For Claude Code Users

Copy the skill files to your Claude Code skills directory:

```bash
# Create the skill directory
mkdir -p ~/.claude/skills/pptx

# Copy the files (or download from this repo)
cp SKILL.md ~/.claude/skills/pptx/
cp -r scripts ~/.claude/skills/pptx/
```

Then use it by typing `/pptx` in Claude Code.

### Manual Download

1. Download `SKILL.md` and `scripts/` from this repo
2. Place them in `~/.claude/skills/pptx/`
3. Restart Claude Code

## Usage

```
/pptx

> "Create a pitch deck for my AI startup"
> "Make a presentation about climate change with 10 slides"
> "生成一个关于产品发布的演示文稿"
```

The skill will:
1. Design the content and visual theme
2. Generate the PowerPoint file
3. Save to `outputs/<name>.pptx`
4. Attach the file for download

## Slide Types

The skill supports various slide layouts:

- **Cover** — Oversized title with accent colors and tagline
- **Content** — Heading with description and card grid
- **Split** — Two-column layout with text and visuals
- **Quote** — Centered quote with accent lines
- **CTA** — Call-to-action with button and stats

Each slide is designed to fit content properly with:
- Max 1 heading per slide
- Max 6 bullets per slide
- Max 6 cards in a grid

## Output Format

- **File format:** PowerPoint (.pptx)
- **Slide size:** 16:9 (13.33 × 7.5 inches)
- **Location:** `outputs/<name>.pptx`
- **Compatibility:** Works with PowerPoint, Keynote, Google Slides

## Requirements

- [Claude Code](https://claude.ai/claude-code) CLI
- Python 3 with required libraries

```bash
# Install required Python packages
pip install python-pptx
```

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Main skill instructions for Claude Code |
| `scripts/pptx_builder.py` | PowerPoint generation library with Builder API |

## How It Works

1. **Phase 1:** The skill creates an internal HTML draft to design the layout and theme
2. **Phase 2:** It extracts colors from the HTML and uses the Builder API to create PPTX
3. **Phase 3:** Delivers the final `.pptx` file to you

The HTML draft is purely internal — you only see the final PowerPoint file.

## License

MIT — Use it, modify it, share it.
