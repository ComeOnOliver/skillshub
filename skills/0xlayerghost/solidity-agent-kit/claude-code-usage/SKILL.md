---
name: claude-code-usage
description: "[AUTO-INVOKE] MUST be invoked at the START of each new coding session. Covers context management, task strategies, and Foundry-specific workflows. Trigger: beginning of any new conversation or coding session in a Solidity/Foundry project."
---

# Claude Code Best Practices

## Language Rule

- **Always respond in the same language the user is using.** If the user asks in Chinese, respond in Chinese. If in English, respond in English.

## Context Management Rules

| Rule | Why |
|------|-----|
| One window = one task | Mixing tasks pollutes context and degrades output quality |
| Use `/clear` over `/compact` | Clean start is more reliable than compressed context |
| `/clear` after complex tasks | Prevents old context from interfering with new work |
| Copy key info to new windows | Don't rely on context persistence — paste critical details |

## Task Execution Strategy

| Task Type | Recommended Approach |
|-----------|---------------------|
| Small bug fix (few lines) | Describe directly, let Claude modify in-place |
| Large feature / refactor | `/plan` → review approach → `/clear` → paste plan → execute step by step |
| Multi-file changes | Must use `/plan` workflow — never modify multiple files without a plan |
| Code analysis / learning | Ask Claude to analyze directly — no plan needed |
| Debugging | Provide error message + file path + relevant code — ask for root cause |

## Prompt Techniques

### Do This

- Give specific paths: *"Modify the `_transfer` function in `src/MyToken.sol`"*
- Give examples: *"Input: 100 tokens, Expected: 95 tokens after 5% fee"*
- Set boundaries: *"Only modify this function, don't touch other code"*
- Reference tests: *"The fix should make `test_transfer_feeDeduction` pass"*

### Avoid This

- Vague references: *"Modify that transfer function"* — which one? Where?
- Open-ended requests without constraints: *"Make it better"*
- Multiple unrelated tasks in one message

## Ambiguity Resolution — When Instructions Are Unclear

When a user instruction is vague, open-ended, or could be interpreted in multiple ways, do NOT guess and proceed. Proactively analyze the instruction and present all possible interpretations for the user to confirm before taking action.

### Trigger Conditions

Activate ambiguity resolution when the instruction matches ANY of these patterns:

| Pattern | Example |
|---------|---------|
| No target specified | "优化一下" — optimize what? |
| Multiple possible scopes | "加个检查" — which function? what kind of check? |
| Unclear boundary | "改一下权限" — add? remove? which role? |
| Implicit context | "跟上次一样处理" — what was "last time"? |
| Conflicting possibilities | "处理一下安全问题" — which vulnerability? what level? |

### Analysis Dimensions

When ambiguity is detected, analyze across these dimensions:

1. **Scope** — Which files / contracts / functions could be affected?
2. **Action** — What operation is intended? (add / modify / delete / refactor / fix)
3. **Skill match** — Which skills are relevant? Map each interpretation to applicable /skill
4. **Impact** — What side effects could each interpretation have?
5. **Constraints** — Are there implicit boundaries the user might assume?

### Output Format

Present findings as a numbered list:

```
我检测到你的指令存在多种可能的解读，在开始之前需要确认边界：

**可能的解读：**

1. **[解读A]** — [具体描述]
   - 涉及：[files / contracts]
   - 关联 skill：/skill-name
   - 影响范围：[scope]

2. **[解读B]** — [具体描述]
   - 涉及：[files / contracts]
   - 关联 skill：/skill-name
   - 影响范围：[scope]

**请确认：**
- 你想要哪个解读？（可多选）
- 是否有额外的约束条件？
```

### Example

```
User: "处理一下这个合约的安全问题"

AI: 我检测到你的指令存在多种可能的解读：

1. **运行 Slither 静态分析** — 用 slither MCP 扫描，修复高危问题
   - 关联 skill：/solidity-security
   - 影响范围：仅修复工具检测到的问题

2. **手动安全审计** — 按审计清单逐项检查（重入、权限、输入验证等）
   - 关联 skill：/solidity-audit
   - 影响范围：完整审查，可能涉及较多修改

3. **修复已知漏洞** — 你已知有特定安全问题，需要定位并修复
   - 关联 skill：/solidity-security
   - 影响范围：仅限特定问题

4. **DeFi 安全加固** — 添加防鲸鱼、防闪电贷等保护机制
   - 关联 skill：/defi-security
   - 影响范围：可能改变合约接口

请确认你想要哪个方向？
```

### Key Rules

| Rule | Why |
|------|-----|
| Never guess | Wrong guesses waste more time than one clarification round |
| Show skill connections | Map each interpretation to relevant /skill so user knows what workflow triggers |
| Respect confirmation | User says "就按第2个来" → proceed immediately, no further questions |
| Context-aware skip | If conversation history already disambiguates, skip this process and act directly |

## Meta-Prompting — When Things Go Wrong

When Claude's response misses the mark, don't just rephrase and retry. Use **Meta-Prompting** (reverse prompting) to let Claude diagnose the gap, then re-ask with complete context.

### Four Prompt Types

| Type | When to Use | Template |
|------|-------------|----------|
| **Diagnose** | Answer was wrong or incomplete | *"我刚才的提问中缺少了哪些关键信息，导致你没能一次性给出正确答案？请逐条列出。"* |
| **Rewrite** | You don't know how to improve the question | *"请帮我重写刚才的问题，补全你认为缺失的上下文，使你能一次性给出正确答案。"* |
| **Template** | Prevent same mistake next time | *"对于这类问题，我应该提供哪些信息你才能一次性解决？请给我一个提问模板。"* |
| **Pre-check** | Before Claude starts working | *"在你开始写代码之前，列出你还需要我提供的所有信息。"* |

### Recommended Flow

```
Step 1: Ask your question
        ↓ (answer is wrong or incomplete)
Step 2: Use [Diagnose] — "我的问题中缺少了什么？"
        ↓ (Claude lists missing info)
Step 3: Use [Rewrite] — "帮我重写这个问题"
        ↓ (Claude outputs a complete, self-contained prompt)
Step 4: Copy the rewritten prompt, `/clear`, paste and send
        ↓ (clean context + complete prompt = correct answer)
```

### Practical Example

```
# Round 1 — incomplete question
User: "帮我写一个 staking 合约"
Claude: (generates a basic staking contract, but missing reward logic)

# Round 2 — diagnose
User: "我刚才的提问中缺少了哪些信息？"
Claude: "你没有说明：
  1. 质押代币和奖励代币是否相同
  2. 奖励分发机制（按时间/按区块/固定APR）
  3. 是否需要锁仓期
  4. 是否需要紧急提取功能
  5. 管理员权限范围"

# Round 3 — rewrite
User: "帮我重写这个问题"
Claude: "请帮我写一个 Staking 合约，要求如下：
  - 质押代币：ERC20 TOKEN_A，奖励代币：ERC20 TOKEN_B
  - 奖励机制：按质押时长线性释放，年化 12%
  - 锁仓期：7 天最短锁仓
  - 紧急提取：支持，但扣除 10% 罚金
  - 管理员：可更新奖励率，不可触碰用户质押资金
  - 安全：使用 ReentrancyGuard + SafeERC20
  请基于 OpenZeppelin 5.x，Solidity ^0.8.20，Foundry 项目结构。"

# Round 4 — /clear, paste rewritten prompt, get correct result
```

### Key Principle

> **Don't guess what you missed — let Claude tell you.** One round of meta-prompting saves multiple rounds of trial and error.

### Post-Correction Rule

- **Every time after correcting a mistake, always end with: "Update your `CLAUDE.md` so you won't make the same mistake again."** This ensures lessons learned are persisted into the project memory, preventing the same error from recurring in future sessions.

## Git Operation Rules

- Always run `git diff` before committing to review changes
- Only commit — do not push unless explicitly requested
- Never push directly to main/master branch
- Stage specific files — never use `git add .` in Solidity projects (risk of committing `.env`)

## Foundry-Specific Workflow

| Action | Command |
|--------|---------|
| Before committing | `forge fmt && forge test` |
| After modifying contracts | `forge build` to check compilation |
| Before PR | `forge test --gas-report` to check gas impact |
| Debugging failed test | `forge test --match-test <name> -vvvv` for full trace |

## Quick Command Reference

| Command | Purpose |
|---------|---------|
| `/clear` | Clear context, start fresh |
| `/plan` | Enter planning mode — analyze before modifying |
| `/help` | View all available commands |
| `/compact` | Compress context (prefer `/clear` instead) |

## Project-level Configuration

Create `.claude/instructions.md` in the project root with project-specific rules. Claude automatically reads it at the start of every conversation — no manual loading needed.
