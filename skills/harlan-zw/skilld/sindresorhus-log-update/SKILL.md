# sindresorhus/log-update `log-update`

**Version:** 7.1.0 (1 week ago)
**Deps:** ansi-escapes@^7.1.0, cli-cursor@^5.0.0, slice-ansi@^7.1.2, strip-ansi@^7.1.2, wrap-ansi@^9.0.2
**Tags:** latest: 7.1.0 (1 week ago)

**References:** [package.json](./.skilld/pkg/package.json) • [GitHub Issues](./.skilld/issues/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `npx -y skilld search` instead of grepping `.skilld/` directories — hybrid semantic + keyword search across all indexed docs, issues, and releases.

```bash
npx -y skilld search "query" -p log-update
npx -y skilld search "issues:error handling" -p log-update
npx -y skilld search "releases:deprecated" -p log-update
```

Filters: `docs:`, `issues:`, `releases:` prefix narrows by source type.

## API Changes

✨ `.persist(...text)` — new in v7.0, writes text that stays in scrollback (like `console.log`) without clearing the update area [source](./.skilld/releases/v7.0.0.md)

✨ `defaultWidth` / `defaultHeight` options — new in v7.0 for `createLogUpdate()`, controls fallback dimensions when stream lacks `columns`/`rows` (default: 80×24) [source](./.skilld/releases/v7.0.0.md)

✨ Partial diff rendering — v7.0 only redraws changed lines instead of erasing all, reduces flicker [source](./.skilld/releases/v7.0.0.md)

✨ Synchronized output (`?2026h`/`?2026l`) — v7.1 wraps writes in DEC synchronized output sequences on TTYs, eliminates tearing [source](./.skilld/releases/v7.1.0.md)

⚠️ Node.js 20+ required — v7.0 dropped Node 18 support [source](./.skilld/releases/v7.0.0.md)

⚠️ `logUpdate.create()` removed in v5 — use named export `createLogUpdate` instead [source](./.skilld/releases/v5.0.0.md)

⚠️ `logUpdate.stderr` removed in v5 — use named export `logUpdateStderr` instead [source](./.skilld/releases/v5.0.0.md)

⚠️ Pure ESM since v5 — no `require()`, use `import logUpdate from 'log-update'` [source](./.skilld/releases/v5.0.0.md)

## Best Practices

✅ Use `.persist()` for permanent output between updating sections — it writes to scrollback history then resets the update region, unlike `.done()` which just freezes the current frame [source](./.skilld/pkg/readme.md)

```ts
logUpdate('Downloading...')
logUpdate.persist('✓ Download complete')  // stays in scrollback
logUpdate('Installing...')                 // new update region starts

```
✅ Call `.done()` when finished to restore the cursor — the default export hides the cursor on first call and only restores it on `.done()` [source](./.skilld/pkg/index.js)

✅ Set `showCursor: true` via `createLogUpdate` when your CLI also accepts user input — the default singleton hides the cursor which breaks interactive prompts [source](./.skilld/pkg/readme.md)

```ts
const log = createLogUpdate(process.stdout, { showCursor: true })
```

✅ Set `defaultWidth`/`defaultHeight` when output may be piped or redirected — `stream.columns`/`stream.rows` are undefined in non-TTY contexts, defaults are 80×24 [source](./.skilld/pkg/readme.md)

✅ Output is automatically clipped to terminal height (bottom lines kept, top removed) — cannot be disabled, design your output with the most important info at the bottom [source](./.skilld/issues/issue-51.md)

✅ Content exceeding terminal width is hard-wrapped per-character (not word-wrapped) — ANSI-colored strings are handled correctly but long unbroken lines will split mid-word [source](./.skilld/pkg/index.js)

✅ Multiple string arguments are joined with spaces, not newlines — `logUpdate('a', 'b')` produces `"a b"`, use template literals or `\n` for multiline [source](./.skilld/pkg/index.js)

✅ Use `createLogUpdate` for multiple independent update regions — the default export is a singleton; two modules sharing it will clobber each other's output. Each `createLogUpdate` call tracks its own state [source](./.skilld/issues/issue-48.md)

✅ v7.1.0 uses synchronized output (`\x1b[?2026h/l`) on TTYs to eliminate flicker — no action needed, but be aware this wraps every write in DEC private mode sequences that some non-standard terminals may not support [source](./.skilld/releases/v7.1.0.md)

✅ Identical consecutive frames are skipped (no-op) — safe to call `logUpdate()` at high frequency without performance concern, the library diffs and only writes changed lines [source](./.skilld/pkg/index.js)