# Reddit Read-Only

## Overview

Browse and search Reddit programmatically using the public JSON API. Fetch posts from subreddits, search for topics, retrieve comment threads, and access trending content. No API key or authentication is needed. All access is read-only.

## Instructions

When a user asks you to browse or search Reddit, follow these steps:

### Step 1: Determine the request type

Identify what the user wants:
- **Browse a subreddit**: Fetch posts from a specific subreddit (hot, new, top, rising)
- **Search Reddit**: Find posts matching a query across Reddit or within a subreddit
- **Read a thread**: Fetch a specific post and its comments
- **Get trending content**: Check what is popular right now

### Step 2: Use the public JSON API

Reddit exposes JSON data by appending `.json` to most URLs:

```python
import requests
import time
from datetime import datetime

HEADERS = {"User-Agent": "reddit-readonly-bot/1.0.0"}
BASE_URL = "https://www.reddit.com"


def get_subreddit_posts(subreddit, sort="hot", time_filter="day", limit=25):
    """Fetch posts from a subreddit.

    Args:
        subreddit: Subreddit name without r/ prefix
        sort: One of 'hot', 'new', 'top', 'rising'
        time_filter: For 'top' sort: 'hour', 'day', 'week', 'month', 'year', 'all'
        limit: Number of posts (max 100)
    """
    url = f"{BASE_URL}/r/{subreddit}/{sort}.json"
    params = {"limit": min(limit, 100), "t": time_filter}
    response = requests.get(url, headers=HEADERS, params=params, timeout=30)
    response.raise_for_status()
    time.sleep(1)

    posts = []
    for child in response.json()["data"]["children"]:
        p = child["data"]
        posts.append({
            "title": p["title"],
            "author": p.get("author", "[deleted]"),
            "score": p["score"],
            "num_comments": p["num_comments"],
            "selftext": p.get("selftext", "")[:500],
            "url": p.get("url", ""),
            "permalink": f"https://reddit.com{p['permalink']}",
            "created": datetime.utcfromtimestamp(p["created_utc"]).isoformat(),
            "subreddit": p["subreddit"],
        })
    return posts


def search_reddit(query, subreddit=None, sort="relevance", time_filter="year", limit=25):
    """Search for posts matching a query."""
    if subreddit:
        url = f"{BASE_URL}/r/{subreddit}/search.json"
        params = {"q": query, "sort": sort, "t": time_filter,
                  "limit": min(limit, 100), "restrict_sr": "on"}
    else:
        url = f"{BASE_URL}/search.json"
        params = {"q": query, "sort": sort, "t": time_filter,
                  "limit": min(limit, 100)}

    response = requests.get(url, headers=HEADERS, params=params, timeout=30)
    response.raise_for_status()
    time.sleep(1)

    posts = []
    for child in response.json()["data"]["children"]:
        p = child["data"]
        posts.append({
            "title": p["title"],
            "score": p["score"],
            "num_comments": p["num_comments"],
            "subreddit": p["subreddit"],
            "permalink": f"https://reddit.com{p['permalink']}",
            "selftext": p.get("selftext", "")[:300],
        })
    return posts


def get_comments(permalink, sort="top", limit=100):
    """Fetch comments for a post given its permalink path."""
    # permalink should be like /r/subreddit/comments/id/title/
    url = f"{BASE_URL}{permalink}.json"
    params = {"sort": sort, "limit": limit}
    response = requests.get(url, headers=HEADERS, params=params, timeout=30)
    response.raise_for_status()
    time.sleep(1)

    comments = []
    data = response.json()
    if len(data) > 1:
        _extract_comments(data[1]["data"]["children"], comments, depth=0)
    return comments


def _extract_comments(children, comments, depth):
    """Recursively extract comments from nested structure."""
    for child in children:
        if child["kind"] != "t1":
            continue
        c = child["data"]
        comments.append({
            "body": c["body"],
            "author": c.get("author", "[deleted]"),
            "score": c["score"],
            "depth": depth,
        })
        # Extract replies
        if c.get("replies") and isinstance(c["replies"], dict):
            _extract_comments(
                c["replies"]["data"]["children"], comments, depth + 1
            )
```

### Step 3: Format and present results

Format the output clearly for the user:

**For subreddit browsing:**
```
r/programming - Hot Posts
========================

1. [523 pts | 89 comments] "Why Rust is replacing C++ in embedded systems"
   https://reddit.com/r/programming/comments/abc123/...

2. [312 pts | 45 comments] "SQLite internals: How the query planner works"
   https://reddit.com/r/programming/comments/def456/...

3. [298 pts | 112 comments] "Ask r/programming: What's your unpopular tech opinion?"
   Preview: "I'll start: ORMs cause more problems than they solve..."
   https://reddit.com/r/programming/comments/ghi789/...
```

**For comment threads:**
```
Thread: "Why did you switch from VS Code to Neovim?"
r/neovim | 445 pts | 203 comments

Top Comments:
  [189 pts] u/vimuser42: "Speed. My VS Code took 8 seconds to open a
  large TypeScript project. Neovim opens instantly."

    [67 pts] u/reply_user: "Same experience. The LSP integration in
    Neovim has gotten so good there's no feature gap anymore."

  [145 pts] u/pragmatic_dev: "Honestly, the keybindings. Once you learn
  modal editing, going back to click-and-type feels slow."
```

### Step 4: Handle pagination for large requests

```python
def get_all_posts(subreddit, sort="new", limit=500):
    """Fetch multiple pages of posts using pagination."""
    all_posts = []
    after = None

    while len(all_posts) < limit:
        url = f"{BASE_URL}/r/{subreddit}/{sort}.json"
        params = {"limit": 100}
        if after:
            params["after"] = after

        response = requests.get(url, headers=HEADERS, params=params, timeout=30)
        response.raise_for_status()
        time.sleep(1)

        data = response.json()["data"]
        children = data["children"]
        if not children:
            break

        for child in children:
            all_posts.append(child["data"])

        after = data.get("after")
        if not after:
            break

    return all_posts[:limit]
```

## Examples

### Example 1: Browse top posts in a subreddit

**User request:** "Show me the top posts in r/machinelearning from this week."

**Execution:**
```python
posts = get_subreddit_posts("machinelearning", sort="top", time_filter="week", limit=10)
for i, post in enumerate(posts, 1):
    print(f"{i}. [{post['score']} pts] {post['title']}")
    print(f"   {post['permalink']}")
```

### Example 2: Search for a specific topic

**User request:** "Find Reddit discussions about migrating from MongoDB to PostgreSQL."

**Execution:**
```python
posts = search_reddit(
    query="migrate MongoDB to PostgreSQL",
    sort="relevance",
    time_filter="year",
    limit=20
)
```

### Example 3: Read a full comment thread

**User request:** "Read the comments on this Reddit post: https://reddit.com/r/webdev/comments/xyz/..."

**Execution:**
```python
permalink = "/r/webdev/comments/xyz/post_title/"
comments = get_comments(permalink, sort="top", limit=50)
for c in comments:
    indent = "  " * c["depth"]
    print(f"{indent}[{c['score']} pts] u/{c['author']}: {c['body'][:200]}")
```

## Guidelines

- Always include a 1-second delay between requests to avoid being rate-limited by Reddit.
- Set a descriptive User-Agent header. Reddit blocks requests without one and may return 429 errors.
- The public JSON API has a hard limit of 100 items per request. Use the `after` parameter for pagination.
- All access is read-only. This skill cannot post, vote, or modify any Reddit content.
- Truncate long selftext and comment bodies when displaying summaries. Show full text only when the user requests a specific post.
- Handle deleted posts and comments gracefully. Check for `[deleted]` or `[removed]` content.
- Reddit may return 403 or 429 errors during high traffic. Implement retry logic with exponential backoff.
- Respect that some subreddits are private and will return 403 errors. Inform the user and suggest alternatives.
- Do not attempt to access quarantined or NSFW subreddits without the user explicitly requesting it.
- Always provide permalink URLs so the user can visit the original discussion in their browser.