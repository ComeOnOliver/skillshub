# Provided by TippyEntertainment
# https://github.com/tippyentertainment/skills.git


This skill is designed for use on the Tasking.tech agent platform (https://tasking.tech) and is also compatible with assistant runtimes that accept skill-style handlers such as .claude, .openai, and .mistral. Use this skill for both Claude code and Tasking.tech agent source.


# comfyui-video-generator

## Summary

Generate short AI video clips (shots) using ComfyUI. This skill turns text prompts (and optional reference images) into 3–8 second scenes that can be stitched into longer “AI movies”.

---

## When to Use

- The user asks for an **AI video**, **scene**, or **shot**.
- You are building a multi‑shot story or trailer and need per‑scene clips.
- You need b‑roll, promo visuals, or anime‑style sequences.

---

## Inputs to Collect

Ask the user for:

- **Scene description**  
  - Setting, characters/subjects, what happens in the shot.
- **Visual style**  
  - Anime, cinematic, painterly, realistic, cyberpunk, etc.
- **Duration target**  
  - Default 4–6 seconds; keep under ~200 frames per render.
- **Frame rate**  
  - Default 16–24 fps.
- **Resolution**  
  - Default 720p (1280×720); lower for tests.
- **Camera / motion (optional)**  
  - Static, slow zoom, pan, orbit, handheld, etc.
- **Reference images (optional)**  
  - URLs or file handles for style/character consistency.
- **Output format**  
  - MP4/WebM or frame sequence.

If the prompt is vague, ask 2–3 clarifying questions, then proceed with defaults.

---

## Expected Behavior

1. Normalize the request into structured parameters:
   - `prompt`, `negativePrompt`
   - `durationSeconds`, `fps`, `resolution`
   - `cameraStyle`, `referenceAssets`
2. Choose an appropriate ComfyUI workflow:
   - text‑to‑video, image‑to‑video, or ref‑guided loop.
3. Call the ComfyUI backend with those parameters.
4. Monitor for completion and collect:
   - Video file path/URL.
   - Metadata (seed, model, duration, fps, resolution).
5. Return a concise summary plus the link/file handle.

---

## Output Format (to the caller)

The skill should return a JSON‑like structure (or equivalent in your system) with at least:

- `description`: short human‑readable description of the clip.
- `videoUrl` or `videoPath`
- `durationSeconds`
- `fps`
- `resolution`: `{ width, height }`
- `seed` (if available)
- `modelInfo` (model names/versions used)

---

## Orchestration Notes

- This skill is typically called **first** in a pipeline:
  1. `comfyui-video-generator` → create shots.
  2. `comfyui-audio-creator` → create music/ambience for those shots.
  3. `comfyui-soundfx-creator` → create per‑event sound effects.

- Do NOT handle editing/muxing here; just generate the raw video asset and metadata.
