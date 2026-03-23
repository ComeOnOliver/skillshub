# Controller Tests

## Feature tests for endpoints

```php
it('rejects empty email', function () {
  $this->post('/register', ['email' => ''])->assertSessionHasErrors('email');
});
```

## Better tests

- Move validation to Form Requests; assert errors from the request class
- Extract business logic into Actions; unit test them directly
- Use factories for realistic data; avoid heavy mocking
