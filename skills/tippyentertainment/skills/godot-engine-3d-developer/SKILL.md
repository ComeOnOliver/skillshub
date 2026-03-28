# Provided by TippyEntertainment
# https://github.com/tippyentertainment/skills.git


This skill is designed for use on the Tasking.tech agent platform (https://tasking.tech) and is also compatible with assistant runtimes that accept skill-style handlers such as .claude, .openai, and .mistral. Use this skill for both Claude code and Tasking.tech agent source.



# 3D Godot Engine - Game Developer – Agent Skills

These skills define what the Taskingbot agent can do for 3D game development.
Each skill should be implemented as an internal tasking.tech API or workflow.
The model only sees these skills as tools with JSON parameters.

---

## 0. Concepts

- **Project** – A game project (e.g., `Project Aurora`).
- **Area** – High‑level discipline: `gameplay`, `level`, `art`, `tech`, `audio`, `ui`, `tools`.
- **Build** – A compiled game binary for a specific platform (PC, Web, Console, etc.).
- **Worker** – Build/test machines (local or CI) that pull jobs from tasking.tech.

The agent never accesses machines directly. It calls skills → backend enqueues jobs → workers execute and report back.

---

## 0.1 File Types & Formats (Authoritative)

The agent should talk about files using explicit extensions and typical paths.
It never reads files directly; it references them by repo path or storage id.

### Scripts

- `.gd`          – GDScript files (gameplay logic, tools, tests).
- `.cs`          – C# scripts.
- `.tscn`        – Text scene files (levels, prefabs, UI).
- `.escn`        – Text scenes exported from DCC tools or intermediate pipelines.

### 3D / Geometry

- `.blend`       – Blender source scenes and models.
- `.fbx`         – Rigged/animated meshes from DCC tools.
- `.gltf` / `.glb` – Preferred interchange for static and animated assets.
- `.obj`         – Legacy static meshes.

### Textures & Materials

- `.png`, `.jpg` – General textures (albedo, masks, UI).
- `.tga`, `.tif` – High‑quality or linear textures.
- Common naming patterns the agent should respect:
  - `_albedo`, `_basecolor`, `_normal`, `_roughness`, `_metallic`, `_ao`.

### Audio

- `.wav`         – Source and high‑quality SFX/VO.
- `.ogg`, `.mp3` – Compressed in‑game audio and music.

### Shaders

- `.shader`      – Godot shader files.
- `.gdshader`    – Godot visual shader files (text representation).

### Data & Config

- `.json`, `.yml`, `.yaml` – Game data, build configs, pipelines.
- `.cfg`, `.ini`           – Engine or tool configuration.

Guidelines for the agent:

- Mention specific extensions in tasks (e.g. “refactor `player_controller.gd`”,
  “convert all `.fbx` in `art/characters/` to `.glb`”).
- Keep existing naming conventions and folder layouts when proposing changes.
- Use `source_extension`, `target_extension`, explicit file names and `source_path`
  in skill parameters when relevant.

## Files to create

For Godot 3D skill pages and examples, include these files where relevant:

- `SKILL.md` — must include YAML frontmatter with `name` and `description`
- `README.md` — short skill overview (optional)
- Scenes: `.tscn` (Text scene files)
- Scripts: `.gd`, `.cs`
- 3D assets: `.glb`/`.gltf`, `.fbx`, `.blend`
- Textures: `.png`, `.jpg`, `.tga`
- Shaders: `.shader`


---

## 1. Planning & Task Management

### `create_game_task`

Create a new task for the 3D game team.

**Parameters**

- `title` (string, required) – Short, actionable task title.
- `area` (string, required) – One of: `gameplay`, `level`, `art`, `tech`, `audio`, `ui`, `tools`.
- `project_id` (string, required) – Internal project identifier.
- `description` (string, optional) – Design/technical details, links, acceptance criteria.
- `priority` (string, optional) – `low`, `medium`, `high`, `blocker`.
- `due_date` (string, optional, ISO 8601).
- `assignee` (string, optional) – User id or handle.
- `labels` (array of string, optional).

**Behavior**

- Creates a task in the project management system.
- Returns `task_id` and canonical task data.

---

### `update_game_task`

Update a game task.

**Parameters**

- `task_id` (string, required).
- Any of: `title`, `status`, `priority`, `due_date`, `assignee`, `labels`, `area`, `description`.

**Behavior**

- Applies partial updates.
- Returns updated task summary.

---

### `list_game_tasks`

List tasks matching filters.

**Parameters**

- `project_id` (string, required).
- `status` (string, optional) – e.g. `todo`, `in_progress`, `review`, `done`.
- `area` (string, optional).
- `label` (string, optional).
- `due_before` (string, optional, ISO).
- `limit` (integer, optional, default 50).

**Behavior**

- Returns an array of lightweight task summaries for planning and status reports.

---

### `plan_game_sprint`

Create a sprint backlog for a fixed period.

**Parameters**

- `project_id` (string, required).
- `duration_days` (integer, required).
- `goals` (array of string, required) – High‑level sprint goals.
- `capacity_notes` (string, optional) – Team availability, constraints.

**Behavior**

- Creates a sprint object, attaches relevant tasks (or placeholders) and returns `sprint_id` plus initial task list.

---

## 2. Builds & Exports

Assumes engine build workers using headless/CLI export (e.g., Godot 4.x `--headless --export-release`).

### `run_game_build`

Trigger a game build on a worker.

**Parameters**

- `project_id` (string, required).
- `branch` (string, required).
- `platform` (string, required) – e.g. `windows`, `linux`, `mac`, `web`, `console_devkit`.
- `build_type` (string, required) – `debug` or `release`.
- `build_preset` (string, optional) – Engine export preset name or CI preset id.
- `notes` (string, optional) – Context for changelog.

**Behavior**

- Enqueues a build job.
- Returns `build_id`.

---

### `check_game_build_status`

Query build status and logs.

**Parameters**

- `build_id` (string, required).

**Behavior**

- Returns:
  - `status`: `queued`, `running`, `failed`, `succeeded`.
  - `summary`: short text.
  - `log_excerpt`: last N lines.
  - `artifacts`: list of artifact ids/URLs (installer, zip, symbols, etc.).

---

### `publish_playtest_build`

Mark a build as ready for playtest and distribute.

**Parameters**

- `project_id` (string, required).
- `build_id` (string, required).
- `channel` (string, required) – `internal`, `closed_beta`, `public_demo`.
- `notes` (string, optional) – Release notes.

**Behavior**

- Links build to the chosen channel, posts notifications, and returns distribution info.

---

## 3. Automated Testing & QA

### `run_game_tests`

Run automated tests (unit/integration/e2e) through headless engine or separate harness.

**Parameters**

- `project_id` (string, required).
- `branch` (string, required).
- `suite` (string, required) – `all`, `unit`, `integration`, `performance`, `smoke`.
- `target_platform` (string, optional).

**Behavior**

- Enqueues a test job on workers.
- Returns `test_run_id`.

---

### `check_test_results`

Get results of a test run.

**Parameters**

- `test_run_id` (string, required).

**Behavior**

- Returns:
  - `status`: `queued`, `running`, `failed`, `passed`, `partial`.
  - `summary`: passes/fails, key metrics.
  - `report_ids`: links to detailed reports (JUnit, HTML, etc.).
  - `log_excerpt`: short snippet of failing tests or stack traces.

---

### `triage_game_bug`

Turn logs + repro into actionable work.

**Parameters**

- `project_id` (string, required).
- `title` (string, required).
- `log_text` (string, required) – Crash log, stack trace, console output.
- `repro_steps` (string, optional).
- `severity` (string, required) – `low`, `medium`, `high`, `blocker`.
- `build_id` (string, optional).
- `area` (string, optional).

**Behavior**

- Creates one or more tasks (e.g., `tech` + `art`), links them to the build and test run if present.
- Returns created `task_ids` and a triage summary.

---

## 4. Assets, Levels & Performance

### `register_3d_asset`

Register/import a 3D asset into the game pipeline.

**Parameters**

- `project_id` (string, required).
- `asset_name` (string, required).
- `source_path` (string, required) – e.g. `art/characters/hero/hero_v03.fbx`.
- `category` (string, required) – `environment`, `character`, `prop`, `fx`, `vehicle`, `weapon`.
- `source_extension` (string, required) – e.g. `fbx`, `gltf`, `glb`, `blend`, `obj`.
- `target_extension` (string, optional) – e.g. `glb`, `tscn`.
- `usage_notes` (string, optional).

**Behavior**

- Records asset metadata and desired conversion.
- May trigger import/conversion scripts on workers.
- Returns `asset_id`.

---

### `convert_asset_format`

Batch‑convert assets between formats (e.g., FBX → GLTF).

**Parameters**

- `project_id` (string, required).
- `input_extension` (string, required).
- `output_extension` (string, required).
- `path_pattern` (string, required) – Glob or repo path pattern (e.g., `art/characters/**/*.fbx`).
- `options` (object, optional) – Tool‑specific flags (scale, axis, animation import, etc.).

**Behavior**

- Enqueues conversion jobs on workers.
- Returns `conversion_job_id` and later status/summary.

---

### `analyze_scene_performance`

Analyze scene complexity to guide optimization.

**Parameters**

- `project_id` (string, required).
- `scene_path` (string, required) – Engine‑relative path (e.g., `res://scenes/levels/level_01.tscn`).
- `platform` (string, optional).

**Behavior**

- Runs a worker job to collect stats (draw calls, mesh/tri counts, texture usage).
- Returns a raw metrics object and a summarized “hotspots” list.

---

### `bake_level_content`

Bake lighting, probes, navmesh, or similar offline steps via an automation scene.

**Parameters**

- `project_id` (string, required).
- `scene_path` (string, required).
- `bake_types` (array of string, required) – e.g. `["light", "navmesh", "occlusion"]`.

**Behavior**

- Enqueues a bake job, returns `bake_id` and later status/metrics.

---

## 5. Design & Documentation

### `generate_feature_spec`

Generate and store a lightweight feature spec / GDD section.

**Parameters**

- `project_id` (string, required).
- `feature_title` (string, required).
- `summary` (string, required) – Designer’s description.
- `constraints` (string, optional) – Platforms, budgets, deadlines.

**Behavior**

- Creates a spec document (template: overview, mechanics, UX, technical notes, acceptance criteria).
- Optionally auto‑creates `create_game_task` entries linked to this spec.
- Returns `spec_id` and any created `task_ids`.

---

### `summarize_playtest_feedback`

Condense raw playtest notes into insights and tasks.

**Parameters**

- `project_id` (string, required).
- `feedback_items` (array of string, required) – Individual notes or doc ids.
- `build_id` (string, optional).
- `segment` (string, optional) – Player segment or test type.

**Behavior**

- Groups issues by theme (controls, difficulty, UX, performance, bugs).
- Returns:
  - key problems and opportunities,
  - recommended changes,
  - optionally auto‑created `task_ids` for critical issues.

---

## 6. Git, CI & Collaboration

### `create_issue_from_game_task`

Mirror a task into the Git hosting platform.

**Parameters**

- `task_id` (string, required).
- `repo` (string, required).
- `labels` (array of string, optional).
- `include_logs` (boolean, optional, default false).

**Behavior**

- Creates an issue/ticket with links back to tasking.tech and relevant build/test info.
- Returns `issue_url` / `issue_id`.

---

### `summarize_pr_for_game_team`

Summarize a PR for designers, producers, and engineers.

**Parameters**

- `repo` (string, required).
- `pr_number` (integer, required).
- `project_id` (string, optional).

**Behavior**

- Fetches diff + comments via backend.
- Returns:
  - overview of changes,
  - risk areas (systems touched, potential regressions),
  - suggested test scenarios,
  - optionally links to updated tasks.

---

### `post_release_announcement`

Send a release note to team channels (Discord, Slack, etc.).

**Parameters**

- `project_id` (string, required).
- `build_id` (string, required).
- `channel_ids` (array of string, required).
- `audience` (string, optional) – `team`, `playtesters`, `public`.
- `extra_notes` (string, optional).

**Behavior**

- Formats and posts a short announcement with links to build + changelog.

---

## 7. Memory & Retrospectives

### `save_game_memory`

Store long‑term game context.

**Parameters**

- `project_id` (string, required).
- `summary` (string, required) – Stable fact or decision.
- `category` (string, required) – `goal`, `decision`, `pipeline`, `style`, `constraint`.

**Behavior**

- Writes to semantic memory store for retrieval in future sessions.

---

### `summarize_game_period`

Summarize work over a time window (e.g., “What did we do this week?”).

**Parameters**

- `project_id` (string, required).
- `start_date` (string, required, ISO).
- `end_date` (string, required, ISO).

**Behavior**

- Aggregates tasks, builds, tests, and game memories.
- Returns a structured summary grouped by area (gameplay, level, art, tech, etc.).

---

## 8. Agent Usage Guidelines

When using these skills, the agent should:

1. **Plan first, then act**  
   - For non‑trivial requests, outline a short plan, then call skills in sequence.

2. **Automate aggressively**  
   - Prefer skills over suggestions when possible (create tasks, trigger builds/tests, bake levels, convert assets).

3. **Keep humans in the loop on risk**  
   - Explain build/test failures or asset issues in plain language and propose specific fixes.

4. **Tie everything back to the project**  
   - Always supply `project_id` and link tasks/builds/tests/specs/assets where possible.

5. **Use memory for big decisions**  
   - Call `save_game_memory` when important constraints, goals, or decisions are made so future conversations stay aligned.

---
