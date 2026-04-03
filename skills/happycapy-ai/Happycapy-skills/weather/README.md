# Weather

Get current weather and forecasts using free services without requiring API keys.

## Overview

This skill provides weather information through two free services:
- **wttr.in**: Primary service with rich formatting options and visual weather displays
- **Open-Meteo**: Fallback JSON API for programmatic use

## Features

- Current weather conditions
- Multi-day forecasts
- Multiple output formats (text, PNG images)
- Support for cities, airport codes, and coordinates
- No API key required
- Metric and imperial units

## Usage Examples

### Quick Current Weather
```bash
curl -s "wttr.in/London?format=3"
# Output: London: ⛅️ +8°C
```

### Detailed Conditions
```bash
curl -s "wttr.in/London?format=%l:+%c+%t+%h+%w"
# Output: London: ⛅️ +8°C 71% ↙5km/h
```

### Full Forecast
```bash
curl -s "wttr.in/London?T"
```

### Weather Image
```bash
curl -s "wttr.in/Berlin.png" -o weather.png
```

## Requirements

- `curl` command-line tool (pre-installed on most systems)

## Services Used

- [wttr.in](https://wttr.in) - Weather in terminal with beautiful ASCII art
- [Open-Meteo](https://open-meteo.com) - Free weather API with JSON responses

## License

See the main repository LICENSE file.

## Original Source

From [openclaw/openclaw](https://github.com/openclaw/openclaw/tree/main/skills/weather)
