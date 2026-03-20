# Kafka with KafkaJS

## Setup
```bash
npm install kafkajs
```

## Producer
```typescript
const kafka = new Kafka({ clientId: 'app', brokers: ['localhost:9092'] });
const producer = kafka.producer();
await producer.connect();
await producer.send({ topic: 'events', messages: [{ key: 'user-1', value: JSON.stringify(event) }] });
```

## Consumer
```typescript
const consumer = kafka.consumer({ groupId: 'my-service' });
await consumer.subscribe({ topic: 'events' });
await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value!.toString());
        await processEvent(event);
    },
});
```

## Admin
```typescript
const admin = kafka.admin();
await admin.createTopics({ topics: [{ topic: 'events', numPartitions: 3 }] });
```

## Key Patterns
- Message keys for partition ordering
- Consumer groups for parallel processing
- Idempotent consumers (handle duplicates)
- Transactional producer for exactly-once