# Chai Assertions

```typescript
import { expect } from 'chai';

// Equality
expect(x).to.equal(42);
expect(obj).to.deep.equal({ a: 1 });

// Types
expect('hello').to.be.a('string');
expect([]).to.be.an('array');
expect(true).to.be.true;
expect(null).to.be.null;

// Numbers
expect(10).to.be.above(5).and.below(20);
expect(10.5).to.be.closeTo(10, 1);

// Strings & Arrays
expect('foobar').to.include('foo');
expect([1,2,3]).to.include(2).and.have.lengthOf(3);
expect([]).to.be.empty;

// Objects
expect(obj).to.have.property('name', 'Alice');
expect(obj).to.have.all.keys('name', 'age');
expect(obj).to.have.nested.property('addr.city');

// Errors
expect(() => fn()).to.throw(Error, /message/);

// Promises (chai-as-promised)
await expect(promise).to.eventually.equal(42);
await expect(badPromise).to.be.rejectedWith(Error);
```