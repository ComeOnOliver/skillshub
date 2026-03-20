# Laravel Validation

**Always use array syntax for rules**, not pipe-delimited strings. Arrays are easier to read, diff, and extend — and required when using Rule objects or closures.

```php
// WRONG:
'email' => 'required|email|unique:users',

// CORRECT:
'email' => ['required', 'email', 'unique:users'],
```

## Quick Decision Guide

### "How do I validate?"

| Scenario | Approach |
|----------|----------|
| Simple controller validation | `$request->validate([...])` |
| Reusable/complex validation | Form Request class |
| Outside HTTP request (CLI, jobs) | `Validator::make($data, $rules)` |
| Validate and get safe data | `$request->safe()` for `ValidatedInput` object |
| Validate but keep going | `Validator::make()->validate()` or check `->fails()` |

### "Which rule do I need?"

**Presence & optionality:**
| Need | Rule |
|------|------|
| Must be present and non-empty | `required` |
| Required only if present | `sometimes` |
| May be null | `nullable` |
| Must be present (even if empty) | `present` |
| Must not be in input | `missing` |
| Required when other field has value | `required_if:field,value` |
| Required when other field is absent | `required_without:field` |
| Exclude from validated output | `exclude` |

**Type constraints:**
| Need | Rule |
|------|------|
| String | `string` |
| Integer | `integer` |
| Numeric (int, float, string) | `numeric` |
| Boolean | `boolean` |
| Array | `array` |
| Sequential list (0-indexed) | `list` |
| Date | `date` or `date_format:Y-m-d` |
| File upload | `file` |
| Image | `image` |
| Email | `email` |
| URL | `url` |
| JSON | `json` |
| UUID | `uuid` |

**Size & range:**
| Need | Rule |
|------|------|
| Min/max length, value, count, or KB | `min:n` / `max:n` |
| Exact size | `size:n` |
| Between range | `between:min,max` |
| Compare to another field | `gt:field` / `gte:field` / `lt:field` / `lte:field` |

**Database:**
| Need | Rule |
|------|------|
| Must exist in table | `exists:table,column` or `Rule::exists(...)` |
| Must be unique in table | `unique:table,column` or `Rule::unique(...)` |

## Validated Data Access

```php
// Get only validated fields
$validated = $request->validated();

// Get ValidatedInput object (supports only/except/merge/etc.)
$safe = $request->safe();
$safe->only(['name', 'email']);
$safe->except(['password']);
$safe->merge(['ip' => $request->ip()]);
```

## Common Pitfalls

### 1. Missing `nullable` on optional fields

Laravel's `ConvertEmptyStringsToNull` middleware converts `""` to `null`. Without `nullable`, empty optional fields fail validation.

```php
// WRONG: empty string becomes null, fails 'string' rule
'bio' => ['string', 'max:500'],

// CORRECT:
'bio' => ['nullable', 'string', 'max:500'],
```

### 2. `sometimes` vs `nullable` vs `required`

```php
// required: MUST be present and non-empty
'name' => ['required', 'string'],

// nullable: can be present as null
'nickname' => ['nullable', 'string'],

// sometimes: only validate IF the field is in the input at all
// (useful for PATCH requests where fields are optional)
'email' => ['sometimes', 'required', 'email'],
```

### 3. Unsafe `unique` ignore

Never pass user-controlled input to `ignore()`:

```php
// DANGEROUS: SQL injection risk
Rule::unique('users')->ignore($request->input('id'))

// SAFE: use the authenticated model
Rule::unique('users')->ignore($user->id)
```

### 4. `bail` placement

`bail` must be the first rule to stop processing on first failure:

```php
// WRONG: bail has no effect here
'email' => ['required', 'bail', 'email', 'unique:users'],

// CORRECT: bail first
'email' => ['bail', 'required', 'email', 'unique:users'],
```

### 5. Array vs nested validation confusion

```php
// Validates the array itself
'tags' => ['required', 'array', 'min:1'],

// Validates each item IN the array
'tags.*' => ['string', 'max:50'],

// Nested objects in array
'users.*.email' => ['required', 'email'],
'users.*.roles.*' => ['exists:roles,name'],
```

### 6. `exists` / `unique` with soft deletes

```php
// Ignores soft-deleted records (default counts them as existing)
Rule::unique('users', 'email')->withoutTrashed()

// Only check non-deleted records exist
Rule::exists('users', 'id')->whereNull('deleted_at')
```

### 7. Date comparison with field references

```php
// Compare against another field, not a literal date
'end_date' => ['required', 'date', 'after:start_date'],

// Compare against a literal date
'start_date' => ['required', 'date', 'after:2024-01-01'],

// Use after_or_equal when same-day should be valid
'checkout' => ['required', 'date', 'after_or_equal:checkin'],
```

## Rule Builders

Use fluent builders instead of string rules for complex validation. See [references/rule-builders.md](references/rule-builders.md) for the full API of every builder.

### Password

```php
use Illuminate\Validation\Rules\Password;

// Define defaults (typically in AppServiceProvider::boot)
Password::defaults(fn () => Password::min(8)->uncompromised());

// Use in rules
'password' => ['required', 'confirmed', Password::default()],

// Full chain
'password' => ['required', Password::min(8)
    ->letters()
    ->mixedCase()
    ->numbers()
    ->symbols()
    ->uncompromised(3)], // min 3 appearances in breach DB
```

### File

```php
use Illuminate\Validation\Rules\File;

'document' => ['required', File::types(['pdf', 'docx'])->max('10mb')],
'avatar' => ['required', Rule::imageFile()->dimensions(Rule::dimensions()->maxWidth(2000))],
```

### Enum

```php
'status' => [Rule::enum(OrderStatus::class)->except([OrderStatus::Cancelled])],
```

### Date & Numeric

```php
'start_date' => [Rule::date()->afterToday()->format('Y-m-d')],
'price' => [Rule::numeric()->decimal(2)->min(0)->max(99999.99)],
'email' => [Rule::email()->rfcCompliant()->validateMxRecord()],
```

## Conditional Validation

```php
use Illuminate\Validation\Rule;

$request->validate([
    'role' => ['required', 'string'],
    // Required only when role is admin
    'admin_code' => [Rule::requiredIf($request->role === 'admin')],

    // Using closures for complex conditions
    'company' => [Rule::requiredIf(fn () => $user->isBusinessAccount())],

    // Exclude from output when condition met
    'coupon' => ['exclude_if:type,free', 'required', 'string'],
]);
```

### After validation hooks

```php
$validator = Validator::make($data, $rules);

$validator->after(function ($validator) {
    if ($this->somethingElseIsInvalid()) {
        $validator->errors()->add('field', 'Something is wrong.');
    }
});
```

## Custom Rules

### Rule object (recommended)

```bash
php artisan make:rule Uppercase
php artisan make:rule Uppercase --implicit  # runs even on empty values
```

```php
class Uppercase implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (strtoupper($value) !== $value) {
            $fail('The :attribute must be uppercase.');
        }
    }
}

// Usage
'name' => ['required', new Uppercase],
```

### Closure rule (one-off)

```php
'title' => [
    'required',
    function (string $attribute, mixed $value, Closure $fail) {
        if ($value === 'foo') {
            $fail("The {$attribute} is invalid.");
        }
    },
],
```

## Custom Error Messages

```php
// Inline
$request->validate([
    'email' => ['required', 'email'],
], [
    'email.required' => 'We need your email address.',
    'email.email' => 'That doesn\'t look like a valid email.',
]);

// In Form Request
public function messages(): array
{
    return [
        'title.required' => 'A title is required.',
        'body.required' => 'A message body is required.',
    ];
}

// Custom attribute names
public function attributes(): array
{
    return [
        'email' => 'email address',
    ];
}

// Array position placeholder
'photos.*.description.required' => 'Please describe photo #:position.',
```

## Reference Files

- **All validation rules**: See [references/rules.md](references/rules.md) for every built-in rule with signatures and descriptions
- **Rule class & fluent builders**: See [references/rule-builders.md](references/rule-builders.md) for `Rule::unique()`, `Rule::exists()`, `Password::`, `File::`, `Rule::date()`, `Rule::numeric()`, `Rule::email()`, `Rule::enum()`, `Rule::dimensions()`, and all other fluent builder APIs
- **Form Requests**: See [references/form-requests.md](references/form-requests.md) for Form Request patterns, methods, and advanced usage