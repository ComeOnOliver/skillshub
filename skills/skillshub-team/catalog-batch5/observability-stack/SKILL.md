# Observability Stack

## Prometheus Metrics
```typescript
import { Counter, Histogram, register } from 'prom-client';
const httpRequests = new Counter({ name: 'http_requests_total', help: 'Total HTTP requests', labelNames: ['method', 'path', 'status'] });
const httpDuration = new Histogram({ name: 'http_duration_seconds', help: 'Request duration', labelNames: ['method', 'path'] });

app.use((req, res, next) => {
    const end = httpDuration.startTimer({ method: req.method, path: req.path });
    res.on('finish', () => {
        httpRequests.inc({ method: req.method, path: req.path, status: res.statusCode });
        end();
    });
    next();
});
app.get('/metrics', async (req, res) => { res.set('Content-Type', register.contentType); res.send(await register.metrics()); });
```

## Docker Compose Stack
Grafana (dashboards) + Prometheus (metrics) + Loki (logs) + Tempo (traces)

## Key Metrics: request rate, error rate, latency (p50/p95/p99), saturation