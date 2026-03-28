# PicoClaw

## Overview

PicoClaw is an ultra-lightweight personal AI assistant that runs on devices with as little as 10 MB RAM and boots in under 1 second. It connects to LLM providers (OpenRouter, Anthropic, OpenAI, Gemini, DeepSeek, Groq, Zhipu) and bridges conversations to messaging platforms via a gateway. Configuration lives in `~/.picoclaw/config.json`.

## Instructions

### 1. Install PicoClaw

**From source (recommended for development):**

```bash
git clone https://github.com/sipeed/picoclaw.git
cd picoclaw
make deps
make build      # binary at build/picoclaw
make install    # installs to ~/.local/bin
```

**From prebuilt binary:** download from [GitHub Releases](https://github.com/sipeed/picoclaw/releases) for linux-amd64, linux-arm64, linux-riscv64, darwin-arm64, or windows-amd64.

**With Docker Compose:**

```bash
git clone https://github.com/sipeed/picoclaw.git && cd picoclaw
cp config/config.example.json config/config.json
# Edit config/config.json with your API keys
docker compose --profile gateway up -d
```

### 2. Initial setup

```bash
picoclaw onboard    # creates ~/.picoclaw/config.json interactively
```

This generates the config file and workspace directory at `~/.picoclaw/workspace/`.

### 3. Configure an LLM provider

Edit `~/.picoclaw/config.json`. Set the model and at least one provider API key:

```json
{
  "agents": {
    "defaults": {
      "workspace": "~/.picoclaw/workspace",
      "model": "anthropic/claude-sonnet-4-5-20250929",
      "max_tokens": 8192,
      "temperature": 0.7,
      "max_tool_iterations": 20
    }
  },
  "providers": {
    "openrouter": {
      "api_key": "sk-or-v1-YOUR_KEY"
    }
  }
}
```

Supported providers: `openrouter`, `anthropic`, `openai`, `gemini`, `zhipu`, `deepseek`, `groq`, `nvidia`, `moonshot`, `vllm`. Each accepts `api_key` and optional `api_base`.

### 4. Chat with the agent

```bash
picoclaw agent -m "Summarize the Go 1.22 release notes"   # single query
picoclaw agent                                              # interactive mode
```

### 5. Set up a messaging gateway

Enable one or more channels in config.json, then start the gateway:

Each channel needs `enabled: true`, a bot token, and an `allow_from` list of user IDs. Example for Telegram (create bot via `@BotFather`, get user ID from `@userinfobot`):

```json
{
  "channels": {
    "telegram": { "enabled": true, "token": "123456:ABC-TOKEN", "allow_from": ["USER_ID"] }
  }
}
```

Discord: create bot at discord.com/developers/applications, enable MESSAGE CONTENT INTENT, invite with `bot` scope. Slack: use `bot_token` + `app_token`. Other channels: `line`, `dingtalk`, `qq`, `feishu`, `onebot`, `whatsapp`, `maixcam`.

Start the gateway:

```bash
picoclaw gateway
```

### 6. Enable web search

Add a Brave Search API key (2000 free queries/month) or use DuckDuckGo as fallback:

```json
{
  "tools": {
    "web": {
      "brave": { "enabled": true, "api_key": "BSA-YOUR-KEY", "max_results": 5 },
      "duckduckgo": { "enabled": true, "max_results": 5 }
    }
  }
}
```

### 7. Scheduled tasks and heartbeat

**Heartbeat** reads `~/.picoclaw/workspace/HEARTBEAT.md` every N minutes and executes tasks:

```json
{
  "heartbeat": { "enabled": true, "interval": 30 }
}
```

Write tasks in HEARTBEAT.md:

```markdown
## Quick Tasks
- Report current system uptime

## Long Tasks (use spawn for async)
- Search the web for security advisories and summarize
```

**Cron jobs** for one-time or recurring reminders:

```bash
picoclaw cron list                 # list scheduled jobs
picoclaw cron add "every 2 hours"  # add recurring job
```

### 8. Workspace and security

Workspace at `~/.picoclaw/workspace/` contains: `sessions/` (history), `memory/` (MEMORY.md), `cron/` (scheduled jobs), `skills/`, plus markdown files for agent identity (`IDENTITY.md`, `SOUL.md`, `AGENTS.md`, `USER.md`, `TOOLS.md`, `HEARTBEAT.md`).

By default `restrict_to_workspace: true` sandboxes all file/exec operations to the workspace. Dangerous commands (`rm -rf`, `mkfs`, fork bombs, `shutdown`) are blocked even when restrictions are disabled. Override with `PICOCLAW_AGENTS_DEFAULTS_RESTRICT_TO_WORKSPACE=false`.

## Examples

### Example 1: Deploy PicoClaw as a Telegram bot on a Raspberry Pi

**User request:** "Set up PicoClaw on my Raspberry Pi as a Telegram bot using Claude"

1. SSH into the Pi and install from source:

```bash
git clone https://github.com/sipeed/picoclaw.git
cd picoclaw && make deps && make build && make install
picoclaw onboard
```

2. Edit `~/.picoclaw/config.json`:

```json
{
  "agents": {
    "defaults": {
      "model": "anthropic/claude-sonnet-4-5-20250929",
      "max_tokens": 4096,
      "temperature": 0.7,
      "max_tool_iterations": 10
    }
  },
  "providers": {
    "openrouter": { "api_key": "sk-or-v1-abc123" }
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "token": "7654321:AAF-rG3example",
      "allow_from": ["198234567"]
    }
  },
  "heartbeat": { "enabled": true, "interval": 60 }
}
```

3. Start the gateway:

```bash
picoclaw gateway
```

The bot now responds to messages in Telegram from the allowed user.

### Example 2: Run PicoClaw with Docker Compose and Discord

**User request:** "Run PicoClaw in Docker with Discord and web search enabled"

1. Clone and configure:

```bash
git clone https://github.com/sipeed/picoclaw.git && cd picoclaw
cp config/config.example.json config/config.json
```

2. Edit `config/config.json`:

```json
{
  "agents": { "defaults": { "model": "google/gemini-2.5-flash" } },
  "providers": { "openrouter": { "api_key": "sk-or-v1-xyz789" } },
  "channels": {
    "discord": {
      "enabled": true,
      "token": "MTIzNDU2Nzg5.example.token",
      "allow_from": ["987654321012345678"]
    }
  },
  "tools": {
    "web": {
      "duckduckgo": { "enabled": true, "max_results": 5 }
    }
  }
}
```

3. Start with Docker Compose:

```bash
docker compose --profile gateway up -d
docker compose logs -f picoclaw-gateway   # verify it connected
```

To ask a one-shot question via Docker:

```bash
docker compose run --rm picoclaw-agent -m "What is the weather in Tokyo?"
```

## Guidelines

- Always set `allow_from` with specific user IDs in production to prevent unauthorized access to your bot.
- Only one gateway instance can run per bot token — running two causes Telegram "conflict: terminated by other getUpdates" errors.
- PicoClaw is in early development (pre-v1.0). Do not deploy to production environments with sensitive data.
- When `restrict_to_workspace` is `true`, all file and exec operations are sandboxed to the workspace directory. Subagents and heartbeat tasks inherit the same restriction.
- Groq provides free Whisper-based voice transcription. If configured, Telegram voice messages are transcribed automatically.
- Environment variables override config.json values using the pattern `PICOCLAW_SECTION_KEY` (e.g., `PICOCLAW_HEARTBEAT_INTERVAL=60`).
- Keep the model name prefixed with the provider when using OpenRouter (e.g., `anthropic/claude-sonnet-4-5-20250929`). For direct provider connections, use the bare model name (e.g., `glm-4.7` for Zhipu).
