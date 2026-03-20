# Node.js Security Review

Use when auditing Node.js/TypeScript applications for security vulnerabilities.

## Dependency Audit
```bash
npm audit                          # Check known vulnerabilities
npm audit fix                      # Auto-fix where possible
npm audit --production             # Only production deps
npx better-npm-audit audit         # Stricter thresholds
npx snyk test                      # Deeper analysis (needs auth)
```

## Common Vulnerability Patterns

### 1. Injection Attacks
```typescript
// ❌ SQL Injection
db.query(`SELECT * FROM users WHERE id = ${req.params.id}`);
// ✅ Parameterized queries
db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);

// ❌ Command injection
exec(`ls ${userInput}`);
// ✅ Use execFile with args array
execFile('ls', [userInput]);

// ❌ Path traversal
fs.readFile(path.join('/uploads', req.params.filename));
// ✅ Validate and resolve
const safePath = path.resolve('/uploads', req.params.filename);
if (!safePath.startsWith('/uploads/')) throw new Error('Invalid path');
```

### 2. Prototype Pollution
```typescript
// ❌ Vulnerable to __proto__ pollution
function merge(target, source) {
  for (const key in source) target[key] = source[key];
}
// ✅ Filter dangerous keys
function safeMerge(target: Record<string, unknown>, source: Record<string, unknown>) {
  for (const key of Object.keys(source)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    target[key] = source[key];
  }
}
```

### 3. Authentication & Sessions
```typescript
// ✅ Secure session configuration
app.use(session({
  secret: process.env.SESSION_SECRET!, // strong random secret
  name: '__session',                   // don't use default 'connect.sid'
  cookie: {
    httpOnly: true,                    // no JS access
    secure: true,                      // HTTPS only
    sameSite: 'strict',                // CSRF protection
    maxAge: 3600000,                   // 1 hour
  },
  resave: false,
  saveUninitialized: false,
}));

// ✅ Rate limiting
import rateLimit from 'express-rate-limit';
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }));
```

### 4. Express/Fastify Hardening
```typescript
import helmet from 'helmet';
import cors from 'cors';

app.use(helmet());                     // Security headers
app.use(cors({ origin: ['https://myapp.com'], credentials: true }));
app.disable('x-powered-by');          // Don't reveal Express

// ✅ Input validation with zod
import { z } from 'zod';
const CreateUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150),
});
app.post('/users', (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json(result.error);
});
```

### 5. Secret Management
```typescript
// ❌ Hardcoded secrets
const API_KEY = "sk-1234567890";
// ✅ Environment variables with validation
const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error("API_KEY is required");

// ✅ .gitignore
// .env, .env.local, *.pem, *.key
```

### 6. Error Handling
```typescript
// ❌ Leaking stack traces
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.stack });
});
// ✅ Generic errors in production
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});
```

## Security Checklist
- [ ] `npm audit` shows 0 high/critical vulnerabilities
- [ ] All user input validated (zod, joi, or similar)
- [ ] Parameterized DB queries (no string interpolation)
- [ ] Helmet.js for HTTP security headers
- [ ] CORS properly configured (not `*` in production)
- [ ] Rate limiting on auth and sensitive endpoints
- [ ] Secrets in env vars, not code
- [ ] `.env` files in `.gitignore`
- [ ] HTTPS enforced in production
- [ ] Session cookies: httpOnly, secure, sameSite
- [ ] No `eval()`, `Function()`, or `vm.runInNewContext()` with user input
- [ ] File upload validation (size, type, path)
- [ ] Error responses don't leak internals in production
- [ ] Dependencies pinned and regularly updated