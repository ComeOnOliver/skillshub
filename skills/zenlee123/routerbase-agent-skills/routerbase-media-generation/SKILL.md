---
name: routerbase-media-generation
description: Covers image/video/audio generation flows, async polling, and storage handoff patterns.
---

# RouterBase Media Generation

Generate images, video, audio, and speech, and use embeddings for retrieval workflows.

## Workflow

1. Submit a generation request with the selected model and prompt parameters.
2. Use the returned job or task identifier to poll status asynchronously.
3. When complete, download or redirect the result to durable storage.

## Storage handoff

- Avoid keeping large media payloads in agent context or logs.
- Prefer signed URLs or object-storage references for final deliverables.
- Include the job identifier in artifacts for traceability and retry.
