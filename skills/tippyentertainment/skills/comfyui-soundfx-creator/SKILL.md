# Provided by TippyEntertainment
# https://github.com/tippyentertainment/skills.git


This skill is designed for use on the Tasking.tech agent platform (https://tasking.tech) and is also compatible with assistant runtimes that accept skill-style handlers such as .claude, .openai, and .mistral. Use this skill for both Claude code and Tasking.tech agent source.


# comfyui-soundfx-creator

## Summary

Generate short sound effects (SFX) that sync with moments in the video, using ComfyUI‑driven audio workflows or connected SFX models.

---

## When to Use

- After scenes and base audio exist, and the user wants **moment‑specific sound effects**.
- The user requests sounds like “robot booting up”, “sword slash”, “UI click”, “magic spell”, etc.
- You are enriching AI‑generated clips with interaction and impact.

---

## Inputs to Collect

Ask the user (or previous skills) for:

- **SFX description**
  - What happens (event) and how it should feel (timbre/mood).
- **Target timing**
  - Approximate timestamp(s) in a given video clip (e.g., `clipId` + seconds).
- **Duration**
  - Usually 0.2–2 seconds; up to 5–10 seconds for stingers or sweeps.
- **Usage context**
  - Game/UI/film/trailer/website, etc.
- **Tone / timbre**
  - Soft / hard, metallic / organic, digital / analog, retro / modern.
- **Format & sample rate**
  - Default: WAV, 44.1 kHz or 48 kHz, mono or stereo.

---

## Expected Behavior

1. Normalize the request to SFX parameters:
   - `eventDescription`, `durationSeconds`, `intensity`, `timbre`, `targetClip`, `timecode`.
2. Choose or build an SFX generation workflow:
   - Text‑to‑audio SFX model, synthesis chains, or layering of primitives.
3. Generate one or more SFX variants.
4. For each variant, collect:
   - `audioUrl` / `audioPath`
   - `durationSeconds`
   - `format`, `sampleRate`, `channels`
5. Optionally suggest which variant best fits the described moment.
6. Return a concise list of SFX assets plus their metadata.

---

## Output Format (to the caller)

Return a structure such as:

- `effects`: array of:
  - `name`
  - `description`
  - `audioUrl` or `audioPath`
  - `durationSeconds`
  - `format`
  - `sampleRate`
  - `channels`
  - `targetClipId` (if provided)
  - `timecode` (if provided)

---

## Orchestration Notes

Typical pipeline:

1. Use `comfyui-video-generator` to create scenes.  
2. Use `comfyui-audio-creator` to generate music/ambience.  
3. Use `comfyui-soundfx-creator` to add moment‑specific SFX for key beats.

This skill does not perform final mixing; it only produces clean SFX assets and metadata so a separate mixer/editor can place them accurately on the timeline.