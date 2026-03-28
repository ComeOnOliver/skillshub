# Reddit Insights

## Overview

Perform semantic research across Reddit to extract actionable insights. Search for discussions, analyze sentiment patterns, identify recurring pain points, validate product ideas, and discover niche opportunities. Uses Reddit's public JSON API to access posts and comments without requiring authentication.

## Instructions

When a user asks you to research Reddit for insights, follow these steps:

### Step 1: Define the research scope

Clarify with the user:
- **Topic/query**: What subject, product, or idea to research
- **Subreddits** (optional): Specific subreddits to focus on, or search broadly
- **Time range**: Recent (week/month) or historical (year/all)
- **Research goal**: Pain points, sentiment, idea validation, competitor analysis, or trend discovery
- **Output format**: Summary report, raw data, or structured analysis

### Step 2: Fetch Reddit data via public JSON API

Access Reddit's public JSON endpoints without authentication:

```python
import requests
import time

HEADERS = {"User-Agent": "research-bot/1.2.0"}

def search_reddit(query, subreddit=None, sort="relevance", time_filter="year", limit=100):
    """Search Reddit posts via public JSON API."""
    if subreddit:
        url = f"https://www.reddit.com/r/{subreddit}/search.json"
        params = {"q": query, "sort": sort, "t": time_filter,
                  "limit": min(limit, 100), "restrict_sr": "on"}
    else:
        url = "https://www.reddit.com/search.json"
        params = {"q": query, "sort": sort, "t": time_filter,
                  "limit": min(limit, 100)}

    response = requests.get(url, headers=HEADERS, params=params, timeout=30)
    response.raise_for_status()
    time.sleep(1)  # Rate limiting

    data = response.json()
    posts = []
    for child in data["data"]["children"]:
        post = child["data"]
        posts.append({
            "title": post["title"],
            "selftext": post.get("selftext", ""),
            "subreddit": post["subreddit"],
            "score": post["score"],
            "num_comments": post["num_comments"],
            "url": f"https://reddit.com{post['permalink']}",
            "created_utc": post["created_utc"],
        })
    return posts


def get_post_comments(permalink, limit=200):
    """Fetch comments for a specific post."""
    url = f"https://www.reddit.com{permalink}.json"
    params = {"limit": limit, "sort": "top"}
    response = requests.get(url, headers=HEADERS, params=params, timeout=30)
    response.raise_for_status()
    time.sleep(1)

    comments = []
    data = response.json()
    if len(data) > 1:
        for child in data[1]["data"]["children"]:
            if child["kind"] == "t1":
                c = child["data"]
                comments.append({
                    "body": c["body"],
                    "score": c["score"],
                    "author": c.get("author", "[deleted]"),
                })
    return comments
```

### Step 3: Analyze the content

Process the collected posts and comments to extract insights:

**Pain point extraction:**
- Search for phrases like "I wish", "frustrated with", "hate that", "switched from", "biggest problem"
- Group recurring complaints by theme
- Count frequency and upvote weight of each pain point

**Sentiment analysis:**
- Categorize posts/comments as positive, negative, neutral, or mixed
- Track sentiment trends over time
- Identify polarizing topics

**Idea validation:**
- Find existing discussions about similar solutions
- Look for "someone should build" or "is there a tool that" posts
- Assess demand signals: upvotes, comment engagement, frequency of asks

**Competitive analysis:**
- Search for competitor product names
- Analyze praise and criticism patterns
- Identify feature gaps users mention

### Step 4: Compile the research report

Structure the output as an actionable report:

```markdown
# Reddit Research Report: [Topic]

## Research Parameters
- Query: [search terms used]
- Subreddits: [list of subreddits searched]
- Time range: [period]
- Posts analyzed: [count]
- Comments analyzed: [count]

## Key Findings

### Top Pain Points
1. **[Pain point 1]** (mentioned 23 times, avg score: 45)
   - Example: "[quoted user comment]"
   - Subreddits: r/subreddit1, r/subreddit2

2. **[Pain point 2]** (mentioned 18 times, avg score: 32)
   - Example: "[quoted user comment]"

### Sentiment Overview
- Positive: 35% | Neutral: 40% | Negative: 25%
- Most positive aspect: [topic]
- Most negative aspect: [topic]

### Opportunity Signals
- [Unmet need identified from discussions]
- [Feature request pattern observed]
- [Gap in existing solutions mentioned]

### Notable Discussions
1. [Post title](url) - [X] upvotes, [Y] comments
   Summary: [brief takeaway]

## Recommendations
- [Actionable recommendation 1]
- [Actionable recommendation 2]
- [Actionable recommendation 3]
```

### Step 5: Save the report

```bash
cat > reddit_research_[topic].md << 'EOF'
[compiled report]
EOF
```

## Examples

### Example 1: Validate a SaaS idea

**User request:** "Research Reddit to see if people need a better project management tool for small agencies."

**Research approach:**
1. Search queries: "project management agency", "PM tool freelancer", "manage client projects"
2. Target subreddits: r/agency, r/freelance, r/smallbusiness, r/projectmanagement
3. Look for: complaints about existing tools, feature wish lists, "what do you use" threads
4. Analyze: frequency of complaints, which tools are mentioned negatively, unmet needs

**Key findings format:**
```
Pain Points Found:
1. "Asana/Monday are too complex for a 5-person team" (seen 15 times)
2. "No good tool combines project tracking with client invoicing" (seen 9 times)
3. "Switching between 4 tools to manage one project" (seen 12 times)

Validation Signal: MODERATE-STRONG
- Clear demand exists, but space is crowded
- Differentiation opportunity: simplicity + invoicing integration
```

### Example 2: Analyze sentiment around a product launch

**User request:** "What is Reddit saying about the new Arc browser?"

**Research approach:**
1. Search for "Arc browser" across all subreddits
2. Fetch top 50 posts and their comments from the past 3 months
3. Categorize sentiment per feature area (UI, speed, extensions, sync)
4. Identify most loved and most criticized features

### Example 3: Discover underserved niches

**User request:** "Find underserved developer tool niches by mining Reddit complaints."

**Research approach:**
1. Search r/programming, r/webdev, r/devops for frustration keywords
2. Queries: "annoying that", "wish there was", "no good tool for", "why is there no"
3. Group complaints by category (testing, deployment, documentation, etc.)
4. Rank by frequency and engagement
5. Cross-reference with existing tools to identify true gaps

## Guidelines

- Always add a 1-second delay between API requests to respect Reddit's rate limits.
- Set a descriptive User-Agent header. Reddit blocks requests without one.
- Reddit's public JSON API has a 100-post limit per request. Use pagination with the `after` parameter for larger datasets.
- Do not scrape user profiles or collect personally identifiable information.
- Present findings with context: a single upvoted complaint does not equal a validated market need. Look for patterns across multiple discussions.
- Always include source links so the user can verify findings and read full context.
- Distinguish between vocal minorities and genuine widespread sentiment. A post with 500 upvotes carries more weight than one with 3.
- Note the subreddit context: complaints in r/technology have different implications than those in r/startups.
- For idea validation, look for both demand signals (people wanting a solution) and supply signals (existing tools already addressing the need).
- Save all raw data alongside the analysis so the user can explore further.
- If the public API is rate-limited or returns errors, suggest the user try again after a brief wait.
