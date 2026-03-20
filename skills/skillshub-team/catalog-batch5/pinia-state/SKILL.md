# Pinia

## Store
```typescript
import { defineStore } from 'pinia';
export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const isLoggedIn = computed(() => !!user.value);
    async function login(email: string, pass: string) {
        user.value = await api.login(email, pass);
    }
    return { user, isLoggedIn, login };
});
```

## Usage
```vue
<script setup>
const auth = useAuthStore();
const { isLoggedIn } = storeToRefs(auth);
</script>
```

## Persistence: pinia-plugin-persistedstate for localStorage sync