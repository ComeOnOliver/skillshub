# OpenID Connect

## Auth Code + PKCE Flow
1. Generate code_verifier + code_challenge (S256)
2. Redirect to /authorize with client_id, redirect_uri, scope=openid, code_challenge
3. Exchange code for tokens at /token endpoint
4. Validate id_token JWT with JWKS

## Token Exchange
```typescript
const res = await fetch(tokenUrl, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri, client_id, code_verifier }),
});
const { access_token, id_token, refresh_token } = await res.json();
```

## Validate ID Token
```typescript
import { jwtVerify, createRemoteJWKSet } from 'jose';
const JWKS = createRemoteJWKSet(new URL(issuer + '/.well-known/jwks.json'));
const { payload } = await jwtVerify(id_token, JWKS, { issuer, audience: clientId });
```

## Discovery: GET /.well-known/openid-configuration