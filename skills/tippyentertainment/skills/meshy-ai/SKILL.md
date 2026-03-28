---
target: https://meshy.ai
name: meshy-ai
description: >
  Use the Meshy.ai REST API to generate 3D assets from text or images and download the resulting OBJ/MTL and preview renders. Supports: (1) text-to-3D and (2) image-to-3D. Handles async task polling. Requires MESHY_API_KEY in the environment.
tags:
  - 3d
  - assets
  - meshy
  - text-to-3d
  - image-to-3d
requires_credentials:
  - MESHY_API_KEY
---
---

# Meshy.ai Skill

---

# Provided by TippyEntertainment
# https://github.com/tippyentertainment/skills.git
Generate 3D models via Meshy.ai and save outputs for the current task.

## Capabilities

- Create **text-to-3D** tasks from a prompt.
- Create **image-to-3D** tasks from an image URL.
- Poll async task status until `SUCCEEDED` or `FAILED`.
- Download resulting 3D assets (OBJ/MTL) and preview images into a task-scoped folder.

## Inputs

- `mode`: `"text-to-3d"` | `"image-to-3d"`.
- For `text-to-3d`:
  - `prompt` (string, required).
  - `art_style` (string, optional; e.g., `"realistic"`, `"cartoon"`, `"lowpoly"`).
  - `should_remesh` (boolean, optional).
- For `image-to-3d`:
  - `image_url` (string, required; public URL or data URI).
  - `model_type` (optional; `"standard"` | `"lowpoly"`).
  - `should_texture`, `should_remesh` (booleans, optional).

## Outputs

- Meshy task id.
- Final task status.
- Local paths or URLs of downloaded OBJ/MTL and preview images.
