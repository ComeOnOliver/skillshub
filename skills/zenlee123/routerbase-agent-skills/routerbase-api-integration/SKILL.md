---
name: routerbase-api-integration
description: Guides OpenAI-compatible RouterBase API setup and safe credential handling.
---

# RouterBase API Integration

Use RouterBase as an OpenAI-compatible model gateway.

## Setup

1. Create an API key at https://routerbase.com/.
2. Store it in `ROUTERBASE_API_KEY` or a secret manager.
3. Set the client base URL to `https://routerbase.com/v1`.

## Safe credential handling

- Never commit keys, tokens, or client secrets.
- Do not include credentials in prompts, logs, or example files.
- Rotate keys immediately if they are exposed.
