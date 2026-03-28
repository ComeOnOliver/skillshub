# Canny

## Overview

Canny collects, organizes, and prioritizes product feedback. Users submit feature requests, vote on ideas, and follow updates. Teams build public roadmaps and close the loop when features ship.

## Instructions

### Step 1: Identify Users

```typescript
// components/CannySdk.tsx — Identify logged-in users
'use client'
import { useEffect } from 'react'

export function CannyIdentify({ user }) {
  useEffect(() => {
    if (window.Canny && user) {
      window.Canny('identify', {
        appID: process.env.NEXT_PUBLIC_CANNY_APP_ID,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarURL: user.avatar,
          created: new Date(user.createdAt).toISOString(),
          customFields: { plan: user.plan, mrr: user.mrr },
        },
      })
    }
  }, [user])
  return null
}
```

### Step 2: Embed Feedback Widget

```tsx
// Embed the feedback widget in your app
function FeedbackButton() {
  return (
    <button
      data-canny-link
      data-board-token="your-board-token"
      className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full"
    >
      💡 Feedback
    </button>
  )
}
```

### Step 3: API Integration

```typescript
// lib/canny.ts — Programmatic feedback management
const CANNY_API_KEY = process.env.CANNY_API_KEY!

// Create a post (feature request) programmatically
await fetch('https://canny.io/api/v1/posts/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: CANNY_API_KEY,
    authorID: userId,
    boardID: 'board-id',
    title: 'Dark mode support',
    details: 'Would love a dark theme option for the dashboard.',
  }),
})

// Retrieve top voted posts
const response = await fetch('https://canny.io/api/v1/posts/list', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: CANNY_API_KEY,
    boardID: 'board-id',
    sort: 'score',
    limit: 20,
  }),
})
```

## Guidelines

- Free tier: 1 board, basic features. Growth ($79/mo): unlimited boards, roadmap, integrations.
- Use custom fields to segment feedback by plan (show which features paying customers want).
- Public changelog closes the loop — users see when their requested features ship.
- For free alternative, consider using GitHub Discussions or a simple upvote board.
