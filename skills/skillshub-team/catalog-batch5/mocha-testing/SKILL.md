# Mocha Testing

## Setup
```bash
npm install -D mocha @types/mocha chai ts-node
```

## .mocharc.yml
```yaml
require: ts-node/register
spec: "test/**/*.test.ts"
timeout: 5000
recursive: true
```

## Tests
```typescript
import { expect } from 'chai';

describe('Calculator', () => {
    let calc: Calculator;
    beforeEach(() => { calc = new Calculator(); });

    it('should add numbers', () => { expect(calc.add(2, 3)).to.equal(5); });
    it('should throw on div by zero', () => {
        expect(() => calc.divide(1, 0)).to.throw('Division by zero');
    });
});

describe('API', () => {
    it('should fetch data', async () => {
        const data = await api.get('/users');
        expect(data).to.be.an('array');
    });
});
```

## Hooks: before, after, beforeEach, afterEach
## Run: npx mocha / npx mocha --grep "pattern" / npx mocha --watch
