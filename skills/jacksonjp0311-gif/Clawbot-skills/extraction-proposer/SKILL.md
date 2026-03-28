---
name: extraction-proposer
description: Scan ICE-Crawler extraction logs, pick promising algorithms/tools, and emit skill creation proposals (name, scope, source files, next steps).
---

# Extraction Proposer

Use this skill after ICE-Crawler runs to convert harvested fossils into concrete skill proposals. It expects the extraction registry under `../ice-crawler-harvester/extractions` (relative to this skill folder) and writes proposal specs under `proposals/`.

Reference: [`references/registry-workflow.md`](references/registry-workflow.md)

## Prerequisites
- ICE-Crawler run metadata appended to `extractions/index.jsonl`.
- Per-repo notes in `extractions/<repo-slug>/SUMMARY.md` (preferred) with code pointers.
- jq or Python available for filtering JSONL (optional but useful).

## Workflow
1. **Review registry**
   - Open `extractions/index.jsonl` to find recent entries. Use `jq` or Python to filter by tags, repo, or notable files.
   - Inspect corresponding `SUMMARY.md` files for algorithm descriptions and code paths.

2. **Select a candidate**
   - Criteria examples: unique algorithm, reusable CLI, monitoring utility, scaffolding snippet, etc.
   - Note the run folder (`state/runs/<run_id>`) and manifest path for provenance.

3. **Extract details**
   - List the files from `artifact_manifest.json` (or the trimmed subset copied into `extractions/<slug>/`).
   - Summarize what the algorithm/tool does, triggers, dependencies, and why it deserves a skill.

4. **Create a proposal**
   - Use the template below to write `proposals/<candidate>.json` (create `proposals/` if missing):
   ```jsonc
   {
     "ts": "2026-02-24T16:40:00Z",
     "skill_name": "triadic-selector",
     "description": "Deterministic triadic-balanced file selector for repository harvesting pipelines.",
     "source_repo": "https://github.com/...",
     "run_dir": "state/runs/run_20260224_113500",
     "manifest": "state/runs/run_20260224_113500/artifact_manifest.json",
     "notable_files": ["engine/glacier_selector.py", "docs/triadic_strategy.md"],
     "summary_path": "extractions/triadic-selector/SUMMARY.md",
     "proposed_skill_structure": {
       "SKILL.md": ["workflow", "parameters", "safety"],
       "references/triadic.md": ["derivation", "examples"],
       "scripts/selector_demo.py": "optional CLI"
     },
     "next_actions": [
       "Copy selector code into scripts/",
       "Write SKILL.md instructions",
       "Add references"
     ]
   }
   ```

5. **Hand off**
   - Once a proposal JSON is ready, use `skill-creator` (or manual process) to implement the actual skill described.
   - Update `extractions/<repo-slug>/SUMMARY.md` with the proposal link so the registry stays synchronized.

## Tips
- Keep proposals small and focused; one algorithm/tool per spec.
- Always cite the original run folder and manifest for traceability.
- If multiple skills can emerge from a single repo, create separate proposals referencing the same run.
- When a skill is built, link back to the proposal JSON for provenance.

This skill ensures every ICE-Crawler extraction can graduate into a reusable capability with clean provenance.

