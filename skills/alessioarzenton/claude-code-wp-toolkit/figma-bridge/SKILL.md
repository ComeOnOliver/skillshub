---
name: figma-bridge
description: How to use Figma MCP and Variables2CSS to read designs from Figma and generate code consistent with tokens. Use when the designer shares a Figma link.
user-invocable: false
disable-model-invocation: true
---

# Figma Bridge — Implement Design

## Overview

Structured workflow to translate Figma designs into production-ready code with 1:1 visual fidelity. Ensures integration with the Figma MCP server, correct use of design tokens, and visual parity with mockups.

## Prerequisites

- **Figma MCP** configured in the project's `.mcp.json` (automatically created by `init-project.sh`). On first session, authenticate: `/mcp` → figma → Authenticate → Allow Access.
- Figma URL in the format: `https://figma.com/design/:fileKey/:fileName?node-id=1-2`
- **Or** with `figma-desktop` MCP: direct node selection in the desktop app (no URL required)

## Workflow — Follow these steps in order. Do not skip steps.

### Step 0: Verify Figma MCP is configured

If an MCP call fails because the Figma server is not connected, stop and configure:

1. Verify that `.mcp.json` in the project root contains the `figma` server (see `references/figma-mcp-setup.md`)
2. If missing, create it or run `init-project.sh`
3. Authenticate: `/mcp` → figma → Authenticate → Allow Access
4. Restart Claude Code after configuration
5. Verify with a test call (e.g., `get_screenshot` on a known node)

Once configured, this step does not need to be repeated in subsequent sessions (the OAuth token is persisted).

### Step 1: Get the Node ID

#### Option A: Parse from the Figma URL

URL format: `https://figma.com/design/:fileKey/:fileName?node-id=1-2`

Extract:
- **File key:** the segment after `/design/`
- **Node ID:** the value of the `node-id` parameter

Example:
- URL: `https://figma.com/design/kL9xQn2VwM8pYrTb4ZcHjF/DesignSystem?node-id=42-15`
- File key: `kL9xQn2VwM8pYrTb4ZcHjF`
- Node ID: `42-15`

#### Option B: Selection from desktop app (figma-desktop MCP only)

With the desktop MCP, tools automatically use the selected node in the open file. No need to pass `fileKey`.

### Step 2: Read the Design Context

Use `get_design_context` with the extracted file key and node ID:

```
get_design_context(fileKey=":fileKey", nodeId="1-2")
```

Provides:
- Layout (Auto Layout, flex, grid, constraints, sizing)
- Typographic specs
- Colors and design tokens
- Component structure and variants
- Spacing and padding

**If the response is truncated or too large:**

1. Use `get_metadata(fileKey=":fileKey", nodeId="1-2")` to get the high-level node map
2. Identify the needed child nodes from metadata
3. Fetch individual children with `get_design_context(fileKey=":fileKey", nodeId=":childNodeId")`

### Step 3: Capture the Visual Reference

Use `get_screenshot` as the visual source of truth:

```
get_screenshot(fileKey=":fileKey", nodeId="1-2")
```

Don't rely solely on the data structure — the screenshot confirms the expected appearance. Keep it accessible throughout the implementation.

### Step 4: Download Assets

Download images, icons, and SVGs returned by the Figma MCP server.

**Asset rules:**
- If the MCP returns a `localhost` source for an image or SVG, use it directly
- DO NOT import or add icon packages — all assets must come from the Figma payload
- DO NOT use or create placeholders if a `localhost` source is available
- Assets are served from the Figma MCP server's assets endpoint

### Step 5: Verify Project Tokens

Use `get_variable_defs` to verify that design tokens match those in the theme CSS files. Flag discrepancies to the designer.

Read these CSS files for actual values — don't rely on markdown tables:

| File | Content |
|------|---------|
| `{{TOKEN_FILE_THEME}}` | `@theme {}` block — colors, spacing, radius, font, breakpoints, gradients |
| `{{TOKEN_FILE_CUSTOM_PROPS}}` | `:root` semantic CSS vars |
| `{{TOKEN_FILE_SEMANTIC}}` | `@utility` for semantic colors, bg, border, link |
| `{{TOKEN_FILE_TYPOGRAPHY}}` | Heading and body classes |

### Step 6: Translate to Project Conventions

Generate code based on the structure read from MCP, not invented layout.

**Principles:**
- Treat Figma output as a representation of design and behavior, not as final code style
- Use project tokens — not hardcoded values
- Reuse existing components (buttons, inputs, typography) instead of duplicating functionality
- Consult `{{COMPONENTS_CATALOG}}` — use existing components where possible
- If a component doesn't exist, generate markup following the design system pattern
- Apply accessibility rules (skill `accessibility`)
- Flag if new components are needed

### Step 7: Completion and Verification

Report completion to the user. Visual verification is the user's responsibility — if they provide a screenshot for comparison, adjust the implementation accordingly.

#### Self-check checklist

- [ ] Spacing consistent with the px → Tailwind mapping (see `component-workflow` step 5.5)
- [ ] Correct typography (appropriate `rtds-heading-N` or `rtds-body-N` class)
- [ ] Colors via semantic vars or utilities (no hardcoded hex)
- [ ] Interactive states working (hover, active, disabled)
- [ ] Responsive behavior consistent with Figma constraints
- [ ] Assets rendered correctly
- [ ] Accessibility standards met

## Token Pipeline: Figma → Code

```
Figma Variables
     ↓
Variables2CSS plugin (in browser)
     ↓
{{TOKEN_FILE_THEME}} (@theme block)
     ↓
{{TOKEN_FILE_CUSTOM_PROPS}} (:root vars)
{{TOKEN_FILE_SEMANTIC}} (semantic @utility)
     ↓
TW4 classes with project prefix (e.g.: {{PREFIX}}:bg-primary-500, {{PREFIX}}:p-4)
+ semantic utilities (e.g.: {{PREFIX}}-content-01, {{PREFIX}}-background-primary)
```

### Token update

When the designer updates tokens in Figma:
1. Opens the Variables2CSS plugin
2. Selects the collections to export
3. Chooses "CSS Custom Properties" format
4. Copies the output and updates `{{TOKEN_FILE_THEME}}` / `{{TOKEN_FILE_CUSTOM_PROPS}}`
5. The browser auto-refreshes (Vite hot reload)

No need to modify `app.css` — the `@theme` mapping uses `var()` which updates automatically.

## Figma → Tailwind 4 Mapping

| Figma Property | How to find the value | Example class/variable |
|---|---|---|
| Fill > color | 1) Find hex. 2) Search in `{{TOKEN_FILE_THEME}}`. 3) Search semantic var in `{{TOKEN_FILE_CUSTOM_PROPS}}`. 4) Use var or utility from `{{TOKEN_FILE_SEMANTIC}}` | `var(--color-content-primary)` or `{{PREFIX}}-content-primary` or `{{PREFIX}}:bg-primary-500` |
| Auto Layout > Gap | **px / 4 = Tailwind number**. E.g.: 16px / 4 = 4 | `{{PREFIX}}:gap-4` |
| Padding | **px / 4 = Tailwind number**. E.g.: 24px / 4 = 6 | `{{PREFIX}}:p-6`, `{{PREFIX}}:px-8` |
| Corner Radius | Search in `{{TOKEN_FILE_THEME}}` → `--radius-*` | `{{PREFIX}}:rounded-md`, `{{PREFIX}}:rounded-lg` |
| Drop Shadow | Search in `{{TOKEN_FILE_THEME}}` → `--shadow-*` | `{{PREFIX}}:shadow-sm`, `{{PREFIX}}:shadow-md` |
| Font Outfit | Use heading class matching the size | `.{{PREFIX}}-heading-1` ... `.{{PREFIX}}-heading-6` |
| Font DM Sans | Use body class matching the size | `.{{PREFIX}}-body-xs` ... `.{{PREFIX}}-body-xl` |
| Semantic color | Search in `{{TOKEN_FILE_SEMANTIC}}` for the utility class | `{{PREFIX}}-content-01`, `{{PREFIX}}-background-primary` |

> **Quick spacing rule**: `Figma px / 4 = Tailwind class number`. E.g.: 32px = `{{PREFIX}}:p-8`, 48px = `{{PREFIX}}:p-12`
>
> **Quick typography rule**: Outfit → `{{PREFIX}}-heading-N`, DM Sans → `{{PREFIX}}-body-N`
>
> **Full tables** for spacing, typography, and colors: see `component-workflow` skill, section 5.5.

## Discrepancies and Troubleshooting

### Common discrepancies

- **Token in design but not in CSS**: the designer needs to update CSS files with Variables2CSS
- **Hardcoded values in design**: ask the designer if the value should be a token
- **Figma component without counterpart**: generate markup following the design system pattern
- **Colors not in palette**: check `{{TOKEN_FILE_THEME}}` — might be a color with a different name

### Frequent issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Truncated Figma output | Design too complex or too many nested levels | Use `get_metadata` for the node map, then fetch individual children with `get_design_context` |
| Design doesn't match after implementation | Visual discrepancies between code and mockup | Compare side-by-side with the Step 3 screenshot. Check spacing, colors, and typography in context data |
| Assets not loading | MCP assets endpoint not accessible or URLs changed | Verify the Figma MCP assets endpoint is accessible. Use `localhost` URLs directly without modifications |
| Token values differ from Figma | Project tokens have different values than those in the design | Prefer project tokens for consistency, but adjust spacing/sizing to maintain visual fidelity |

## Examples

### Example 1: Implementing a UI component

The user shares: `https://figma.com/design/kL9xQn2VwM8pYrTb4ZcHjF/DesignSystem?node-id=42-15`

**Actions:**
1. Parse URL → fileKey=`kL9xQn2VwM8pYrTb4ZcHjF`, nodeId=`42-15`
2. `get_design_context(fileKey="kL9xQn2VwM8pYrTb4ZcHjF", nodeId="42-15")`
3. `get_screenshot(fileKey="kL9xQn2VwM8pYrTb4ZcHjF", nodeId="42-15")` for visual reference
4. Download icons/images from the assets endpoint
5. Check if a similar component exists in `{{COMPONENTS_CATALOG}}`
6. If it exists → extend it with the new variant. If not → create a new component following the design system conventions
7. Map Figma colors to project tokens (e.g., `primary-500`, `primary-hover`)
8. Validate against the screenshot: padding, border radius, typography

**Result:** Component that respects the Figma design, integrated into the project's design system.

### Example 2: Implementing a page layout

The user shares: `https://figma.com/design/pR8mNv5KqXzGwY2JtCfL4D/Pages?node-id=10-5`

**Actions:**
1. Parse URL → fileKey=`pR8mNv5KqXzGwY2JtCfL4D`, nodeId=`10-5`
2. `get_metadata(fileKey="pR8mNv5KqXzGwY2JtCfL4D", nodeId="10-5")` to understand the structure (complex page)
3. Identify main sections (header, content, sidebar, footer) and their node IDs
4. `get_design_context` for each main section
5. `get_screenshot(fileKey="pR8mNv5KqXzGwY2JtCfL4D", nodeId="10-5")` for the full page
6. Download all assets (logos, icons, images)
7. Build the layout using existing components where possible
8. Implement each section reusing components from `{{COMPONENTS_CATALOG}}`
9. Validate responsive behavior against Figma constraints

**Result:** Complete page layout, faithful to the design, with reused design system components.

## Best Practices

### Always start from context

Don't implement based on assumptions. Always run `get_design_context` and `get_screenshot` before writing code.

### Validate incrementally

Compare your code with the Figma screenshot and design context data during implementation. Verify spacing, typography, and colors using the token mapping tables. If you have doubts about fidelity, flag it to the user.

### Document deviations

If you must deviate from the Figma design (e.g., for accessibility, technical constraints, or framework limitations), document the reason with a code comment.

### Design System First

When in doubt, prefer the project's design system patterns over a literal Figma translation. Codebase consistency matters more than exact replication.

### Reuse before recreation

Always check `{{COMPONENTS_CATALOG}}` for existing components before creating new ones. Extend rather than duplicate.

## References

- `references/figma-tools-and-prompts.md` — Complete MCP tool catalog and prompt patterns
- `references/figma-mcp-setup.md` — Setup, verification, and troubleshooting for the Figma MCP server
