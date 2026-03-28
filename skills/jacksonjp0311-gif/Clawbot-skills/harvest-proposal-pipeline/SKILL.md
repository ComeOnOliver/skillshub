---
name: harvest-proposal-pipeline
description: Automate ICE-Crawler ingestion → registry update → proposal stub creation. Use when you want a full harvest loop that ends with a ready-to-review skill idea.
---

# Harvest → Proposal Pipeline

This skill runs the whole flow when you say so:
1. ICE-Crawler orchestrator ingests a repo (Frost→Glacier→Crystal→Residue).
2. The extraction registry (`ice-crawler-harvester/extractions`) is appended automatically.
3. A summary stub + optional proposal JSON is generated so you can approve the next skill.

Helper script: `scripts/harvest_pipeline.py`

## Usage
```powershell
cd <skills_repo>\skills\harvest-proposal-pipeline
python scripts\harvest_pipeline.py <repo_url> --candidate <skill-name> --max-files 80 --max-kb 256
```
- `repo_url` — cloneable Git URL (raw/tree/blob URLs are fine; orchestrator normalizes).
- `--candidate` (optional) — proposed skill name. When supplied, a stub JSON is written under `skills/extraction-proposer/proposals/`.
- `--max-files` / `--max-kb` — bounds for Glacier selection + per-file size.
- Set `ICE_CRAWLER_ROOT` to the local path of your ICE-Crawler clone before running this script.

## What it does
1. Runs `python -m engine.orchestrator …` inside `$env:ICE_CRAWLER_ROOT` with timestamped `state/runs/run_<ts>`.
2. Loads `artifact_manifest.json` to count files.
3. Writes/updates `skills/ice-crawler-harvester/extractions/index.jsonl` with: repo, run_dir, manifest path, file count, summary path.
4. Creates/updates `skills/ice-crawler-harvester/extractions/<repo-slug>/SUMMARY.md`, including an auto-generated “Auto-detected Candidates” section with suggested algorithms/tools.
5. If `--candidate` is provided, saves `skills/extraction-proposer/proposals/<skill-name>.json` prefilled with provenance, candidate description, notable file list, and suggested skill structure.

## After the run
- Console output highlights:
  - `Run folder`: the ICE-Crawler fossil (`state/runs/run_<timestamp>`).
  - `Summary`: path to `SUMMARY.md` (includes auto-detected candidate bullets).
  - `Proposal stub`: JSON file to review in `extraction-proposer/proposals/` (if `--candidate` supplied).
- Once you approve a proposal, copy it into `extraction-proposer/catalog/` and mark the status (`approved`, `rejected`, etc.) so the catalog becomes the definitive list of green-lit algorithms.
- Open the summary/proposal, add any extra notes, and decide whether to execute the build using `skill-creator`.

## Safety & Notes
- Requires Python + git on PATH (same prerequisites as ICE-Crawler).
- Registry + proposal folders must exist (created by earlier skills).
- Script fails fast if orchestrator errors or the manifest is missing.
- You stay in control: nothing becomes a skill until you approve/edit the generated proposal.

Invoke this skill whenever you want a one-command harvest that comes back with a ready-to-review idea.

