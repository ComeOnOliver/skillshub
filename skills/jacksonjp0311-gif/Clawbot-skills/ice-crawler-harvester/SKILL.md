# ICE-Crawler Harvester

Use this skill to run the ICE-Crawler pipeline wherever you have the project cloned. Set an environment variable such as `ICE_CRAWLER_ROOT` that points to your local clone of the [Ice-Crawler repo](https://github.com/jacksonjp0311-gif/Ice-Crawler) and run the commands from there. The instructions below assume PowerShell, but any shell works.

Reference: [`references/ice-crawler-workflow.md`](references/ice-crawler-workflow.md)

## Prerequisites
- Python 3.10+ with Tkinter (for the UI) and Git on PATH.
- ICE-Crawler repository checked out locally (path referenced via `ICE_CRAWLER_ROOT`).
- Optional: `agentics/` hooks if you need partitioned follow-up tasks.

## Workflow 1 — Full UI Run (interactive)
1. `cd $env:ICE_CRAWLER_ROOT`
2. Launch the UI: `python icecrawler.py`
3. Paste any cloneable Git URL (browse/blob URLs are normalized automatically) and press the glowing **PRESS TO SUBMIT TO ICE CRAWLER** button.
4. Watch the phase ladder (Frost → Glacier → Crystal → Residue) and log panels update in real time.
5. When the run completes, open `state/runs/run_<timestamp>/` to inspect the fossilized artifact bundle.

### UI Controls
- **Ctrl+B** toggle left ladder; **Ctrl+Shift+B** toggle right logs; **Ctrl+J** toggle terminal.
- Drag PanedWindow sashes to resize panels.
- UI never touches git; it mirrors `ui_events.jsonl` written by the orchestrator.

## Workflow 2 — Headless CLI Run
```powershell
cd $env:ICE_CRAWLER_ROOT
$run = "state/runs/run_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$temp = "state/_temp_repo"
New-Item -ItemType Directory -Force -Path $run | Out-Null
python -m engine.orchestrator "https://github.com/openclaw/openclaw.git" $run 80 256 $temp
```
Arguments: `<repo_url> <state_run_dir> <max_files> <max_kb> <temp_dir>`
- `max_files` controls the Glacier selection cap.
- `max_kb` enforces a per-file size ceiling when copying into `artifact/`.
- `temp_dir` is purged automatically; failure to delete triggers a residue violation.

## Outputs & Follow-up
- `state/runs/<run>/artifact/` — crystallized file tree (repo-relative paths preserved).
- `artifact_manifest.json` + `artifact_hashes.json` — integrity anchors for downstream tools.
- `ai_handoff/manifest_compact.json` + `root_seal.txt` — sealed bundle for agent prompts.
- `ui_events.jsonl`, `run_cmds.jsonl` — truth logs for UI or automation.
- `residue_truth.json` — teardown attestation; treat violations as failures.
- **Extraction registry** — append a row to `skills/ice-crawler-harvester/extractions/index.jsonl` and drop notes under `extractions/<repo-slug>/` so future skills can mine algorithms/tools (see `extractions/README.md`).

## Extending / Integrating
- Call the orchestrator from scripts or scheduled jobs to keep repo fossils fresh.
- Parse `artifact_manifest.json` to feed other skills (e.g., code summarizers, diff analyzers).
- Hook `agentics/` when you need automatic partitioning of Frost metadata or Crystal artifacts into bounded tasks.
- Adjust `max_files` / `max_kb` per run to dial ingest size; keep limits conservative for safety.

## Troubleshooting
- Missing Tkinter on Linux → `sudo apt install python3-tk` (or distro equivalent).
- Git credential prompts bubble through the orchestrator; ensure SSH keys or tokens are configured.
- Residue violation (`state/_temp_repo` not deleted) aborts the run; rerun after manual cleanup if needed.

Follow this skill to get deterministic repo fossils with ICE-Crawler’s provenance guarantees.