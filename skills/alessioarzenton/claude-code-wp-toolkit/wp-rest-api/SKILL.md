---
name: wp-rest-api
description: WordPress REST endpoint development and debugging. Always-active rules when working with REST routes, API authentication, or data exposure via JSON.
user-invocable: false
---

# WordPress REST API

Skill for creating, managing, and debugging REST endpoints in WordPress 6.x+. Covers route registration, authentication, input validation, security, and integration with CPTs/taxonomies.

## When to use

Apply this skill when the task involves:

- Creating or modifying custom REST routes and endpoints
- Exposing Custom Post Types or taxonomies via REST
- Resolving authentication/authorization errors (401, 403, 404)
- Adding custom fields to REST responses
- Defining validation rules and JSON schemas
- Customizing response structure, pagination, links

## Prerequisites

Before starting, verify:

- Path of the plugin/theme/mu-plugin where routes will be registered
- Desired namespace and version (e.g., `{{TEXT_DOMAIN}}/v1`)
- Authentication strategy (cookie+nonce for admin, application passwords for external clients)
- Minimum WordPress version of the project

## Procedure

### 1) Detecting existing implementations

Before creating new endpoints, search the codebase:

```
register_rest_route    → custom routes already registered
WP_REST_Controller     → extended controllers
rest_api_init          → registration hooks
show_in_rest           → exposed CPTs/taxonomies
register_rest_field    → custom fields added
```

Check for namespace conflicts and registration patterns already in use.

### 2) Choosing the approach

| Scenario | Approach |
|----------|----------|
| Expose a CPT or taxonomy | `'show_in_rest' => true` in the CPT registration |
| Add fields to existing endpoints | `register_rest_field()` or `register_meta()` with `show_in_rest` |
| Custom logic (calculations, aggregations, actions) | `register_rest_route()` with a dedicated handler |
| Full CRUD endpoint | Extend `WP_REST_Controller` |

### 3) Secure endpoint registration

**Mandatory rules**:

```php
add_action('rest_api_init', function () {
    register_rest_route('{{TEXT_DOMAIN}}/v1', '/items', [
        'methods'             => WP_REST_Server::READABLE,  // Use constants, not strings
        'callback'            => 'handle_get_items',
        'permission_callback' => 'check_items_permission',  // MANDATORY — never '__return_true' in production if data is sensitive
        'args'                => get_items_args_schema(),
    ]);
});
```

- **Unique namespace**: `{{TEXT_DOMAIN}}/v1` — never register under `wp/v2`
- **`permission_callback` always present**: WordPress 5.5+ logs a `_doing_it_wrong` if missing
- **HTTP constants**: `WP_REST_Server::READABLE`, `::CREATABLE`, `::EDITABLE`, `::DELETABLE`
- **Response**: always return `rest_ensure_response()` or `new WP_REST_Response($data, $status)`

### 4) Argument validation and sanitization

Define the schema for every argument — never access `$_GET`/`$_POST` directly:

```php
function get_items_args_schema(): array {
    return [
        'per_page' => [
            'type'              => 'integer',
            'default'           => 10,
            'minimum'           => 1,
            'maximum'           => 100,
            'sanitize_callback' => 'absint',
            'validate_callback' => 'rest_validate_request_arg',
        ],
        'search' => [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
        ],
        'status' => [
            'type'              => 'string',
            'enum'              => ['aperto', 'chiuso', 'in_arrivo'],
            'default'           => 'aperto',
        ],
    ];
}
```

- Use JSON Schema `type`: `string`, `integer`, `boolean`, `array`, `object`
- Add `enum` for allowed values, `minimum`/`maximum` for ranges
- `sanitize_callback` cleans the data, `validate_callback` rejects it if invalid

### 5) Adding custom fields to responses

**For ACF/post meta metadata** — expose via `register_meta()`:

```php
register_meta('post', 'importo_bando', [
    'object_subtype' => 'bando',
    'type'           => 'number',
    'single'         => true,
    'show_in_rest'   => true,
    'auth_callback'  => function () {
        return current_user_can('edit_posts');
    },
]);
```

**For computed values** — use `register_rest_field()`:

```php
register_rest_field('bando', 'stato_calcolato', [
    'get_callback' => function ($object) {
        return calcola_stato_bando($object['id']);
    },
    'schema' => [
        'type'        => 'string',
        'description' => 'Automatically calculated bando status',
        'context'     => ['view', 'edit'],
    ],
]);
```

- Extend existing responses, do not remove fields
- Set `context` to control where the field appears (`view`, `edit`, `embed`)

### 6) Authentication and authorization

| Context | Method | Notes |
|---------|--------|-------|
| JavaScript in wp-admin | Cookie + `X-WP-Nonce` | `wp_create_nonce('wp_rest')` — automatic with `wp.apiFetch` |
| External apps / CI | Application Passwords | Dedicated WP user with minimal capabilities |
| Authentication plugins | JWT / OAuth | Use established plugins, do not reinvent |

**`permission_callback`** — always check capabilities, not roles:

```php
function check_items_permission(WP_REST_Request $request): bool|WP_Error {
    if (!current_user_can('edit_posts')) {
        return new WP_Error(
            'rest_forbidden',
            __('Permesso negato.', '{{TEXT_DOMAIN}}'),
            ['status' => 403]
        );
    }
    return true;
}
```

- Public endpoints (reading bandi, FAQ): `'permission_callback' => '__return_true'`
- Write endpoints: **always** capability check
- Never trust the user role alone — use `current_user_can()`

### 7) Client experience

- **Discovery**: your endpoints appear in `/wp-json/{{TEXT_DOMAIN}}/v1`
- **Field filtering**: support `?_fields=id,title,stato` to reduce payload
- **Embed**: support `?_embed` to include related resources inline
- **Pagination**: respect `X-WP-Total`, `X-WP-TotalPages` headers; maximum 100 per page
- **Cache**: add `Cache-Control` headers for high-traffic public endpoints

## Verification checklist

- [ ] The REST index (`/wp-json/`) shows your namespace
- [ ] `OPTIONS` on routes returns the schema
- [ ] Responses follow the expected format (data, HTTP codes, headers)
- [ ] Unauthenticated requests return `401` on protected endpoints
- [ ] Requests from users without permissions return `403`
- [ ] Invalid parameters return `400` with a clear message
- [ ] CPTs with `show_in_rest` appear under `wp/v2`
- [ ] The project build succeeds after changes

## Common errors and solutions

| Problem | Likely cause | Solution |
|---------|-------------|----------|
| 404 on the endpoint | `rest_api_init` hook not executed, wrong route name, permalinks not enabled | Verify the code is loaded; enable pretty permalinks; check the namespace |
| 401 / Cookie nonce mismatch | Nonce missing or expired in the JS request | Use `wp.apiFetch` which handles the nonce automatically, or pass `X-WP-Nonce` in the header |
| 403 Forbidden | `permission_callback` rejects; user without capability | Verify the required capability and user role |
| Custom field missing | `show_in_rest` not set, `register_meta` without `object_subtype` | Add `show_in_rest => true` and specify the subtype |
| Schema not validated | `validate_callback` not defined or not used | Use `rest_validate_request_arg` as callback |
| Corrupted serialized data | `register_meta` of type `array`/`object` without `show_in_rest.schema` | Define the full schema in `show_in_rest['schema']` |

## What NOT to do

- **Do not** register routes under the `wp/v2` namespace — it is reserved for core
- **Do not** access `$_GET`, `$_POST`, `$_REQUEST` — use `$request->get_param()` or `$request->get_json_params()`
- **Do not** return `echo`/`die()` — always return a `WP_REST_Response` or `WP_Error` object
- **Do not** omit `permission_callback` — even if the endpoint is public, use `'__return_true'`
- **Do not** build SQL manually — use `$wpdb->prepare()` if you need direct queries
- **Do not** expose sensitive data (user emails, password hashes) without authorization checks
