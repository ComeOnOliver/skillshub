# UE5 Project Setup Skill

Scaffolds a production-ready Unreal Engine 5 project with all the tooling, conventions, and configuration files needed for efficient AI-assisted development.

## What This Skill Creates

1. **CLAUDE.md** — Project context file for Claude Code integration
2. **.gitignore** — UE5-specific ignore rules
3. **.gitattributes** — Git LFS tracking for binary assets
4. **Directory structure guidance** — Module and plugin organization
5. **.claude/settings.json** — Exclude noisy directories from Claude context
6. **.mcp.json** — MCP server configuration for live editor control
7. **Config/DefaultEngine.ini entries** — Remote Control API auto-start

## Step 1: Gather Project Info

Ask the user:
- **Project name** (PascalCase, e.g., `MyActionRPG`)
- **Template base** (ThirdPerson, FirstPerson, TopDown, Blank)
- **Primary language** (C++ only, C++ with Blueprints, Blueprints only)
- **Target platforms** (Linux, Windows, both)
- **Key gameplay systems** (GAS, Enhanced Input, Multiplayer, AI, PCG)

## Step 2: Generate CLAUDE.md

Place at the project root. Keep under 150 lines. Use progressive disclosure — tell Claude how to find info rather than listing everything.

```markdown
# [ProjectName]

## Tech Stack
- Unreal Engine 5.7
- C++ with Blueprint extension
- [List key plugins: GAS, Enhanced Input, CommonUI, etc.]

## Project Structure
```
Source/
├── [ProjectName]/          # Primary game module
│   ├── Public/             # Headers
│   │   ├── Characters/
│   │   ├── Abilities/
│   │   ├── Components/
│   │   └── UI/
│   └── Private/            # Implementation
│       ├── Characters/
│       ├── Abilities/
│       ├── Components/
│       └── UI/
├── [ProjectName]Editor/    # Editor-only module (optional)
Plugins/
├── GameFeatures/           # Modular game features
Content/
├── Blueprints/
├── Maps/
├── Materials/
├── Meshes/
└── UI/
```

## Coding Conventions
- Follow Epic C++ Coding Standard
- Prefixes: A (Actor), U (UObject), F (struct), E (enum), I (interface)
- Boolean vars: `bIsAlive`, `bCanFire`
- Use `TObjectPtr<>` for UObject pointers
- Use `GENERATED_BODY()` in every UObject-derived class
- `#pragma once` for include guards

## Build Commands
```bash
# Editor build
[UE_ROOT]/Engine/Build/BatchFiles/Linux/Build.sh [ProjectName]Editor Linux Development -project=[path]

# Package
[UE_ROOT]/Engine/Build/BatchFiles/RunUAT.sh BuildCookRun -project=[path] -platform=Linux -clientconfig=Shipping -cook -build -stage -pak
```

## Gameplay Architecture
[Describe your GameMode → GameState → PlayerController → Character hierarchy]
[Describe your ability system if using GAS]

## Key Classes
[List your 5-10 most important classes with one-line descriptions]
```

## Step 3: Generate .gitignore

Based on the community standard from `github.com/MOZGIII/ue5-gitignore`:

```gitignore
# UE5 Build artifacts
Binaries/
Intermediate/
Saved/
DerivedDataCache/

# IDE files
.vs/
.vscode/
.idea/
*.sln
*.xcworkspace

# OS files
.DS_Store
Thumbs.db

# Compiled assets (if using source assets)
*.uasset
*.umap

# Except for Content (track via LFS)
!Content/**/*.uasset
!Content/**/*.umap

# Build outputs
Build/
Packaged/
```

Adjust based on whether the user wants to track Content in Git or use a separate asset management approach.

## Step 4: Generate .gitattributes for Git LFS

```gitattributes
# UE5 binary assets — track with Git LFS
*.uasset filter=lfs diff=lfs merge=lfs -text
*.umap filter=lfs diff=lfs merge=lfs -text
*.uexp filter=lfs diff=lfs merge=lfs -text
*.ubulk filter=lfs diff=lfs merge=lfs -text

# Media files
*.png filter=lfs diff=lfs merge=lfs -text
*.jpg filter=lfs diff=lfs merge=lfs -text
*.jpeg filter=lfs diff=lfs merge=lfs -text
*.bmp filter=lfs diff=lfs merge=lfs -text
*.tga filter=lfs diff=lfs merge=lfs -text
*.exr filter=lfs diff=lfs merge=lfs -text
*.hdr filter=lfs diff=lfs merge=lfs -text

# Audio
*.wav filter=lfs diff=lfs merge=lfs -text
*.ogg filter=lfs diff=lfs merge=lfs -text
*.mp3 filter=lfs diff=lfs merge=lfs -text

# Video
*.mp4 filter=lfs diff=lfs merge=lfs -text
*.mov filter=lfs diff=lfs merge=lfs -text

# 3D assets
*.fbx filter=lfs diff=lfs merge=lfs -text
*.obj filter=lfs diff=lfs merge=lfs -text
*.gltf filter=lfs diff=lfs merge=lfs -text
*.glb filter=lfs diff=lfs merge=lfs -text

# Fonts
*.ttf filter=lfs diff=lfs merge=lfs -text
*.otf filter=lfs diff=lfs merge=lfs -text

# Precompiled binaries
*.dll filter=lfs diff=lfs merge=lfs -text
*.so filter=lfs diff=lfs merge=lfs -text
*.dylib filter=lfs diff=lfs merge=lfs -text
*.exe filter=lfs diff=lfs merge=lfs -text
```

## Step 5: Generate .claude/settings.json

```json
{
  "permissions": {
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force*)"
    ]
  },
  "ignorePatterns": [
    "Binaries/**",
    "Intermediate/**",
    "Saved/**",
    "DerivedDataCache/**",
    ".vs/**",
    "*.uasset",
    "*.umap"
  ]
}
```

## Step 6: Generate .mcp.json for MCP Server Integration

If the user wants Claude Code to control the UE5 editor (spawn actors, create materials, compile blueprints), generate `.mcp.json` at the project root:

```json
{
  "mcpServers": {
    "ue5": {
      "command": "node",
      "args": ["/path/to/UnrealEngineAgent/mcp-server/dist/index.js"]
    }
  }
}
```

**Note**: MCP servers are configured in `.mcp.json`, NOT in `~/.claude/settings.json` (which doesn't support `mcpServers`).

### Remote Control API Setup

Add to the CLAUDE.md template if the user wants MCP integration:

```markdown
## Remote Control API
- Plugin: Remote Control API (must be enabled in Edit → Plugins)
- HTTP: http://localhost:6766
- WebSocket: ws://localhost:6767
- Test: `curl -s http://localhost:6766/remote/api/v1/objects | jq .`
```

Add to `Config/DefaultEngine.ini`:

```ini
[/Script/RemoteControlAPI.RemoteControlSettings]
bAutoStartRemoteControl=True
RemoteControlHttpServerPort=6766
RemoteControlWebSocketServerPort=6767
```

## Step 8: Initialize Git Repository

```bash
cd /path/to/project
git init
git lfs install
git add .gitignore .gitattributes CLAUDE.md .claude/ .mcp.json
git commit -m "Initial project setup with UE5 conventions"
```

## Asset Naming Conventions (Allar Style Guide)

| Asset Type | Prefix | Example |
|------------|--------|---------|
| Blueprint | BP_ | BP_PlayerCharacter |
| Material | M_ | M_RockBase |
| Material Instance | MI_ | MI_RockBase_Snow |
| Static Mesh | SM_ | SM_Rock_01 |
| Skeletal Mesh | SK_ | SK_PlayerCharacter |
| Texture | T_ | T_RockBase_D (diffuse) |
| Animation | A_ | A_Walk_Fwd |
| Animation Blueprint | ABP_ | ABP_PlayerCharacter |
| Widget Blueprint | WBP_ | WBP_MainMenu |
| Niagara System | NS_ | NS_FireEffect |
| Sound Cue | SC_ | SC_Footstep |
| Data Table | DT_ | DT_WeaponStats |
| Gameplay Ability | GA_ | GA_MeleeAttack |
| Gameplay Effect | GE_ | GE_DamageInstant |

## Output

After running this skill, the user will have:
- A properly structured project root with all config files
- Git LFS configured for binary assets
- CLAUDE.md tailored to their specific project architecture
- A foundation ready for UE5 C++ and Blueprint development