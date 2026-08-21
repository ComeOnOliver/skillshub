---
name: routerbase-model-routing
description: Helps select model IDs, primary/fallback routing, and production-safe retry behavior.
---

# RouterBase Model Routing

Choose RouterBase model IDs and routing behavior for production agent workloads.

## Model selection

- Start with a primary model that fits latency, cost, and capability requirements.
- Identify fallback models that support the required tools, context length, and modalities.
- Keep model IDs explicit and versioned in configuration.

## Production-safe retry behavior

- Retry idempotent requests with bounded exponential backoff.
- Fall back to an alternate model when the primary is unavailable or returns provider errors.
- Log routing decisions and failures without leaking credentials.
