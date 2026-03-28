# RabbitMQ with Node.js

## Setup
```bash
npm install amqplib
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

## Producer
```typescript
const conn = await amqp.connect('amqp://localhost');
const ch = await conn.createChannel();
await ch.assertQueue('tasks', { durable: true });
ch.sendToQueue('tasks', Buffer.from(JSON.stringify(msg)), { persistent: true });
```

## Consumer
```typescript
ch.prefetch(1);
ch.consume('tasks', async (msg) => {
    if (!msg) return;
    try {
        await process(JSON.parse(msg.content.toString()));
        ch.ack(msg);
    } catch { ch.nack(msg, false, true); }
});
```

## Pub/Sub (Fanout Exchange)
```typescript
await ch.assertExchange('events', 'fanout', { durable: true });
ch.publish('events', '', Buffer.from(data));
// Subscriber binds queue to exchange
```

## Topic Exchange: ch.publish('logs', 'order.created', data) → ch.bindQueue(q, 'logs', 'order.*')
## Dead Letter Queue: x-dead-letter-exchange + x-dead-letter-routing-key arguments
