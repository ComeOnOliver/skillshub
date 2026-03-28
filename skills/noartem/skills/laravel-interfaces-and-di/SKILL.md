# Interfaces and Dependency Injection

Define narrow interfaces and inject them where needed. Bind concrete implementations in a service provider.

```php
interface Slugger { public function slug(string $s): string; }

final class AsciiSlugger implements Slugger {
  public function slug(string $s): string { /* ... */ }
}

$this->app->bind(Slugger::class, AsciiSlugger::class);
```

Benefits: easier testing (mock interfaces), clearer contracts, swap implementations without touching consumers.
