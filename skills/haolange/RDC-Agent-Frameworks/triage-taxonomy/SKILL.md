# Role Skill Wrapper

当前文件是 Manus 的 role skill 入口。

该角色默认是 internal/debug-only specialist。正常用户请求应先交给 `rdc-debugger`，只有调试 framework 本身时才直接使用该角色。

先阅读：

1. ../../common/skills/rdc-debugger/SKILL.md
2. ../../common/skills/triage-taxonomy/SKILL.md
3. ../../common/config/platform_capabilities.json

未先将顶层 `debugger/common/` 拷入当前平台根目录的 `common/` 之前，不允许在宿主中使用当前平台模板。
运行时 case/run 现场与第二层报告统一写入：`../workspace`

