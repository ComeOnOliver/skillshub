# Supabase RLS

## Enable RLS
```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Users can only read published posts
CREATE POLICY "Public posts" ON posts FOR SELECT USING (published = true);

-- Users can only edit their own posts
CREATE POLICY "Own posts" ON posts FOR ALL USING (auth.uid() = user_id);

-- Admin can do anything
CREATE POLICY "Admin access" ON posts FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
```

## Common Patterns
- auth.uid() — current user's ID
- auth.jwt() — full JWT claims
- Use WITH CHECK for INSERT/UPDATE validation
- Separate SELECT/INSERT/UPDATE/DELETE policies for fine-grained control
