# Supabase

## Client Setup
```typescript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

## Database (Postgres)
```typescript
const { data } = await supabase.from('posts').select('*, author:users(name)').order('created_at', { ascending: false }).limit(10);
await supabase.from('posts').insert({ title, body, user_id: user.id });
await supabase.from('posts').update({ title }).eq('id', postId);
```

## Auth
```typescript
await supabase.auth.signUp({ email, password });
await supabase.auth.signInWithPassword({ email, password });
await supabase.auth.signInWithOAuth({ provider: 'github' });
const { data: { user } } = await supabase.auth.getUser();
```

## Real-time
```typescript
supabase.channel('posts').on('postgres_changes',
    { event: '*', schema: 'public', table: 'posts' },
    (payload) => console.log(payload)
).subscribe();
```

## Storage
```typescript
await supabase.storage.from('avatars').upload(path, file);
const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
```

## RLS (Row Level Security) for fine-grained access control in Postgres policies
