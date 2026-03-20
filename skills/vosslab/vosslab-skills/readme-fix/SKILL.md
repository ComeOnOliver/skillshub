# README fix

## Goal

Make `README.md` short, correct, and consistent with this repo's documentation layout.
Keep deeper detail in `docs/` and link it from the README.

## Required sections

- Title.
- One paragraph: what it is and who it is for.
- "Documentation" section pointing into `docs/` (INSTALL, USAGE, TROUBLESHOOTING,
  CODE_ARCHITECTURE, FILE_STRUCTURE as applicable).
- Quick start for one primary path (keep it verifiable).

## Optional sections (only with evidence or genuinely short)

- Installation summary (otherwise link `docs/INSTALL.md`).
- Usage examples (otherwise link `docs/USAGE.md`).
- Testing command (only if you can confirm the command exists).
- Troubleshooting pointer (otherwise link `docs/TROUBLESHOOTING.md`).
- Status or maturity note (experimental, stable, deprecated).
- Maintainer or support link (issues, discussion, contact).

## Inputs to request

- Current `README.md` content.
- How the tool is intended to be run (CLI, library, web service, container).
- Known prerequisites and common failures, if any.

## Workflow

1. Read the current README and docs index
   - Read `README.md`.
   - Scan `docs/` for existing target docs (INSTALL, USAGE, TROUBLESHOOTING, etc.).
2. Enforce the README role
   - README contains:
     - One paragraph: what the project is and who it is for.
     - One "Quick start" that actually works or is clearly scoped.
     - A "Documentation" section with links to the deeper docs.
   - Move long explanations into the appropriate `docs/*.md` file and link it, instead
     of expanding README.
3. Standardize structure (minimal, repeatable)
   - Project name heading.
   - Short overview paragraph.
   - Documentation links list.
   - Quick start for the primary path (one path only: local, container, or installable
     package).
   - Optional: "Testing" section only if a test command is verifiable in repo files.
4. Documentation section policy (curated, not exhaustive)
   - Link text must be the file path so readers know they are clicking a file and see
     the exact filename.
   - Good:
     - [docs/MARKDOWN_STYLE.md](docs/MARKDOWN_STYLE.md): Markdown rules for this repo.
   - Bad:
     - [Style Guide for Markdown](docs/MARKDOWN_STYLE.md)
   - Only include a backticked path when the link text is not the path.
   - Choose the documentation list format based on doc count:
     - Small docset (3 to 8): single list, each item includes path link as link text
       + one line description. Do not repeat the path in backticks.
     - Medium docset (9 to 16): group into 2 to 4 labeled subsections, keep each
       group short.
     - Large docset (more than 16): list 3 to 6 core docs plus 1 to 2 index docs
       that cover the long tail. Do not enumerate everything.
5. Decide which docs are link only versus needing a short README section
   - Link only is fine for:
     - Standards and policies (style guides, repo style).
     - Internals that most users do not need first (architecture, file structure),
       unless the repo is developer facing.
   - Include a short README section (then link to the full doc) for:
     - Installation and prerequisites: keep a minimal quick start, then link
       `docs/INSTALL.md`.
     - Primary usage path: one minimal example, then link `docs/USAGE.md`.
     - Key concepts users must understand early (formats, engines, question bank
       rules, version compatibility): 3 to 8 lines max, then link the authoritative
       doc.
     - Troubleshooting: only include 2 to 3 verified common failures, otherwise
       link `docs/TROUBLESHOOTING.md`.
6. Keep README short by moving detail into docs
   - If README starts to grow past the quick start and a curated doc map, move long
     sections into the correct `docs/*.md` file and link it from README.
7. Apply Markdown house rules
   - ASCII only; escape symbols like `&alpha;` if needed.
   - Sentence case headings, short headings.
   - Bullets use `-`, one idea per bullet.
   - Relative links with descriptive text.
   - When referencing files, use Markdown links so users can click through. Markdown
     links are created using the syntax [link text](URL), where "link text" is the
     clickable text that appears in the document, and "URL" is the web address or
     file path the link points to. This allows users to navigate between different
     content easily. Use file-path link text so readers know the exact filename
     (good: [docs/MARKDOWN_STYLE.md](docs/MARKDOWN_STYLE.md), bad:
     [Style Guide for Markdown](docs/MARKDOWN_STYLE.md)).
8. Enforce REPO_STYLE documentation rules
   - Do not add banned docs (CONTRIBUTING.md, templates, SECURITY.md unless supported).
   - If a missing common doc is required to keep README concise (usually INSTALL or
     USAGE), create a minimal stub under `docs/` using ALL CAPS naming and link it.
   - Prefer social links over hard coded email when adding contact.
9. Keep claims verifiable
   - Only include commands you can confirm exist (scripts, Makefile targets, documented
     CLI).
   - If a detail is unclear, add a short note pointing to where it should be verified,
     then stop.

## Quality bar
- README stays short. Prefer links plus one line descriptions over large inlined manuals.
- Documentation links use the file path as link text and include a one line
  description. Do not repeat the same path in backticks.
- Include short sections only when they unblock getting started or explain a
  required concept.
- For large docsets, list core docs plus index docs, not everything.

## Output

- A proposed README patch with minimal edits.
- A short checklist of missing docs under `docs/` that should exist for this repo type.

## References (optional)

- GitHub Docs: "About READMEs" for expected content and auto TOC behavior.
- Standard Readme community spec for section ordering.
- READMINE template for an explicit TOC example.