# Event-Driven Architecture

## Event Sourcing
Store events as facts, rebuild state by replaying them.
```typescript
interface DomainEvent { type: string; aggregateId: string; data: unknown; timestamp: number; }
class OrderAggregate {
    apply(event: DomainEvent) {
        switch(event.type) {
            case 'OrderCreated': this.state.status = 'created'; break;
            case 'OrderShipped': this.state.status = 'shipped'; break;
        }
    }
    static fromEvents(events: DomainEvent[]) { /* replay */ }
}
```

## CQRS
- **Command side**: writes events to event store
- **Query side**: reads from materialized projections
- **Projection**: listens to events, updates read DB

## Saga Pattern (distributed transactions)
```typescript
try {
    await paymentService.charge(order);
    await inventoryService.reserve(order);
} catch { // compensating transactions
    await inventoryService.release(order);
    await paymentService.refund(order);
}
```

## Best Practices
- Events are immutable, past-tense (OrderCreated not CreateOrder)
- Idempotent consumers (same event twice = same result)
- Correlation IDs for distributed tracing
- Dead letter queues for failed messages
