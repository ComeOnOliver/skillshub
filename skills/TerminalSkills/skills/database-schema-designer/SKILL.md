# Database Schema Designer

## Overview

This skill designs database schemas from requirements, including table structures, relationships, indexes, constraints, row-level security policies, and migration scripts. It produces production-ready SQL with proper normalization and performance considerations.

## Instructions

### Step 1: Understand the Domain

Identify the core entities, their relationships, and access patterns:
- What are the main entities? (users, orders, products, etc.)
- What are the relationships? (one-to-many, many-to-many)
- What queries will be most frequent? (reads vs writes, filtering patterns)
- Is multi-tenancy needed? What isolation level?

### Step 2: Design the Schema

Apply these principles:
- **3NF by default** — normalize to third normal form unless denormalization is justified by read performance
- **UUIDs for public IDs** — use UUID v7 (time-ordered) for primary keys exposed to clients; serial for internal-only
- **Timestamps everywhere** — `created_at` and `updated_at` on all tables
- **Soft deletes when appropriate** — `deleted_at TIMESTAMPTZ` for recoverable records
- **JSONB for flexible fields** — use for tenant-specific settings, metadata, but not for frequently queried fields

### Step 3: Add Indexes

```sql
-- Always index foreign keys
CREATE INDEX idx_tasks_project_id ON tasks(project_id);

-- Composite indexes for common query patterns
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status) WHERE deleted_at IS NULL;

-- Partial indexes for filtered queries
CREATE INDEX idx_tasks_active ON tasks(assigned_to, due_date) WHERE status != 'done';
```

### Step 4: Implement Tenant Isolation (if multi-tenant)

For shared-database multi-tenancy:

```sql
-- Add tenant_id to all tenant-scoped tables
ALTER TABLE projects ADD COLUMN tenant_id UUID NOT NULL REFERENCES tenants(id);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create isolation policy
CREATE POLICY tenant_isolation ON projects
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID)
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Ensure tenant_id is in composite indexes
CREATE INDEX idx_projects_tenant ON projects(tenant_id, created_at DESC);
```

### Step 5: Generate Migration Files

Output as numbered migration files compatible with common tools:
```
migrations/
  001_create_tenants.sql
  002_create_users.sql
  003_create_projects.sql
  004_enable_rls_policies.sql
```

Each migration should be idempotent where possible (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`).

## Examples

### Example 1: Project Management Schema

**User prompt:**
```
Design a schema for a project management app with projects, tasks, members, and comments.
```

**Agent output:**
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'archived', 'deleted')),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'todo'
        CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    priority SMALLINT NOT NULL DEFAULT 2 CHECK (priority BETWEEN 0 AND 4),
    assigned_to UUID REFERENCES users(id),
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common access patterns
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_assigned_due ON tasks(assigned_to, due_date)
    WHERE status NOT IN ('done');
CREATE INDEX idx_tasks_tenant ON tasks(tenant_id, created_at DESC);
```

### Example 2: Adding RLS to Existing Tables

**User prompt:**
```
Add row-level security to our existing users and orders tables for multi-tenancy.
```

**Agent output:**
```sql
-- Step 1: Add tenant_id if missing
ALTER TABLE orders ADD COLUMN tenant_id UUID;
UPDATE orders SET tenant_id = (SELECT tenant_id FROM users WHERE users.id = orders.user_id);
ALTER TABLE orders ALTER COLUMN tenant_id SET NOT NULL;

-- Step 2: Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies
CREATE POLICY tenant_orders ON orders FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_users ON users FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Step 4: Superuser bypass (for admin/migration scripts)
ALTER TABLE orders FORCE ROW LEVEL SECURITY;
CREATE POLICY admin_bypass ON orders FOR ALL TO admin_role USING (true);
```

## Guidelines

- **RLS policies must cover ALL operations** — use `FOR ALL` or create separate policies for SELECT, INSERT, UPDATE, DELETE
- **Test RLS thoroughly** — write integration tests that attempt cross-tenant access and verify it fails
- **Index tenant_id first in composite indexes** — PostgreSQL uses leftmost columns for index scans
- **Don't over-normalize** — if you always fetch user.name with orders, a denormalized `order.user_name` saves a JOIN on read-heavy tables
- **Use CHECK constraints** — they're free documentation and prevent invalid data at the database level
- **Foreign keys with ON DELETE** — always specify CASCADE, SET NULL, or RESTRICT explicitly
- **Consider partitioning at scale** — for tables exceeding 100M rows, partition by tenant_id or date range