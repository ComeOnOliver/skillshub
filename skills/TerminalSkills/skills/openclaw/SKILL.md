# OpenClaw

## Overview

Manage OpenClaw, an open-source self-hosted gateway that connects messaging platforms (WhatsApp, Telegram, Discord, Slack, Signal, iMessage) to AI coding agents. Covers the full lifecycle from installation through multi-agent routing, cron scheduling, webhooks, and sub-agent orchestration. Configuration lives at `~/.openclaw/openclaw.json`.

## Instructions

When a user asks for help with OpenClaw, determine which task they need:

### Task A: Install and onboard

```bash
# Install globally
npm install -g openclaw@latest

# Interactive onboarding (creates config, pairs first channel, starts gateway)
openclaw onboard --install-daemon

# Or manual setup
openclaw channels login      # Scan QR to pair WhatsApp
openclaw gateway --port 18789  # Start the gateway
```

The Control UI is accessible at `http://127.0.0.1:18789/` after the gateway starts.

### Task B: Configure channels

Edit `~/.openclaw/openclaw.json` to enable channels. Each channel has `dmPolicy` (`pairing`, `allowlist`, `open`, `disabled`) and `groupPolicy` (`open`, `allowlist`, `disabled`).

**WhatsApp:**
```json5
{ channels: { whatsapp: { enabled: true, allowFrom: ["+15555550123"], groups: { "*": { requireMention: true } } } } }
```

**Telegram:**
```json5
{ channels: { telegram: {
  enabled: true, token: "BOT_TOKEN", dmPolicy: "pairing", groupPolicy: "allowlist",
  allowedGroups: { "-100123456789": { allowedUsers: ["987654321"] } }
} } }
```

**Discord:**
```json5
{ channels: { discord: {
  enabled: true, token: "BOT_TOKEN", groupPolicy: "allowlist",
  guilds: { "123456789012345678": { requireMention: true, users: ["987654321098765432"], channels: { "general": { allow: true } } } }
} } }
```

Verify connectivity with `openclaw channels status --probe`.

### Task C: Set up agents and routing

Define multiple agents in `agents.list`. Each agent gets an isolated workspace, session store, and tool access.

```json5
{
  agents: {
    list: [
      { id: "alfred", name: "Alfred", workspace: "~/.openclaw/workspace-alfred", default: true },
      { id: "support", name: "Support Agent", workspace: "~/agents/support" }
    ],
    defaults: {
      model: { provider: "anthropic", name: "claude-sonnet-4-20250514" },
      thinking: "off",
      heartbeat: { every: "30m", activeHours: { start: "08:00", end: "22:00", timezone: "America/New_York" } }
    }
  }
}
```

Route messages to agents using bindings (evaluated in priority order):

```json5
{
  bindings: [
    { match: { channel: "whatsapp", peer: { kind: "group", id: "120363403215116621@g.us" } }, agentId: "support" },
    { match: { channel: "telegram", peer: { kind: "group", id: "-100123" } }, agentId: "alfred" },
    { match: { channel: "discord", guildId: "123456789012345678", roles: ["111111111111111111"] }, agentId: "alfred" }
  ]
}
```

CLI commands: `openclaw agents list`, `openclaw agents info <id>`, `openclaw agents create`.

### Task D: Schedule cron jobs

Cron runs inside the gateway and persists jobs at `~/.openclaw/cron/`. Enable with `"cron": { "enabled": true }`.

```bash
# One-shot reminder (UTC, auto-deletes after run)
openclaw cron add --name "Reminder" --at "2026-02-15T16:00:00Z" \
  --session main --system-event "Check project deadlines" --wake now --delete-after-run

# Recurring isolated job with delivery to WhatsApp
openclaw cron add --name "Morning brief" --cron "0 7 * * *" \
  --tz "America/Los_Angeles" --session isolated \
  --message "Summarize overnight updates" \
  --announce --channel whatsapp --to "+15551234567"

# Manage jobs
openclaw cron list
openclaw cron run <job-id>           # Run immediately
openclaw cron runs --id <job-id>     # View run history
openclaw cron edit <job-id> --message "Updated prompt"
```

Schedule types: `at` (one-shot), `every` (fixed interval), `cron` (5-field expression with timezone).

### Task E: Set up webhooks

Enable webhook ingestion for external triggers:

```json5
{
  hooks: {
    enabled: true,
    token: "SHARED_SECRET",
    path: "/hooks",
    allowedAgentIds: ["hooks", "main"]
  }
}
```

Endpoints:
- `POST /hooks/wake` — enqueue a system event: `{"text": "description", "mode": "now"}`
- `POST /hooks/agent` — isolated agent run: `{"message": "task", "deliver": true, "channel": "slack", "to": "channel:C123"}`
- `POST /hooks/<name>` — custom mapped endpoints via `hooks.mappings`

Authenticate with `Authorization: Bearer <token>` header.

### Task F: Use sub-agents

Sub-agents run background tasks in isolated sessions. No configuration needed for defaults.

```json5
{
  agents: {
    defaults: {
      subagents: {
        model: "minimax/MiniMax-M2.1",
        thinking: "low",
        maxConcurrent: 4,
        archiveAfterMinutes: 120
      }
    }
  }
}
```

Spawn by telling the agent: "Spawn a sub-agent to research the latest Node.js release notes."

Manage with `/subagents list`, `/subagents stop <id>`, `/subagents log <id>`.

### Task G: Monitor and troubleshoot

```bash
openclaw status              # Local creds and sessions
openclaw status --deep       # Gateway health checks
openclaw gateway status      # Gateway process info
openclaw logs --follow       # Stream gateway logs
openclaw doctor              # Diagnose common issues
openclaw channels status --probe  # Test channel connectivity
```

Workspace files: `IDENTITY.md` (personality), `SOUL.md` (memory), `HEARTBEAT.md` (periodic tasks), `TOOLS.md` (tool access), `AGENTS.md` (subagent allowlist).

## Examples

### Example 1: Personal WhatsApp assistant with heartbeats

**User request:** "Set up OpenClaw as a personal assistant on WhatsApp with periodic check-ins"

```bash
$ npm install -g openclaw@latest
$ openclaw channels login   # Scan QR with assistant's phone
```

Config (`~/.openclaw/openclaw.json`):
```json5
{
  agent: {
    model: "anthropic/claude-sonnet-4-20250514",
    workspace: "~/.openclaw/workspace",
    heartbeat: { every: "30m", activeHours: { start: "08:00", end: "22:00", timezone: "America/New_York" } }
  },
  channels: { whatsapp: { allowFrom: ["+15555550123"], groups: { "*": { requireMention: true } } } },
  session: { scope: "per-sender", reset: { mode: "daily", atHour: 4, idleMinutes: 10080 } }
}
```

```bash
$ openclaw gateway --port 18789
Gateway started on http://127.0.0.1:18789/
# Agent now responds via WhatsApp and runs heartbeat checks every 30 min
```

### Example 2: Multi-agent team with cron and Discord routing

**User request:** "Set up two agents — one for code review in Discord, one for daily standup via Telegram"

Config:
```json5
{
  agents: { list: [
    { id: "reviewer", name: "Code Reviewer", workspace: "~/agents/reviewer", default: true },
    { id: "standup", name: "Standup Bot", workspace: "~/agents/standup" }
  ] },
  bindings: [
    { match: { channel: "discord", guildId: "123456789012345678" }, agentId: "reviewer" },
    { match: { channel: "telegram", peer: { kind: "group", id: "-1001234567890" } }, agentId: "standup" }
  ],
  channels: {
    discord: { enabled: true, token: "DISCORD_BOT_TOKEN", guilds: { "123456789012345678": { requireMention: true } } },
    telegram: { enabled: true, token: "TELEGRAM_BOT_TOKEN", groupPolicy: "allowlist", allowedGroups: { "-1001234567890": {} } }
  },
  cron: { enabled: true }
}
```

```bash
$ openclaw cron add --name "Daily standup" --cron "0 9 * * 1-5" \
  --tz "America/New_York" --session isolated \
  --message "Compile yesterday's commits and open PRs into a standup summary" \
  --announce --channel telegram --to "group:-1001234567890"
Cron job created: job-abc123
```

### Example 3: Webhook-triggered CI notifications to WhatsApp

**User request:** "Send me a WhatsApp message whenever my CI pipeline finishes"

Config addition:
```json5
{
  hooks: {
    enabled: true, token: "ci-webhook-secret-2024",
    mappings: [{ match: { path: "ci-notify" }, action: "agent", deliver: true, channel: "whatsapp", to: "+15555550123" }]
  }
}
```

GitHub Actions step:
```yaml
- name: Notify via OpenClaw
  run: |
    curl -X POST "https://openclaw.example.com/hooks/ci-notify" \
      -H "Authorization: Bearer ${{ secrets.OPENCLAW_HOOK_TOKEN }}" \
      -H "Content-Type: application/json" \
      -d '{"message": "Deploy of ${{ github.repository }} completed (${{ job.status }})"}'
```

## Guidelines

- Use a **separate phone number** for the WhatsApp assistant to avoid mixing personal and agent messages.
- Always configure `allowFrom` on WhatsApp to restrict who can message the agent.
- Start with `heartbeat.every: "0m"` (disabled) until you trust the setup, then increase to `"30m"`.
- Agent workspaces should be treated as the agent's memory — back them up with git (use a private repo).
- Session keys follow the pattern `agent:<agentId>:<channel>:<kind>:<id>`. Use `dmScope: "per-channel-peer"` for multi-user setups.
- Cron jobs without `--tz` use the gateway host's timezone. Always specify `--tz` for predictable scheduling.
- Webhook tokens should be stored securely and rotated periodically. Never use query string authentication.
- Sub-agents cannot spawn their own sub-agents (no nesting). Use `maxConcurrent` to control resource usage.
- For troubleshooting, start with `openclaw doctor` and `openclaw logs --follow` to identify issues quickly.
- OpenClaw config uses JSON5 format (comments and trailing commas are allowed).