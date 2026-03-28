# OpenCLI

Turn websites into CLI commands while reusing an existing Chrome login session when needed.

## When to Use

- You need data from a website that already works in the browser but does not expose a clean public API.
- You want browser-backed extraction without exporting credentials out of Chrome.
- You want structured output from a website in `table`, `json`, `md`, or `csv`.
- You want to explore a site, generate an adapter, probe auth strategy, or smoke-test a generated workflow.

## Install

```bash
npm install -g @jackwener/opencli
opencli list
```

## Prerequisites

Browser-backed commands require:

1. Chrome running and already logged into the target site
2. [Playwright MCP Bridge](https://chromewebstore.google.com/detail/playwright-mcp-bridge/mmlmfjhmonkocbjadbfplnigmagldckm) installed
3. `PLAYWRIGHT_MCP_EXTENSION_TOKEN` configured for the Playwright MCP server

Public API commands such as `hackernews`, `v2ex`, and some `github search` flows do not need the browser setup.

## Core Usage

```bash
opencli <site> <command> [flags]
opencli list
opencli list --json
opencli hackernews top --limit 5 -f json
opencli bilibili hot --limit 10
opencli github search --keyword "cli"
```

## AI-Native Workflows

```bash
opencli explore <url> --site <name>
opencli synthesize <site>
opencli generate <url> --goal "hot"
opencli cascade <api-url>
opencli verify <site/name> --smoke
```

- `explore`: inspect a site and capture artifacts for later generation
- `synthesize`: generate adapters from existing explore artifacts
- `generate`: run the end-to-end explore to register flow in one step
- `cascade`: auto-probe auth strategy from `public` to `cookie` to `header`
- `verify`: smoke-test a generated adapter

If you need to build new adapters, read [references/cli-creator.md](references/cli-creator.md).

## Output And Debugging

```bash
opencli <site> <command> -f table
opencli <site> <command> -f json
opencli <site> <command> -f md
opencli <site> <command> -f csv
opencli <site> <command> -v
```

## Common Targets

- Browser-backed: `bilibili`, `zhihu`, `xiaohongshu`, `twitter`, `reddit`, `weibo`, `youtube`, `boss`, `yahoo-finance`, `reuters`, `smzdm`, `ctrip`
- Public or mixed: `hackernews`, `v2ex`, `github`, `bbc`

## Notes

- Tabs opened during execution are usually auto-closed afterwards.
- If a browser command returns empty data, first verify the site is reachable in Chrome and the session is logged in.
- For the full upstream command matrix and release details, start from `https://github.com/jackwener/opencli`.
