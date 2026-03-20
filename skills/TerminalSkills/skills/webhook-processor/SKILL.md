# Webhook Processor

## Overview
This skill helps you build production-grade webhook ingestion endpoints that accept incoming HTTP callbacks, verify their authenticity, and process them reliably with exponential backoff retries and dead letter queues. It covers signature validation, idempotency keys, and graceful failure handling.

## Instructions

### 1. Scaffold the webhook endpoint
Create an HTTP endpoint that accepts POST requests. Immediately return a 200 status before processing — webhook senders expect fast acknowledgment.

```typescript
// webhook-receiver.ts
import express from "express";
import crypto from "crypto";
import { Queue } from "bullmq";

const app = express();
app.use(express.raw({ type: "application/json" }));

const webhookQueue = new Queue("webhooks", {
  connection: { host: "localhost", port: 6379 },
});

app.post("/webhooks/:source", async (req, res) => {
  const signature = req.headers["x-signature-256"] as string;
  const idempotencyKey =
    req.headers["x-idempotency-key"] ||
    crypto.createHash("sha256").update(req.body).digest("hex");

  await webhookQueue.add(
    "process",
    {
      source: req.params.source,
      payload: req.body.toString(),
      signature,
      idempotencyKey,
      receivedAt: new Date().toISOString(),
    },
    {
      jobId: String(idempotencyKey),
      attempts: 5,
      backoff: { type: "exponential", delay: 3000 },
    }
  );

  res.status(200).json({ received: true });
});
```

### 2. Verify webhook signatures
Always validate the signature before processing. Each provider uses different schemes:

```typescript
function verifySignature(
  payload: string,
  signature: string,
  secret: string,
  scheme: "hmac-sha256" | "hmac-sha1"
): boolean {
  const algo = scheme === "hmac-sha256" ? "sha256" : "sha1";
  const expected = crypto
    .createHmac(algo, secret)
    .update(payload, "utf8")
    .digest("hex");
  const prefix = scheme === "hmac-sha256" ? "sha256=" : "sha1=";
  return crypto.timingSafeEqual(
    Buffer.from(prefix + expected),
    Buffer.from(signature)
  );
}
```

### 3. Implement the worker with retry logic
Process jobs from the queue. Failed jobs retry with exponential backoff. After all retries exhaust, move to a dead letter queue.

```typescript
import { Worker } from "bullmq";

const worker = new Worker(
  "webhooks",
  async (job) => {
    const { source, payload, signature } = job.data;
    const secret = getSecretForSource(source);
    if (!verifySignature(payload, signature, secret, "hmac-sha256")) {
      throw new Error("Invalid webhook signature — will not retry");
    }
    const event = JSON.parse(payload);
    await routeEvent(source, event);
  },
  {
    connection: { host: "localhost", port: 6379 },
    limiter: { max: 50, duration: 1000 },
  }
);

worker.on("failed", (job, err) => {
  if (job && job.attemptsMade >= 5) {
    console.error(`Dead letter: job ${job.id} — ${err.message}`);
    // Move to dead letter queue for manual inspection
  }
});
```

### 4. Add idempotency tracking
Prevent double-processing with a deduplication store:

```typescript
import Redis from "ioredis";
const redis = new Redis();

async function isProcessed(key: string): Promise<boolean> {
  const result = await redis.set(key, "1", "EX", 86400, "NX");
  return result === null; // null means key already existed
}
```

## Examples

### Example 1: Payment provider webhook
**Prompt:** "Set up a webhook endpoint to receive payment events. It should verify HMAC-SHA256 signatures, retry failed processing up to 5 times with exponential backoff, and log dead letter events."

**Agent output:**
- Creates `src/webhooks/payment-handler.ts` with signature verification using the provider's signing secret
- Creates `src/workers/payment-worker.ts` with BullMQ retry config (5 attempts, 3s/9s/27s/81s/243s backoff)
- Creates `src/utils/dead-letter.ts` that stores failed events in a `dead_letters` database table
- Adds integration test that simulates an invalid signature and verifies rejection

### Example 2: Version control platform webhook
**Prompt:** "Build a webhook handler for repository push events that triggers CI builds. Include idempotency so duplicate deliveries don't start duplicate builds."

**Agent output:**
- Creates `src/webhooks/repo-handler.ts` that validates the event type and extracts commit SHA
- Uses the commit SHA as the idempotency key — same commit never triggers two builds
- Creates `src/workers/build-trigger.ts` that enqueues build jobs only for new commits
- Adds a Redis-backed deduplication check with 24-hour TTL

## Guidelines

- **Always return 200 immediately** — process asynchronously. Webhook senders timeout after 5-30 seconds and will retry, causing duplicates.
- **Use `crypto.timingSafeEqual`** for signature comparison to prevent timing attacks.
- **Set idempotency key TTL** to at least 24 hours — most providers retry for up to 72 hours.
- **Monitor your dead letter queue** — set up alerts when it grows beyond a threshold.
- **Log the raw payload** before processing — invaluable for debugging malformed events.
- **Rate limit your worker** to avoid overwhelming downstream services during webhook storms.
- **Handle schema changes** gracefully — webhook payloads evolve. Use optional chaining and validate required fields explicitly.