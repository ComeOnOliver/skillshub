# *nix Agent Tool Design

> A single `run(command="...")` tool with Unix-style commands outperforms a catalog of typed function calls.

**Credit:** This design was authored by the backend lead at [Manus](https://manus.im) and is implemented in the open-source [agent-clip](https://github.com/epiral/agent-clip) runtime by [@epiral](https://github.com/epiral). This skill packages that knowledge for use in OpenCode, OpenClaw, and Pinix.

---

## Core Philosophy

Unix and LLMs made the same architectural decision 50 years apart: **everything is text**.

- Unix: text streams, pipes, exit codes, `--help`, stderr
- LLMs: tokens in, tokens out — they only understand and produce text

This convergence means **the Unix terminal interface is the LLM's native tool interface**. Don't invent a new one.

---

## Principle 1: Single `run` Tool

Replace a catalog of typed function calls with one tool:

```python
run(command="...")
```

All capabilities exposed as CLI subcommands. The LLM composes strings instead of switching between unrelated API schemas.

**Why it works:**
- LLMs have seen billions of shell commands in training data — they already know CLI
- Command selection = string composition in one namespace
- Function selection = context-switching between N unrelated APIs
- Reduces "which tool?" cognitive load; agent focuses on "what do I need?"

**Example reduction:**

```
# Function-calling (3 calls):
read_file(path="/var/log/app.log")
search_text(text=<file>, pattern="ERROR")
count_lines(text=<matches>)

# CLI (1 call):
run(command="cat /var/log/app.log | grep ERROR | wc -l")
```

---

## Principle 2: Chain Parser (`parseChain`)

Support four Unix chain operators so a single tool call = a complete workflow:

| Operator | Behavior |
|----------|----------|
| `\|` | Pipe: stdout of previous → stdin of next |
| `&&` | And: next only if previous succeeded (exit 0) |
| `\|\|` | Or: next only if previous failed (exit ≠ 0) |
| `;` | Seq: next regardless of result |

**Examples:**
```bash
curl -sL $URL -o data.csv && cat data.csv | head 5    # download → inspect
cat access.log | grep "500" | sort | head 10           # read → filter → sort → top 10
cat config.yaml || echo "config not found, using defaults"  # try A, fall back to B
```

---

## Principle 3: Progressive `--help` Discovery (3 levels)

Never stuff full documentation into the system prompt. Use progressive disclosure:

**Level 0 — Tool description → command list** (injected at conversation start)
```
Available commands:
  cat    — Read a text file. For images use 'see'. For binary use 'cat -b'.
  see    — View an image (auto-attaches to vision)
  ls     — List files in current topic
  write  — Write file. Usage: write <path> [content] or stdin
  grep   — Filter lines matching a pattern (supports -i, -v, -c)
  memory — Search or manage memory
  clip   — Operate external environments (sandboxes, services)
```

**Level 1 — `command` with no args → usage string**
```
run(command="memory")
→ [error] memory: usage: memory search|recent|store|facts|forget
```

**Level 2 — `command subcommand` with missing args → specific parameters**
```
run(command="memory search")
→ [error] memory: usage: memory search <query> [-t topic_id] [-k keyword]
```

**Requirement:** Every command and subcommand MUST have complete help output. A good help message means one-shot success. A missing one means a blind guess.

---

## Principle 4: Error Messages as Navigation

Every error must contain: **what went wrong** + **what to do instead**.

```
# Traditional (useless to agents):
cat: binary file (standard output)

# Agent-optimized:
[error] cat: binary image file (182KB). Use: see photo.png
[error] unknown command: foo — Available: cat, ls, see, write, grep, memory, clip
[error] clip "sandbox" not found. Use 'clip list' to see available clips
```

**Production lesson:** Silent stderr caused 10 blind retries to find the right package manager. Always surface stderr on failure.

```
# WRONG:
if stdout != "": discard stderr

# RIGHT:
always attach stderr on failure:
output + "\n[stderr] " + stderr
```

---

## Principle 5: Consistent Output Format

Append `[exit:N | Xms]` to every tool result:

```
file1.txt
file2.txt
dir1/
[exit:0 | 12ms]
```

**Exit code semantics (LLMs already know these):**
- `exit:0` — success
- `exit:1` — general error  
- `exit:127` — command not found

**Duration signals cost:**
- `12ms` — cheap, call freely
- `3.2s` — moderate
- `45s` — expensive, use sparingly

Consistent format = agent internalizes pattern over the conversation. Inconsistency makes every call feel like the first.

---

## Principle 6: Two-Layer Architecture (CRITICAL)

Raw command output ≠ what the LLM should receive. Two hard LLM constraints drive this:

- **Constraint A:** Context window is finite and expensive
- **Constraint B:** LLMs cannot process binary data (produces meaningless high-entropy tokens that degrade surrounding attention)

```
┌─────────────────────────────────────────────────┐
│  Layer 2: LLM Presentation Layer                │  ← Designed for LLM constraints
│  Binary guard | Truncation+overflow | Meta      │
├─────────────────────────────────────────────────┤
│  Layer 1: Unix Execution Layer                  │  ← Pure Unix semantics
│  Command routing | pipe | chain | exit code     │
└─────────────────────────────────────────────────┘
```

**CRITICAL:** Layer 1 must be **raw, lossless, metadata-free**. If you truncate in Layer 1, `grep` only searches the first 200 lines. If you add `[exit:0]` in Layer 1, it becomes grep data. Processing only happens in Layer 2.

### Layer 2 Mechanisms

**A. Binary Guard**
```
Null byte detected → binary
UTF-8 validation failed → binary  
Control character ratio > 10% → binary

→ [error] binary image (182KB). Use: see photo.png
→ [error] binary file (1.2MB). Use: cat -b file.bin
```

**B. Overflow Mode**
```
Output > 200 lines or > 50KB?
  → Truncate to first 200 lines (rune-safe)
  → Write full output to /tmp/cmd-output/cmd-{n}.txt
  → Return:
    [first 200 lines]
    --- output truncated (5000 lines, 245.3KB) ---
    Full output: /tmp/cmd-output/cmd-3.txt
    Explore: cat /tmp/cmd-output/cmd-3.txt | grep <pattern>
             cat /tmp/cmd-output/cmd-3.txt | tail 100
    [exit:0 | 1.2s]
```

The agent already knows `grep`, `head`, `tail` — overflow mode turns large data into a familiar navigation problem.

**C. Metadata Footer**
```
[exit:0 | 1.2s]
```
Appended after the pipe chain completes. Never in Layer 1.

**D. stderr Attachment**
```
output + "\n[stderr] " + stderr
```
Always on failure. Never drop it when stdout is non-empty.

---

## When NOT to Use CLI

Typed APIs may be better when:
- **Strongly-typed interactions** — DB queries, GraphQL, schema validation required
- **High security** — CLI string concatenation has injection risk; use typed params + sandbox isolation
- **Native multimodal** — Pure audio/video binary stream processing

Safety boundaries are external (not iteration limits):
- Sandbox isolation (e.g., BoxLite containers)
- API spending caps
- User cancellation with graceful shutdown

---

## Production War Stories

| Story | Root Cause | Fix | Lesson |
|-------|-----------|-----|--------|
| PNG caused 20 iterations of thrashing | No binary guard in Layer 2 | `isBinary()` + `Use: see photo.png` | Return garbage = agent goes blind |
| 10 blind retries to find package manager | Silent stderr when stdout non-empty | Always attach stderr on failure | stderr is most needed when commands fail |
| 5,000-line log overwhelmed context | No overflow mode | Truncate + write to /tmp + give explore commands | A map beats the entire territory |

---

## Implementation Reference

**Original implementation by [@epiral](https://github.com/epiral):**

| Repo | Description |
|------|-------------|
| [epiral/agent-clip](https://github.com/epiral/agent-clip) | The agent as a Pinix Clip — full Go implementation of these principles |
| [epiral/pinix](https://github.com/epiral/pinix) | Decentralized runtime platform that hosts Clips (BoxLite micro-VMs, Edge Clips) |

| File | Responsibility |
|------|---------------|
| `internal/tools.go` | Command routing, single `run` entry point |
| `internal/chain.go` | Pipe/&&/\|\|/; chain parser |
| `internal/loop.go` | Two-layer agentic loop |
| `internal/fs.go` | Binary guard |
| `internal/clip.go` | stderr handling |
| `internal/browser.go` | Vision auto-attach |
| `internal/memory.go` | Semantic memory commands |
