# promql-cli — Debugging Methodology

## Core Rule: Isolate Before Aggregating

The most common debugging mistake is starting with aggregated metrics. Aggregation masks individual bad actors — a single overloaded pod looks fine when its metrics are averaged with 9 healthy ones. Always start by narrowing to a single instance, then broaden once you understand what's happening.

## USE Method (Utilization, Saturation, Errors)

For infrastructure components (CPU, memory, disk, network):

```bash
# Utilization — how busy is the resource?
promql 'avg by(instance)(rate(node_cpu_seconds_total{mode!="idle"}[5m]))' --start 1h --output graph

# Saturation — is the resource overloaded? (queue depth, wait time)
promql 'node_load1 / on(instance) count by(instance)(node_cpu_seconds_total{mode="idle"})' --start 1h

# Errors — are requests failing?
promql 'rate(node_disk_io_time_seconds_total[5m])' --start 1h --output graph
```

## RED Method (Rate, Errors, Duration)

For services and HTTP endpoints:

```bash
# Rate — requests per second
promql 'sum by(job)(rate(http_requests_total[5m]))' --start 1h --output graph

# Errors — error ratio
promql 'sum by(job)(rate(http_requests_total{status=~"5.."}[5m])) / sum by(job)(rate(http_requests_total[5m]))' --start 1h

# Duration — latency (requires histogram metric)
promql 'histogram_quantile(0.99, sum by(le, job)(rate(http_request_duration_seconds_bucket[5m])))' --start 1h --output graph
```

## Step-by-Step: Investigating a Latency Spike

**1. Identify the time window**

```bash
promql 'histogram_quantile(0.99, sum by(le)(rate(http_request_duration_seconds_bucket[5m])))' --start 6h --output graph
```

**2. Isolate by instance — don't aggregate yet**

```bash
# Remove the sum(), keep instance labels
promql 'histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{job="api"}[5m]))' --start 2h --output graph
```

**3. Check resource pressure on the worst instance**

```bash
promql 'rate(node_cpu_seconds_total{mode!="idle", instance="bad-host:9100"}[5m])' --start 2h --output graph
promql 'node_memory_MemAvailable_bytes{instance="bad-host:9100"}' --start 2h --output graph
```

**4. Correlate with upstream dependencies**

```bash
promql 'rate(db_query_duration_seconds_sum{instance="bad-host:5432"}[5m]) / rate(db_query_duration_seconds_count{instance="bad-host:5432"}[5m])' --start 2h --output graph
```

## Step-by-Step: Investigating an Error Rate Spike

**1. Get the overall error rate**

```bash
promql 'sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))' --start 3h --output graph
```

**2. Break down by endpoint**

```bash
promql 'sum by(handler)(rate(http_requests_total{status=~"5.."}[5m]))' --start 1h --output csv | sort -t, -k2 -rn | head -10
```

**3. Check for upstream failures (dependency error rates)**

```bash
promql 'rate(grpc_client_handled_total{grpc_code!="OK"}[5m])' --start 1h --output graph
```

## Diagnose: Useful Checks

**Diagnose:** 1- `promql 'up' --output table` — check which scrape targets are down; a missing instance explains missing metrics 2- `promql metrics | grep <service>` — discover what metrics a service actually exposes before querying 3- `promql meta <metric>` — confirm the metric type (counter vs gauge) before applying `rate()` or `increase()`

## Finding the Right Metrics

When you don't know which metrics or thresholds are meaningful for a given component, start with `promql metrics` and `promql meta` to discover what your Prometheus instance exposes. For reference, the Awesome Prometheus Alerts project (samber/awesome-prometheus-alerts) maintains a curated collection of battle-tested PromQL alert rules organized by exporter, covering:

| Domain | Exporters covered |
| --- | --- |
| Infrastructure | node-exporter, cAdvisor, blackbox, IPMI, Windows, Proxmox |
| Databases | MySQL, PostgreSQL, Redis, MongoDB, Elasticsearch, Cassandra, Clickhouse, and more |
| Message brokers | Kafka, RabbitMQ, Pulsar, NATS, Zookeeper |
| Proxies & mesh | Nginx, HAProxy, Traefik, Envoy, Istio, Linkerd |
| Runtimes | JVM, Golang, PHP-FPM, Ruby, Python |
| Orchestrators | Kubernetes, Nomad, Consul, Etcd |
| Storage | Ceph, MinIO, ZFS, OpenEBS |
| Observability | Thanos, Loki, Grafana Mimir, OpenTelemetry Collector |
| Cloud | AWS CloudWatch, GCP Stackdriver, Azure, DigitalOcean |

Standard alert expressions are valid PromQL — you can use similar patterns with promql-cli to inspect current values. Example workflow:

```bash
# 1. Discover relevant metrics in your Prometheus instance
# 2. Write a PromQL expression based on common alerting patterns
# 3. Run it to see the current value
promql 'node_filesystem_avail_bytes{fstype!="tmpfs"} / node_filesystem_size_bytes{fstype!="tmpfs"} * 100' --output table

# 4. Run as a range query to see the trend
promql 'node_filesystem_avail_bytes{fstype!="tmpfs"} / node_filesystem_size_bytes{fstype!="tmpfs"} * 100' --start 6h --output graph
```

**Exporter documentation** — when alert rules aren't enough, check the official exporter docs for the full list of exposed metrics and their semantics. Each exporter's README lists all metric names and labels.

## Listing Available Metrics

Use `promql metrics` to discover what's actually exposed in your Prometheus instance. On large production setups this can return thousands of metric names — always filter immediately or the output becomes unmanageable.

```bash
# ✗ Bad — dumps every metric name, potentially thousands of lines
promql metrics

# ✓ Good — filter by exporter prefix or keyword
promql metrics | grep '^node_'          # node-exporter metrics
promql metrics | grep '^container_'     # cAdvisor / Kubernetes metrics
promql metrics | grep '^pg_'            # PostgreSQL exporter
promql metrics | grep '^redis_'         # Redis exporter
promql metrics | grep '^kafka_'         # Kafka exporter
promql metrics | grep http              # any metric mentioning http
```

Once you have a metric name, drill into its labels and type:

```bash
promql labels <metric>         # list all label names
promql labels <metric> job     # list all values for a specific label
promql meta <metric>           # show metric type (counter/gauge/histogram) and help text
```

Label values help you understand the cardinality before running a query — a metric with hundreds of `instance` values will return a large result set unless filtered:

```bash
# Check how many instances exist before querying
promql labels http_requests_total instance

# Then filter down to the relevant one
promql 'rate(http_requests_total{instance="api-1:8080"}[5m])' --output table
```
