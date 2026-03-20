# OAuth 2.0 & JWT

## Sign & Verify Tokens
```typescript
import { SignJWT, jwtVerify } from 'jose';
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function sign(payload: any, exp = '15m') {
    return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt().setExpirationTime(exp).sign(secret);
}
async function verify(token: string) {
    return (await jwtVerify(token, secret)).payload;
}
```

## Auth Middleware
```typescript
async function auth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Missing token' });
    try { req.user = await verify(token); next(); }
    catch { res.status(401).json({ error: 'Invalid token' }); }
}
```

## Refresh Token Flow
- Short-lived access token (15m) + long-lived refresh token (7d)
- Store refresh tokens in DB, check revocation
- POST /auth/refresh exchanges refresh → new access token