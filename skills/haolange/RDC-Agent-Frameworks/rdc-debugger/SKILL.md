---
name: rdc-debugger
description: Public main skill for the RenderDoc/RDC GPU debugger framework. Use when the user wants defect diagnosis, root-cause analysis, regression explanation, or fix verification for a GPU rendering issue from one or more `.rdc` captures. This skill owns intent gate classification, preflight, missing-input collection, intake normalization, and the handoff into `team_lead`; it is the only framework classifier and the normal user-facing entry instead of sending users directly to specialist roles.
---

# RDC Debugger

## 目标

你是 `debugger` framework 的 public main skill。

你的职责不是直接做 specialist 调查，也不是替代 `team_lead` 做裁决；你的职责是：

1. 接住用户请求。
2. 先做 `intent_gate`，判断这个请求是否属于 `debugger` 的存在价值。
3. 只有在判定属于 `debugger` 后，才继续统一 preflight。
4. 判断输入是否齐备。
5. 在缺失时用一轮或多轮补料把任务补齐。
6. 只有条件满足后，才把规范化任务提交给 `team_lead`。
7. 在 case/run 已创建后，从 `hypothesis_board.yaml` 读取并持续回显当前 task/progress。

## Intent Gate 独占权

`intent_gate` 只允许由 `rdc-debugger` 的主入口 LLM 执行。

硬规则：

- 不新增 Python classifier、hook classifier 或 specialist classifier。
- `team_lead`、`triage_agent`、`capture_repro_agent` 与其他 specialist 只读消费 `intent_gate`，不得重做打分、改写 decision 或覆盖 redirect 结论。
- 若 downstream 发现 `intent_gate` 与实际任务明显冲突，只能停止推进并要求回到主入口重判，不得自行改判。

## 必读顺序

1. `../../AGENT_CORE.md`
2. `../../docs/intake/README.md`
3. `../../config/platform_adapter.json`
4. `../../config/platform_capabilities.json`
5. `../../docs/platform-capability-model.md`
6. `../../docs/model-routing.md`
7. `../team-lead-orchestration/SKILL.md`

若用户明确要求 `CLI` 模式，再补读：

8. `../../docs/cli-mode-reference.md`

## Workflow

### 1. Intent Gate

在任何 debugger-specific preflight、capture intake、case/run 初始化和 `team_lead` handoff 之前，先做 `intent_gate`。

#### 1.1 第一性判断维度

必须先把用户请求归一化为以下四个维度：

- `primary_completion_question`
  - 用户最终要回答什么问题
- `requested_artifact`
  - 用户真正要的权威产物是什么
- `dominant_operation`
  - 用户希望 agent 主要执行什么动作
- `ab_role`
  - A/B 在当前任务里扮演什么角色

固定语义：

- `ab_role = none`
  - 当前任务没有 A/B 语义
- `ab_role = evidence_method`
  - A/B 只是为了证明 bug 原因、回归原因或 fix 是否成立
- `ab_role = primary_object`
  - A/B diff 本身就是任务主体

硬规则：

- A/B 本身不等于 analyst。
- 只有当 A/B diff 是任务主体时，才把它当 analyst 的正向强信号。

#### 1.2 量化评分

`debugger`：

- `+4` 明确要求根因、错误来源、回归原因
- `+4` 明确要求 fix verification / 是否修好
- `+3` 明确要求 `causal_anchor` / `first_bad_event` / `root_drawcall` / `root_expression`
- `+2` 明确描述异常症状并要求解释“为什么错”
- `-4` 主要目标是 diff / compare / reconstruction
- `-5` 主要目标是 perf / budget / bottleneck

`analyst`：

- `+4` 主要目标是 compare / diff / A-B 差异解释
- `+4` 主要目标是 pass graph / dependency / module abstraction / fingerprint / knowledge extraction
- `+3` 主要目标是重建结构、归纳模式、沉淀知识
- `-3` 明确要求 root-cause verdict 或 fix verdict
- `-2` 明确要求 `causal_anchor`

`optimizer`：

- `+5` 明确要求性能、budget、fps、frame time、bottleneck
- `+4` 明确要求优化实验、收益验证、A/B 性能验证
- `+3` 明确要求 frame breakdown / overdraw / occupancy / bandwidth attribution
- `-3` 明确要求渲染错误诊断

#### 1.3 决策规则

- 若命中硬排除，直接判定并拒绝进入 `debugger`
- 若最高分 `>= 7` 且领先第二名 `>= 3`，接受该 framework 判定
- 否则进入澄清轮次，由主入口 LLM 连续提问直到判断稳定
- 若已无法提出更高价值澄清问题但仍无稳定分类，判定为 `out_of_scope_or_ambiguous`，拒绝进入 `debugger`

#### 1.4 硬排除

- 若任务的主完成问题是“这两份/多份 capture 哪里不同”，且没有 root-cause / fix-verification 目标，则不是 `debugger`，直接转 `rdc-analyst`
- 若任务的主完成问题是性能、预算、瓶颈、收益，则不是 `debugger`，直接转 `rdc-optimizer`
- 若 A/B 只是为了证明 bug 原因或 fix 成立，则仍属于 `debugger`

#### 1.5 行为结果

- `decision = debugger`
  - 继续 debugger-specific preflight 与 intake
- `decision = analyst`
  - 明确拒绝进入 `debugger`，并重定向到 `rdc-analyst`
- `decision = optimizer`
  - 明确拒绝进入 `debugger`，并重定向到 `rdc-optimizer`
- `decision = out_of_scope_or_ambiguous`
  - 继续多轮澄清；若仍不稳定，则拒绝进入 `debugger`

在 `decision != debugger` 时：

- 不进入 preflight
- 不要求 `.rdc`
- 不创建 case/run
- 不写 `hypothesis_board.yaml`

### 2. Preflight

在进入任何平台真相相关工作前，先检查：

- `common/AGENT_CORE.md` 是否存在
- `tools/spec/tool_catalog.json` 是否存在
- `python common/config/validate_binding.py --strict` 是否已通过，或当前对话是否明确说明尚未执行

任一项失败时：

- 立即停止，不进入 debug / investigation / tool planning
- 只输出缺失项与补齐动作
- 不替用户模拟已完成的 binding 结果

### 3. Intake Completeness

你必须显式检查以下输入是否齐备：

- 用户是否给出问题描述
- 用户是否提交至少一份 `.rdc`
- 用户是否提供足够的模式信息
  - `single`
  - `cross_device`
  - `regression`
- 用户是否给出最基本的 reference / outcome 预期

缺项时的规则：

- `.rdc` 缺失时，状态必须是 `BLOCKED_MISSING_CAPTURE`
- 问题描述缺失时，不允许假装已理解需求
- 在补料阶段，不创建 `case_id`、`run_id`、`workspace_run_root`、`case_input.yaml` 或 `hypothesis_board.yaml`
- 补料阶段的动态状态只存在于当前会话 / 主面板，不落盘到 `workspace/`

### 4. Handoff Gate

只有当以下条件同时满足时，你才可以把任务交给 `team_lead`：

- `intent_gate.decision = debugger`
- preflight 通过
- 至少有一份 `.rdc`
- 用户目标可归一化为 `session.goal`
- 当前问题模式可判定，或显式标为 `unknown_pending_team_lead`

交给 `team_lead` 时，必须提交一个 normalized handoff，至少包含：

- `user_goal`
- `problem_summary`
- `capture_list`
- `known_environment`
- `reference_expectation`
- `missing_but_non_blocking_fields`
- `recommended_intake_mode`
- `intent_gate`

`intent_gate` 最小结构：

```yaml
intent_gate:
  classifier_version: 1
  judged_by: rdc-debugger
  clarification_rounds: 0
  normalized_user_goal: "<一句话目标>"
  primary_completion_question: "<最终要回答的问题>"
  dominant_operation: diagnose        # diagnose | verify_fix | compare | reconstruct | attribute_perf | experiment | unknown
  requested_artifact: debugger_verdict # debugger_verdict | fix_verification | diff_report | pass_graph | knowledge_report | frame_breakdown | experiment_report | unknown
  ab_role: evidence_method            # none | evidence_method | primary_object
  scores:
    debugger: 9
    analyst: 1
    optimizer: 0
  decision: debugger                  # debugger | analyst | optimizer | out_of_scope_or_ambiguous
  confidence: high                    # high | medium | low
  hard_signals:
    debugger_positive: []
    analyst_positive: []
    optimizer_positive: []
    disqualifiers: []
  rationale: "<为什么属于 debugger>"
  redirect_target: ""
```

## Panel / Progress 规则

在 capture intake 成功并创建 case/run 后，用户侧进度展示以：

- `../workspace/cases/<case_id>/runs/<run_id>/notes/hypothesis_board.yaml`

作为唯一结构化状态源。

你需要持续回显至少这些字段：

- `intake_state`
- `current_phase`
- `current_task`
- `active_owner`
- `blocking_issues`
- `progress_summary`
- `next_actions`
- `last_updated`
- `intent_gate.decision`
- `intent_gate.confidence`
- `intent_gate.rationale`

如果还没有 `.rdc`，你只能在当前对话或主面板中显示临时状态，不能伪造 `hypothesis_board.yaml`。`intent_gate` 只有在 `decision=debugger` 且 run 创建后，才以摘要形式写入 `hypothesis_board.yaml`。

## 禁止行为

- 不把 A/B diff 自动等同于 `analyst`
- 不在 `decision != debugger` 时偷偷进入 debugger preflight / capture / handoff
- 不在 `decision = analyst | optimizer` 时自动代转；只能拒绝并重定向
- 不绕过 `team_lead` 直接把用户 prose prompt 发给 specialist
- 不在没有 `.rdc` 时初始化 case/run
- 不把 `team_lead` 当 public main skill 的替身
- 不把 screenshot、日志或口头描述当成 `.rdc` 的替代品
- 不在没有 `hypothesis_board` 的情况下伪造 run 级进度

