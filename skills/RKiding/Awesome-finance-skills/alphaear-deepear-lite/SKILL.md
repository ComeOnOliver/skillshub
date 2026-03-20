# DeepEar Lite Skill

## Overview

Fetch high-frequency financial signals, including titles, summaries, confidence scores, and reasoning directly from the DeepEar Lite platform's real-time data source.

## Capabilities

### 1. Fetch Latest Financial Signals

Use `scripts/deepear_lite.py` via `DeepEarLiteTools`.

-   **Fetch Signals**: `fetch_latest_signals()`
    -   Retrieves all latest signals from `https://deepear.vercel.app/latest.json`.
    -   Returns a formatted report of signal titles, sentiment/confidence metrics, summaries, and source links.

## Dependencies

-   `requests`, `loguru`
-   No local database required for this skill.

## Testing

Run the test script to verify the connection and data fetching:
```bash
python scripts/deepear_lite.py
```