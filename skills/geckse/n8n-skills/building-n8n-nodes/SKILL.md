# n8n Node Builder

Build production-ready custom nodes for n8n using the official `n8n-node` CLI tool and n8n's best practices.

## When You Need More Detail

This skill uses progressive disclosure. The SKILL.md covers the full workflow and decision-making. For complete code templates, read these reference files:

- `references/declarative-node.md` — Full declarative node template with routing, credentials, and codex file
- `references/programmatic-node.md` — Full programmatic node template with execute method, error handling, item linking, and trigger patterns
- `references/credentials.md` — All credential/auth patterns (API key, Bearer, OAuth2, Basic, Custom, testedBy)
- `references/publishing.md` — Linting, testing, releasing, and verification checklist
- `references/common-mistakes.md` — Error catalog with 36 numbered mistake patterns and fixes

Read the appropriate reference file before writing any code.

## Workflow Overview

Building an n8n node follows this sequence:

1. **Decide** on the node style (declarative vs programmatic)
2. **Scaffold** the project with the `n8n-node` CLI
3. **Implement** the node base file, credentials file, and codex file
4. **Test** locally with `npm run dev`
5. **Lint** with `npm run lint`
6. **Publish** to npm and optionally submit for verification

## Step 1: Choose Your Node Style

n8n has two node-building styles. Picking the right one up front saves significant rework.

### Declarative Style (preferred for REST APIs)

Use declarative when the integration is a REST API wrapper. It's JSON-based, simpler, more future-proof, and faster to get approved for n8n Cloud.

The declarative style handles data flow through a `routing` key inside the operations object. There's no `execute()` method — n8n constructs HTTP requests from the JSON description automatically.

Declarative nodes support advanced patterns beyond simple routing: declarative dynamic dropdowns via `typeOptions.loadOptions.routing` with `setKeyValue`/`sort` postReceive transforms, dynamic property paths using `$parent`/`$index` expressions for nested body structures, routing on any parameter field (not just operations), `preSend` functions (including factory patterns) to transform request bodies before sending, custom `postReceive` functions to transform responses (including binary file handling with `binaryData` type), custom pagination functions with duplicate detection, three pagination modes (offset, generic token-based, and cursor-based via custom functions), `resourceLocator` parameters for multi-mode entity selection (list/URL/ID), `resourceMapper` for dynamic field mapping UIs, `fixedCollection` for structured filters/sort rules, advanced `displayOptions` with `_cnd` operators (eq, not, gte, lte, startsWith, includes, regex, exists, etc.) and `@version`/`@tool` special keys, `ignoreHttpStatusErrors` for custom error handling in postReceive, conditional transforms with `enabled`/`errorMessage` on all postReceive types, `propertyInDotNotation` control for literal dot keys, dynamic base URLs from credentials, and a `methods` object for `listSearch`, `loadOptions`, and `resourceMapping`. See `references/declarative-node.md` → "Advanced Declarative Patterns" for complete templates and a TypeScript type reference.

**Choose declarative when:**
- The API is REST-based
- You want a simpler, lower-risk codebase
- Even if you need custom request/response transformation (use `preSend`/`postReceive` functions)
- Even if you need file upload/download (use `preSend` with form-data, `postReceive` with binary data)
- Even if you need dynamic field mapping (use `resourceMapper`)
- Even if you need custom pagination logic (use custom pagination functions)

### Programmatic Style (required for advanced use cases)

Use programmatic when you need full control over execution. It requires an `execute()` method that reads inputs, builds requests, and returns results manually.

**You must use programmatic for:**
- Trigger nodes (webhook, polling, or other event-driven)
- GraphQL APIs
- Non-REST protocols
- Complex multi-step logic that chains multiple sequential API calls where later calls depend on earlier results

### Quick Decision

Ask: "Is this a REST API with no triggers and no multi-call chaining?" If yes → declarative (even for complex request/response transformation, pagination, file handling, and field mapping — use `preSend`/`postReceive` functions). Otherwise → programmatic.

## Step 2: Scaffold with the n8n-node CLI

The CLI sets up the correct project structure, dependencies, linter config, and build scripts automatically.

### Option A: Without installing (recommended)

```bash
npm create @n8n/node@latest n8n-nodes-<YOUR_NODE_NAME> -- --template <template>
```

Templates:
- `declarative/github-issues` — Demo with multiple operations and credentials (good for learning)
- `declarative/custom` — Blank declarative starting point (prompts for base URL, auth type)
- `programmatic/example` — Programmatic with full flexibility

### Option B: Install globally

```bash
npm install --global @n8n/node-cli
n8n-node new n8n-nodes-<YOUR_NODE_NAME> --template <template>
```

### Option C: Clone the n8n-nodes-starter repo

```bash
git clone https://github.com/n8n-io/n8n-nodes-starter.git n8n-nodes-<YOUR_NODE_NAME>
cd n8n-nodes-<YOUR_NODE_NAME>
rm -rf .git && git init
npm install
```

The starter provides pre-configured TypeScript, ESLint, build scripts, and example files. After cloning, rename/replace the example node and credential files with your own and update `package.json`.

### Naming Rules

Package names must follow one of these formats:
- `n8n-nodes-<NAME>` (e.g., `n8n-nodes-acme`)
- `@<ORG>/n8n-nodes-<NAME>` (e.g., `@myorg/n8n-nodes-acme`)

After scaffolding, the project looks like:

```
n8n-nodes-<name>/
├── package.json          # Must contain "n8n" attribute listing nodes and credentials
├── tsconfig.json
├── .eslintrc.js          # Don't edit — contains n8n linter config
├── nodes/
│   └── <NodeName>/
│       ├── <NodeName>.node.ts      # Base file — the node's core logic
│       ├── <NodeName>.node.json    # Codex file — metadata for n8n's node panel
│       └── <NodeName>.svg          # Icon — square SVG recommended
├── credentials/
│   └── <NodeName>Api.credentials.ts  # Credential file
└── dist/                 # Built output (generated by build command)
```

## Step 3: Implement the Node

Every node needs three files at minimum: the base file, the codex file, and the credentials file (unless no auth is needed).

### 3A: The Node Base File (`<Name>.node.ts`)

This is the heart of the node. It exports a class implementing `INodeType` with a `description` object.

**Critical rules:**
- The class name must match the filename (e.g., class `Acme` → file `Acme.node.ts`)
- Use `NodeConnectionType.Main` for inputs/outputs (imported from `n8n-workflow`). If your `n8n-workflow` version exports it as type-only, use the string `'main'` as fallback
- The `name` field in the description must be a camelCase unique identifier
- Use Title Case for `displayName` and all UI-facing strings
- Always set `noDataExpression: true` on Resource and Operation selectors
- Always include `action` on every operation option (e.g., `action: 'Create a contact'`)
- Use `import type` for symbols only used in type annotations (rule of thumb: if a symbol only appears in `: Type` annotations, function signatures, or `as Type` casts, use `import type`; if it's used as a value like `throw new NodeApiError(...)`, use regular import)
- Dynamic expressions in routing must start with `=` prefix: `'=/contacts/{{$parameter["id"]}}'`
- **Declarative nodes cannot have an `execute()` method** — if `requestDefaults` is present, n8n uses the routing engine and ignores `execute()`. Use one or the other
- The `execute()` method must return `[returnData]` — an array of arrays (one per output connector). Forgetting the outer array is a common error

**Standard description parameters** (same for both styles):

| Parameter | Type | Purpose |
|-----------|------|---------|
| `displayName` | string | Name shown in the UI |
| `name` | string | Internal camelCase identifier |
| `icon` | string | `'file:<name>.svg'` — reference the icon file |
| `group` | string[] | `['transform']` for action nodes, `['trigger']` for triggers |
| `version` | number or number[] | Start at `1`; use array for light versioning |
| `subtitle` | string | Template shown below node name, e.g. `'={{$parameter["operation"]}}'` |
| `description` | string | Short description for the node panel |
| `defaults` | object | `{ name: 'Display Name' }` |
| `inputs` | array | `[NodeConnectionType.Main]` |
| `outputs` | array | `[NodeConnectionType.Main]` |
| `usableAsTool` | boolean | `true` — enables use as an AI agent tool (recommended) |
| `credentials` | array | `[{ name: 'credName', required: true }]` |
| `properties` | array | Resource, operation, and field definitions |

**For declarative nodes**, also add:
- `requestDefaults: { baseURL: '...', headers: { Accept: 'application/json' } }` — supports dynamic expressions from credentials (e.g., `'={{ !$credentials.customBaseUrl ? "https://api.example.com/v1" : $credentials.baseUrl }}'`)
- Operations use a `routing` key to define HTTP method, URL, query strings, and body — use `encodeURIComponent()` for user values in URLs
- `routing` can be placed on any parameter (not just operations) — fields, fixedCollections, etc.
- Use `typeOptions.loadOptions.routing` for declarative dynamic dropdowns with `setKeyValue`/`sort` postReceive transforms
- Use dynamic property paths with `$parent`, `$index` expressions (e.g., `'=attributes.{{$parent.fieldName}}'`, `'=items[{{$index}}].value'`)
- Operations can use `routing.send.preSend` array for custom request transformation functions
- Operations can use `routing.output.postReceive` array for custom response transformation (including binary file handling)
- Operations can use `routing.operations.pagination` for custom pagination functions
- Use `type: 'resourceLocator'` for multi-mode entity selection (list/URL/ID) with `methods.listSearch`
- Use `type: 'resourceMapper'` for dynamic field mapping UIs with `methods.resourceMapping`
- Use `type: 'fixedCollection'` for structured parameter groups (filters, sort rules) with `$index` for array mapping
- Combine `displayOptions.show` and `displayOptions.hide` for fine-grained field visibility
- Split operations/fields into separate `*Description.ts` files per resource, spread into the main node
- Define a `methods` object on the class for `listSearch`, `loadOptions`, and `resourceMapping`

**For programmatic nodes**, also add:
- An `async execute()` method
- Proper item looping with `this.getInputData()` and `pairedItem` linking

For complete templates, read the appropriate reference file before coding:
- Declarative → Read `references/declarative-node.md`
- Programmatic → Read `references/programmatic-node.md`

### 3B: The Resource → Operation Pattern

n8n nodes follow a consistent UI pattern: **Resource** (what entity) → **Operation** (what action).

Each resource gets a dropdown, each operation gets a dropdown filtered by the selected resource using `displayOptions.show`. Operations should map to CRUD verbs where applicable: Create, Create or Update (Upsert), Delete, Get, Get Many, Update. Use the `action` field on each operation option to provide a human-readable description (e.g., `action: 'Create a contact'`). For Upsert, use displayName "Create or Update" with description "Create a new record or update an existing one (upsert)".

**Important naming rule:** The linter enforces naming list operations **"Get Many"** (not "Get All"). The operation value should be `getAll` but the display name must be `Get Many`.

### Return All / Limit Pattern

For list ("Get Many") operations, always include a `returnAll` boolean toggle (default `false`, description `'Whether to return all results or only up to a given limit'`) paired with a conditional `limit` number field that only shows when `returnAll` is `false` (`displayOptions: { show: { returnAll: [false] } }`). This is the standard pattern used across all n8n built-in nodes. See both reference templates for complete examples.

### 3C: displayOptions and Conditional Fields

Use `displayOptions.show` to conditionally display fields based on the selected resource, operation, or other parameter values (e.g., `show: { resource: ['contact'], operation: ['create'] }`). For version-specific fields, use `'@version'`: `displayOptions: { show: { '@version': [2] } }`.

### 3D: Additional Fields (Optional Parameters)

Group optional parameters under a collection named "Additional Fields":

```typescript
{
  displayName: 'Additional Fields',
  name: 'additionalFields',
  type: 'collection',
  placeholder: 'Add Field',
  default: {},
  displayOptions: {
    show: { resource: ['contact'], operation: ['create'] },
  },
  options: [
    // Individual optional fields here
  ],
}
```

### 3E: The Codex File (`<Name>.node.json`)

Metadata controlling how the node appears in n8n's node discovery panel:

```json
{
  "node": "n8n-nodes-<package>.<nodeName>",
  "nodeVersion": "1.0",
  "codexVersion": "1.0",
  "categories": ["Miscellaneous"],
  "resources": {
    "credentialDocumentation": [{ "url": "" }],
    "primaryDocumentation": [{ "url": "" }]
  }
}
```

The `node` field format is `<npm-package-name>.<node-internal-name>` (e.g., `n8n-nodes-acme.acmeService`).

Categories: Analytics, Communication, Data & Storage, Development, Finance & Accounting, Marketing & Content, Miscellaneous, Productivity, Sales, Utility.

### 3F: Credentials

Read `references/credentials.md` for complete patterns. Key points:
- File: `credentials/<Name>Api.credentials.ts`
- Class implements `ICredentialType`
- `name` must match the node's `credentials[].name`
- Use `authenticate: IAuthenticateGeneric` for header/body/query auth
- Use `test: ICredentialTestRequest` to validate credentials (or `testedBy` in the node for complex validation)
- Always use `$credentials` (plural) in expressions — `$credential` (singular) is wrong
- The linter requires an `icon` property using `Icon` type from n8n-workflow

### 3G: The Icon

SVG is recommended (square aspect ratio). PNG alternative: 60×60px. Place alongside the `.node.ts` file. Reference with `icon: 'file:<name>.svg'`. For light/dark variants: `icon: { light: 'file:icon.svg', dark: 'file:icon.dark.svg' }`. Don't reference Font Awesome — download and embed.

## Step 4: Error Handling (Programmatic Nodes)

Use `NodeApiError` for API errors and `NodeOperationError` for validation errors (both from `n8n-workflow`). Wrap each item's processing in `try/catch` and support `continueOnFail()` so users can choose to keep going on errors — push `{ json: { error: message }, pairedItem: { item: i } }` on failure. See `references/programmatic-node.md` → "Error Handling Patterns" for full examples including HTTP status-specific handling.

## Step 5: Item Linking (pairedItem / constructExecutionMetaData)

Every output item in a programmatic node must link back to its source input. There are two approaches:

**Modern approach (recommended):** Use `constructExecutionMetaData`:
```typescript
const executionData = this.helpers.constructExecutionMetaData(
  this.helpers.returnJsonArray(responseData),
  { itemData: { item: i } },
);
returnData.push(...executionData);
```

**Manual approach:** Set `pairedItem` directly:
```typescript
returnData.push({
  json: responseData,
  pairedItem: { item: i },
});
```

Without item linking, n8n can't trace data flow between nodes.

## Step 6: HTTP Helpers

Use n8n's built-in helpers — no external HTTP libraries:

```typescript
// Without auth:
const response = await this.helpers.httpRequest(options);

// With auth (handles credential injection automatically):
const response = await this.helpers.httpRequestWithAuthentication.call(
  this, 'credentialTypeName', options
);
```

**Deprecation warning:** `this.helpers.requestWithAuthentication` and `IRequestOptions` are **deprecated**. Always use `httpRequestWithAuthentication` with `IHttpRequestOptions`. The new interface uses `url` (not `uri`) and defaults to JSON parsing.

### GenericFunctions.ts Pattern

For programmatic nodes, create a `GenericFunctions.ts` helper to centralize HTTP logic. Include `IHookFunctions`, `IWebhookFunctions`, and `IPollFunctions` in the `this` type union for trigger node compatibility. See `references/programmatic-node.md` → "GenericFunctions.ts Pattern" for the full template with pagination variants.

### Dynamic Options (loadOptionsMethod)

Use `loadOptionsMethod` for dropdowns that fetch values from an API at runtime. Define a `methods.loadOptions` object in the node class, with each method returning `Array<{ name: string, value: string }>`. See `references/programmatic-node.md` for the complete pattern.

## Step 7: Node Versioning

**Light versioning** (all node types): Change `version` to an array `[1, 2]` and use `displayOptions: { show: { '@version': [2] } }`.

**Full versioning** (programmatic only): Extend `NodeVersionedType` with separate `v1/`, `v2/` directories. See the Mattermost node on GitHub for a real example.

## Step 8: Test, Lint, Publish

```bash
npm run dev              # Live-reload local n8n with your node
npm run lint             # Check against n8n standards
npm run lint -- --fix    # Auto-fix what's possible
n8n-node release         # Publish to npm (uses release-it)
```

Read `references/publishing.md` for the full publishing and verification checklist.

## Code Standards Summary

- Write in TypeScript; use `import type` for type-only imports (if a symbol only appears in `: Type` annotations or `as Type` casts, use `import type`)
- Use `httpRequestWithAuthentication` (not the deprecated `requestWithAuthentication`); use `url` not `uri` in `IHttpRequestOptions`
- Never mutate incoming data — clone with spread or `structuredClone()`
- No external runtime dependencies for verified nodes — use built-in helpers only
- `n8n-workflow` should be a peer dependency, not bundled
- Follow Resource → Operation pattern with `noDataExpression: true` on selectors
- Always include `action` on every operation option
- Use `constructExecutionMetaData` with `itemData` for proper item linking
- Implement `continueOnFail()` in every execute loop
- The `execute()` method returns `[returnData]` — don't forget the outer array wrapper
- Create `GenericFunctions.ts` for shared API request helpers (include `IHookFunctions` and `IWebhookFunctions` in the `this` type for trigger node compatibility)
- Add `usableAsTool: true` to node descriptions for AI agent compatibility
- Name list operations **"Get Many"** (not "Get All") — the linter enforces this
- Use `returnAll` / `limit` pair for list operations
- Use `displayOptions` for progressive field disclosure
- Optional params go in "Additional Fields" collections
- Title Case for UI text; Sentence case for descriptions/hints
- Trigger nodes: `inputs: []`, `group: ['trigger']`, "Trigger" suffix in `displayName` and class name
- Reuse internal parameter `value` names across operations
- Set `"strict": true` in the `n8n` config of `package.json`
- Use `$credentials` (plural) in credential expressions — `$credential` (singular) won't resolve
- Dynamic expressions in routing need the `=` prefix: `'=/path/{{$parameter.id}}'`
- Declarative nodes cannot have `execute()` — use routing OR execute, not both
- Use `typeOptions.loadOptions.routing` for declarative dynamic dropdowns — chain `rootProperty` → `setKeyValue` → `sort` postReceive transforms
- Use dynamic property paths: `$parent.fieldName` for nested objects, `$index` for array indexing in fixedCollections
- Use `encodeURIComponent()` / `encodeURI()` for user-provided values in routing URLs
- Place `routing` on any parameter that needs it (fields, fixedCollections), not just on operations
- Split multi-resource nodes into `*Description.ts` files per resource, spread into properties array
- Use `preSend` functions for custom request body transformation in declarative nodes — they receive and return `IHttpRequestOptions`
- Use custom `postReceive` functions for response transformation beyond `rootProperty`/`filter`/`limit`/`set`/`setKeyValue`/`sort`/`binaryData` — they receive `(items, response)` and return `INodeExecutionData[]`
- All postReceive transforms support optional `enabled` (boolean/expression) and `errorMessage` properties
- For file downloads in declarative nodes, set `returnFullResponse: true` and `encoding: 'arraybuffer'` on the request, then handle binary conversion in `postReceive`
- For file uploads in declarative nodes, use `preSend` to build `FormData` from `this.helpers.getBinaryDataBuffer()`
- Use `ignoreHttpStatusErrors: true` on request when you need custom error handling in postReceive
- Use `propertyInDotNotation: false` on `routing.send` when property names contain literal dots (default is `true`, which creates nested objects)
- For generic/token-based pagination, use `type: 'generic'` with `$response.body`/`$request` expressions
- For cursor-based pagination, create a reusable factory function using `IExecutePaginationFunctions` and `makeRoutingRequest()`
- Use `_cnd` operators in displayOptions for advanced conditions: `{ _cnd: { gte: 2 } }`, `{ _cnd: { startsWith: 'https' } }`, etc.
- Use `@version`, `@tool`, `@feature` special keys in displayOptions for version/context-specific fields
- Use `type: 'resourceLocator'` for entity selection (provides list, URL, and ID modes) — requires `methods.listSearch` on the node class
- Use `type: 'resourceMapper'` for dynamic field mapping (Create/Update) — requires `methods.resourceMapping` on the node class
- Use `type: 'fixedCollection'` with `multipleValues: true` for repeatable structured parameter groups (filters, sort rules)
- Combine `displayOptions.show` and `displayOptions.hide` for excluding specific parameter values
- Pass the linter before publishing — see `references/common-mistakes.md` for the full error catalog

## UX Patterns (Verification Requirements)

These patterns are required for verified community nodes and recommended for all nodes:

**Delete operation output:** Always return `{ deleted: true }` (not `{ success: true }`) from Delete operations. This confirms the deletion and triggers the following node.

**Simplify toggle:** When an endpoint returns data with more than 10 fields, add a "Simplify" boolean parameter that returns a curated subset of max 10 fields. Use displayName `Simplify` and description `Whether to return a simplified version of the response instead of the raw data`. Flatten nested fields in simplified mode.

**AI Tool Output parameter:** For nodes used as AI agent tools, add an "Output" options parameter with three modes: Simplified (same as Simplify above), Raw (all fields), and Selected Fields (user picks which fields to send to the AI agent). This prevents context window overflow.

**Resource Locator:** Use `type: 'resourceLocator'` instead of a plain string input whenever a user needs to select a single item (e.g., a specific document, board, or channel). It offers ID, URL, and "From list" modes. Default to "From list" when available. See the Trello and Google Drive nodes for examples.

**Sorting options for Get Many:** Enhance list operations by providing sorting options in a dedicated collection below the main "Options" collection.

**Binary data naming:** Don't use "binary data" or "binary property" in field names. Instead use "Input Data Field Name" / "Output Data Field Name".

**Upsert:** When the API supports it, include "Create or Update" as a separate operation alongside Create and Update.

## Trigger Nodes

Triggers are always programmatic. Four patterns:

| Type | Method | Use When | Example |
|------|--------|----------|---------|
| Webhook (auto) | `webhook()` + `webhookMethods` | Service supports API-based webhook registration | Stripe Trigger |
| Webhook (manual) | `webhook()` only | User pastes webhook URL into external service | Generic Webhook |
| Polling | `poll()` | No webhook support; check for new data on a schedule | Gmail Trigger |
| Event/Stream | `trigger()` | Long-running connection (WebSocket, SSE, message queue) | AMQP Trigger |

**Key differences from action nodes:**
- Set `group: ['trigger']` and suffix the `displayName` with "Trigger"
- Trigger nodes have `inputs: []` — they have NO inputs
- Class names and filenames get the `Trigger` suffix (e.g., `MyServiceTrigger`)
- Use `getWorkflowStaticData('node')` to persist state (webhook IDs, last-checked timestamps) between calls

For complete trigger templates with full code examples, read `references/programmatic-node.md` → "Trigger Node Patterns".

## Modular Structure (Complex Nodes)

For many resources/operations, split into modules:

```
nodes/MyNode/
├── MyNode.node.ts           # Main entry
├── GenericFunctions.ts      # Shared API request helpers
├── actions/                 # One dir per resource
│   ├── contact/
│   │   ├── create.ts
│   │   ├── get.ts
│   │   └── index.ts
│   └── deal/
│       └── index.ts
├── methods/                 # loadOptions, etc.
└── transport/               # Shared HTTP helpers
```

## n8n Data Structure

Data flows between nodes as arrays of items. Each item has `json` (required) and optionally `binary`. The `execute()` method returns `Promise<INodeExecutionData[][]>` — an array of arrays (one per output). Use `this.helpers.returnJsonArray(responseData)` to wrap raw data, and remember to return `[returnData]` (nested array).