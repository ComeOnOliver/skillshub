# Blender 3D Modeling

## Overview

Create 3D geometry procedurally using Blender's Python API. Build meshes from vertices and faces, use bmesh for advanced editing, apply modifiers, generate curves, and create parametric or procedural models entirely from code.

## Instructions

### 1. Create a mesh from raw vertex data

```python
import bpy

vertices = [
    (-1, -1, 0), (1, -1, 0), (1, 1, 0), (-1, 1, 0),  # bottom
    (-1, -1, 2), (1, -1, 2), (1, 1, 2), (-1, 1, 2),   # top
]
faces = [
    (0, 1, 2, 3),  # bottom
    (4, 5, 6, 7),  # top
    (0, 1, 5, 4),  # front
    (2, 3, 7, 6),  # back
    (0, 3, 7, 4),  # left
    (1, 2, 6, 5),  # right
]

mesh = bpy.data.meshes.new("CustomBox")
mesh.from_pydata(vertices, [], faces)
mesh.update()

obj = bpy.data.objects.new("CustomBox", mesh)
bpy.context.collection.objects.link(obj)
```

`from_pydata(vertices, edges, faces)` is the primary way to build meshes. Pass empty lists `[]` for edges or faces if not needed.

### 2. Use bmesh for advanced mesh editing

```python
import bpy
import bmesh

# Create from scratch
bm = bmesh.new()

# Or edit an existing mesh
obj = bpy.context.active_object
bm = bmesh.new()
bm.from_mesh(obj.data)

# Add geometry
v1 = bm.verts.new((0, 0, 0))
v2 = bm.verts.new((1, 0, 0))
v3 = bm.verts.new((1, 1, 0))
v4 = bm.verts.new((0, 1, 0))
bm.faces.new((v1, v2, v3, v4))

# Common operations
bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])
bmesh.ops.translate(bm, vec=(0, 0, 1), verts=[v for v in bm.verts if v.select])
bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=2)

# Write back to mesh
bm.to_mesh(obj.data)
bm.free()
obj.data.update()
```

Always call `bm.free()` when done to release memory.

### 3. Apply modifiers programmatically

```python
import bpy

obj = bpy.context.active_object

# Subdivision Surface
sub = obj.modifiers.new(name="Subdivision", type='SUBSURF')
sub.levels = 2
sub.render_levels = 3

# Mirror
mirror = obj.modifiers.new(name="Mirror", type='MIRROR')
mirror.use_axis = (True, False, False)
mirror.use_clip = True

# Array
array = obj.modifiers.new(name="Array", type='ARRAY')
array.count = 5
array.relative_offset_displace = (1.1, 0, 0)

# Boolean
bool_mod = obj.modifiers.new(name="Boolean", type='BOOLEAN')
bool_mod.operation = 'DIFFERENCE'
bool_mod.object = bpy.data.objects["Cutter"]

# Solidify
solid = obj.modifiers.new(name="Solidify", type='SOLIDIFY')
solid.thickness = 0.1

# Bevel
bevel = obj.modifiers.new(name="Bevel", type='BEVEL')
bevel.width = 0.05
bevel.segments = 3

# Apply a modifier permanently
bpy.context.view_layer.objects.active = obj
bpy.ops.object.modifier_apply(modifier="Subdivision")
```

### 4. Create curves and surfaces

```python
import bpy
import math

# Create a bezier curve
curve_data = bpy.data.curves.new("MyCurve", type='CURVE')
curve_data.dimensions = '3D'
curve_data.resolution_u = 24

spline = curve_data.splines.new('BEZIER')
spline.bezier_points.add(3)  # 4 points total (1 default + 3 added)

coords = [(0, 0, 0), (1, 1, 0), (2, 0, 1), (3, 1, 1)]
for i, (x, y, z) in enumerate(coords):
    pt = spline.bezier_points[i]
    pt.co = (x, y, z)
    pt.handle_type_left = 'AUTO'
    pt.handle_type_right = 'AUTO'

# Add depth to make it a tube
curve_data.bevel_depth = 0.1
curve_data.bevel_resolution = 4

obj = bpy.data.objects.new("MyCurve", curve_data)
bpy.context.collection.objects.link(obj)

# Create a NURBS circle
bpy.ops.curve.primitive_nurbs_circle_add(radius=2)
circle = bpy.context.active_object
circle.data.bevel_depth = 0.05
```

### 5. Procedural generation patterns

**Grid of objects:**
```python
import bpy

rows, cols = 10, 10
spacing = 2.5

for i in range(rows):
    for j in range(cols):
        bpy.ops.mesh.primitive_cube_add(
            size=1,
            location=(i * spacing, j * spacing, 0)
        )
        obj = bpy.context.active_object
        obj.name = f"Grid_{i}_{j}"
```

**Circular array:**
```python
import bpy
import math

count = 12
radius = 5

for i in range(count):
    angle = (2 * math.pi * i) / count
    x = radius * math.cos(angle)
    y = radius * math.sin(angle)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.3, depth=2, location=(x, y, 0))
    obj = bpy.context.active_object
    obj.rotation_euler.z = angle
```

**Terrain from heightmap:**
```python
import bpy
import bmesh
import math
import random

size = 20
res = 50

bm = bmesh.new()
verts = []
for i in range(res):
    row = []
    for j in range(res):
        x = (i / res - 0.5) * size
        y = (j / res - 0.5) * size
        z = math.sin(x * 0.5) * math.cos(y * 0.5) * 2 + random.uniform(-0.2, 0.2)
        row.append(bm.verts.new((x, y, z)))
    verts.append(row)

for i in range(res - 1):
    for j in range(res - 1):
        bm.faces.new((verts[i][j], verts[i+1][j], verts[i+1][j+1], verts[i][j+1]))

mesh = bpy.data.meshes.new("Terrain")
bm.to_mesh(mesh)
bm.free()

obj = bpy.data.objects.new("Terrain", mesh)
bpy.context.collection.objects.link(obj)

# Smooth the terrain
sub = obj.modifiers.new("Smooth", 'SUBSURF')
sub.levels = 1
```

### 6. Assign materials to faces

```python
import bpy
import bmesh

obj = bpy.context.active_object

# Create materials
mat_red = bpy.data.materials.new("Red")
mat_red.diffuse_color = (1, 0, 0, 1)
mat_blue = bpy.data.materials.new("Blue")
mat_blue.diffuse_color = (0, 0, 1, 1)

obj.data.materials.append(mat_red)   # index 0
obj.data.materials.append(mat_blue)  # index 1

# Assign by face index
for i, poly in enumerate(obj.data.polygons):
    poly.material_index = 0 if i % 2 == 0 else 1
```

## Examples

### Example 1: Parametric staircase

**User request:** "Generate a spiral staircase with 20 steps"

```python
import bpy
import math

def create_spiral_staircase(steps=20, radius=3, height=6, step_width=1.5):
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    step_height = height / steps
    angle_per_step = (2 * math.pi) / steps

    for i in range(steps):
        angle = i * angle_per_step
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)
        z = i * step_height

        bpy.ops.mesh.primitive_cube_add(
            size=1,
            location=(x, y, z),
            scale=(step_width, 0.4, step_height * 0.8)
        )
        step = bpy.context.active_object
        step.rotation_euler.z = angle
        step.name = f"Step_{i+1:02d}"

    # Add central column
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.2, depth=height, location=(0, 0, height / 2)
    )
    bpy.context.active_object.name = "CentralColumn"

create_spiral_staircase(steps=20)
bpy.ops.wm.save_as_mainfile(filepath="/tmp/staircase.blend")
```

### Example 2: Honeycomb panel

**User request:** "Create a flat honeycomb pattern panel"

```python
import bpy
import bmesh
import math

def create_hexagon(bm, cx, cy, radius):
    verts = []
    for i in range(6):
        angle = math.radians(60 * i + 30)
        x = cx + radius * math.cos(angle)
        y = cy + radius * math.sin(angle)
        verts.append(bm.verts.new((x, y, 0)))
    bm.faces.new(verts)

radius = 0.5
rows, cols = 8, 10
bm = bmesh.new()

for row in range(rows):
    for col in range(cols):
        cx = col * radius * 1.75
        cy = row * radius * 1.52
        if col % 2 == 1:
            cy += radius * 0.76
        create_hexagon(bm, cx, cy, radius * 0.9)

mesh = bpy.data.meshes.new("Honeycomb")
bm.to_mesh(mesh)
bm.free()

obj = bpy.data.objects.new("Honeycomb", mesh)
bpy.context.collection.objects.link(obj)

# Add thickness
solid = obj.modifiers.new("Solidify", 'SOLIDIFY')
solid.thickness = 0.1
```

## Guidelines

- Use `from_pydata()` for simple static meshes. Use `bmesh` when you need to build geometry with operations like extrude, subdivide, or per-face manipulation.
- Always call `mesh.update()` after `from_pydata()` and `bm.free()` after bmesh operations.
- When applying modifiers via `bpy.ops.object.modifier_apply()`, ensure the object is active and selected.
- For large procedural meshes (10k+ faces), prefer bmesh over repeated `bpy.ops` calls — it's significantly faster since operators have per-call overhead.
- Link new objects to a collection with `bpy.context.collection.objects.link(obj)` — objects not linked to any collection won't appear in the scene.
- Blender uses Z-up coordinate system. Keep this in mind when importing from Y-up systems (most game engines).
- For smooth shading: `bpy.ops.object.shade_smooth()` or set per-face `polygon.use_smooth = True`.
- Test procedural scripts with small counts first, then scale up. A 100x100 grid with subdivision modifiers can freeze Blender.
