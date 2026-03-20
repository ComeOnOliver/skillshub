# ShaderGraph Editor

## Description and Goals

This skill provides guidance for the Apple-documented Shader Graph workflow: author materials in Reality Composer Pro, load them with `ShaderGraphMaterial`, and update promoted inputs at runtime. It also covers how to inspect exported USD and MaterialX when you need advanced debugging or interoperability, but raw `.usda` editing is not the default authoring path.

### Goals

- Enable developers to create RealityKit materials with Shader Graph in Reality Composer Pro
- Guide loading and runtime control of `ShaderGraphMaterial`
- Help troubleshoot material graphs, promoted inputs, and exported assets
- Support advanced USD and MaterialX inspection without treating it as the primary workflow
- Point to repo samples when they provide a close starting point

## What This Skill Should Do

When working with Shader Graph materials, this skill should:

1. **Default to Reality Composer Pro** - Treat the Shader Graph editor as the main authoring workflow.
2. **Guide node selection** - Help choose the correct RealityKit surface, geometry, texture, and math nodes for the effect.
3. **Explain runtime integration** - Show how promoted inputs map to `ShaderGraphMaterial` parameters.
4. **Troubleshoot exports** - Inspect exported USD and MaterialX only when debugging, interop, or asset review requires it.
5. **Cross-link appropriately** - Defer raw USD structure edits to `usd-editor` when the task is really about prims, composition, or text-level USD authoring.
6. **Prefer sample graphs when available** - If the requested effect matches an example in `samples/`, start from that file and point the user to it.

Load the appropriate reference file from the tables below for detailed usage, code examples, and best practices.

### Quick Start Workflow

Before building a new effect from scratch, check `samples/` for a close match and adapt it.

1. Create or open the material in Reality Composer Pro's Shader Graph editor.
2. Choose the appropriate RealityKit surface node and add the graph nodes needed for the effect.
3. Promote the inputs you expect to change at runtime.
4. Save the material in the Reality Composer Pro asset package that ships with the app.
5. Load the material with `ShaderGraphMaterial` at runtime.
6. Update promoted inputs with runtime parameter APIs when the experience needs dynamic control.
7. Inspect exported USD and MaterialX only when you need to debug the authored graph or interoperate with other asset tooling.

## Information About the Skill

### Core Concepts

#### Material Prim

Reality Composer Pro exports Shader Graph materials into USD-based assets, but the material should be authored in the Shader Graph editor rather than hand-written as text by default.

#### Shader Graph Authoring

Shader Graph materials are composed visually in Reality Composer Pro. Use RealityKit-specific nodes such as the surface and geometry modifier nodes that Apple documents for Shader Graph.

#### Promoted Inputs and Runtime Control

Promoted inputs let the app change material parameters after loading the material. This is the main Apple-supported workflow for runtime customization.

#### Exported USD and MaterialX

Exported assets may contain USD and MaterialX representations of the graph. Treat those files as implementation artifacts for debugging or interop, not as the primary authoring surface.

#### Samples and Interop Boundaries

The samples in this repo are useful starting points, but they are repo-owned examples. Do not treat raw exported `info:id` strings or USD graph structure as stable Apple API unless Apple documents them directly.

### Reference Files

| Reference | When to Use |
|-----------|-------------|
| [`REFERENCE.MD`](references/REFERENCE.MD) | When looking for ShaderGraph node and material reference guide. |

### Samples (Common Effects)

This repo includes common ShaderGraph examples in `samples/`. When a user asks for a specific visual effect, **start by selecting the closest sample** and tell them to open it so you can align on the exact look and parameters.

- [`samples/ShaderSamplesScene.usda`](samples/ShaderSamplesScene.usda) — A single scene that references the other samples for quick preview/inspection.
- [`samples/OutlineShader.usda`](samples/OutlineShader.usda) — Mesh outline via duplicated mesh + vertex expansion (geometry modifier) and `cullMode = "front"`.
- [`samples/FresnelShader.usda`](samples/FresnelShader.usda) — Fresnel/rim glow (emissive) with tunable color and falloff.
- [`samples/GradientShader.usda`](samples/GradientShader.usda) — Near/far color gradient driven by camera distance.
- [`samples/LavaShader.usda`](samples/LavaShader.usda) — Animated lava emissive using 3D noise + time.
- [`samples/DissolveShader.usda`](samples/DissolveShader.usda) — Animated dissolve with noise threshold and emissive edge.
- [`samples/VertexDisplacementShader.usda`](samples/VertexDisplacementShader.usda) — Animated vertex displacement using `outputs:realitykit:vertex` (geometry modifier).
- [`samples/NormalCorrectionShader.usda`](samples/NormalCorrectionShader.usda) — Vertex displacement with corrected normals for cleaner lighting.
- [`samples/ToonShader.usda`](samples/ToonShader.usda) — Toon shading using diffuse/specular ramp textures.
- [`samples/PBRToonShader.usda`](samples/PBRToonShader.usda) — PBR-to-toon node graph (banding/quantization) applied to an existing material graph.

Some samples reference external assets (for example ramp textures or a referenced `.usdz`). When copying a sample into your project, keep or update those asset paths as needed.

### Implementation Patterns

#### Recommended Authoring Flow

- Start with a Shader Graph material in Reality Composer Pro.
- Use Apple-documented RealityKit Shader Graph nodes such as the surface nodes and geometry modifier nodes for the effect you need.
- Promote any inputs that must change at runtime.
- Load the material in app code with `ShaderGraphMaterial`.
- Change promoted values at runtime rather than editing exported USD directly.

#### When Raw USD Review Is Appropriate

- Inspect exported files when a material fails to load or render as expected.
- Compare repo samples to an exported asset when debugging a graph translation issue.
- Hand off prim-level edits to `usd-editor` when the task is really about USD structure, paths, or composition.

### Pitfalls and Checks

- Do not present `UsdPreviewSurface` networks as equivalent to Reality Composer Pro Shader Graph materials.
- Do not rely on undocumented exported `info:id` strings as stable Apple API.
- Prefer promoted inputs and runtime parameter updates over raw text edits when the app needs dynamic control.
- Use `usd-editor` for prim paths, composition arcs, or other text-level USD authoring tasks.
- Treat the samples as repo examples, not as an exhaustive Apple-backed schema reference.