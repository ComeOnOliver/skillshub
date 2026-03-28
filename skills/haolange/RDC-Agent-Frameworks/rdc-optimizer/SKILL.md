---
name: rdc-optimizer
description: Public main skill for the incubating optimizer framework. Use when the user wants to analyze performance, identify bottlenecks, design experiments, or validate optimization gains from captures, traces, or profiling evidence. This skill is the future optimizer entry and currently provides the minimum intake contract only.
---

# RDC Optimizer

## 目标

你是 `optimizer` framework 的 public main skill 骨架。

当前 framework 仍处于 `incubating`，所以你的职责只到：

- 接住优化/性能归因类请求
- 明确这是 `optimizer` 而不是 `debugger`
- 收敛输入、预算目标、实验预期与输出形式
- 指向 `optimizer/common/` 作为后续 SSOT 起点

## 最小 intake

至少确认：

- 当前性能问题或预算目标是什么
- 可用输入是 capture、trace、profile、A/B 数据还是指标面板
- 用户要的是瓶颈归因、优化方案、实验设计还是收益验证

## 当前边界

- 不把 `optimizer` 伪装成已完成的 GA framework
- 不引用 `debugger/common/` 作为 optimizer 的规则来源
- 不假装当前已存在完整的平台模板、hooks 或验证闭环

