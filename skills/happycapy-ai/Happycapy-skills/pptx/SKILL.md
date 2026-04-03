---
name: pptx
description: >
  Create polished PowerPoint (.pptx) presentations directly from a topic or content description.
  Uses HTML as an invisible internal design intermediate — the HTML is never shown to the user.
  The final and only deliverable is a .pptx file saved to outputs/.
  Use this skill whenever the user asks to: make a PPT / PowerPoint / 幻灯片 / 演示文稿,
  generate slides about a topic, or turn any content into a presentation deck.
  Supports Chinese and English. Always outputs .pptx, never HTML.
---

# PPTX Skill

Generate a polished PPTX in three phases. The HTML draft is purely internal — never reference or expose it to the user.

## Phase 1 — Design the HTML Draft (Internal only)

Write a single self-contained HTML presentation to `tmp/<name>-draft.html`.

**Design principles:**
- Choose a bold, distinctive aesthetic (dark editorial, pastel geometry, neon cyber, etc.)
- Define a CSS `:root {}` block with named color variables: `--bg`, `--bg1`, `--bg2`, `--text`, `--muted`, `--accent`, `--dim`, etc. Use hex values only.
- Each `<section class="slide" id="sN">` is one slide. Viewport-locked `100vh`, scroll-snap, no overflow.
- Use Google Fonts — avoid Inter/Roboto. Good choices: Fraunces, DM Sans, Syne, Outfit, Cormorant.
- Staggered reveal animations are fine for the HTML but irrelevant to PPTX.

This HTML serves one purpose: capture **color theme + slide structure + text content + layout intent** before building the PPTX.

## Phase 2 — Extract Theme & Build PPTX

1. Read `tmp/<name>-draft.html`
2. Extract the CSS color theme using `extract_theme_from_html()` from `scripts/pptx_builder.py`
3. Write a one-off build script to `tmp/<name>-build.py`:
   - Import `Builder` from `scripts/pptx_builder.py` (add skills scripts dir to sys.path)
   - Instantiate `Builder(theme)` with the extracted colors
   - Recreate each HTML slide using Builder primitives
   - Save to `outputs/<name>.pptx`
4. Run: `python3 tmp/<name>-build.py`

### sys.path setup (always required)
```python
import sys
sys.path.insert(0, "/home/node/.claude/skills/pptx/scripts")
from pptx_builder import Builder, extract_theme_from_html
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN

html = open("tmp/deck-draft.html").read()
theme = extract_theme_from_html(html)   # {"bg":"#0b0b0b", "accent":"#c9a84c", ...}
b = Builder(theme)
```

### Builder API
```python
slide = b.new_slide()              # blank slide with bg fill

# Shapes
b.rect(slide, x, y, w, h, fill="bg1", border="dim")
b.hline(slide, x, y, w, color="accent")
b.oval(slide, x, y, w, h, fill="bg1")
b.card(slide, x, y, w, h)         # shortcut for bg1 card with border

# Text
b.txt(slide, "text", x, y, w, h,
      size=14, bold=False, italic=False,
      color="text",               # theme key or "#hexcode"
      align=PP_ALIGN.LEFT)

b.multicolor_txt(slide, [         # mixed colors in one line
    {"text": "White ",  "size": 52, "bold": True, "color": "text"},
    {"text": "Gold",    "size": 52, "bold": True, "italic": True, "color": "accent"},
], x, y, w, h, align=PP_ALIGN.LEFT)

# Helpers
b.eyebrow(slide, "LABEL", x, y)   # small gold uppercase label
b.logo(slide, "Name", x, y)
b.slide_number(slide, n=1, total=9)

# Grid of cards
b.grid_cards(slide, items, x0, y0, card_w, card_h, gap,
             cols=4, draw_fn=fn)  # fn(slide, b, item, cx, cy, cw, ch)

b.save("outputs/deck.pptx")
```

**Color keys:** any key from the theme dict (`"bg"`, `"bg1"`, `"text"`, `"muted"`, `"accent"`, `"dim"`, etc.) or a raw `"#rrggbb"` string.

## Phase 3 — Deliver

- Attach `outputs/<name>.pptx` in the `<attachments>` block
- Do NOT mention the HTML draft or tmp files
- The user should only see the PPTX as output

## PPTX Layout Conventions

**Slide size:** 13.33 × 7.5 in (16:9). Set automatically by Builder.

| Slide type | Approach |
|---|---|
| Cover | Oversized multicolor title (Pt 100–130), gold rule, tagline below |
| Content | Eyebrow + heading + description + card grid |
| Split | Left column: text + bullets. Right column: visual card panel |
| Quote | Centered quote Pt 44–60, accent line above |
| CTA | Centered heading + description + gold button rect + stats row |

**Limits per slide:** 1 heading, max 6 bullets, max 6 cards in a grid.

## Common Patterns

**Cover with giant title:**
```python
s = b.new_slide()
b.multicolor_txt(s, [
    {"text": "My ",  "size": 120, "bold": True, "color": "text"},
    {"text": "Brand", "size": 120, "bold": True, "color": "accent"},
], Inches(0.8), Inches(1.0), Inches(12), Inches(3.5))
b.hline(s, Inches(0.8), Inches(4.8), Inches(2.5))
b.txt(s, "Tagline text here", Inches(0.8), Inches(5.1), Inches(7), Inches(0.9),
      size=16, color="muted")
b.slide_number(s, 1, 9)
```

**Card grid:**
```python
items = [("📝", "Title", "Description"), ...]

def draw(slide, b, item, cx, cy, cw, ch):
    ico, lbl, desc = item
    b.txt(slide, ico,  cx+Inches(0.2), cy+Inches(0.2), cw, Inches(0.5), size=20)
    b.txt(slide, lbl,  cx+Inches(0.2), cy+Inches(0.8),  cw-Inches(0.4), Inches(0.45), size=12, bold=True)
    b.txt(slide, desc, cx+Inches(0.2), cy+Inches(1.3),  cw-Inches(0.4), Inches(0.65), size=10, color="muted")

b.grid_cards(s, items, Inches(0.8), Inches(3.4), Inches(2.9), Inches(2.1), Inches(0.22), cols=4, draw_fn=draw)
```

**Bullet list with gold dots:**
```python
bullets = ["Item one", "Item two", "Item three"]
for i, text in enumerate(bullets):
    fy = Inches(3.5) + i * Inches(0.55)
    b.oval(s, Inches(0.8), fy + Inches(0.15), Inches(0.12), Inches(0.12), fill="accent")
    b.txt(s, text, Inches(1.1), fy, Inches(5.0), Inches(0.45), size=13)
```

**Gold CTA button:**
```python
b.rect(s, Inches(4.7), Inches(5.1), Inches(3.9), Inches(0.6), fill="accent", border=None)
b.txt(s, "Get Started  →", Inches(4.7), Inches(5.13), Inches(3.9), Inches(0.55),
      size=13, bold=True, color="bg", align=PP_ALIGN.CENTER)
```
