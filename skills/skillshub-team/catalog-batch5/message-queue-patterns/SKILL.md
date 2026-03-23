# Message Queue Patterns

## Work Queue: Multiple consumers share work, messages delivered to one consumer
## Pub/Sub: Messages broadcast to all subscribers
## Topic Routing: Pattern-based message routing (order.* matches order.created)
## Request/Reply (RPC): Correlate requests with responses via correlation IDs
## Dead Letter Queue: Failed messages routed to DLQ after max retries
## Priority Queue: High-priority messages processed first
## Delayed Messages: TTL-based delayed delivery

## Choosing a Broker
| Feature | RabbitMQ | Kafka | Redis Streams |
|---------|----------|-------|--------------|
| Ordering | Per-queue | Per-partition | Per-stream |
| Replay | No (consumed) | Yes (log-based) | Yes (limited) |
| Throughput | ~50K/s | ~1M/s | ~100K/s |
| Use case | Task queues | Event streaming | Simple pub/sub |

## Reliability Patterns
- Publisher confirms / acks
- Consumer acknowledgments
- Persistent/durable queues
- Exactly-once with idempotency keys
- Circuit breaker for downstream failures
