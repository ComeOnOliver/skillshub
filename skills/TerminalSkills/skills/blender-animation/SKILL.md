# Blender Animation

## Overview

Create and control animations in Blender using Python. Keyframe object and bone transforms, build armatures with IK/FK rigs, animate shape keys for facial motion, edit F-Curves for timing control, layer actions in the NLA editor, and wire up drivers for expression-based automation — all scriptable from the terminal.

## Instructions

### 1. Keyframe object properties

```python
import bpy

obj = bpy.data.objects["Cube"]
# Keyframe location at multiple frames
for loc, frame in [((0,0,0), 1), ((5,0,3), 30), ((5,4,0), 60)]:
    obj.location = loc
    obj.keyframe_insert(data_path="location", frame=frame)

# Also works for rotation_euler, scale, single-axis (index=2 for Z), custom props
obj.rotation_euler = (0, 0, 3.14159)
obj.keyframe_insert(data_path="rotation_euler", frame=60)
obj.scale = (2, 2, 2)
obj.keyframe_insert(data_path="scale", frame=60)
obj["intensity"] = 1.0  # custom property
obj.keyframe_insert(data_path='["intensity"]', frame=30)
bpy.context.scene.frame_start, bpy.context.scene.frame_end = 1, 60
```

### 2. Control F-Curve interpolation and modifiers

```python
import bpy

action = bpy.data.objects["Cube"].animation_data.action
for fcurve in action.fcurves:
    for kp in fcurve.keyframe_points:
        kp.interpolation = 'BEZIER'  # CONSTANT, LINEAR, BEZIER, SINE, EXPO, BOUNCE, ELASTIC
        kp.easing = 'EASE_IN_OUT'   # AUTO, EASE_IN, EASE_OUT, EASE_IN_OUT
    # Cycles modifier to loop the animation
    mod = fcurve.modifiers.new(type='CYCLES')
    mod.mode_before = 'REPEAT'       # NONE, REPEAT, REPEAT_OFFSET, MIRROR
    mod.mode_after = 'REPEAT'

# Add noise to a specific channel
z_curve = action.fcurves.find("location", index=2)  # Z location
if z_curve:
    noise = z_curve.modifiers.new(type='NOISE')
    noise.strength, noise.scale = 0.3, 5.0
```

### 3. Create armatures and bones

```python
import bpy

arm_data = bpy.data.armatures.new("Rig")
arm_obj = bpy.data.objects.new("Rig", arm_data)
bpy.context.collection.objects.link(arm_obj)
bpy.context.view_layer.objects.active = arm_obj
bpy.ops.object.mode_set(mode='EDIT')
# (name, head, tail, parent_name, connected)
bone_defs = [
    ("Spine",      (0,0,1.0),   (0,0,1.4),   None,       False),
    ("Chest",      (0,0,1.4),   (0,0,1.8),   "Spine",    False),
    ("UpperArm.L", (0.2,0,1.7), (0.5,0,1.4), "Chest",    False),
    ("Forearm.L",  (0.5,0,1.4), (0.8,0,1.1), "UpperArm.L", True),
    ("Thigh.L",    (0.1,0,1.0), (0.1,0,0.5), "Spine",    False),
    ("Shin.L",     (0.1,0,0.5), (0.1,0,0.05),"Thigh.L",  True),
]
for name, head, tail, parent, connected in bone_defs:
    b = arm_data.edit_bones.new(name)
    b.head, b.tail = head, tail
    if parent:
        b.parent = arm_data.edit_bones[parent]
        b.use_connect = connected

bpy.ops.object.mode_set(mode='OBJECT')
```

### 4. Set up constraints on bones

```python
import bpy

arm_obj = bpy.data.objects["Rig"]
bpy.context.view_layer.objects.active = arm_obj
bpy.ops.object.mode_set(mode='POSE')
# IK — use an empty as target, chain_count limits affected bones
ik = arm_obj.pose.bones["Forearm.L"].constraints.new('IK')
ik.target = bpy.data.objects["IK_Target"]
ik.pole_target = bpy.data.objects["IK_Pole"]
ik.chain_count = 2

# Copy Rotation — mirrors another object's rotation
cr = arm_obj.pose.bones["Chest"].constraints.new('COPY_ROTATION')
cr.target = bpy.data.objects["ChestCtrl"]
# Other types: LIMIT_ROTATION, DAMPED_TRACK, STRETCH_TO, COPY_LOCATION, TRACK_TO

bpy.ops.object.mode_set(mode='OBJECT')
```

### 5. Keyframe bone poses

```python
import bpy, math

arm_obj = bpy.data.objects["Rig"]
bpy.context.view_layer.objects.active = arm_obj
bpy.ops.object.mode_set(mode='POSE')
if not arm_obj.animation_data:
    arm_obj.animation_data_create()
action = bpy.data.actions.new("WalkCycle")
arm_obj.animation_data.action = action

# Keyframe thigh swing: back → neutral → forward
thigh = arm_obj.pose.bones["Thigh.L"]
for angle, frame in [(-30, 1), (0, 13), (30, 25)]:
    thigh.rotation_euler = (math.radians(angle), 0, 0)
    thigh.keyframe_insert(data_path="rotation_euler", frame=frame)

bpy.ops.object.mode_set(mode='OBJECT')
```

### 6. Create and animate shape keys

```python
import bpy

obj = bpy.data.objects["Head"]
mesh = obj.data
if not mesh.shape_keys:  # Basis key required first
    obj.shape_key_add(name="Basis", from_mix=False)

smile = obj.shape_key_add(name="Smile", from_mix=False)
for i, vert in enumerate(smile.data):
    if i in [42, 43, 56, 57]:  # mouth corner vertices
        vert.co.z += 0.02

# Animate shape key value (0.0 → 1.0 → 0.0)
sk = mesh.shape_keys.key_blocks["Smile"]
for val, frame in [(0.0, 1), (1.0, 15), (0.0, 30)]:
    sk.value = val
    sk.keyframe_insert(data_path="value", frame=frame)
```

### 7. Layer actions with the NLA editor

```python
import bpy

arm_obj = bpy.data.objects["Rig"]
if not arm_obj.animation_data:
    arm_obj.animation_data_create()
# Push actions as NLA strips on separate tracks
track1 = arm_obj.animation_data.nla_tracks.new()
track1.name = "Walk"
strip1 = track1.strips.new("Walk", start=1, action=bpy.data.actions["WalkCycle"])
strip1.repeat = 4                    # loop 4 times
strip1.blend_type = 'REPLACE'        # REPLACE, COMBINE, ADD, SUBTRACT, MULTIPLY

track2 = arm_obj.animation_data.nla_tracks.new()
track2.name = "Wave"
strip2 = track2.strips.new("Wave", start=25, action=bpy.data.actions["WaveHand"])
strip2.blend_type = 'COMBINE'        # blend on top of walk
strip2.influence = 0.8               # partial blend

arm_obj.animation_data.action = None  # clear active action so NLA takes over
```

### 8. Add drivers for expression-based animation

```python
import bpy

driver = bpy.data.objects["Cube"].driver_add("location", 2).driver  # drive Z location
driver.type = 'SCRIPTED'
driver.expression = "sin(frame * 0.1) * 2"
# Add a variable that reads another object's transform
var = driver.variables.new()
var.name = "ctrl"
var.type = 'TRANSFORMS'
var.targets[0].id = bpy.data.objects["Controller"]
var.targets[0].transform_type = 'LOC_X'
var.targets[0].transform_space = 'WORLD_SPACE'
driver.expression = "ctrl * 3"  # also works on shape keys via sk.driver_add("value")
```

## Examples

### Example 1: Bouncing ball with squash and stretch

**User request:** "Animate a ball bouncing with squash and stretch"

```python
import bpy

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5, location=(0, 0, 3))
ball = bpy.context.active_object
ball.name = "BouncingBall"

keyframes = [  # (frame, z_pos, scale_x, scale_y, scale_z)
    (1,  3.0, 1.0, 1.0, 1.0),    (12, 0.5, 1.0, 1.0, 1.0),     # fall
    (15, 0.3, 1.3, 1.3, 0.6),    (18, 0.5, 0.85, 0.85, 1.2),   # squash + stretch
    (30, 2.2, 1.0, 1.0, 1.0),    (42, 0.5, 1.0, 1.0, 1.0),     # apex + second fall
    (45, 0.3, 1.2, 1.2, 0.7),    (55, 1.5, 1.0, 1.0, 1.0),     # smaller bounce
    (62, 0.5, 1.0, 1.0, 1.0),                                    # settle
]
for frame, z, sx, sy, sz in keyframes:
    ball.location = (0, 0, z)
    ball.keyframe_insert(data_path="location", frame=frame)
    ball.scale = (sx, sy, sz)
    ball.keyframe_insert(data_path="scale", frame=frame)

for fc in ball.animation_data.action.fcurves:
    for kp in fc.keyframe_points:
        kp.interpolation = 'BEZIER'

bpy.context.scene.frame_end = 62
bpy.ops.wm.save_as_mainfile(filepath="/tmp/bouncing_ball.blend")
```

### Example 2: Arm rig with IK reaching for an object

**User request:** "Create a simple arm rig with IK and animate it reaching for a cube"

```python
import bpy

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

arm_data = bpy.data.armatures.new("ArmRig")
arm_obj = bpy.data.objects.new("ArmRig", arm_data)
bpy.context.collection.objects.link(arm_obj)
bpy.context.view_layer.objects.active = arm_obj
bpy.ops.object.mode_set(mode='EDIT')
prev = None
for name, head, tail in [("UpperArm",(0,0,1.5),(0.6,0,1.5)),
                          ("Forearm",(0.6,0,1.5),(1.2,0,1.5)),
                          ("Hand",(1.2,0,1.5),(1.4,0,1.5))]:
    b = arm_data.edit_bones.new(name)
    b.head, b.tail = head, tail
    if prev: b.parent, b.use_connect = prev, True
    prev = b
bpy.ops.object.mode_set(mode='OBJECT')

# IK target + constraint
bpy.ops.object.empty_add(type='PLAIN_AXES', location=(1.2, 0, 1.5))
ik_target = bpy.context.active_object
ik_target.name = "IK_Hand"
bpy.context.view_layer.objects.active = arm_obj
bpy.ops.object.mode_set(mode='POSE')
ik = arm_obj.pose.bones["Hand"].constraints.new('IK')
ik.target, ik.chain_count = ik_target, 3
bpy.ops.object.mode_set(mode='OBJECT')

# Animate IK target reaching toward a cube
bpy.ops.mesh.primitive_cube_add(size=0.3, location=(1.5, 0.5, 1.0))
for loc, frame in [((1.2,0,1.5),1), ((1.5,0.5,1.0),30), ((1.5,0.5,1.3),50)]:
    ik_target.location = loc
    ik_target.keyframe_insert(data_path="location", frame=frame)
for fc in ik_target.animation_data.action.fcurves:
    for kp in fc.keyframe_points:
        kp.interpolation, kp.easing = 'BEZIER', 'EASE_IN_OUT'
bpy.context.scene.frame_end = 50
bpy.ops.wm.save_as_mainfile(filepath="/tmp/arm_grab.blend")
```

## Guidelines

- `data_path` must match the RNA path exactly: `"location"`, `"rotation_euler"`, `"scale"`, `'["custom_prop"]'`.
- Armature workflow: Edit mode for bones (`edit_bones`), Pose mode for constraints and keyframes (`pose.bones`).
- For IK, use Empty objects as targets. `chain_count=0` solves the entire chain to root.
- Shape keys need a "Basis" key first. Animate via `key_blocks["Name"].value` (0.0 to 1.0).
- Interpolation: `CONSTANT` for hold/step, `LINEAR` for mechanical, `BEZIER` with easing for organic motion.
- Set `animation_data.action = None` to let NLA strips drive — an active action overrides NLA.
- For walk cycles, keyframe one stride and use a Cycles F-Curve modifier or NLA repeat to loop.
- Bake constraints/drivers with `bpy.ops.nla.bake()` before export — other software cannot read them.
