---
name: unrealhub-developer
description: 'UnrealMCPHub 代码库开发维护指南。面向修改 Hub 源码（Python/MCP 服务器）的开发者。触发：用户修改 UnrealMCPHub/src 下源码时激活。'
license: MIT
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# UnrealMCPHub 开发者指南

> **注意**：本文件面向 Hub 代码库本身的维护与开发。
> 如需了解如何**使用** Hub 驱动 UE 开发，请参阅 `skills/use-unrealhub/SKILL.md`（随 Hub 仓库一起发布）。
>
> **维护规约**：对 Hub 的任何功能变更（新工具、参数修改、行为变化）
> 都**必须**同步更新 `skills/use-unrealhub/SKILL.md`。详见下方「添加新工具检查清单」。

## 架构概览

```
UnrealMCPHub/
├── src/unrealhub/
│   ├── server.py              # MCP 服务器入口、工具注册
│   ├── config.py              # 项目配置管理
│   ├── tools/
│   │   ├── project_tools.py   # setup/config/remove/status
│   │   ├── build_tools.py     # build_project
│   │   ├── launch_tools.py    # launch/stop/restart editor
│   │   ├── install_tools.py   # check_plugin_status
│   │   ├── discovery_tools.py # discover/manage instances
│   │   ├── monitor_tools.py   # health check
│   │   ├── log_tools.py       # get_log
│   │   ├── proxy_tools.py     # ue_status/list/call/run_python
│   │   └── session_tools.py   # add_note/get_session
│   └── core/
│       ├── instance_manager.py
│       ├── process_manager.py
│       └── watcher.py
├── skills/
│   ├── unrealhub-developer/
│   │   └── SKILL.md           # 本文件（开发者指南）
│   ├── use-unrealhub/
│   │   └── SKILL.md           # 使用者技能（随 Hub 发布）
│   └── ue-benchmark/
│       ├── SKILL.md           # Benchmark 通用框架
│       └── scenarios/         # 各评测场景规格
│           └── vampire-survivors-v1.md
```

## 工具注册模式

所有工具在 `server.py` 中通过 `@mcp.tool()` 装饰器注册。添加新工具时：

1. 在对应的 `tools/*.py` 中实现函数
2. 在 `server.py` 中导入并注册
3. 更新 `skills/use-unrealhub/SKILL.md` 的工具速查表

## 代理工具原理

`proxy_tools.py` 中的 `ue_call`/`ue_run_python` 通过 HTTP 转发到 UE 内运行的 RemoteMCP 插件。关键逻辑：

- 活跃实例选择：`instance_manager.get_active()`
- HTTP 转发：`POST http://{host}:{port}/mcp/call`
- 离线降级：返回引导信息而非抛异常

## 添加新工具检查清单

- [ ] `tools/*.py` 中实现
- [ ] `server.py` 中注册
- [ ] 错误处理（连接失败、实例离线、参数校验）
- [ ] **同步更新** `skills/use-unrealhub/SKILL.md`
- [ ] 如有新的使用模式/注意事项，同步补充到技能文件的对应 Part

## 发布检查清单

每次 Hub 发版（打 tag / bump version）前必须执行：

- [ ] **更新 `PLUGIN_TAG`**：检查 [RemoteMCP](https://github.com/blackplume233/UnrealRemoteMCP) 最新 tag，
      将 `src/unrealhub/config.py` 中的 `PLUGIN_TAG` 更新为该 tag（如 `"v1.0.0"`）
- [ ] **更新 `pyproject.toml` version**：与 git tag 一致
- [ ] **全量测试通过**：`pytest tests/ -v`
- [ ] **SKILL.md 同步**：确认 `skills/use-unrealhub/SKILL.md` 反映所有变更
- [ ] **Lint 清零**：无新增 lint 错误
