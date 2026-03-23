# Airtable API Integration

Automate and integrate with Airtable bases using the REST API.

## Authentication

### Personal Access Token (simplest)

Generate at https://airtable.com/create/tokens. Scope to specific bases and permissions.

```bash
export AIRTABLE_TOKEN="pat..."
```

### OAuth 2.0 (multi-user apps)

Register at https://airtable.com/create/oauth. Supports PKCE for public clients.

```python
"""airtable_oauth.py — OAuth 2.0 with PKCE for Airtable."""
import hashlib, secrets, base64, requests

def start_oauth(client_id: str, redirect_uri: str) -> tuple[str, str]:
    """Generate authorization URL with PKCE challenge.

    Args:
        client_id: From Airtable OAuth integration settings.
        redirect_uri: Your callback URL.

    Returns:
        Tuple of (authorization_url, code_verifier) — store verifier for token exchange.
    """
    verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(
        hashlib.sha256(verifier.encode()).digest()
    ).rstrip(b"=").decode()

    url = (
        f"https://airtable.com/oauth2/v1/authorize?"
        f"client_id={client_id}&redirect_uri={redirect_uri}"
        f"&response_type=code&scope=data.records:read data.records:write schema.bases:read"
        f"&code_challenge={challenge}&code_challenge_method=S256"
    )
    return url, verifier

def exchange_token(code: str, verifier: str, client_id: str, redirect_uri: str) -> dict:
    """Exchange authorization code for access token.

    Args:
        code: From Airtable's redirect.
        verifier: The PKCE code_verifier from start_oauth.
        client_id: OAuth client ID.
        redirect_uri: Must match the one used in authorization.
    """
    resp = requests.post("https://airtable.com/oauth2/v1/token", data={
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri,
        "client_id": client_id,
        "code_verifier": verifier,
    })
    return resp.json()  # access_token, refresh_token, expires_in
```

## Core API Patterns

### Record Operations

```python
"""airtable_records.py — CRUD operations on Airtable records."""
import requests, time

API = "https://api.airtable.com/v0"

def headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

def list_records(token: str, base_id: str, table_name: str,
                 view: str = None, formula: str = None,
                 fields: list = None, sort: list = None) -> list:
    """List all records from a table with optional filtering.

    Args:
        token: Personal access token or OAuth token.
        base_id: Base ID (starts with 'app').
        table_name: Table name or ID.
        view: Optional view name to filter/sort by.
        formula: Airtable formula for filtering (e.g., "AND({Status}='Active', {Score}>80)").
        fields: List of field names to return (reduces payload).
        sort: List of dicts with 'field' and 'direction' keys.

    Returns:
        List of all matching record objects.
    """
    params = {}
    if view:
        params["view"] = view
    if formula:
        params["filterByFormula"] = formula
    if fields:
        for i, f in enumerate(fields):
            params[f"fields[{i}]"] = f
    if sort:
        for i, s in enumerate(sort):
            params[f"sort[{i}][field]"] = s["field"]
            params[f"sort[{i}][direction]"] = s.get("direction", "asc")

    records = []
    offset = None
    while True:
        if offset:
            params["offset"] = offset
        resp = requests.get(f"{API}/{base_id}/{table_name}",
                            params=params, headers=headers(token))
        resp.raise_for_status()
        data = resp.json()
        records.extend(data["records"])
        offset = data.get("offset")
        if not offset:
            break
        time.sleep(0.2)  # Stay under 5 req/s rate limit

    return records

def create_records(token: str, base_id: str, table_name: str,
                   records: list[dict], typecast: bool = False) -> list:
    """Create up to 10 records at a time.

    Args:
        token: Auth token.
        base_id: Base ID.
        table_name: Target table.
        records: List of dicts with field values (max 10 per call).
        typecast: If True, Airtable auto-converts string values to proper types.

    Returns:
        List of created record objects with IDs.
    """
    # Airtable limits to 10 records per request
    created = []
    for i in range(0, len(records), 10):
        batch = [{"fields": r} for r in records[i:i + 10]]
        resp = requests.post(
            f"{API}/{base_id}/{table_name}",
            json={"records": batch, "typecast": typecast},
            headers=headers(token),
        )
        resp.raise_for_status()
        created.extend(resp.json()["records"])
        if i + 10 < len(records):
            time.sleep(0.2)
    return created

def update_records(token: str, base_id: str, table_name: str,
                   updates: list[dict]) -> list:
    """Update existing records (PATCH — partial update).

    Args:
        token: Auth token.
        base_id: Base ID.
        table_name: Target table.
        updates: List of dicts with 'id' and 'fields' keys (max 10 per call).
    """
    updated = []
    for i in range(0, len(updates), 10):
        batch = updates[i:i + 10]
        resp = requests.patch(
            f"{API}/{base_id}/{table_name}",
            json={"records": batch},
            headers=headers(token),
        )
        resp.raise_for_status()
        updated.extend(resp.json()["records"])
        if i + 10 < len(updates):
            time.sleep(0.2)
    return updated

def delete_records(token: str, base_id: str, table_name: str,
                   record_ids: list[str]) -> list:
    """Delete records by ID (max 10 per call).

    Args:
        token: Auth token.
        base_id: Base ID.
        table_name: Target table.
        record_ids: List of record IDs to delete.
    """
    deleted = []
    for i in range(0, len(record_ids), 10):
        batch = record_ids[i:i + 10]
        params = "&".join(f"records[]={rid}" for rid in batch)
        resp = requests.delete(
            f"{API}/{base_id}/{table_name}?{params}",
            headers=headers(token),
        )
        resp.raise_for_status()
        deleted.extend(resp.json()["records"])
        if i + 10 < len(record_ids):
            time.sleep(0.2)
    return deleted
```

### Formula Filtering

Airtable formulas are powerful for server-side filtering:

```python
# Common formula patterns
formulas = {
    # Exact match
    "status_active": "{Status} = 'Active'",

    # Multiple conditions
    "high_priority_open": "AND({Priority} = 'High', {Status} != 'Done')",

    # Date filtering — tasks due this week
    "due_this_week": "IS_BEFORE({Due Date}, DATEADD(TODAY(), 7, 'days'))",

    # Text search (case-insensitive)
    "name_contains": "FIND('search term', LOWER({Name}))",

    # Linked records — has at least one linked project
    "has_project": "{Project} != ''",

    # Number range
    "score_range": "AND({Score} >= 80, {Score} <= 100)",

    # Empty/non-empty checks
    "missing_email": "{Email} = ''",
    "has_attachment": "{Attachments} != ''",
}
```

### Schema Operations

Read and modify base structure:

```python
def get_base_schema(token: str, base_id: str) -> dict:
    """Get all tables, fields, and views in a base.

    Args:
        token: Auth token with schema.bases:read scope.
        base_id: Base ID.
    """
    resp = requests.get(f"https://api.airtable.com/v0/meta/bases/{base_id}/tables",
                        headers=headers(token))
    return resp.json()

def create_field(token: str, base_id: str, table_id: str,
                 name: str, field_type: str, options: dict = None) -> dict:
    """Add a new field (column) to a table.

    Args:
        token: Auth token with schema.bases:write scope.
        base_id: Base ID.
        table_id: Table ID (not name).
        name: Field name.
        field_type: One of: singleLineText, multilineText, number, percent,
                    currency, singleSelect, multipleSelects, date, checkbox, etc.
        options: Type-specific options (e.g., select choices, currency symbol).
    """
    body = {"name": name, "type": field_type}
    if options:
        body["options"] = options
    resp = requests.post(
        f"https://api.airtable.com/v0/meta/bases/{base_id}/tables/{table_id}/fields",
        json=body, headers=headers(token),
    )
    return resp.json()
```

### Webhooks

Listen for changes in real time:

```python
def create_webhook(token: str, base_id: str, notification_url: str,
                   table_id: str = None) -> dict:
    """Register a webhook for record changes.

    Args:
        token: Auth token with webhook:manage scope.
        base_id: Base ID to watch.
        notification_url: Your HTTPS endpoint for receiving payloads.
        table_id: Optional — watch a specific table instead of entire base.
    """
    spec = {"options": {"filters": {"sourceType": "client", "recordChangeScope": base_id}}}
    if table_id:
        spec["options"]["filters"]["watchDataInFieldIds"] = "all"
    resp = requests.post(
        f"https://api.airtable.com/v0/bases/{base_id}/webhooks",
        json={"notificationUrl": notification_url, "specification": spec},
        headers=headers(token),
    )
    return resp.json()

def list_webhook_payloads(token: str, base_id: str, webhook_id: str,
                          cursor: int = None) -> dict:
    """Fetch webhook payloads (poll-based — payloads expire after 7 days).

    Args:
        token: Auth token.
        base_id: Base ID.
        webhook_id: Webhook ID from create_webhook.
        cursor: Cursor from previous response for pagination.
    """
    params = {}
    if cursor:
        params["cursor"] = cursor
    resp = requests.get(
        f"https://api.airtable.com/v0/bases/{base_id}/webhooks/{webhook_id}/payloads",
        params=params, headers=headers(token),
    )
    return resp.json()
```

## Rate Limits

- **5 requests per second** per base
- Record operations: max **10 records** per create/update/delete call
- List: max **100 records** per page (use offset for pagination)
- Implement backoff on 429 responses

## Field Type Reference

| Type | API name | Notes |
|---|---|---|
| Single line text | `singleLineText` | Plain string |
| Long text | `multilineText` | Supports markdown |
| Number | `number` | Integer or decimal |
| Single select | `singleSelect` | One from predefined list |
| Multiple select | `multipleSelects` | Array of selections |
| Date | `date` | ISO 8601 string |
| Checkbox | `checkbox` | Boolean |
| URL | `url` | Validated URL string |
| Email | `email` | Validated email string |
| Phone | `phoneNumber` | String |
| Currency | `currency` | Number with currency formatting |
| Percent | `percent` | Number displayed as percentage |
| Attachment | `multipleAttachments` | Array of file objects with URL |
| Linked record | `multipleRecordLinks` | Array of record IDs |
| Lookup | `multipleLookupValues` | Read-only, from linked records |
| Rollup | `rollup` | Read-only, aggregation of linked records |
| Formula | `formula` | Read-only, computed value |

## Guidelines

- Always paginate list requests -- never assume all records fit in one response
- Use `filterByFormula` to reduce payload instead of fetching all and filtering client-side
- Batch operations in groups of 10 (API limit) with 200ms delays
- Use `typecast: true` for imports where field values might need conversion
- Attachment fields require URLs -- upload to a hosting service first, then pass the URL
- Linked record fields accept record IDs, not display values
- Formula and rollup fields are read-only -- you cannot write to them via API
- Webhook payloads don't contain full record data -- they signal changes, then you fetch details
- Rate limits are per-base, not per-token -- multiple integrations on the same base share the limit
