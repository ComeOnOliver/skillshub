# OpenTelemetry

## Overview

OpenTelemetry (OTel) is the unified observability standard for instrumenting applications with traces, metrics, and logs. It supports auto-instrumentation across Node.js, Python, Java, and Go, and exports telemetry to backends like Jaeger, Grafana, Datadog, and Honeycomb through a flexible Collector pipeline.

## Instructions

- When adding tracing, create spans with meaningful names, set span kinds (`CLIENT`, `SERVER`, `PRODUCER`, `CONSUMER`), add business-relevant attributes, and use W3C Trace Context for propagation.
- When adding metrics, choose the right instrument type: Counter for monotonic values, Histogram for distributions like latency, UpDownCounter for fluctuating values, and Gauge for point-in-time readings.
- When setting up auto-instrumentation, use the language-specific packages (`@opentelemetry/auto-instrumentations-node`, `opentelemetry-instrumentation` for Python, etc.) to capture HTTP, database, and messaging spans without code changes.
- When configuring the OTel Collector, define pipelines with receivers (OTLP, Prometheus), processors (batch, memory_limiter, tail_sampling), and exporters (OTLP, Jaeger, Datadog) in the collector config.
- When deploying Collectors, choose sidecar mode for per-pod collection, agent mode for per-node, or gateway mode for centralized processing.
- When setting resource attributes, always include `service.name`, `service.version`, and `deployment.environment`, and use cloud/container resource detectors for infrastructure metadata.
- When naming attributes, follow OTel semantic conventions (`http.request.method`, `db.system`, `messaging.system`) instead of inventing custom names.

## Examples

### Example 1: Add distributed tracing to a Node.js microservice

**User request:** "Instrument my Express API with OpenTelemetry tracing"

**Actions:**
1. Install `@opentelemetry/auto-instrumentations-node` and OTLP exporter
2. Configure SDK with service name, version, and `BatchSpanProcessor`
3. Set up OTLP exporter pointing to the Collector endpoint
4. Add custom spans with business attributes for key operations

**Output:** An auto-instrumented Express API sending traces to the OTel Collector with correlated spans across services.

### Example 2: Set up an OTel Collector pipeline

**User request:** "Configure an OTel Collector to receive traces and export to Grafana Tempo"

**Actions:**
1. Define OTLP gRPC receiver in the Collector config
2. Add batch processor and memory_limiter for production safety
3. Configure Tempo exporter with endpoint and authentication
4. Wire the traces pipeline: receiver -> processor -> exporter

**Output:** A Collector config file routing traces from applications to Grafana Tempo with batching and memory protection.

## Guidelines

- Always set `service.name` and `service.version` as resource attributes.
- Use semantic conventions for attribute names; never invent custom names when a standard exists.
- Configure `BatchSpanProcessor` in production, not `SimpleSpanProcessor`, to avoid blocking the application.
- Set `memory_limiter` processor on the Collector to prevent OOM crashes.
- Sample in production: `TraceIdRatioBased(0.1)` captures 10% of traces, sufficient for most services.
- Add custom attributes to spans for business context (`user.tier`, `feature.flag`, `order.total`).
- Never log sensitive data in span attributes (PII, secrets, tokens).
