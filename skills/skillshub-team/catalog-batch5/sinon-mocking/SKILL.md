# Sinon.js

## Spies
```typescript
const spy = sinon.spy(obj, 'method');
obj.method('arg');
expect(spy.calledWith('arg')).to.be.true;
spy.restore();
```

## Stubs
```typescript
const stub = sinon.stub(api, 'fetch');
stub.resolves({ id: 1, name: 'Alice' });
stub.withArgs('error').rejects(new Error('fail'));
```

## Fake Timers
```typescript
const clock = sinon.useFakeTimers();
const debounced = debounce(fn, 100);
debounced(); debounced();
clock.tick(100);
expect(fn.callCount).to.equal(1);
clock.restore();
```

## Sandbox (auto-cleanup)
```typescript
const sandbox = sinon.createSandbox();
afterEach(() => sandbox.restore());
sandbox.stub(api, 'fetch').resolves([]);
```
