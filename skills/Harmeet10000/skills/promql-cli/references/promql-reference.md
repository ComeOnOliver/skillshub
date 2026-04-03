# PromQL Reference

## Metric Types

| Type | Description | Correct function |
| --- | --- | --- |
| **Counter** | Monotonically increasing, resets on restart | `rate()`, `increase()` |
| **Gauge** | Arbitrary value that goes up and down | Direct use, `avg()`, `max()` |
| **Histogram** | Cumulative buckets (`_bucket`, `_sum`, `_count`) | `histogram_quantile()` |
| **Summary** | Pre-computed quantiles (less flexible than histogram) | Direct use |

Using `rate()` on a gauge produces meaningless results. Using raw counter values ignores resets and gives absolute counts rather than rates — always check the metric type with `promql meta <metric>` before querying.

## Key Functions

### rate() and irate()

```promql
rate(http_requests_total[5m])    # average per-second rate over 5m window (smoothed)
irate(http_requests_total[5m])   # instantaneous rate (last 2 samples) — spiky, reactive
```

Use `rate()` for dashboards and alerts. Use `irate()` only when you need to detect very short spikes.

### increase()

```promql
increase(http_requests_total[1h])   # total increase over 1h (extrapolated)
```

`increase()` is `rate() * duration` — useful for "how many requests in the last hour?" rather than per-second rates.

### histogram_quantile()

```promql
# p99 latency across all instances
histogram_quantile(0.99, sum by(le)(rate(http_request_duration_seconds_bucket[5m])))

# p99 per job — keep job and le in by()
histogram_quantile(0.99, sum by(le, job)(rate(http_request_duration_seconds_bucket[5m])))
```

The `le` label must stay in the `by()` clause — it identifies the buckets that `histogram_quantile()` needs to interpolate percentiles. Dropping it produces `NaN`.

### Aggregation Operators

```promql
sum by(job)(rate(http_requests_total[5m]))       # sum, grouped by job
avg without(instance)(node_memory_MemFree_bytes) # avg, dropping instance label
max by(instance)(node_load1)                     # max per instance
min(node_memory_MemAvailable_bytes)              # global min
count by(job)(up)                                # count of series
topk(5, rate(http_requests_total[5m]))           # top 5 series by value
bottomk(3, node_memory_MemAvailable_bytes)       # bottom 3
```

### Label Matchers

```promql
http_requests_total{job="api"}                   # exact match
http_requests_total{job!="api"}                  # not equal
http_requests_total{status=~"5.."}               # regex match (RE2)
http_requests_total{status!~"2.."}               # regex not-match
http_requests_total{job="api", status=~"5.."}    # multiple matchers (AND)
```

Filter as early as possible — put matchers in the innermost vector selector, not after functions. This reduces the number of time series Prometheus evaluates.

### Binary Operators

```promql
# Error ratio
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# CPU usage ratio
1 - avg by(instance)(rate(node_cpu_seconds_total{mode="idle"}[5m]))

# Matching labels across metrics (one-to-one)
http_requests_total / on(instance, job) http_request_duration_seconds_sum
```

### offset

```promql
rate(http_requests_total[5m]) offset 1h    # same query, 1 hour ago (for comparison)
```

## Common Pitfalls

| Mistake | Consequence | Fix |
| --- | --- | --- |
| `rate()` on a gauge | Meaningless derivative of an arbitrary value | Use the gauge directly |
| Raw counter value (no `rate()`) | Absolute total ignores resets, not a rate | Wrap in `rate()` or `increase()` |
| Dropping `le` from `by()` in `histogram_quantile()` | Returns `NaN` or wrong percentile | Keep `le` in `by()` |
| Aggregating across instances before isolating | Masks per-instance anomalies | Start with individual instance, then aggregate |
| Range vector window too short for `rate()` | Noisy result if scrape interval is long | Use window ≥ 2× scrape interval |
| Mixing labels across binary operators | "many-to-many not allowed" error | Use `on()` or `ignoring()` to match labels |
