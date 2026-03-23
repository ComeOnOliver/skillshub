# Blender Scripting

## Overview

Automate Blender tasks using Python and the `bpy` API. Run scripts headlessly from the terminal to manipulate scenes, batch process files, import/export models, and build 3D pipelines without opening the GUI.

## Instructions

### 1. Run a Blender script from the terminal

```bash
# Run a script in background mode (no GUI)
blender --background --python script.py

# Run with a specific .blend file
blender myfile.blend --background --python script.py

# Pass custom arguments (use -- to separate Blender args from script args)
blender --background --python script.py -- --output /tmp/result.png --scale 2.0
```

Parse custom arguments in the script:

```python
import sys

argv = sys.argv
# Everything after "--" is a custom argument
if "--" in argv:
    custom_args = argv[argv.index("--") + 1:]
else:
    custom_args = []
```

### 2. Understand the bpy module structure

```python
import bpy

# bpy.data — all data in the file (meshes, materials, objects, scenes)
bpy.data.objects["Cube"]
bpy.data.meshes["Cube"]
bpy.data.materials["Material"]

# bpy.context — current state (active object, selected objects, scene)
bpy.context.active_object
bpy.context.selected_objects
bpy.context.scene

# bpy.ops — operators (actions like add, delete, transform)
bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 0))
bpy.ops.object.delete()
```

### 3. Scene setup and cleanup

```python
import bpy

def clear_scene():
    """Remove all objects from the scene."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    # Also clear orphan data
    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        if block.users == 0:
            bpy.data.materials.remove(block)

def setup_scene():
    """Set up a clean scene with basic settings."""
    clear_scene()
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0
```

### 4. Create and transform objects

```python
import bpy
from mathutils import Vector, Euler
import math

# Add primitives
bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 0))
cube = bpy.context.active_object
cube.name = "MyCube"

# Transform
cube.location = (3, 0, 1)
cube.rotation_euler = (0, 0, math.radians(45))
cube.scale = (1, 2, 0.5)

# Duplicate
bpy.ops.object.duplicate(linked=False)
duplicate = bpy.context.active_object
duplicate.location.x += 5

# Parent objects
child = bpy.data.objects["ChildObj"]
parent = bpy.data.objects["ParentObj"]
child.parent = parent
```

### 5. Import and export 3D files

```python
import bpy

# Import
bpy.ops.wm.obj_import(filepath="/path/to/model.obj")
bpy.ops.import_scene.fbx(filepath="/path/to/model.fbx")
bpy.ops.import_scene.gltf(filepath="/path/to/model.glb")
bpy.ops.wm.stl_import(filepath="/path/to/model.stl")

# Export
bpy.ops.wm.obj_export(filepath="/path/to/output.obj")
bpy.ops.export_scene.fbx(filepath="/path/to/output.fbx", use_selection=True)
bpy.ops.export_scene.gltf(filepath="/path/to/output.glb", export_format='GLB')
bpy.ops.wm.stl_export(filepath="/path/to/output.stl")
```

### 6. Batch process .blend files

```python
import bpy
import glob
import os

blend_files = glob.glob("/path/to/projects/*.blend")

for filepath in blend_files:
    bpy.ops.wm.open_mainfile(filepath=filepath)

    # Do work on each file
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            print(f"  Mesh: {obj.name}, verts: {len(obj.data.vertices)}")

    # Save modified file
    output = filepath.replace(".blend", "_processed.blend")
    bpy.ops.wm.save_as_mainfile(filepath=output)
    print(f"Saved: {output}")
```

### 7. Work with custom properties

```python
import bpy

obj = bpy.context.active_object

# Set custom properties
obj["my_property"] = 42
obj["tags"] = "hero,main"

# Read custom properties
value = obj.get("my_property", 0)

# Iterate all custom properties
for key, value in obj.items():
    if key not in {"_RNA_UI"}:
        print(f"{key}: {value}")
```

## Examples

### Example 1: Export all objects as separate OBJ files

**User request:** "Export every mesh object in my .blend file as a separate OBJ"

```python
import bpy
import os

output_dir = "/tmp/exports"
os.makedirs(output_dir, exist_ok=True)

bpy.ops.object.select_all(action='DESELECT')

for obj in bpy.data.objects:
    if obj.type == 'MESH':
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        filepath = os.path.join(output_dir, f"{obj.name}.obj")
        bpy.ops.wm.obj_export(filepath=filepath, export_selected_objects=True)
        print(f"Exported: {filepath}")
```

Run: `blender scene.blend --background --python export_all.py`

### Example 2: Batch rename objects by type

**User request:** "Rename all mesh objects to mesh_001, mesh_002, etc. and all lights to light_001, etc."

```python
import bpy

counters = {}

for obj in sorted(bpy.data.objects, key=lambda o: o.name):
    prefix = obj.type.lower()
    counters[prefix] = counters.get(prefix, 0) + 1
    obj.name = f"{prefix}_{counters[prefix]:03d}"
    print(f"Renamed to: {obj.name}")

bpy.ops.wm.save_mainfile()
```

### Example 3: Scene statistics report

**User request:** "Give me a summary of what's in this .blend file"

```python
import bpy

print("=== Scene Report ===")
print(f"Objects: {len(bpy.data.objects)}")
print(f"Meshes: {len(bpy.data.meshes)}")
print(f"Materials: {len(bpy.data.materials)}")
print(f"Textures: {len(bpy.data.images)}")
print(f"Scenes: {len(bpy.data.scenes)}")
print(f"Collections: {len(bpy.data.collections)}")

total_verts = sum(len(m.vertices) for m in bpy.data.meshes)
total_faces = sum(len(m.polygons) for m in bpy.data.meshes)
print(f"Total vertices: {total_verts:,}")
print(f"Total faces: {total_faces:,}")

for obj in bpy.data.objects:
    info = f"  {obj.name} ({obj.type})"
    if obj.type == 'MESH':
        info += f" — {len(obj.data.vertices)} verts"
    print(info)
```

## Guidelines

- Always use `--background` when running scripts from the terminal to avoid opening the GUI.
- Start scripts with `clear_scene()` if building a scene from scratch to avoid leftover default objects.
- Use `bpy.data` for direct data access (fast, reliable). Use `bpy.ops` for complex operations that mirror user actions (operators require correct context).
- When using operators, ensure the correct object is active and selected: `bpy.context.view_layer.objects.active = obj` and `obj.select_set(True)`.
- For batch processing, always save to a new file (not overwrite originals) unless the user explicitly requests in-place modification.
- Import/export operator names vary between Blender versions. The ones listed here work for Blender 3.6+. For older versions, check `dir(bpy.ops.import_scene)`.
- Use `mathutils` for vector math, quaternions, and matrix operations — it's bundled with Blender's Python.
- To debug, use `print()` statements — output goes to the terminal when running with `--background`.
