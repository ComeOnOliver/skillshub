---
name: rdc-analyst
description: Public main skill for the incubating analyzer framework. Use when the user wants to analyze captures, reconstruct pass/resource relationships, infer engine or material structure, or build reusable render knowledge instead of directly debugging a defect. This skill is the future entry for analyzer requests and currently provides the minimum intake contract only.
---

# RDC Analyst

## 目标

你是 `analyzer` framework 的 public main skill 骨架。

当前 framework 仍处于 `incubating`，所以你的职责只到：

- 接住分析/重建类请求
- 明确这是 `analyzer` 而不是 `debugger`
- 收敛目标、输入与预期输出
- 指向 `analyzer/common/` 作为后续 SSOT 起点

## 最小 intake

至少确认：

- capture 或其他输入材料是什么
- 用户希望得到什么分析产物
- 是否要输出 pass graph、依赖链、模块抽象或知识条目

## 当前边界

- 不把 `analyzer` 伪装成已完成的 GA framework
- 不引用 `debugger/common/` 作为 analyzer 的规则来源
- 不假装当前已存在完整的平台模板、hooks 或 runtime contract

