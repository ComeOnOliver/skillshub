# Three.js

## Overview

Three.js is a JavaScript library for creating interactive 3D graphics in the browser using WebGL. It provides a scene graph, PBR materials, lighting systems, model loaders (glTF, FBX), and performance tools like instanced rendering. React Three Fiber offers a declarative React integration with automatic resource management and Suspense-based loading.

## Instructions

- When setting up a scene, create a `Scene`, `PerspectiveCamera` (or `OrthographicCamera`), and `WebGLRenderer`, adding `OrbitControls` for mouse/touch interaction and configuring anti-aliasing and tone mapping for production quality.
- When creating objects, combine geometries (box, sphere, plane, or custom `BufferGeometry`) with materials (`MeshStandardMaterial` for PBR, `MeshPhysicalMaterial` for advanced effects) and apply texture maps for diffuse, normal, roughness, and metalness.
- When loading 3D models, use `GLTFLoader` for glTF/GLB files (the preferred web format), enable Draco compression for models over 1MB, and use KTX2 textures for GPU-compressed formats.
- When building lighting, combine ambient, directional, point, and spot lights with environment maps (HDR) for image-based lighting, and enable shadow maps on lights and meshes that need them.
- When optimizing performance, use `InstancedMesh` for rendering 100+ identical objects, merge static geometries, implement LOD for distance-based detail levels, and dispose resources manually when removing objects.
- When using React, prefer React Three Fiber with `@react-three/drei` helpers (OrbitControls, Environment, useGLTF) and `@react-three/postprocessing` for effects like bloom and SSAO.

## Examples

### Example 1: Build a 3D product configurator

**User request:** "Create a 3D product viewer where users can change colors and rotate the model"

**Actions:**
1. Load the product model with `useGLTF()` in React Three Fiber with Draco compression
2. Set up `OrbitControls` for rotation and zoom, with camera animation on option change
3. Create material swapping logic that updates `MeshStandardMaterial` color and roughness
4. Add environment lighting with an HDR map and contact shadows for realism

**Output:** An interactive 3D product configurator with color options, smooth rotation, and realistic lighting.

### Example 2: Create an animated data globe

**User request:** "Visualize global data points on an interactive 3D globe"

**Actions:**
1. Create a sphere geometry with an earth texture and atmosphere shader
2. Plot data points using `InstancedMesh` with thousands of small spheres at geographic coordinates
3. Add arc connections between points using `TubeGeometry` with animated dash offsets
4. Implement auto-rotation with mouse-override orbit controls

**Output:** A 3D globe with data point markers, animated connection arcs, and interactive rotation.

## Guidelines

- Use glTF/GLB format for all 3D models since it is the most efficient and widely supported web format.
- Enable Draco compression for models over 1MB to reduce file size significantly.
- Use `InstancedMesh` when rendering more than 100 identical objects for massive performance gains.
- Set `antialias: true` and `toneMapping: ACESFilmicToneMapping` for production visual quality.
- Use React Three Fiber for React apps for declarative scene management and automatic disposal.
- Dispose resources manually when removing objects: `geometry.dispose()`, `material.dispose()`, `texture.dispose()`.
- Test on mobile devices and reduce shadow resolution, pixel ratio, and material complexity for low-end GPUs.
