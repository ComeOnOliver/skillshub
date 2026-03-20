# Debug Council: Research-Aligned Self-Consistency

Pure implementation of self-consistency (Wang et al., 2022). Each agent receives the **raw user prompt** and explores/debugs **independently**. No pre-processing, no shared context. Majority voting selects the answer.

**Use this for bugs and problems with ONE correct answer.**

## Step 0: Ask User How Many Agents

Before doing anything else, **ask the user how many solver agents to use**:

```
How many debug agents would you like me to use? (3-10)

Recommendations:
- 3 agents: Faster, still reliable
- 5 agents: Good balance
- 7 agents: High confidence
- 10 agents: Maximum confidence (critical bugs)

Note: Each agent will independently explore the codebase and find the bug.
This takes longer but provides true independence per the research.
```

Wait for the user's response. If they specified a number (e.g., "debug council of 5"), use that.

**Minimum: 3 agents** | **Maximum: 10 agents**

---

## CRITICAL: Pure Research Alignment

### What This Means

1. **NO orchestrator exploration** - Do NOT read files or gather context before spawning agents
2. **Raw user prompt to all agents** - Each agent gets the user's original request, unchanged
3. **Each agent explores independently** - Agents discover the codebase themselves
4. **True independence** - No shared context, no cross-contamination

### Why This Matters

The research shows that **independent samples** converge on correct answers. If we pre-process or share context, we:
- Introduce orchestrator bias
- Reduce independence
- May miss what individual agents would discover

---

## Workflow

### Step 1: Capture the Raw User Prompt

Take the user's request **exactly as stated**. Do NOT:
- ❌ Read files first
- ❌ Explore the codebase
- ❌ Add context
- ❌ Rephrase or enhance the prompt

Just capture what the user said.

### Step 2: Spawn Agents IN PARALLEL with RAW PROMPT

Spawn ALL agents simultaneously. Each gets the **exact same raw prompt**:

```
Task(agent: "debug-solver-1", prompt: "[USER'S EXACT WORDS]")
Task(agent: "debug-solver-2", prompt: "[USER'S EXACT WORDS]")
Task(agent: "debug-solver-3", prompt: "[USER'S EXACT WORDS]")
... (all in the SAME batch - parallel execution)
```

**DO NOT modify the prompt. DO NOT add context. Raw user words only.**

### Step 3: Agents Work Independently

Each agent will:
1. Read and understand the user's request
2. Explore the codebase using their tools (Read, Grep, Glob, LS)
3. Identify the root cause
4. Reason through solutions (chain-of-thought)
5. Generate a complete fix

**Each agent works in complete isolation** - they cannot see what other agents are doing or have found.

### Step 4: Track Progress & Collect Solutions

As agents complete, **show progress to the user**:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                     AGENT PROGRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
☑ Agent 1 - Complete
☑ Agent 2 - Complete  
☑ Agent 3 - Complete
☐ Agent 4 - Working...
☐ Agent 5 - Working...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Update this display as each agent finishes. When all complete:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                     AGENT PROGRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
☑ Agent 1 - Complete ✓
☑ Agent 2 - Complete ✓
☑ Agent 3 - Complete ✓
☑ Agent 4 - Complete ✓
☑ Agent 5 - Complete ✓

All agents finished! Analyzing solutions...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Collect all outputs for voting.

### Step 5: Majority Voting

**Group solutions by their core approach/answer:**

1. Identify the **key decision** in each solution
2. Group solutions that make the same key decision
3. Count how many agents chose each approach

**Voting rules:**
- **Clear majority (≥50%)**: Select that solution, HIGH confidence
- **Plurality (highest < 50%)**: Select that solution, MEDIUM confidence
- **No clear winner**: Analyze disagreement, LOW confidence

### Step 6: Implement the Winner

Implement the majority solution. Do NOT synthesize or merge - use the winning answer as-is.

### Step 7: Report Results

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    DEBUG COUNCIL RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📊 Voting Summary

| Approach | Description | Agents | Votes |
|----------|-------------|--------|-------|
| ✅ A | [description] | 1, 2, 4, 5, 7 | **5/7** |
| B | [description] | 3, 6 | 2/7 |

**Winner: Approach A** (71% consensus)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔍 What Each Agent Found

### Agent 1
- Files explored: [list]
- Root cause identified: [summary]
- Solution: [brief]

### Agent 2
- Files explored: [list]
- Root cause identified: [summary]
- Solution: [brief]

... (for each agent)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🧠 Reasoning Highlights

### Why majority chose Approach A:
- Agent 1: "[key insight]"
- Agent 2: "[key insight]"
- Agent 4: "[key insight]"

### Why minority chose differently:
- Agent 3: "[different perspective]"

### Valuable minority insight:
[Any good ideas from minority that might be worth noting]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📈 Confidence: HIGH/MEDIUM/LOW

[Explanation based on voting distribution and reasoning quality]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ✅ Selected Solution

[The complete winning solution]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔧 Implementation

[The actual code change being made]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Configuration

| Mode | Agents | Use Case |
|------|--------|----------|
| `debug council of 3` | 3 | Faster, still reliable |
| `debug council of 5` | 5 | Good balance |
| `debug council of 7` | 7 | High confidence |
| `debug council of 10` | 10 | Maximum confidence |

If user just says `debug council`, ask them to choose.

---

## Research Basis

Based on "Self-Consistency Improves Chain of Thought Reasoning in Language Models" (Wang et al., 2022):

| Principle | Our Implementation |
|-----------|-------------------|
| Same prompt to all | Raw user prompt, unmodified |
| Independent samples | Each agent explores independently |
| No shared context | No orchestrator pre-processing |
| Chain-of-thought | Agents use ultrathink |
| Majority voting | Count approaches, select majority |

---

## Why This is Slower (And Why That's OK)

Each agent independently:
- Explores the codebase
- Reads relevant files
- Reasons through the problem
- Generates a solution

This takes **3-10x longer** than shared-context approaches, but provides:
- **True independence** - no orchestrator bias
- **Diverse exploration** - agents may find different things
- **Research alignment** - matches the paper exactly
- **Maximum reliability** - for when accuracy matters most

**Use this for critical problems where getting it right matters more than getting it fast.**

---

## Agents

10 identical debug solver agents in `agents/` directory:
- `debug-solver-1` through `debug-solver-10`

All agents:
- Same instructions
- Same temperature (0.7)
- Same tools (Read, Grep, Glob, LS)
- Use ultrathink (extended thinking)
- Focus on finding the ONE correct answer

Diversity comes from sampling randomness and independent exploration, not different prompts.