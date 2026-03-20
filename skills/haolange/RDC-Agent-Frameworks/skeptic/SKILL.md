# Skeptic Skill Wrapper

当前文件是 Cursor 平台的 skeptic skill 入口。

本 skill 引用当前平台根目录的 `common/`：

- ../../common/skills/skeptic/SKILL.md
- 进入任何平台真相相关工作前，必须先校验 ../../common/config/platform_adapter.json
- coordination_mode 与降级边界以 ../../common/config/platform_capabilities.json 的当前平台定义为准。

未先将顶层 `debugger/common/` 拷入当前平台根目录的 `common/` 之前，不允许在宿主中使用当前平台模板。

运行时 case/run 现场与第二层报告统一写入：`../workspace`
