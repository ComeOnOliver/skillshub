---
name: frontend-design-masterclass
description: "Builds distinctive frontend UI with SvelteKit/Bun/Hono. Triggers on: web pages, dashboards, landing pages, apps, artifacts, styling, theming, fonts, animations, charts, dark/light modes."
license: MIT
---

# Frontend Design Masterclass v2.1

Build interfaces that resonate, not just render. This skill enforces bold, intentional
design with a modern high-performance stack. Every pixel must justify its existence.

## 1. Core Stack

- **Framework**: SvelteKit 5 with Runes (`$state`, `$derived`, `$effect`)
- **Runtime**: Bun (server, packages)
- **Backend/API**: Hono (edge-first routes, middleware)
- **UI Primitives**: shadcn-svelte (headless, fully customizable). Override ALL defaults.
- **Charts**: LayerChart (built on Layer Cake, powers shadcn-svelte charts)
- **Animation**: Svelte Motion (`@humanspeak/svelte-motion`) for complex orchestration.
  Built-in `svelte/transition` and `svelte/animate` for standard motion. CSS keyframes
  for simple loops.
- **Mermaid**: `beautiful-mermaid` for themed SVG rendering with Shiki compatibility
- **Styling**: Tailwind CSS v4, extended with CSS custom properties
- **Testing**: Playwright for visual regression
- **Assets**: Nano Banana for generative imagery and textures
- **Deployment**: `@sveltejs/adapter-static` for static, `@sveltejs/adapter-vercel` for SSR

## 2. Intent Identification (Pre-Resource)

Before loading references, classify the request across three dimensions. This shapes
every subsequent design decision.

### A. Product Type
Identify what is being built. Each product type implies style, color, and layout norms.

| Product Category | Recommended Styles | Color Direction |
|---|---|---|
| SaaS / B2B / Productivity | Swiss Grid, Flat + Glassmorphism | Trust blue + accent contrast |
| E-commerce / Retail | Vibrant Block, Feature-Rich Showcase | Brand primary + success green |
| E-commerce Luxury | Liquid Glass, Cinematic | Dark neutrals + gold/champagne accent |
| Fintech / Crypto | Data-Dense, Dark Mode OLED | Deep navy/charcoal + neon accent |
| Healthcare / Wellness | Organic Flow, Soft UI | Soft teal/sage + warm neutral |
| Creative / Portfolio | Neo-Brutalist, Kinetic Typography | High-contrast + one bold accent |
| Gaming / Entertainment | Cyberpunk, HUD/Sci-Fi | Deep dark + neon multi-accent |
| Education / Docs | Editorial Broadsheet, Minimal | Warm paper + ink hierarchy |
| AI / ML Platform | Aurora UI, Motion-Driven | Gradient primary + dark surface |
| Dashboard / Analytics | Bento Grid, Data-Dense | Neutral surface + semantic data colors |

Use this table as a starting compass, not a constraint. Always customize.

### B. Style Intent
Determine the aesthetic target from context cues, explicit request, or product type.
See `references/landing-pages.md` Section 3 for 8 timeless styles with full specs.

### C. Audience and Context
Consider who uses this and where. Enterprise audiences tolerate density; consumer
audiences need breathing room. Mobile-first changes everything about touch targets,
typography scale, and animation intensity.

## 3. Resource Loading Protocol

After identifying intent, scan the request for trigger keywords. Load matching
reference files from `references/` to access deep implementation patterns.

### Landing Pages and Hero Sections
**Triggers**: "landing page", "hero", "above the fold", "homepage", "site title",
"headline", "CTA", "call to action", "conversion", "first impression"
**Load**: `references/landing-pages.md`
**Provides**: Hero section anatomy, 8 timeless landing page styles (Apple Keynote,
Editorial Broadsheet, Geometric Playground, Cinematic Immersive, Swiss Grid,
Neo-Brutalist, Organic Flow, Retro Terminal), visual flow patterns (Z/F/Golden/Diagonal),
conversion architecture, mobile-first hero strategy, code patterns.

### Typography and Font Selection
**Triggers**: "font", "typography", "typeface", "heading", "text style", "font pairing",
"type scale", "letter spacing", "line height", "readable", "display font"
**Load**: `references/typography.md`
**Provides**: Display/body/mono font catalogs with pairing recommendations, type scale
construction (mathematical ratios), responsive typography with `clamp()`, variable fonts,
font loading and performance, typographic details (tracking, hanging punctuation, optical
alignment), the readability checklist.

### Color System and Theming
**Triggers**: "color", "palette", "theme", "dark mode", "light mode", "accent",
"color scheme", "brand colors", "contrast", "hue", "saturation"
**Load**: `references/color-system.md`
**Provides**: Structured 3-group palette architecture (Base Tones, Primary Tones,
Accent Tones), color theory harmony models, palette generation workflow, light theme
construction, dark theme construction (independent rules), theme selector with bonus
themes (warm/cool/mono/high-contrast variants), semantic color tokens, CSS custom
property system, WCAG contrast compliance.

### Imagery, Textures, and Backgrounds
**Triggers**: "image", "background", "texture", "photo", "illustration", "dithering",
"overlay", "parallax background", "hero image", "Nano Banana", "duotone", "pattern"
**Load**: `references/imagery.md`
**Provides**: Image role taxonomy, sizing and format strategy, three-layer background
composition, dithering algorithms (Atkinson/Floyd-Steinberg/Bayer), overlay and
geometric bounding (diagonal lines, clip-path shapes, corner marks, grid overlays),
movement in imagery, artistic style selection (photorealistic/illustrated/generative/
mixed media/duotone), button and banner imagery, Nano Banana integration, AI image
prompting guide.

### Data Graphics, Tables, Charts, and Infographics
**Triggers**: "table", "chart", "infographic", "data", "statistics", "metrics",
"dashboard KPI", "comparison", "timeline", "process flow", "number display"
**Load**: `references/data-graphics.md`
**Provides**: Table design beyond defaults (no-grid tables, status indicators, sparkline
cells, sticky headers, emphasis techniques), chart aesthetics and storytelling (gradient
fills, glow effects, annotations, grid replacements), Mermaid diagram integration,
infographic patterns (number blocks, timelines, comparison grids, process flows),
AI prompting for data visuals, print-ready data graphics.

### Microanimations and Interactive Controls
**Triggers**: "animation", "hover", "click", "button", "toggle", "feedback", "ripple",
"loading", "skeleton", "transition", "snap", "magnetic", "scroll animation",
"microinteraction", "responsive control", "state transition", "form animation"
**Load**: `references/microanimations.md`
**Provides**: Complete 5-state button system (default/hover/active/focus/disabled),
navigation feedback (menu items, hamburger, tab indicator), scroll-driven animations
(staggered reveal, progress bar, counter animation), form interactions (floating labels,
validation feedback, custom checkboxes), loading states (skeletons, success/error),
page transitions, haptic-feel patterns (press, bounce, card lift, ripple), snap and
magnetic behaviors, performance rules, easing and timing reference table.

### Visual Motion and Depth
**Triggers**: "3d", "depth", "parallax", "tilt", "fake 3d", "spatial", "kinetic",
"motion", "glassmorphism", "holographic"
**Load**: `references/visual-kinetics.md`
**Provides**: Animation tier system (CSS -> Svelte -> Svelte Motion -> GSAP), holographic
tilt card with glare, parallax hero with Nano Banana layers, glassmorphism 2.0, kinetic
typography (reveal mask, marquee, split text), scroll-triggered reveals, physics-based
easing, magnetic button, performance checklist.

### Data Visualization (Charts and Dashboards)
**Triggers**: "layerchart", "chart component", "dashboard layout", "bento grid",
"sparkline", "real-time", "neon chart", "editorial chart"
**Load**: `references/data-visualization.md`
**Provides**: LayerChart composable patterns, shadcn-svelte chart integration, chart
aesthetic modes (Neon/Editorial/Minimal), table styling recipes, Bento grid dashboard
layouts, sparklines, real-time data patterns, fallback libraries.

### Diagrams (Mermaid)
**Triggers**: "mermaid", "diagram", "flowchart", "sequence diagram", "architecture diagram"
**Load**: `references/mermaid-theming.md`
**Provides**: beautiful-mermaid setup and theming, Shiki integration, native Mermaid
`themeVariables` mapping, SVG post-processing (texture overlay, shadows, borders),
SvelteKit component pattern, diagram type styling notes, print considerations.

When **multiple triggers** are detected, load all relevant references.
When **no triggers** are detected, apply the Universal Mandates below directly.

## 4. The Anti-Slop Mandate

LLMs converge toward high-probability "safe" design patterns from training data.
This is distributional convergence. Fight it deliberately.

**REJECT**: Bootstrap/Tailwind defaults shipped as-is, Inter/Roboto/Arial/system fonts,
purple-on-white color schemes, predictable card grids, cookie-cutter hero sections,
centered-everything layouts, stock photography, generic gradients, emoji icons in UI,
magic number spacing, invisible hover states, layout-shifting scale transforms on hover,
light-mode glass cards with <30% opacity, muted text below gray-500 contrast.

**EMBRACE**: Intentional typography hierarchies, asymmetric compositions, atmospheric
depth, kinetic feedback, editorial grids, geometric eye-guides, print-ready precision,
custom color palettes built from color theory, distinctive font pairings, SVG icon
systems (Lucide, Heroicons) with consistent viewBox, cursor-pointer on every clickable
element, stable hover states using color/opacity (not layout-disrupting transforms).

## 5. Design Thinking (Pre-Code)

Before writing code, commit to a direction:

1. **Purpose**: What does this solve? Who uses it?
2. **Product Type**: Classify using the table in Section 2A for initial direction.
3. **Aesthetic Tone**: Pick ONE and commit fully. See `references/landing-pages.md`
   Section 3 for 8 proven styles. Or invent a hybrid.
4. **Color Direction**: Select primary hue, derive accent via color theory harmony.
   See `references/color-system.md` Section 3 for the full workflow.
5. **Typography**: Choose display + body + mono trio from
   `references/typography.md` catalogs.
6. **The Memorable Detail**: Identify ONE element the user will remember.
7. **Complexity Match**: Maximalist = elaborate code. Minimalist = surgical precision.

## 6. Universal Aesthetic Mandates

### Typography
Select distinctive, characterful pairings. Load from Google Fonts or Fontsource.
See `references/typography.md` for full font catalogs and pairing strategies.
NEVER use Inter, Roboto, Open Sans, Lato, or default system fonts unless heavily modified.
NEVER converge on Space Grotesk across generations.

### Color (The Structured Palette)
Build a 3-group palette: Base Tones, Primary Tones, Accent Tones.
See `references/color-system.md` for the complete system.
Light themes: hard shadows, heavy typography, thin lines.
Dark themes: colored glows, off-white text (#E8E8E8), subtle surface gradients.
NEVER use pure purple (H: 270-280) as primary. Shift to indigo, teal, coral, or emerald.

### Imagery and Texture
Never use flat, solid-color backgrounds for hero sections.
See `references/imagery.md` for the three-layer composition technique, dithering
algorithms, and Nano Banana integration patterns.

### Microanimations (Mandatory)
Every interactive element must provide motion feedback.
See `references/microanimations.md` for the complete 5-state button system,
scroll-driven animations, and haptic-feel patterns.

### Spatial Composition
Vertical scaffolding, asymmetry, negative space, grid-breaking elements.
See `references/landing-pages.md` Section 4 for visual flow patterns.

### Accessibility (Non-Negotiable)
- Semantic HTML: `<article>`, `<section>`, `<nav>`, `<aside>`, `<main>`
- Focus states: NEVER `outline: none`. Style as `outline: 2px solid var(--accent); outline-offset: 4px`
- WCAG AA contrast minimum. See `references/color-system.md` Section 9.
- ARIA labels on all custom interactive components
- `prefers-reduced-motion`: disable parallax, tilt, complex animations
- Color must never be the sole indicator of state
- All images need alt text; form inputs need labels

### Print and PDF
Sites must double as printable reports when `@media print` is active.
Hide nav/footer/buttons, force white background, preserve SVG charts,
use `break-inside: avoid` on cards/charts/tables.

## 7. Implementation Workflow

1. **Identify**: Classify product type, style intent, audience (Section 2).
2. **Load**: Scan for resource triggers. Load relevant reference files (Section 3).
3. **Research**: For complex builds, conduct deep research (up to 10 web searches)
   on comparable award-winning sites, patterns, and library capabilities.
4. **Architect**: Plan SvelteKit file structure. Define CSS variable tokens.
5. **Code**: Write semantic HTML, extended Tailwind, Svelte 5 Runes.
   Production-ready, no placeholders.
6. **Polish**: Apply microanimations, texture layers, hover states, scroll triggers.
7. **Validate**: Run the Pre-Delivery Checklist (Section 8). Fix all failures.
8. **Iterate**: Compare against the aesthetic vision. Adjust until it pops.

## 8. Pre-Delivery Checklist

Run this before delivering any UI code. Every item is a known failure mode.

### Visual Quality
- [ ] No emojis used as UI icons (use Lucide or Heroicons SVGs)
- [ ] All icons from a single consistent set with matching viewBox (24x24)
- [ ] Brand logos verified against official sources (Simple Icons)
- [ ] Hover states cause NO layout shift (use opacity/color, not scale transforms)
- [ ] No default Tailwind color classes without customization
- [ ] Typography pairing is intentional and loaded (not system fallback)

### Interaction
- [ ] Every clickable element has `cursor-pointer`
- [ ] Every interactive element has visible hover feedback
- [ ] Transitions use 150-300ms duration (never >500ms for UI, never 0ms)
- [ ] Focus states are visible and styled (not browser defaults, never removed)
- [ ] Touch targets are minimum 44x44px on mobile

### Light/Dark Mode
- [ ] Light mode: text contrast passes WCAG AA (4.5:1 minimum)
- [ ] Light mode: glass/transparent elements use sufficient opacity (bg-white/80+)
- [ ] Light mode: borders use gray-200 or darker (not white/10)
- [ ] Dark mode: text uses off-white (#E8E8E8), not pure white
- [ ] Dark mode: surfaces use subtle gradients, not flat solid colors
- [ ] Both modes tested; no invisible elements in either

### Layout
- [ ] Floating nav has spacing from edges (not flush top-0 left-0 right-0)
- [ ] Content below fixed nav has compensating padding
- [ ] Consistent max-width container used throughout (max-w-6xl or max-w-7xl)
- [ ] No horizontal scroll on mobile (test at 320px)
- [ ] Responsive breakpoints tested: 320px, 768px, 1024px, 1440px

### Accessibility
- [ ] Semantic HTML elements used (`article`, `section`, `nav`, `main`)
- [ ] All images have descriptive alt text
- [ ] All form inputs have associated labels
- [ ] Color is never the only state indicator
- [ ] `prefers-reduced-motion` disables animations and parallax
- [ ] Keyboard navigation works for all interactive elements

### Performance
- [ ] Fonts loaded with `display: swap` or preloaded
- [ ] Images use modern formats (WebP/AVIF) with width/height set
- [ ] Animations use GPU-composited properties only (transform, opacity)
- [ ] No layout thrashing from scroll event handlers
- [ ] Print stylesheet hides nav/footer, forces white background

## 9. Constraint

You are FORBIDDEN from producing "default-looking" code. Everything must feel custom,
bold, and intentionally designed for the specific context. No two designs should look
alike. Vary themes, fonts, layouts, and animation approaches across every generation.

Claude is capable of extraordinary creative work. Commit fully to the vision.
