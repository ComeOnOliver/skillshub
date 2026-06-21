---
name: hermes-tweet
description: Use Hermes Tweet when a Hermes Agent workflow needs X/Twitter search, social listening, account reads, or approval-gated X actions through Xquik.
license: MIT
source: https://github.com/Xquik-dev/hermes-tweet
---

# Hermes Tweet

## When to Use

Use Hermes Tweet when Hermes Agent needs current X/Twitter context or controlled
account actions from the native `hermes-tweet` plugin.

Good fits:

- Social listening, launch monitoring, and trend research.
- Creator, brand, or community research from public X context.
- Support triage from public mentions, profiles, replies, or timelines.
- Giveaway, follower, list, and export evidence checks.
- Drafting, publishing, DMs, follows, webhooks, monitors, media, extraction
  jobs, or giveaway draws after explicit approval.

## Prerequisites

Install and enable the plugin in the Hermes runtime:

```bash
hermes plugins install Xquik-dev/hermes-tweet --enable
```

If the plugin is installed but not enabled, run:

```bash
hermes plugins enable hermes-tweet
```

Set `XQUIK_API_KEY` in the Hermes runtime environment or `~/.hermes/.env`
before calling authenticated tools. Never paste API keys, passwords, cookies,
signing keys, or TOTP secrets into chat, prompts, logs, issues, PR comments, or
tool arguments.

Keep account-changing routes disabled unless the current session needs them:

```bash
export HERMES_TWEET_ENABLE_ACTIONS=false
```

Set `HERMES_TWEET_ENABLE_ACTIONS=true` only for sessions where approved
account actions are required.

## Workflow

1. Use `tweet_explore` first to find a catalog-listed `/api/v1/...` route. This
   tool is available without network credentials.
2. Use `tweet_read` for public read-only routes after the exact path is known.
   This tool requires `XQUIK_API_KEY`.
3. Use `tweet_action` only for writes, private reads, monitors, webhooks,
   extraction jobs, media, giveaway draws, or other action-only routes after the
   user approves the exact operation. This tool requires `XQUIK_API_KEY` and
   `HERMES_TWEET_ENABLE_ACTIONS=true`.

## Common Patterns

### Social Listening

Search the catalog for trend, search, user, mention, or timeline routes with
`tweet_explore`, then use `tweet_read` to collect public context before
summarizing it.

### Launch Monitoring

Keep `tweet_action` disabled. Use read-only routes for trends, mentions, public
replies, and account checks.

### Controlled Publishing

Draft the content first. Enable actions only in a session that needs posting,
replying, DMs, follows, webhooks, monitors, or media changes, then call
`tweet_action` with the approved path and payload.

### Remote Gateway Profiles

Install and configure Hermes Tweet on the remote Hermes host where plugin tools
execute. The desktop chat surface should not receive runtime secrets unless it
also runs the Hermes runtime locally.

## Checks

After setup, verify that Hermes can see the plugin and tools:

```bash
hermes plugins list
hermes tools list
```

Expected behavior:

- `hermes-tweet` is enabled.
- `tweet_explore` appears without `XQUIK_API_KEY`.
- `tweet_read` appears after `XQUIK_API_KEY` is configured.
- `tweet_action` appears only when `HERMES_TWEET_ENABLE_ACTIONS=true`.

## Gotchas

- Do not guess endpoint paths. Use `tweet_explore`.
- Do not pass credentials in tool arguments.
- Do not use dashboard-admin, billing, credit top-up, API-key, account
  re-authentication, or support-ticket endpoints.
- Keep `tweet_action` disabled for unattended, monitoring-only, or read-only
  workflows.
- If you edit `~/.hermes/.env` while Hermes is already running, reload or
  restart the active Hermes session before calling authenticated tools.
