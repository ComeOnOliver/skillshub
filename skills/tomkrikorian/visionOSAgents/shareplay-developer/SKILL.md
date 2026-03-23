# SharePlay Developer

## Description and Goals

This skill provides comprehensive guidance for implementing SharePlay experiences with the GroupActivities framework. It covers activity definition, session lifecycle, state synchronization, UI surfaces, and visionOS spatial coordination.

### Goals

- Enable developers to build SharePlay experiences across Apple platforms
- Guide proper GroupActivity definition and activation
- Support GroupSession lifecycle management
- Help implement state synchronization with messaging and journals
- Enable spatial coordination for visionOS immersive experiences (group immersive space)

## What This Skill Should Do

When implementing SharePlay features, this skill should:

1. **Guide activity setup** - Help you define GroupActivity types and metadata
2. **Handle activation** - Show how to check eligibility and activate SharePlay
3. **Manage sessions** - Demonstrate GroupSession lifecycle and participant management
4. **Sync state** - Provide patterns for messaging and journal-based synchronization
5. **Coordinate spatially** - Show how to use SystemCoordinator for visionOS spatial experiences and group immersive spaces
6. **Present UI** - Guide use of ShareLink and other SharePlay UI surfaces

Load the appropriate reference file from the tables below for detailed usage, code examples, and best practices.

### Quick Start Workflow

1. Add the Group Activities capability and `com.apple.developer.group-session` entitlement in Xcode.
2. Define a `GroupActivity` type per experience and keep its data minimal and `Codable`.
3. Provide `GroupActivityMetadata` with a clear title, type, and fallback URL.
4. Check `GroupStateObserver.isEligibleForGroupSession` and activate or present SharePlay UI.
5. Listen for sessions with `for await session in Activity.sessions()` and store the session strongly.
6. Configure `SystemCoordinator` before `join()` when spatial personas or immersive spaces are involved.
7. Call `session.join()` only after UI and state are ready.
8. Sync state with `GroupSessionMessenger` (time-sensitive messages) or `GroupSessionJournal` (durable shared data objects).
9. Observe `activeParticipants` and send a state snapshot for late joiners.
10. Call `leave()` or `end()` and cancel tasks when the session invalidates.

### visionOS Launch-Only Workflow (Same Space, No Sync)

Use this when you only want participants to enter the same immersive space with spatial coordination, without synchronizing entities or interactions yet.

1. Define a `GroupActivity` with lightweight metadata. Add `GroupActivityTransferRepresentation` only when you want to start the activity from `ShareLink`, a share sheet, or another transferable context.
2. Provide a `SharePlayManager` that observes sessions and configures `SystemCoordinator`:
   - `supportsGroupImmersiveSpace = true`
   - `spatialTemplatePreference = .sideBySide` (or another appropriate template)
3. If your immersive experience should keep the system immersive environment visible, set `.immersiveEnvironmentBehavior(.coexist)` on the `ImmersiveSpace` scene. Don’t treat that modifier as the API that spatially coordinates participants.
4. Provide a start button:
   - If FaceTime is active and activation is preferred, call `activate()`.
   - Otherwise present `GroupActivitySharingController` (UIKit) or `ShareLink` (SwiftUI).
5. Join the session with `session.join()` once configured.

## Information About the Skill

### Core Concepts

#### Activity Definition

- Use `GroupActivity` to define the shareable experience and keep payloads minimal.
- Provide `GroupActivity.metadata` with title, subtitle, preview image, and fallback URL.
- Set `GroupActivityMetadata.type` to a matching `ActivityType` value.
- Use `GroupActivityActivationResult` from `prepareForActivation()` to decide activation.
- Use `GroupActivityTransferRepresentation` when starting the activity from `ShareLink`, a share sheet, or another transferable surface.

#### Session Lifecycle and Participants

- Use `GroupSession` to manage the live activity; call `join()`, `leave()`, or `end()`.
- Observe `GroupSession.state`, `activeParticipants`, and `isLocallyInitiated` to drive UI.
- Use `GroupSession.sceneSessionIdentifier` to map sessions to scenes when needed.
- Call `requestForegroundPresentation()` when the activity needs the app visible.
- Use `GroupSession.showNotice(_:)` or `postEvent(_:)` for system playback notices.

#### Messaging and Transfer

- Use `GroupSessionMessenger` for time-sensitive messages and state changes.
- Use `.reliable` delivery for critical state and `.unreliable` for high-frequency updates.
- Use `GroupSessionJournal` for attachments and other data objects that should remain available to current and later participants.

#### UI Surfaces to Start SharePlay

- Use `ShareLink` with `Transferable` + `GroupActivityTransferRepresentation` in SwiftUI.
- Use `GroupActivitySharingController` in UIKit/AppKit when no FaceTime call is active.
- Use `NSItemProvider.registerGroupActivity(...)` in share sheets when needed.

#### visionOS Spatial Coordination

- Use `SystemCoordinator` from `GroupSession.systemCoordinator` for spatial layout.
- Set `spatialTemplatePreference` and `supportsGroupImmersiveSpace` as needed.
- Use `localParticipantStates` and `remoteParticipantStates` to track poses.
- Use `groupActivityAssociation(_:)` to choose the primary scene.
- For immersive spaces, use `.immersiveEnvironmentBehavior(.coexist)` only when you want the system immersive environment to remain visible; participant co-location comes from `SystemCoordinator` configuration.

### Reference Files

| Reference                                 | When to Use                                                         |
| ----------------------------------------- | ------------------------------------------------------------------- |
| [`REFERENCE.md`](references/REFERENCE.md) | When looking for GroupActivities-focused code samples and excerpts. |
| [`visionos-immersive-space.md`](references/visionos-immersive-space.md) | When implementing “launch-only” SharePlay for a visionOS immersive space (same space, no sync). |
| [`activation-ui.md`](references/activation-ui.md) | When wiring the start button (FaceTime-active activation vs share sheet fallback). |


### Implementation Patterns

- Send a full state snapshot when new participants join.
- Keep UI state separate from shared game state to reduce message churn.
- Use `GroupSessionMessenger` for transient actions and `GroupSessionJournal` for durable data.
- Prefer AVFoundation coordinated playback for media sync.

### Pitfalls and Checks

- Keep `GroupActivity` data minimal; send state changes via messenger or journal.
- Store strong references to `GroupSession`, `GroupSessionMessenger`, and `GroupSessionJournal`.
- Join only when UI and state are ready; call `leave()` on teardown.
- Handle late joiners by sending the current state snapshot on `activeParticipants` change.
- For visionOS group immersive space: if participants don't colocate, verify `supportsGroupImmersiveSpace`, the selected spatial template, and that `SystemCoordinator` is configured before `join()`.
