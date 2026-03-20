# Coding Standards Enforcer

## Description and Goals

This skill enforces repository-wide coding standards for Swift 6.2 concurrency, Swift language rules, and best practices. It ensures all Swift code in the repository follows consistent patterns, uses modern Swift APIs, and adheres to strict concurrency requirements.

### Goals

- Ensure compliance with Swift 6.2 strict concurrency rules
- Enforce modern Swift language patterns and APIs
- Prevent common concurrency mistakes and anti-patterns
- Maintain consistent code style across the repository
- Support Swift 6 migration and best practices

## What This Skill Should Do

When reviewing or implementing Swift code changes, this skill should:

1. **Enforce concurrency rules** - Ensure all code follows Swift 6.2 strict concurrency requirements
2. **Check language standards** - Verify use of modern Swift APIs and patterns
3. **Identify violations** - Scan for common mistakes and anti-patterns
4. **Suggest fixes** - Provide guidance on how to correct violations
5. **Maintain consistency** - Ensure code follows repository-wide standards

Use this skill whenever you add, modify, or review Swift code in this repo.

## Information About the Skill

### Workflow

1. Identify the files and changes in scope.
2. Scan for violations of the rules below.
3. Apply fixes or call out deviations explicitly.

### Swift Concurrency Guidelines

#### Core Mental Model

Think in isolation domains rather than threads:

- `MainActor` is the UI lane and must own UI state.
- `actor` types protect their own mutable state.
- `nonisolated` code is shared and cannot touch actor state.
- `Sendable` types are safe to move across domains.

#### Strict Concurrency

Swift 6.2 strict concurrency does not make arbitrary code `@MainActor` by default. SwiftUI view `body` is `@MainActor`, and unannotated code only gets default actor isolation when the project opts into it with settings like `SWIFT_DEFAULT_ACTOR_ISOLATION`.

#### Async and Parallel Work

```swift
func fetchUser(id: Int) async throws -> User {
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode(User.self, from: data)
}

async let avatar = fetchImage("avatar.jpg")
async let banner = fetchImage("banner.jpg")
let profile = Profile(avatar: try await avatar, banner: try await banner)
```

#### Tasks and Task Groups

```swift
.task { avatar = await downloadAvatar() }

let saveTask = Task { try await saveProfile() }
try await saveTask.value

let values = try await withThrowingTaskGroup(
    of: (String, String).self,
    returning: [String: String].self
) { group in
    group.addTask { ("avatarURL", try await fetchAvatarURL()) }
    group.addTask { ("bio", try await fetchBioText()) }

    var collected: [String: String] = [:]
    for try await (key, value) in group {
        collected[key] = value
    }
    return collected
}
```

#### Isolation Domains

```swift
@MainActor
final class ViewModel {
    var items: [Item] = []
}

actor BankAccount {
    var balance: Double = 0
    func deposit(_ amount: Double) { balance += amount }
}
```

#### Approachable Concurrency Settings (Swift 6.2+)

- `SWIFT_DEFAULT_ACTOR_ISOLATION = MainActor` keeps UI code on the main actor by default.
- `SWIFT_APPROACHABLE_CONCURRENCY = YES` enables a group of Swift concurrency features intended to ease migration, such as outward actor inference and inferred sendability changes.

```swift
@concurrent func processLargeFile() async { }
```

#### Sendable

```swift
struct User: Sendable {
    let id: Int
    let name: String
}

final class ThreadSafeCache: @unchecked Sendable {
    private let lock = NSLock()
    private var storage: [String: Data] = [:]
}
```

#### Isolation Inheritance

- `Task { }` inherits the current actor.
- `Task.detached { }` does not inherit isolation and should be rare.

#### Background Tasks

Move heavy physics/data work off the main actor using `@concurrent` functions or dedicated actors.

#### Task Management

Cancel long-running tasks on teardown.

#### Common Mistakes to Avoid

- Treating `async` as automatic background work.
- Creating many actors when `@MainActor` is sufficient.
- Using `MainActor.run` when the enclosing function can be annotated.
- Blocking async code with `DispatchSemaphore` or `DispatchGroup.wait()`.
- Spawning unstructured `Task` instances instead of `async let` or task groups.

#### Quick Reference

- `async` and `await` for suspension points.
- `Task { }` for unstructured async work that inherits the current actor context.
- `actor` for isolated mutable state.
- `Sendable` for cross-actor data transfer.

### Swift Language Standards

#### Observable Classes

`@Observable` does not imply `@MainActor`. Add `@MainActor` when the model owns UI-bound state; otherwise leave the type unannotated or isolate it more narrowly based on the actual concurrency requirements.

#### Observation vs Combine

- Prefer Observation (`@Observable`, `@Bindable`, plain stored properties) in new SwiftUI code when your deployment target supports it.
- Keep `ObservableObject`, `@StateObject`, and `@ObservedObject` when existing Combine-based architecture or platform constraints still require them.

#### Swift-Native APIs

Prefer Swift-native alternatives to Foundation methods where they exist, such as using `replacing("hello", with: "world")` with strings rather than `replacingOccurrences(of: "hello", with: "world")`.

#### Modern Foundation API

Prefer modern Foundation API, for example `URL.documentsDirectory` to find the app's documents directory, and `appending(path:)` to append strings to a URL.

#### Number Formatting

Never use C-style number formatting such as `Text(String(format: "%.2f", abs(myNumber)))`; always use `Text(abs(change), format: .number.precision(.fractionLength(2)))` instead.

#### Static Member Lookup

Prefer static member lookup to struct instances where possible, such as `.circle` rather than `Circle()`, and `.borderedProminent` rather than `BorderedProminentButtonStyle()`.

#### Modern Concurrency

Prefer Swift concurrency over Grand Central Dispatch for new async application code. Keep Dispatch-based interop only where framework APIs or existing infrastructure still require it.

#### Text Filtering

Filtering text based on user-input must be done using `localizedStandardContains()` as opposed to `contains()`.

#### Force Unwraps

Avoid force unwraps and force `try` unless it is unrecoverable.