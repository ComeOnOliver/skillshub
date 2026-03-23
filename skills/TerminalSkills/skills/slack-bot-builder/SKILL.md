# Slack Bot Builder

## Overview

Builds production-ready Slack bots and integrations using the Bolt framework. Handles app setup, event subscriptions, slash commands, interactive components (buttons, modals, dropdowns), message formatting with Block Kit, and deployment. Covers both simple webhook-based notifications and full conversational bots.

## Instructions

### 1. App Setup

When creating a new Slack bot:

1. Guide the user through https://api.slack.com/apps → Create New App
2. Recommend "From a manifest" for faster setup
3. Generate the app manifest YAML based on required scopes and features
4. Set up the following based on needs:
   - **Bot Token Scopes**: `chat:write`, `commands`, `app_mentions:read`, `channels:history`, `users:read`
   - **Event Subscriptions**: `message.channels`, `app_mention`, `message.im`
   - **Interactivity**: Enable for buttons, modals, dropdowns
   - **Slash Commands**: Register command names and descriptions

### 2. Project Scaffolding

Use Bolt.js (Node) or Bolt for Python:

```bash
# Node.js
npm init -y && npm install @slack/bolt dotenv

# Python
pip install slack-bolt python-dotenv
```

Standard project structure:
```
slack-bot/
├── app.js              # Main entry, Bolt app initialization
├── listeners/
│   ├── commands.js     # Slash command handlers
│   ├── events.js       # Event handlers (messages, mentions)
│   ├── actions.js      # Interactive component handlers
│   └── views.js        # Modal submission handlers
├── services/           # Business logic
├── blocks/             # Block Kit message templates
├── .env                # SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET, SLACK_APP_TOKEN
└── package.json
```

### 3. Core Patterns

**Sending messages:**
```javascript
await client.chat.postMessage({
  channel: channelId,
  blocks: [/* Block Kit blocks */],
  text: "Fallback text for notifications"
});
```

**Slash commands:**
```javascript
app.command('/deploy', async ({ command, ack, respond }) => {
  await ack();
  await respond({
    blocks: buildDeployConfirmation(command.text),
    response_type: 'ephemeral'
  });
});
```

**Interactive modals:**
```javascript
app.action('button_click', async ({ body, ack, client }) => {
  await ack();
  await client.views.open({
    trigger_id: body.trigger_id,
    view: buildModalView()
  });
});
```

**Event handling:**
```javascript
app.event('app_mention', async ({ event, say }) => {
  await say(`Hey <@${event.user}>! How can I help?`);
});
```

### 4. Block Kit Messages

Always use Block Kit for rich messages. Key block types:
- `section` — text with optional accessory (button, image, overflow)
- `actions` — row of interactive elements
- `input` — form fields in modals
- `divider` — visual separator
- `context` — small metadata text
- `header` — bold large text

Use https://app.slack.com/block-kit-builder for visual design.

### 5. Socket Mode vs HTTP

- **Socket Mode** (recommended for internal bots): No public URL needed, uses WebSocket
  - Set `SLACK_APP_TOKEN` (starts with `xapp-`)
  - `const app = new App({ token, signingSecret, socketMode: true, appToken })`
- **HTTP mode** (for public apps): Needs public URL, use ngrok for dev
  - `const app = new App({ token, signingSecret })`
  - `app.start(3000)`

### 6. Deployment

- **Simple**: Railway, Render, or any Node.js host
- **Production**: Container on ECS/Cloud Run with health checks
- **Serverless**: AWS Lambda with Slack Bolt's `AwsLambdaReceiver`

### 7. Rate Limits

Slack API rate limits:
- **Tier 1** (chat.postMessage): ~1 req/sec per workspace
- **Tier 2** (conversations.list): ~20 req/min
- **Tier 3** (users.list): ~50 req/min
- **Tier 4** (admin endpoints): varies

Handle 429 responses with exponential backoff. The Bolt framework handles basic retry logic.

## Examples

### Example 1: Daily Standup Bot

**Input:** "Build a Slack bot that posts daily standup prompts at 9am, collects responses via thread, and summarizes them at 5pm."

**Output:** A Bolt.js app with:
- Cron job (node-cron) posting standup template to #team channel at 9:00
- Thread listener collecting responses, parsing "yesterday/today/blockers" format
- 5pm summary job that aggregates all thread replies into a formatted Block Kit message
- `/standup-skip` slash command to mark days off

### Example 2: Incident Alert Bot

**Input:** "Create a Slack bot that receives PagerDuty webhooks and creates an incident channel with pre-populated runbook links."

**Output:** A Bolt.js app with:
- HTTP endpoint receiving PagerDuty webhook payloads
- Auto-creates `#incident-{date}-{title}` channel
- Posts incident details with severity-colored sidebar
- Pins runbook links based on service name lookup
- Adds on-call responders to channel automatically
- `/incident-resolve` command to archive channel and post timeline

## Guidelines

- Always set `text` fallback alongside `blocks` (for notifications and accessibility)
- Use ephemeral messages (`response_type: 'ephemeral'`) for user-specific responses
- Store tokens in environment variables, never in code
- Implement proper error handling — Slack silently drops unacknowledged interactions after 3 seconds
- Always `await ack()` within 3 seconds for commands and interactions
- Use `app.error()` global handler for uncaught errors
- For long operations, ack immediately, then use `respond()` or `chat.postMessage` later
- Test with Slack's Socket Mode locally before deploying
- Keep Block Kit messages under 50 blocks and 3000 characters per text field
