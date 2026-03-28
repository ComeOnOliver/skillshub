# Swagger Petstore - OpenAPI 3.0

This is a sample Pet Store Server based on the OpenAPI 3.0 specification.  You can find out more about

## How to Use This Skill

This API documentation is split into multiple files for on-demand loading.

**Directory structure:**
```
references/
├── resources/      # 3 resource index files
├── operations/     # 19 operation detail files
└── schemas/        # 6 schema groups, 6 schema files
```

**Navigation flow:**
1. Find the resource you need in the list below
2. Read `references/resources/<resource>.md` to see available operations
3. Read `references/operations/<operation>.md` for full details
4. If an operation references a schema, read `references/schemas/<prefix>/<schema>.md`

## Base URL

- `/api/v3`

## Authentication

Supported methods: **petstore_auth**, **api_key**. See `references/authentication.md` for details.

## Resources

- **pet** → `references/resources/pet.md` (8 ops) - Everything about your Pets
- **user** → `references/resources/user.md` (7 ops) - Operations about user
- **store** → `references/resources/store.md` (4 ops) - Access to Petstore orders
