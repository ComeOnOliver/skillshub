# Mocha Integration Testing

## HTTP API Tests
```typescript
import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
const { expect } = chai;

describe('GET /api/users', () => {
    it('returns users', async () => {
        const res = await chai.request(app).get('/api/users');
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
    });

    it('creates user', async () => {
        const res = await chai.request(app).post('/api/users')
            .set('Authorization', 'Bearer token')
            .send({ name: 'Alice', email: 'a@b.com' });
        expect(res).to.have.status(201);
    });
});
```

## Database Tests
```typescript
before(async () => { await db.migrate(); });
afterEach(async () => { await db.query('DELETE FROM users'); });
after(async () => { await db.close(); });
```
