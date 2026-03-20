---
name: use-unrealhub
description: '通过 UnrealMCPHub 驱动 Unreal Engine 完成游戏开发全流程的综合技能。覆盖：工程管理、C++ 编译、关卡构建、PIE 测试、AI 寻路、内存治理、弹窗处理、Slate UI 操控、UMG Widget 创建。触发：用户提及 UE/Unreal/编译/启动/崩溃/MCP/PIE/关卡/怪物/AI/UI/Widget/Slate 等关键词时激活。'
license: MIT
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, CallMcpTool
---

# UseUnrealHub — Agent 驱动 UE 开发综合技能

> **维护规约**：本文件随 UnrealMCPHub 仓库发布。对 Hub 的任何功能变更（新工具、参数修改、行为变化）
> 都**必须**同步更新本文件。同步检查清单见 `skills/unrealhub-developer/SKILL.md`。

---

## Part 1: 核心工作流

### 1.1 决策流程

每次涉及 UE 操作前，按此流程决策：

```
项目已配置? ──No──> setup_project(uproject_path="...")
      │Yes
      ▼
编辑器在线? ──No──> 需要编译? ─Yes─> launch_editor()   # launch_editor 会先编译再启动
      │Yes              │No
      │                 ▼
      │            launch_editor()
      ▼
正常使用 UE 工具
      │
遇到崩溃? ──Yes──> get_log(source="crash") → launch_editor(action="restart")
      │No
      ▼
继续工作
```

### 1.2 工具速查表

| 类别 | 工具 | 关键参数 | 用途 |
|------|------|----------|------|
| **项目** | `setup_project` | uproject_path, install_plugin | 一站式项目配置 |
| | `get_project_config` | — | 查看配置 |
| | `hub_status` | — | Hub 全局状态 |
| **编译** | `build_project` | action, target, configuration | UBT 编译/打包 |
| **启动** | `launch_editor` | action, exec_cmds, build_config | 编辑器生命周期；`start/restart` 会先编译再启动（build_config: Development/DebugGame/Debug） |
| | `get_editor_status` | — | 进程状态 |
| **实例** | `discover_instances` | rescan | 发现 Unreal MCP 实例（两阶段端口扫描 + serverInfo 验证 + MCP 自识别 + 自动注册 + 孤儿进程扫描） |
| | `manage_instance` | action, instance, url, port | 注册/注销/切换实例（instance 支持 key/port/项目名） |
| **监控** | `get_instance_health` | instance | 健康检查 |
| | `get_log` | source, tail_lines | 日志读取 |
| **代理** | `ue_status` | — | UE 实例状态 |
| | `ue_list_domains` | — | 列出所有 domain 及描述 |
| | `ue_list_tools` | domain | 列出 UE 工具（含参数 schema） |
| | `ue_call` | tool_name, arguments, domain | 调用 UE 工具 |
| | `ue_run_python` | script | 执行 Python 脚本 |
| **会话** | `add_note` | content | 添加笔记 |
| | `get_session` | scope, format | 查看会话 |
| **帮助** | `help` | topic | 获取使用指南（按 topic 分段：compile, launch, pie, slate, umg, full 等） |

### 1.3 Domain 工具

UE 端工具按领域（domain）分组。**Domain 列表随 UE 插件扩展而动态增长**，不要假设固定的 domain 集合。
已知 domain 仅供参考：level, blueprint, umg, edgraph, behaviortree, slate —— 实际可用 domain 以运行时查询结果为准。

```
# ⚠ 每次会话开始或不确定时，先动态发现可用 domain
ue_list_domains()                                     # 列出所有 domain 及描述
ue_list_tools(domain="level")                         # 查看某个 domain 下的工具和参数
ue_call("spawn_actor", {...}, domain="level")          # 调用域工具
```

> **关键原则**：永远通过 `ue_list_domains()` 动态发现，不要硬编码 domain 名称。
> 新的 domain 可能在 UE 插件更新、用户安装扩展模块后出现。

### 1.4 实例管理

#### 唯一标识：(project_name, port) 复合键

每个实例由 `项目名:端口` 唯一标识，例如 `Develop57:8422`。同一项目同一端口重启 = 同一实例（自动更新 PID/状态）。

`port=0` 是特殊值，表示"UE 进程在运行但未启用 MCP"。当该进程后续启用 MCP 并被发现时，`ProjectName:0` 会自动升级为 `ProjectName:8422`。

#### 实例状态

仅两态：`online` / `offline`。没有中间态。

#### `discover_instances(rescan=True)` 流程

```
Phase 1: 扫描优先端口 [8422, 8423, 8424, 8425]（<1 秒）
Phase 2: 若 Phase 1 未发现任何实例 → 扩展扫描 8000-8999（3-5 秒）
Phase 3: 标记未响应端口的在线实例为 offline
Phase 4: 对每个响应端口执行 identify + upsert
Phase 5: psutil 扫描所有 UE 进程，未被注册的以 port=0 status=offline 纳入管理

对每个响应端口（Phase 4）:
  1. probe_unreal_mcp: 验证 serverInfo.name 包含 "Unreal"（排除非 UE 的 MCP）
  2. _identify_instance: 通过 MCP call_tool("get_unreal_state") 获取项目路径
     （fallback: psutil 查端口归属进程）
  3. state.upsert: 自动注册或更新实例

对未启用 MCP 的 UE 进程（Phase 5）:
  1. psutil 枚举所有 UnrealEditor 进程
  2. 过滤掉已通过 PID 或 project_path 关联的进程
  3. state.upsert(port=0, status="offline"): 注册为不可联通
  4. 后续该进程启用 MCP 后，discover 会自动升级 ProjectName:0 → ProjectName:{port}
```

**行为要点**：
- 任何运行中的 Unreal MCP 实例都会被自动发现并注册，无论是 Hub 启动的还是手动启动的
- **没有启用 MCP 的 UE 编辑器也会被发现**，标记为 `[NO MCP]` offline 状态
- 通过 MCP 协议直接问实例"你是谁"（`get_unreal_state`），获取准确项目路径
- 复合键天然去重：同项目同端口不会产生重复条目
- 离线超过 1 小时的实例自动清理
- ProcessWatcher 后台每 5 秒健康检查在线实例

#### 实例切换

实例可通过完整 key、端口号或项目名查找：

```
manage_instance(action="use", instance="Develop57:8422")  // 完整 key
manage_instance(action="use", instance="8422")             // 按端口
manage_instance(action="use", instance="Develop57")        // 按项目名
```

**崩溃后**：编辑器崩溃重启后，upsert 自动更新同 key 的实例，活跃实例通常自动指向正确实例。

---

## Part 2: 编译策略

### 2.1 Live Coding vs 外部编译

| 方式 | 工具 | 前提 | 适用场景 |
|------|------|------|----------|
| Live Coding | `ue_call("livecoding_compile_and_get_ubt_log")` | 编辑器运行中 | 增量 C++ 修改 |
| 外部 UBT | `build_project()` | 编辑器**必须关闭** | 全量编译、Live Coding 失败时 |

**决策路径**：
1. 优先 Live Coding（快速、不中断工作流）
2. Live Coding 失败且不是代码错误 → 关闭编辑器 → 重新 `launch_editor()`（会先编译再启动）

### 2.1.1 编译流式进度

`build_project()` 和 `launch_editor()` 会通过 MCP progress notification 实时推送编译进度：

- **Progress**：解析 UBT 输出中的 `[x/y]` 标记，通过 `report_progress(current, total, line)` 推送进度与日志文本
- **Log**：每一行非空输出都即时推送——`[x/y]` 编译行 → `ctx.info`，错误 → `ctx.error`，警告 → `ctx.warning`，其他 → `ctx.info`
- **最终返回值**：仍包含完整的错误/警告摘要和输出尾部，不受流式影响

### 2.2 PCH 内存不足 (C3859 / C1076)

```
c1xx: error C3859: 未能创建 PCH 的虚拟内存
c1xx: fatal error C1076: 编译器限制: 达到内部堆限制
```

**这不是代码错误**。处理策略按优先级：

#### 优先级 1：降低并行编译数（首选，最有效）

修改 `%APPDATA%/Unreal Engine/UnrealBuildTool/BuildConfiguration.xml`：

```xml
<?xml version="1.0" encoding="utf-8" ?>
<Configuration xmlns="https://www.unrealengine.com/BuildConfiguration">
    <BuildConfiguration>
        <MaxParallelActions>6</MaxParallelActions>
    </BuildConfiguration>
</Configuration>
```

> **关键**：编译完成后**必须**恢复原值（清空文件内容），避免影响用户正常使用。

#### 优先级 2：要求用户释放内存

如果降低并行度后仍失败，**告知用户**关闭其他大型程序。**不要自行反复重试**。

#### 优先级 3：释放编辑器内存

```python
import gc, unreal
gc.collect()
unreal.SystemLibrary.collect_garbage()
```

#### 禁止行为

- **禁止**在内存不足时反复重建场景
- **禁止**无意义地循环重试编译（>3 次相同失败就要换策略）

### 2.3 UBA 缓存

Unreal Build Accelerator 缓存成功的 .obj。即使部分文件因内存失败，下次重试会自动跳过已缓存的文件。降低并行度后重试通常极快。

---

## Part 3: 编辑器启动与弹窗处理

### 3.1 常见阻塞弹窗

| 弹窗 | 触发条件 | 处理方式 |
|------|---------|---------|
| Shader Compilation 进度条 | 首次打开/引擎变更 | 等待，不可跳过 |
| "Saved with older version" | 切换引擎版本 | Slate 确认 |
| Source Control 提示 | 版控配置异常 | Slate 关闭 |
| New Plugin 面板 | 插件首次安装 | `slate_close_dock_tab` |
| Unable to Check Out | 版控检出失败 | Slate 点击 Ok |

### 3.2 处理方法

**方法 A：静默启动参数（推荐）**

```
launch_editor(exec_cmds="-nosplash -unattended -nopause")
```

| 参数 | 效果 |
|------|------|
| `-nosplash` | 跳过启动画面 |
| `-unattended` | 无人值守，自动确认部分弹窗 |
| `-nopause` | 不暂停等待用户 |

**方法 B：Slate 工具关闭**

```
ue_call("slate_send_key_press", {"key": "Enter"}, domain="slate")        // 确认对话框
ue_call("slate_close_dock_tab", {"tab_label": "Plugins"}, domain="slate") // 关闭 Tab
ue_call("slate_safe_close", {"tab_label": "Plugins"}, domain="slate")    // 安全关闭（优先 Tab，必要时关窗口）
ue_call("slate_get_all_dock_tabs", {}, domain="slate")                    // 先查看已打开的 Tab 列表
```

> **注意**：所有 Slate 工具都在 `slate` domain 中，调用时必须指定 `domain="slate"`。

**方法 C：弹窗阻塞 MCP 连接时**

MCP 在编辑器初始化后才启动。如果弹窗阻塞导致 `launch_editor()` 超时：
1. 通知用户手动关闭弹窗
2. 或 `launch_editor(action="stop")` → 加静默参数重新启动

---

## Part 4: PIE 测试

### 4.1 启动与停止

```python
les = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
les.editor_request_begin_play()   # 异步启动
import time; time.sleep(3)        # 等待初始化
les.is_in_play_in_editor()        # 检查状态
les.editor_request_end_play()     # 停止
```

### 4.2 PIE 世界查询（重要）

编辑器 Python 脚本**无法**直接访问 PIE 世界：

```python
# ❌ PIE 期间全部返回 None
unreal.EditorLevelLibrary.get_editor_world()
les.get_world()
unreal.GameplayStatics.get_player_pawn(None, 0)
```

**正确做法**：使用控制台命令 `getall`

```
ue_call("run_console_command", {"command": "getall ArenaMonster Name"})
ue_call("run_console_command", {"command": "getall ArenaMonster MonsterType MaxHP MoveSpeed"})
ue_call("run_console_command", {"command": "getall ArenaPlayerCharacter Name"})
```

`getall ClassName PropertyName` 枚举 PIE 世界中所有实例及属性，结果输出到日志。

### 4.3 GameMode 配置

通过 Python 设置关卡的 GameMode Override：

```python
world = unreal.EditorLevelLibrary.get_editor_world()
ws = world.get_world_settings()
gm_class = unreal.load_class(None, '/Script/ProjectName.MyGameMode')
ws.set_editor_property('default_game_mode', gm_class)
unreal.EditorLevelLibrary.save_current_level()
```

---

## Part 5: AI 寻路与 NavMesh

### 5.1 完整流程

```
1. Build.cs 添加 "NavigationSystem" 依赖
2. 放置 NavMeshBoundsVolume（Python）
3. 构建 NavMesh（控制台命令）
4. 验证构建成功（检查日志）
```

### 5.2 代码

```python
# 放置 NavMeshBoundsVolume
nav_class = unreal.load_class(None, '/Script/NavigationSystem.NavMeshBoundsVolume')
nav = unreal.EditorLevelLibrary.spawn_actor_from_class(nav_class, unreal.Vector(0, 0, 200))
nav.set_actor_scale3d(unreal.Vector(100, 100, 10))

# 构建 NavMesh
unreal.SystemLibrary.execute_console_command(
    unreal.EditorLevelLibrary.get_editor_world(), 'RebuildNavigation')
```

### 5.3 验证

日志中应出现：
- ✅ `UNavigationSystemV1::Build started...`
- ✅ `Build total execution time`
- ❌ `Unable to find RecastNavMesh instance` → NavMeshBoundsVolume 配置有误

---

## Part 6: 关卡构建

### 6.1 程序化关卡搭建模式

```python
import unreal
el = unreal.EditorLevelLibrary
cube = unreal.EditorAssetLibrary.load_asset('/Engine/BasicShapes/Cube')
plane = unreal.EditorAssetLibrary.load_asset('/Engine/BasicShapes/Plane')
cyl = unreal.EditorAssetLibrary.load_asset('/Engine/BasicShapes/Cylinder')

def spawn_mesh(asset, x, y, z, sx, sy, sz, label=''):
    a = el.spawn_actor_from_class(unreal.StaticMeshActor, unreal.Vector(x, y, z))
    if a:
        a.static_mesh_component.set_static_mesh(asset)
        a.set_actor_scale3d(unreal.Vector(sx, sy, sz))
        if label: a.set_actor_label(label)
    return a
```

### 6.2 关卡要素清单

| 要素 | 典型实现 |
|------|---------|
| 地面 | `Plane` 缩放 80×80 |
| 围墙 | `Cube` 围成八边形 |
| 掩体 | L 形 `Cube` 组合 |
| 柱子 | `Cylinder` 散布 |
| 高台 | `Cube` 加厚抬高 |
| 灯光 | DirectionalLight + SkyLight + PointLight×N |
| 玩家出生 | `PlayerStart` |

---

## Part 7: 行为准则

1. **配置优先**：任何 UE 操作前确认 `get_project_config()` 有配置
2. **代理优先**：`ue_run_python` > `ue_call` > `ue_list_tools` 按频率排序
3. **崩溃韧性**：离线/崩溃时不放弃，按流程恢复
4. **内存意识**：编译失败时先诊断是内存还是代码问题
5. **弹窗预防**：启动时加 `-unattended` 参数
6. **PIE 查询**：用 `run_console_command` + `getall`，不用 Python world context
7. **NavMesh 前置**：有 AI 寻路需求时先配 NavMesh
8. **保持笔记**：`add_note` 记录关键决策，崩溃后 `get_session` 恢复
9. **质量导向**：代码架构清晰、数值可配置、核心循环闭合
10. **编译后恢复**：修改 BuildConfiguration.xml 后必须恢复原值
11. **Domain 动态发现**：不要假设固定的 domain 列表，每次会话用 `ue_list_domains()` 发现当前可用 domain
12. **Widget Tree 优先**：查找 UI 元素时优先用 `slate_find_widgets_by_type` 或 `slate_get_all_text_blocks`，而非盲目点击坐标
13. **UMG 路径约束**：UMG 工具的 C++ 后端硬编码资产路径为 `/Game/Widgets/`，Python `path` 参数当前被忽略
14. **崩溃后实例自动复用**：编辑器崩溃重启后，upsert 自动更新同 (project_name:port) 的实例，通常无需手动切换。可用 `manage_instance(action="use", instance="端口号或项目名")` 手动切换

---

## Part 8: Slate UI 操控

Slate 工具在 `slate` domain 中，共 22 个，所有调用需指定 `domain="slate"`。

### 8.1 工具速查

| 分类 | 工具 | 关键参数 | 用途 |
|------|------|----------|------|
| **查询** | `slate_get_all_windows` | — | 列出所有顶层窗口（索引、标题、位置、大小） |
| | `slate_get_widget_tree` | window_index, max_depth(1-12) | 获取窗口 Widget 树（嵌套 JSON） |
| | `slate_get_widget_under_cursor` | — | 鼠标下的 Widget 路径和几何信息 |
| | `slate_get_widget_at_position` | x, y | 指定坐标处的 Widget 路径 |
| | `slate_find_widgets_by_type` | type_name, max_depth | 按类型名搜索（SButton, STextBlock 等） |
| | `slate_get_all_text_blocks` | window_index | 快速获取所有非空文本 |
| | `slate_get_editor_ui_summary` | — | UI 全貌摘要（窗口列表 + 激活窗口） |
| | `slate_get_active_window` | — | 当前激活窗口信息 |
| | `slate_get_focused_widget` | — | 键盘焦点 Widget |
| | `slate_get_all_dock_tabs` | — | 所有打开的 DockTab 列表 |
| **窗口** | `slate_move_window` | x, y, window_index | 移动窗口 |
| | `slate_resize_window` | width, height | 调整窗口大小 |
| | `slate_close_window` | window_index/title | 关闭窗口 |
| | `slate_close_dock_tab` | tab_label/tab_id | 关闭 DockTab |
| | `slate_safe_close` | tab_label, window_title | 安全关闭（优先 Tab） |
| **焦点** | `slate_set_keyboard_focus` | x, y | 将焦点设到指定坐标 Widget |
| **Tab** | `slate_invoke_tab` | tab_id | 打开/切换编辑器面板 |
| **交互** | `slate_click_at_position` | x, y, button | 模拟鼠标点击 |
| | `slate_send_text_input` | text | 向焦点控件输入文本 |
| | `slate_send_key_press` | key, shift, ctrl, alt | 发送键盘按键 |
| | `slate_scroll_at_position` | x, y, delta | 模拟滚轮滚动 |
| **通知** | `slate_show_notification` | message, type, duration | 编辑器右下角通知 |

### 8.2 Widget Tree 查询流程

```
1. ue_call("slate_get_all_windows", {}, domain="slate")
   → 获取窗口列表，记录目标 window_index

2. ue_call("slate_get_widget_tree", {"window_index": 0, "max_depth": 5}, domain="slate")
   → 获取嵌套 Widget 树，每节点含 type/tag/visibility/children

3. ue_call("slate_find_widgets_by_type", {"type_name": "SButton"}, domain="slate")
   → 按类型搜索，返回匹配 Widget 列表（含 depth/in_window）

4. ue_call("slate_get_all_text_blocks", {}, domain="slate")
   → 快速收集所有 STextBlock 文本（非空）
```

### 8.3 坐标定位与交互

通过 Widget Tree 的 geometry 信息获取坐标，再用交互工具操作：

```
# 查找目标 Widget 位置
ue_call("slate_get_widget_at_position", {"x": 500, "y": 300}, domain="slate")

# 点击
ue_call("slate_click_at_position", {"x": 500, "y": 300}, domain="slate")

# 聚焦 + 输入文本
ue_call("slate_set_keyboard_focus", {"x": 500, "y": 300}, domain="slate")
ue_call("slate_send_text_input", {"text": "Hello"}, domain="slate")

# 发送按键
ue_call("slate_send_key_press", {"key": "Enter"}, domain="slate")
```

### 8.4 常用 Tab ID

| Tab ID | 面板 |
|--------|------|
| `OutputLog` | 输出日志 |
| `ContentBrowser1` | 内容浏览器 |
| `LevelEditor` | 关卡编辑器视口 |
| `WorldOutliner` | 世界大纲 |
| `DetailsView` | 详情面板 |
| `MessageLog` | 消息日志 |
| `Sequencer` | 序列器 |

```
ue_call("slate_invoke_tab", {"tab_id": "OutputLog"}, domain="slate")
```

---

## Part 9: UMG Widget 创建

UMG 工具在 `umg` domain 中，用于程序化创建 Widget Blueprint 并添加 UI 控件。

### 9.1 工具速查

| 工具 | 关键参数 | 用途 |
|------|----------|------|
| `create_umg_widget_blueprint` | widget_name | 创建 Widget Blueprint |
| `add_text_block_to_widget` | widget_name(蓝图名), text_block_name, text, position | 添加文本块 |
| `add_button_to_widget` | widget_name(蓝图名), button_name, text, position | 添加按钮 |
| `bind_widget_event` | widget_name(蓝图名), widget_component_name, event_name | 绑定事件 |
| `add_widget_to_viewport` | widget_name(蓝图名), z_order | 添加到视口 |
| `set_text_block_binding` | widget_name(蓝图名), text_block_name, binding_property | 设置属性绑定 |

### 9.2 创建流程

```
1. ue_call("create_umg_widget_blueprint", {"widget_name": "MyHUD"}, domain="umg")
2. ue_call("add_text_block_to_widget", {"widget_name": "MyHUD", "text_block_name": "Title", "text": "Score: 0", "position": [100, 50]}, domain="umg")
3. ue_call("add_button_to_widget", {"widget_name": "MyHUD", "button_name": "StartBtn", "text": "Start", "position": [100, 150]}, domain="umg")
4. ue_call("bind_widget_event", {"widget_name": "MyHUD", "widget_component_name": "StartBtn", "event_name": "OnClicked"}, domain="umg")
5. ue_call("add_widget_to_viewport", {"widget_name": "MyHUD"}, domain="umg")
```

### 9.3 已知问题

**C++ 后端 Bug（截至 2026-03-07）**：

- `create_umg_widget_blueprint` C++ 层使用 `UBlueprint::StaticClass()` 而非 `UWidgetBlueprint::StaticClass()`，导致 Cast 失败，Widget Blueprint 无法正确创建
- 创建的蓝图缺少 CanvasPanel 根节点，后续添加控件会报 "Root Canvas Panel not found"
- **临时绕过方案**：用 `ue_run_python` 通过 `WidgetBlueprintFactory` 创建

```python
import unreal
factory = unreal.WidgetBlueprintFactory()
factory.set_editor_property('parent_class', unreal.UserWidget)
asset_tools = unreal.AssetToolsHelpers.get_asset_tools()
wb = asset_tools.create_asset('MyHUD', '/Game/Widgets', None, factory)
```

> **注意**：即使通过 Python 创建，WidgetBlueprintFactory 可能不自动添加 CanvasPanel 根节点，
> 导致后续 `add_text_block_to_widget` 仍会失败。此问题需要在 RemoteMCP C++ 层修复。

### 9.4 路径约束

C++ 后端硬编码资产保存路径为 `/Game/Widgets/`，Python 层的 `path` 参数当前被忽略。
所有 UMG 资产统一创建在 `/Game/Widgets/<widget_name>` 下。
