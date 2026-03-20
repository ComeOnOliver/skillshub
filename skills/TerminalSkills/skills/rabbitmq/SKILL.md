# RabbitMQ

Build reliable messaging and task queue systems for microservice architectures and background processing.

## Setup

```yaml
# docker-compose.yml — RabbitMQ with management UI
services:
  rabbitmq:
    image: rabbitmq:3.13-management
    ports:
      - "5672:5672"    # AMQP
      - "15672:15672"  # Management UI
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: secret
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq

volumes:
  rabbitmq-data:
```

Management UI at http://localhost:15672 (admin/secret).

## Core Concepts

RabbitMQ routes messages through **exchanges** to **queues**. Producers send to exchanges, consumers read from queues. The exchange type determines routing logic:

- **Direct** — routes by exact routing key match
- **Fanout** — broadcasts to all bound queues (pub/sub)
- **Topic** — routes by pattern matching on routing key (`order.*`, `#.error`)
- **Headers** — routes by message header values

## Producer and Consumer

### Node.js (amqplib)

```typescript
// connection.ts — Shared connection with auto-reconnect

import amqp, { Channel, Connection } from 'amqplib';

let connection: Connection;
let channel: Channel;

async function getChannel(): Promise<Channel> {
  if (channel) return channel;

  connection = await amqp.connect('amqp://admin:secret@localhost:5672');
  channel = await connection.createChannel();

  // Prefetch 10 — each consumer processes up to 10 unacked messages
  // Prevents one slow consumer from starving others
  await channel.prefetch(10);

  connection.on('close', () => {
    console.error('RabbitMQ connection closed, reconnecting...');
    channel = null!;
    setTimeout(getChannel, 5000);
  });

  return channel;
}

export { getChannel };
```

```typescript
// task-producer.ts — Send tasks to a work queue

import { getChannel } from './connection';

/** Send a background task to the processing queue.
 *
 * @param queue - Target queue name.
 * @param task - Task payload.
 * @param priority - 0 (normal) to 9 (highest). Requires priority queue.
 */
async function sendTask(queue: string, task: object, priority = 0) {
  const ch = await getChannel();

  // Assert queue exists with desired properties (idempotent)
  await ch.assertQueue(queue, {
    durable: true,           // Survives broker restart
    arguments: {
      'x-max-priority': 10,  // Enable priority queue
      'x-dead-letter-exchange': 'dlx',  // Failed messages go here
      'x-message-ttl': 86400000,        // 24h TTL
    },
  });

  ch.sendToQueue(queue, Buffer.from(JSON.stringify(task)), {
    persistent: true,  // Write to disk (survives restart)
    priority,
    contentType: 'application/json',
    timestamp: Date.now(),
    messageId: crypto.randomUUID(),
  });
}

// Example: send an email task
await sendTask('email-queue', {
  to: 'user@example.com',
  template: 'welcome',
  data: { name: 'Alex', activationLink: 'https://app.example.com/activate/abc123' },
});

// High-priority: password reset (skip ahead of marketing emails)
await sendTask('email-queue', {
  to: 'user@example.com',
  template: 'password-reset',
  data: { resetLink: 'https://app.example.com/reset/xyz789' },
}, 9);
```

```typescript
// task-consumer.ts — Process tasks with acknowledgment

import { getChannel } from './connection';

/** Start consuming tasks from a queue.
 *
 * @param queue - Queue to consume from.
 * @param handler - Async function that processes each task.
 */
async function startWorker(queue: string, handler: (task: any) => Promise<void>) {
  const ch = await getChannel();

  await ch.assertQueue(queue, { durable: true });

  ch.consume(queue, async (msg) => {
    if (!msg) return;

    const task = JSON.parse(msg.content.toString());
    const msgId = msg.properties.messageId;

    try {
      await handler(task);
      ch.ack(msg);  // Success — remove from queue
    } catch (err) {
      console.error(`Task ${msgId} failed:`, err);

      // Check if this has been retried too many times
      const retryCount = (msg.properties.headers?.['x-retry-count'] || 0);
      if (retryCount >= 3) {
        ch.nack(msg, false, false);  // Send to dead-letter queue after 3 retries
      } else {
        // Requeue with incremented retry count
        ch.nack(msg, false, false);
        ch.sendToQueue(queue, msg.content, {
          ...msg.properties,
          headers: { ...msg.properties.headers, 'x-retry-count': retryCount + 1 },
        });
      }
    }
  });

  console.log(`Worker started on queue: ${queue}`);
}

// Start processing emails
startWorker('email-queue', async (task) => {
  await sendEmail(task.to, task.template, task.data);
});
```

For Python, use `pika` with `BlockingConnection`, `basic_qos(prefetch_count=N)`, and `basic_consume` with `basic_ack`/`basic_nack` for message handling.

## Exchange Patterns

### Fanout (broadcast)

Every bound queue gets every message — useful for notifications, cache invalidation, audit logging:

```typescript
// fanout.ts — Broadcast events to multiple consumers

const ch = await getChannel();

await ch.assertExchange('user-events', 'fanout', { durable: true });

// Each service creates its own queue bound to the exchange
// Email service queue
await ch.assertQueue('user-events-email', { durable: true });
await ch.bindQueue('user-events-email', 'user-events', '');

// Analytics service queue
await ch.assertQueue('user-events-analytics', { durable: true });
await ch.bindQueue('user-events-analytics', 'user-events', '');

// Publish — all bound queues receive the message
ch.publish('user-events', '', Buffer.from(JSON.stringify({
  type: 'user.registered',
  userId: 'usr-456',
  email: 'new@example.com',
})), { persistent: true });
```

### Topic (pattern routing)

Route messages to queues based on pattern matching:

```typescript
// topic.ts — Route by pattern (e.g., order.created goes to fulfillment, order.* goes to audit)

const ch = await getChannel();

await ch.assertExchange('events', 'topic', { durable: true });

// Fulfillment only cares about new orders
await ch.assertQueue('fulfillment', { durable: true });
await ch.bindQueue('fulfillment', 'events', 'order.created');

// Audit log captures everything
await ch.assertQueue('audit-log', { durable: true });
await ch.bindQueue('audit-log', 'events', '#');  // # matches all routing keys

// Payment service handles payment events
await ch.assertQueue('payment-processing', { durable: true });
await ch.bindQueue('payment-processing', 'events', 'payment.*');

// Publish with routing key
ch.publish('events', 'order.created', Buffer.from(JSON.stringify({ orderId: 'ord-123' })));
ch.publish('events', 'payment.received', Buffer.from(JSON.stringify({ amount: 89.97 })));
```

## Dead-Letter Queue

Failed messages need a place to go for inspection and replay:

```typescript
// dlq.ts — Dead-letter exchange and queue setup

const ch = await getChannel();

// Dead-letter exchange and queue
await ch.assertExchange('dlx', 'direct', { durable: true });
await ch.assertQueue('dead-letters', { durable: true });
await ch.bindQueue('dead-letters', 'dlx', '');

// Main queue — failed messages automatically route to DLX
await ch.assertQueue('orders', {
  durable: true,
  arguments: {
    'x-dead-letter-exchange': 'dlx',
    'x-dead-letter-routing-key': '',
  },
});

// Monitor dead letters
ch.consume('dead-letters', (msg) => {
  if (!msg) return;
  const reason = msg.properties.headers?.['x-death']?.[0]?.reason;
  console.error(`Dead letter (${reason}):`, msg.content.toString());
  // Alert, log to monitoring, or attempt manual replay
  ch.ack(msg);
});
```

## Delayed Messages

Use the `rabbitmq_delayed_message_exchange` plugin. Assert an exchange with type `x-delayed-message`, then publish messages with `headers: { 'x-delay': delayMs }` to schedule future delivery.

## RPC (Request-Reply)

For request-reply, create an exclusive auto-delete reply queue, send with `correlationId` and `replyTo`, and consume the reply queue filtering by `correlationId`.

## Guidelines

- **Always acknowledge messages** — unacked messages block the queue and prevent other consumers from getting them
- **Set prefetch count** — without it, RabbitMQ sends all messages to one consumer, starving others
- **Use durable queues and persistent messages** for anything that matters — in-memory queues vanish on restart
- **Dead-letter queues are not optional** — without them, failed messages disappear silently
- **One queue per consumer type** — don't have email and SMS services reading from the same queue
- **Idempotent consumers** — messages can be delivered more than once (network issues, rebalances). Design handlers to be safe to re-run.
- **Monitor queue depth** — growing queue length means consumers can't keep up. Alert on it.
- **Connection pooling** — create one connection with multiple channels, not one connection per operation