# OpenTelemetry Node.js

## Setup
```bash
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http
```

## Instrumentation
```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({ url: 'http://localhost:4318/v1/traces' }),
    instrumentations: [getNodeAutoInstrumentations()],
    serviceName: 'my-api',
});
sdk.start();
```

## Custom Spans
```typescript
import { trace } from '@opentelemetry/api';
const tracer = trace.getTracer('my-service');

async function processOrder(orderId: string) {
    return tracer.startActiveSpan('process-order', async (span) => {
        span.setAttribute('order.id', orderId);
        try {
            const result = await doWork();
            span.setStatus({ code: SpanStatusCode.OK });
            return result;
        } catch (err) {
            span.recordException(err); span.setStatus({ code: SpanStatusCode.ERROR });
            throw err;
        } finally { span.end(); }
    });
}
```

## Collectors: Jaeger, Zipkin, Grafana Tempo, Datadog, Honeycomb
