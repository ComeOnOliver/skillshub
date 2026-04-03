# promql-cli — Usage Reference

## Instant Queries

Return a single value at the current time (or a specified time):

```bash
promql 'up'                                                      # all targets
promql 'up{job="node"}'                                          # filter by label
promql 'up' --time 2024-01-15T10:00:00Z                          # at a specific time
promql 'rate(http_requests_total[5m])'                           # computed rate
```

## Range Queries

Return a time series over a window. `--start` accepts durations or RFC3339:

```bash
promql 'rate(http_requests_total[5m])' --start 1h                # last 1 hour
promql 'up' --start 2h --end 1h                                  # 2h ago to 1h ago
promql 'up' --start 2024-01-15T00:00:00Z --end 2024-01-15T12:00:00Z
promql 'up' --start 1h --step 5m                                 # custom step (default: auto)
```

## Output Formats

```bash
promql 'up'                          # default: table (aligned columns)
promql 'up' --output table           # explicit table
promql 'up' --output csv             # CSV — pipe to files, spreadsheets
promql 'up' --output json            # JSON — pipe to jq for processing
promql 'up' --output raw             # raw PromQL API response
promql 'rate(http_requests_total[5m])' --start 1h --output graph  # ASCII sparkline — preferred for range queries
```

> **Prefer `--output graph` for range queries when working with an LLM.** ASCII sparklines convey trend direction (rising, falling, spiking, flat) in a compact format that LLMs parse well — far better than a table of raw timestamps and values.

## Metric Discovery

```bash
promql metrics                       # list all metric names in Prometheus
promql metrics | grep http           # filter metrics by name
promql labels http_requests_total    # list all label names for a metric
promql labels http_requests_total job  # list values for a specific label
promql meta http_requests_total      # show metric type (counter/gauge/etc.) and HELP text
```

## Targeting a Specific Host

```bash
promql --host http://prometheus.acme.org:9090 'up'
promql --config ~/.promql-cli-prod.yaml 'up'
```

## Full Flag Reference

| Flag | Default | Description |
| --- | --- | --- |
| `--host` | `http://localhost:9090` | Prometheus URL |
| `--config` | `~/.promql-cli.yaml` | Path to config file |
| `--output` | `table`/`graph` | Output format: `table`, `csv`, `json`, `graph` (default: table for instant queries, graph for range queries) |
| `--start` | — | Start time (duration like `1h` or RFC3339) |
| `--end` | now | End time |
| `--step` | auto | Query resolution step (e.g. `30s`, `5m`) |
| `--time` | now | Instant query time |
| `--no-headers` | false | Suppress column headers in table/csv output |
| `--timeout` | `10s` | HTTP request timeout |

## Combining with Shell Tools

```bash
# Find the top 5 jobs by request rate
promql 'sum by(job)(rate(http_requests_total[5m]))' --output csv | sort -t, -k2 -rn | head -5

# Export a time series to a file
promql 'node_cpu_seconds_total' --start 24h --output csv > cpu_export.csv

# Parse JSON with jq
promql 'up' --output json | jq '.data.result[] | {metric: .metric, value: .value[1]}'
```
