# Blender Grease Pencil

## Overview

Create 2D drawings and animations in Blender's 3D space using the Grease Pencil system and Python. Build strokes from point data, manage layers and frames, apply GP-specific modifiers, and animate 2D content — all scriptable from the terminal.

## Instructions

### 1. Create a Grease Pencil object

```python
import bpy

# Create a new Grease Pencil data block and object
gp_data = bpy.data.grease_pencils.new("MyDrawing")
gp_obj = bpy.data.objects.new("MyDrawing", gp_data)
bpy.context.collection.objects.link(gp_obj)

# Or use the operator
bpy.ops.object.gpencil_add(type='EMPTY')  # EMPTY, STROKE, MONKEY, SCENE, COLLECTION
gp_obj = bpy.context.active_object
```

Types for `gpencil_add`: `EMPTY` (blank), `STROKE` (single stroke), `MONKEY` (Suzanne in 2D), `SCENE` (draw over scene), `COLLECTION` (from collection).

### 2. Add layers and frames

```python
import bpy

gp_data = bpy.context.active_object.data

# Create a layer
layer = gp_data.layers.new("Outlines", set_active=True)
layer.info = "Outlines"
layer.blend_mode = 'REGULAR'  # REGULAR, OVERLAY, ADD, SUBTRACT, MULTIPLY
layer.opacity = 1.0
layer.use_lights = False

# Create a keyframe on the layer at a specific frame
frame = layer.frames.new(frame_number=1)

# Additional layers for organization
color_layer = gp_data.layers.new("Colors", set_active=False)
color_frame = color_layer.frames.new(frame_number=1)
```

### 3. Draw strokes programmatically

```python
import bpy

gp_obj = bpy.context.active_object
gp_data = gp_obj.data
layer = gp_data.layers.active
frame = layer.frames[0]  # or layer.active_frame

# Create a stroke
stroke = frame.strokes.new()
stroke.display_mode = '3DSPACE'  # 3DSPACE, 2DSPACE, 2DIMAGE, SCREEN
stroke.line_width = 10

# Add points to the stroke
num_points = 5
stroke.points.add(num_points)

coords = [(0, 0, 0), (1, 0.5, 0), (2, 1, 0), (3, 0.5, 0), (4, 0, 0)]
for i, (x, y, z) in enumerate(coords):
    stroke.points[i].co = (x, y, z)
    stroke.points[i].pressure = 1.0      # pen pressure (0.0 - 1.0)
    stroke.points[i].strength = 1.0      # color strength (0.0 - 1.0)

# Assign material index to stroke
stroke.material_index = 0
```

### 4. Create GP materials

```python
import bpy

gp_obj = bpy.context.active_object

# Solid fill material
mat_solid = bpy.data.materials.new("GP_Solid")
bpy.data.materials.create_gpencil_data(mat_solid)
mat_solid.grease_pencil.color = (0.1, 0.1, 0.1, 1.0)       # stroke color
mat_solid.grease_pencil.fill_color = (0.8, 0.2, 0.2, 1.0)  # fill color
mat_solid.grease_pencil.show_fill = True
mat_solid.grease_pencil.show_stroke = True
gp_obj.data.materials.append(mat_solid)

# Line-only material
mat_line = bpy.data.materials.new("GP_Line")
bpy.data.materials.create_gpencil_data(mat_line)
mat_line.grease_pencil.color = (0.0, 0.0, 0.0, 1.0)
mat_line.grease_pencil.show_fill = False
mat_line.grease_pencil.show_stroke = True
gp_obj.data.materials.append(mat_line)
```

### 5. Apply Grease Pencil modifiers

```python
import bpy

gp_obj = bpy.context.active_object

# Thickness modifier
thick = gp_obj.grease_pencil_modifiers.new("Thickness", 'GP_THICK')
thick.thickness_factor = 1.5

# Smooth modifier
smooth = gp_obj.grease_pencil_modifiers.new("Smooth", 'GP_SMOOTH')
smooth.factor = 0.5
smooth.step = 3

# Tint modifier (color shift)
tint = gp_obj.grease_pencil_modifiers.new("Tint", 'GP_TINT')
tint.color = (0.2, 0.5, 1.0)
tint.factor = 0.3

# Noise modifier (hand-drawn look)
noise = gp_obj.grease_pencil_modifiers.new("Noise", 'GP_NOISE')
noise.factor = 0.5

# Subdivide modifier (smoother curves)
subdiv = gp_obj.grease_pencil_modifiers.new("Subdivide", 'GP_SUBDIV')
subdiv.level = 2

# Build modifier (animated reveal)
build = gp_obj.grease_pencil_modifiers.new("Build", 'GP_BUILD')
build.mode = 'SEQUENTIAL'  # SEQUENTIAL, CONCURRENT, ADDITIVE
build.start_frame = 1
build.length = 50

# Array modifier (repeat strokes)
array = gp_obj.grease_pencil_modifiers.new("Array", 'GP_ARRAY')
array.count = 5
array.offset = (1.0, 0.0, 0.0)
```

### 6. Animate Grease Pencil frame by frame

```python
import bpy
import math

gp_obj = bpy.context.active_object
gp_data = gp_obj.data
layer = gp_data.layers.active

total_frames = 24

for f in range(total_frames):
    frame = layer.frames.new(frame_number=f + 1)

    stroke = frame.strokes.new()
    stroke.display_mode = '3DSPACE'
    stroke.line_width = 8

    # Animate a circle that grows
    num_points = 32
    stroke.points.add(num_points)
    radius = 0.5 + (f / total_frames) * 2.0

    for i in range(num_points):
        angle = (2 * math.pi * i) / num_points
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)
        stroke.points[i].co = (x, y, 0)
        stroke.points[i].pressure = 1.0
        stroke.points[i].strength = 1.0

# Set playback range
bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end = total_frames
```

### 7. Configure drawing guides

```python
import bpy

# Guides are properties on the scene's tool settings
ts = bpy.context.scene.tool_settings
gp_settings = ts.gpencil_sculpt

# Access guide settings (when in Draw mode)
guide = ts.gpencil_stroke_placement_view3d

# Guide types are set via the tool settings
# Circular — concentric rings from reference point
# Radial — rays extending from reference point
# Parallel — constrained parallel lines
# Grid — horizontal/vertical grid lines
# Isometric — isometric angle constraints

# Note: Guides are interactive Draw mode features.
# For programmatic geometry, compute constrained points directly:
import math

def snap_to_grid(point, spacing=1.0):
    return tuple(round(c / spacing) * spacing for c in point)

def snap_to_radial(point, center=(0, 0, 0), num_rays=8):
    dx, dy = point[0] - center[0], point[1] - center[1]
    angle = math.atan2(dy, dx)
    snap_angle = round(angle / (2 * math.pi / num_rays)) * (2 * math.pi / num_rays)
    dist = math.sqrt(dx**2 + dy**2)
    return (center[0] + dist * math.cos(snap_angle),
            center[1] + dist * math.sin(snap_angle),
            point[2])
```

## Examples

### Example 1: Procedural comic panel with text

**User request:** "Create a simple comic panel layout with borders and speech bubble"

```python
import bpy
import math

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

clear_scene()

# Create GP object
gp_data = bpy.data.grease_pencils.new("ComicPanel")
gp_obj = bpy.data.objects.new("ComicPanel", gp_data)
bpy.context.collection.objects.link(gp_obj)

# Materials
mat_black = bpy.data.materials.new("GP_Black")
bpy.data.materials.create_gpencil_data(mat_black)
mat_black.grease_pencil.color = (0, 0, 0, 1)
mat_black.grease_pencil.show_fill = False
gp_obj.data.materials.append(mat_black)

mat_bubble = bpy.data.materials.new("GP_Bubble")
bpy.data.materials.create_gpencil_data(mat_bubble)
mat_bubble.grease_pencil.color = (0, 0, 0, 1)
mat_bubble.grease_pencil.fill_color = (1, 1, 1, 1)
mat_bubble.grease_pencil.show_fill = True
gp_obj.data.materials.append(mat_bubble)

# Panel border layer
border_layer = gp_data.layers.new("Borders")
border_frame = border_layer.frames.new(frame_number=1)

def draw_rect(frame, x, y, w, h, mat_idx=0, width=12):
    stroke = frame.strokes.new()
    stroke.display_mode = '3DSPACE'
    stroke.line_width = width
    stroke.material_index = mat_idx
    stroke.points.add(5)
    corners = [(x, y, 0), (x+w, y, 0), (x+w, y+h, 0), (x, y+h, 0), (x, y, 0)]
    for i, co in enumerate(corners):
        stroke.points[i].co = co
        stroke.points[i].pressure = 1.0
        stroke.points[i].strength = 1.0

# Outer border
draw_rect(border_frame, 0, 0, 6, 4)
# Inner panels (2 panels side by side)
draw_rect(border_frame, 0.2, 0.2, 2.7, 3.6)
draw_rect(border_frame, 3.1, 0.2, 2.7, 3.6)

# Speech bubble layer
bubble_layer = gp_data.layers.new("Bubbles")
bubble_frame = bubble_layer.frames.new(frame_number=1)

stroke = bubble_frame.strokes.new()
stroke.display_mode = '3DSPACE'
stroke.line_width = 6
stroke.material_index = 1
num_pts = 24
stroke.points.add(num_pts)
cx, cy, rx, ry = 4.5, 3.0, 0.8, 0.4
for i in range(num_pts):
    angle = (2 * math.pi * i) / num_pts
    stroke.points[i].co = (cx + rx * math.cos(angle), cy + ry * math.sin(angle), 0)
    stroke.points[i].pressure = 1.0
    stroke.points[i].strength = 1.0

bpy.ops.wm.save_as_mainfile(filepath="/tmp/comic_panel.blend")
```

### Example 2: Animated handwriting effect

**User request:** "Create an animation that draws text stroke by stroke like handwriting"

```python
import bpy

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

clear_scene()

bpy.ops.object.gpencil_add(type='EMPTY')
gp_obj = bpy.context.active_object
gp_data = gp_obj.data

# Material
mat = bpy.data.materials.new("GP_Ink")
bpy.data.materials.create_gpencil_data(mat)
mat.grease_pencil.color = (0.05, 0.05, 0.15, 1)
gp_data.materials.append(mat)

layer = gp_data.layers.active
frame = layer.frames.new(frame_number=1) if not layer.frames else layer.frames[0]

# Define letter paths as point sequences (simplified "HI")
letters = {
    'H': [(0,0,0),(0,2,0),(0,1,0),(1,1,0),(1,2,0),(1,0,0)],
    'I': [(2.5,2,0),(2.5,0,0)],
}

for letter, points in letters.items():
    stroke = frame.strokes.new()
    stroke.display_mode = '3DSPACE'
    stroke.line_width = 10
    stroke.material_index = 0
    stroke.points.add(len(points))
    for i, co in enumerate(points):
        stroke.points[i].co = co
        stroke.points[i].pressure = 1.0
        stroke.points[i].strength = 1.0

# Add Build modifier for animated reveal
build = gp_obj.grease_pencil_modifiers.new("Build", 'GP_BUILD')
build.mode = 'SEQUENTIAL'
build.start_frame = 1
build.length = 60

bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end = 60

bpy.ops.wm.save_as_mainfile(filepath="/tmp/handwriting.blend")
```

## Guidelines

- Use `bpy.data.grease_pencils.new()` for data-level creation. Use `bpy.ops.object.gpencil_add()` for quick object creation with defaults.
- Always create at least one material and assign it before rendering — GP objects without materials render invisible.
- Stroke `display_mode` controls coordinate space: `3DSPACE` for world-space strokes, `2DSPACE` for screen-relative. Use `3DSPACE` for most scripted workflows.
- The `pressure` property on points controls line thickness variation. Set to 1.0 for uniform width, vary between 0.0-1.0 for pen-like tapering.
- GP modifiers use `grease_pencil_modifiers` (not `modifiers`). Type constants are prefixed with `GP_` (e.g., `GP_THICK`, `GP_SMOOTH`).
- For frame-by-frame animation, create separate `layer.frames.new(frame_number=N)` entries. Each frame holds independent strokes.
- The Build modifier is the easiest way to animate stroke reveal without per-frame scripting.
- Grease Pencil objects support the same transform operations as mesh objects (location, rotation, scale, parenting, constraints).
- For complex 2D art, organize content across multiple layers (outlines, fills, colors, effects) just like in traditional digital art software.