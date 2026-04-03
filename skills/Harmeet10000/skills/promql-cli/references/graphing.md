# promql-cli — ASCII Graphs

Use `--output graph` for an in-terminal ASCII sparkline of range queries. No external dependencies required.

```bash
promql 'rate(http_requests_total[5m])' --start 1h --output graph
promql 'node_memory_MemAvailable_bytes' --start 6h --step 5m --output graph
```

PromQL aggregations return multiple series — each becomes a separate line in the chart:

```bash
# One line per job
promql 'sum by(job)(rate(http_requests_total[5m]))' --start 1h --output graph

# One line per instance
promql 'rate(http_requests_total{job="api"}[5m])' --start 1h --output graph
```

Save to file by redirecting stdout:

```bash
promql 'node_load1' --start 6h --output graph > load_trend.txt
```

`--output graph` is the default for range queries (when `--start` is set) — omitting `--output` has the same effect.
