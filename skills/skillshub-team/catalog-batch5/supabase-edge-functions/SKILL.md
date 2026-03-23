# Supabase Edge Functions

## Create & Deploy
```bash
supabase functions new my-function
supabase functions deploy my-function
```

## Function
```typescript
// supabase/functions/my-function/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data } = await supabase.from('users').select('*');
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
});
```

## Invoke: supabase.functions.invoke('my-function', { body: { name: 'test' } })
## Secrets: supabase secrets set MY_KEY=value
