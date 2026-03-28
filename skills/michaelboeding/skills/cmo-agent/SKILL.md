# AI CMO Agent

Your AI Chief Marketing Officer. Enter a website URL and get a full marketing team deployed across every growth channel.

**This skill uses 6 specialized agents** that work in parallel across SEO, GEO (AI search visibility), content writing, Reddit, Hacker News, and X/Twitter — then synthesizes everything into a prioritized action plan with ready-to-publish content.

## What It Produces

| Output | Description |
|--------|-------------|
| **CMO Dashboard** | Terminal-formatted overview with scores, opportunities, and action items |
| **SEO Audit** | Page-by-page technical audit with exact HTML fix snippets |
| **GEO Analysis** | AI search visibility assessment with schema markup code |
| **Full Articles** | Complete SEO-optimized articles ready to publish (1500-3000 words) |
| **Reddit Comments** | Copy-paste-ready comments for specific active threads |
| **HN Submission** | Show HN post + founder comment + objection responses |
| **Tweet Threads** | Complete threads + standalone tweets + 7-day calendar |
| **Competitor Intel** | Auto-identified competitors with threat levels |
| **Prioritized Actions** | Top 3-5 highest-impact actions ranked by effort-to-impact ratio |
| **Content Cascades** | Cross-channel repurposing plan (article → thread → comments → HN post) |

## What This Replaces

| Human Role | Typical Cost | What CMO Agent Covers |
|------------|-------------|----------------------|
| Marketing Hire | $5,000/mo | Strategy, coordination, cross-channel planning |
| SEO Agency | $4,000/mo | Technical audit, on-page fixes, content gaps |
| Content Writer | $1,500/mo | Full articles, blog posts, landing page copy |
| Social Media Manager | $1,500/mo | Tweet threads, content calendar, engagement |
| Community Manager | $1,000/mo | Reddit, Hacker News, community engagement |
| **Total** | **$13,000/mo** | **All of the above, in one conversation** |

## Prerequisites

- Web access for research (WebSearch, WebFetch)
- `GOOGLE_API_KEY` or `GOOGLE_PSI_API_KEY` — Optional, for PageSpeed Insights scores and Core Web Vitals (free from Google Cloud Console)
- Lighthouse CLI — Optional, for full browser-based performance audit (`npm install -g lighthouse`)

## Workflow

### Step 1: Onboarding (REQUIRED — Maximum 2 Questions)

⚠️ **DO NOT ask more than 2 questions. The CMO's intelligence replaces configuration.**

⚠️ **Use the `AskUserQuestion` tool for each question below.**

**CMO Introduction + Q1: Website URL**

> "Hi, I'm your AI CMO. Give me your website URL and I'll get to work.
>
> I'll crawl your site, audit your SEO, find distribution opportunities on Reddit, Hacker News, and X, identify content gaps, and come back with a prioritized action plan and ready-to-publish content.
>
> **What's your website URL?**"

*Wait for response.*

**Q2: Additional Context (Optional)**

> "Got it. Anything else I should know?
>
> You can drop any of the following — or just say **go** and I'll figure it out:
> - Competitor names or URLs
> - Brand voice / tone guidelines
> - Product description or docs
> - Specific marketing goals
> - Existing social handles (@twitter, etc.)"

*Wait for response. If user says "go" or provides nothing, proceed immediately.*

#### Quick Reference

| Question | Determines |
|----------|------------|
| URL | Everything — site crawl, SEO audit, content analysis |
| Context (optional) | Brand voice, competitors, goals, social handles |

---

### Step 2: Site Analysis & Context Gathering

This step runs BEFORE dispatching agents. The CMO gathers all context that agents will need.

#### 2a: Run Site Audit

```bash
python3 ${SKILL_PATH}/skills/cmo-agent/scripts/site_audit.py \
  --url "USER_URL" \
  --output site_audit.json \
  --format both \
  --max-pages 15 \
  --depth 2 \
  --verbose
```

If user provided a `GOOGLE_PSI_API_KEY` or it's in the environment, add `--psi-key KEY`.

#### 2b: Crawl Website Content

Use **WebFetch** to pull the homepage HTML and key pages (about, pricing, features, blog). Extract:
- Product name and description
- Brand voice indicators (tone, formality, messaging style)
- Existing content inventory (blog posts, guides)
- Pricing/offering structure
- Target audience signals

#### 2c: Auto-Identify Competitors

Use **WebSearch** to find competitors:
- Search: `"[product category] alternatives"`
- Search: `"[product name] vs"`
- Search: `"best [product category] tools 2026"`

Extract top 3-5 competitors with URLs and positioning.

#### 2d: Check for Existing Documents

Look in the working directory for:
- `brand_profile.json` (from brand-research-agent)
- `competitor_analysis.json` (from competitive-intel-agent)
- `product_info.md` or similar product docs

If found, incorporate into agent context. If not, use what was gathered in 2b.

#### 2e: Prepare Agent Context Bundle

Compile a context bundle that ALL agents receive:

```
CONTEXT BUNDLE:
- Website URL: [url]
- Product: [name and description from site crawl]
- Brand Voice: [tone indicators or user-provided guidelines]
- Target Audience: [inferred from site or user-provided]
- Competitors: [auto-identified or user-provided list]
- Site Audit Summary: [key scores and issues from site_audit.py]
- User Goals: [from Q2 or inferred — default: "maximize growth across all channels"]
- Social Handles: [if provided]
```

---

### Step 3: Deploy 6 Specialized Agents in Parallel

Launch all 6 agents simultaneously, each receiving the full context bundle:

#### Agent 1: SEO Analyst
Focus: Technical SEO audit with exact fix snippets
```
Analyze the site_audit.py output plus the raw HTML.
For every issue found, provide the exact HTML/code fix.
Score: SEO, Accessibility, Performance, Best Practices.
```

#### Agent 2: GEO Analyst
Focus: AI search visibility optimization
```
Assess how the site appears in ChatGPT, Perplexity, Google AI Overview.
Provide exact JSON-LD schema code to add.
Identify content structure changes for better AI extraction.
```

#### Agent 3: Content Writer
Focus: Full articles and content calendar
```
Write at least one complete 1500-3000 word article.
Build a 4-week content calendar.
Identify keyword gaps and quick wins.
Include meta tags, heading structure, internal links.
```

#### Agent 4: Reddit Scout
Focus: Active threads and copy-paste comments
```
Find SPECIFIC active Reddit threads (with URLs).
Write complete comments for each (2-3 variations).
Identify subreddits to monitor with rules and risk levels.
```

#### Agent 5: Hacker News Scout
Focus: Show HN submission package
```
Draft a complete Show HN post with founder comment.
Pre-write 5+ objection responses.
Find relevant active threads for comments.
Assess content readiness for HN.
```

#### Agent 6: X Scout
Focus: Tweet threads, calendar, and engagement
```
Write complete tweet threads (5-12 tweets each).
Create 7-day content calendar.
Find reply opportunities with influencers.
Map relevant influencers and hashtags.
```

---

### Step 4: Cross-Channel Synthesis

After all agents complete, the CMO synthesizes outputs into a coordinated strategy.

#### 4a: Identify Narrative Spines

Extract 3-5 core product stories/angles from the combined agent outputs that can be atomized across channels:

```
Narrative Spine 1: "[Core value proposition angle]"
  → Article: "[Full article from content-writer]"
  → Thread: "[Tweet thread derived from article]"
  → Reddit: "[Comments referencing the article/product]"
  → HN: "[Show HN post if technically relevant]"

Narrative Spine 2: "[Technical differentiation angle]"
  → Article: "[Technical deep-dive]"
  → Thread: "[Thread about the technical approach]"
  → HN: "[Primary Show HN angle]"
```

#### 4b: Create Content Cascades

For each narrative spine, define the publishing sequence:

```
Day 1: Publish the SEO article on the blog
Day 1: Submit to Hacker News (if Tuesday-Thursday, 8-10am ET)
Day 1-2: Post the Twitter thread with link to article
Day 2-3: Drop Reddit comments in relevant active threads
Day 3-7: Drip standalone tweets from the thread
```

#### 4c: Prioritize Actions

Rank ALL outputs by impact-to-effort ratio. The top 3-5 become the "Do This Now" list:

```
Priority scoring:
- Effort: How long to execute (copy-paste = 1 min, publish article = 30 min, implement SEO fix = variable)
- Impact: Estimated traffic/visibility gain
- Urgency: Time-sensitive opportunities (active Reddit thread, trending topic)
- Risk: Likelihood of negative outcome (getting banned, negative reception)
```

---

### Step 5: Generate CMO Dashboard

Present the synthesized results as a formatted dashboard. Use box-drawing characters for visual structure.

**Dashboard output format:**

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                            AI CMO TERMINAL                                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  [SEO]      Critical: Missing meta description on /pricing, /contact       ║
║  [Reddit]   r/SaaS: "Best tools for startup marketing?" (23 upvotes)       ║
║  [HN]       Show HN draft ready: "Show HN: [Product] – [description]"     ║
║  [X]        3 tweet threads generated, 2 reply opportunities found         ║
║  [GEO]      5 AI search visibility gaps identified                         ║
║  [Content]  1 SEO article drafted, 4-week calendar built                   ║
║                                                           +N more items    ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─── ANALYTICS OVERVIEW ─────────────────────────────────────────────────────┐
│                                                                            │
│  Page Speed      Accessibility     Best Practices      SEO                │
│  ┌───────┐       ┌───────┐         ┌───────┐          ┌───────┐          │
│  │  58   │       │  85   │         │  73   │          │  92   │          │
│  └───────┘       └───────┘         └───────┘          └───────┘          │
│   NEEDS WORK       GOOD             GOOD              EXCELLENT          │
│                                                                            │
│  Health: 18/24    Links: 42/42    AI/GEO: 3/8    Passed: 63/74          │
│                                                                            │
│  ── SEO Health Checklist ──────────────────────────────────────           │
│  [PASS] Meta Titles .................... 8/10 present                     │
│  [FAIL] Meta Descriptions .............. 7/10 present (3 missing)        │
│  [PASS] Mobile Friendly ................ Yes                              │
│  [WARN] Image Alt Tags ................. 42/50 (8 missing)               │
│  [FAIL] Core Web Vitals:                                                  │
│         LCP: 3.2s (target: <2.5s)                                        │
│         Total Blocking Time: 450ms (target: <200ms)                      │
│         Cumulative Layout Shift: 0.12 (target: <0.1)                     │
└────────────────────────────────────────────────────────────────────────────┘

┌─── DO THIS NOW (Top 3 Actions) ───────────────────────────────────────────┐
│                                                                            │
│  1. [FIX]  Add meta descriptions to 3 pages              ⏱ 15 min        │
│            Impact: HIGH | Copy-paste HTML provided below                  │
│                                                                            │
│  2. [REPLY] Reply to Reddit thread in r/SaaS              ⏱ 2 min        │
│            "Best tools for startup marketing?" (23 upvotes, 6h old)       │
│            Copy-paste comment ready below                                 │
│                                                                            │
│  3. [PUBLISH] Submit Show HN post                         ⏱ 5 min        │
│            Title + founder comment + objection responses ready            │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

┌─── AI CMO FEED ───────────────────────────────────────────────────────────┐
│                                                                            │
│  [!] Reddit Opportunities ─────────────────────────── N found             │
│      > "Thread title" (r/subreddit, X upvotes)                   [REPLY] │
│      > "Thread title" (r/subreddit, X upvotes)                   [REPLY] │
│      + N more threads ready for review                                    │
│                                                                            │
│  [!] SEO & GEO Issues ────────────────────────────── N found             │
│      > Missing meta descriptions on N pages                      [FIX]   │
│      > No FAQ schema markup on N pages                           [FIX]   │
│      + N more recommendations                                            │
│                                                                            │
│  [*] X/Twitter Ideas ─────────────────────────────── N generated          │
│      > Thread: "Hook tweet preview..."                          [REVIEW] │
│      > Reply to @influencer about [topic]                       [REVIEW] │
│      + N more ideas                                                       │
│                                                                            │
│  [*] Articles ────────────────────────────────────── N ready              │
│      > "[Article Title]" (target: keyword, ~2000 words)         [DRAFT]  │
│      + N more article topics in calendar                                  │
│                                                                            │
│  [-] Hacker News ─────────────────────────────────── 1 draft              │
│      > "Show HN: [Product] – [description]"                   [PUBLISH] │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

┌─── COMPETITORS ───────────────────────────────────────────────────────────┐
│                                                                            │
│  Monitored (N):                                                            │
│  HIGH   competitor1.com .... Positioning: "[their tagline]"               │
│  MED    competitor2.com .... Positioning: "[their tagline]"               │
│  LOW    competitor3.com .... Positioning: "[their tagline]"               │
│                                                                            │
│  Say "add competitor [url]" or "remove competitor [url]" to manage.       │
└────────────────────────────────────────────────────────────────────────────┘

┌─── KNOWLEDGE BASE ────────────────────────────────────────────────────────┐
│                                                                            │
│  [LOADED]  Site Audit ..................... site_audit.json                │
│  [LOADED]  Product Info .................. (extracted from site)           │
│  [STATUS]  Brand Profile ................. Not loaded (run /brand-research)│
│  [STATUS]  Competitor Analysis ........... Auto-identified (3 found)      │
│                                                                            │
│  Load documents: provide file paths or describe your product.             │
└────────────────────────────────────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────────────────────
All analysis runs locally in your session. Your data is not stored or
shared externally.
─────────────────────────────────────────────────────────────────────────────
```

**Populate each section with REAL data from agent outputs:**
- Terminal log: One line per agent with the most important finding
- Analytics: Actual scores from site_audit.py (or agent estimates)
- Do This Now: Top 3 actions ranked by impact-to-effort
- Feed: Aggregated opportunities from all agents with preview text
- Competitors: Auto-identified list with threat levels
- Knowledge Base: Status of loaded documents/context

---

### Step 6: Deliver & Enter Chat Mode

After displaying the dashboard, enter conversational mode:

**Delivery message:**

> "Your AI CMO dashboard is ready.
>
> **Top priority:** [#1 action from Do This Now list]
>
> I can expand any section — just ask:
> - **'Show Reddit comments'** — Full comments for all threads
> - **'Show SEO fixes'** — Every fix with copy-paste HTML
> - **'Show the article'** — Complete drafted article
> - **'Show HN post'** — Full submission + founder comment
> - **'Show tweet threads'** — All threads + calendar
> - **'Show GEO fixes'** — AI search visibility recommendations
> - **'Write another article on [topic]'** — Generate more content
> - **'Deep dive on [competitor]'** — Detailed competitive analysis
> - **'Refresh'** — Re-run the full analysis
>
> What would you like to tackle first?"

**Chat interaction patterns:**

When user asks to expand a section, output the FULL agent data for that section:
- Reddit: Every thread URL + all comment variations
- SEO: Every issue with exact HTML fix snippet
- Article: Full markdown article text
- HN: Title + founder comment + all objection responses
- Tweets: Every thread + standalone tweets + calendar
- GEO: Every recommendation with schema code

When user asks to write more content:
- Use the same context bundle to generate additional content
- Maintain brand voice consistency
- Cross-reference existing outputs

---

## State Persistence

After the initial run, save state for future re-runs:

**Save `cmo_state.json` in the working directory:**
```json
{
  "last_run": "2026-03-16T14:30:00Z",
  "website_url": "https://example.com",
  "product_name": "Product Name",
  "product_description": "Brief description",
  "brand_voice": {"tone": ["Confident", "Approachable"], "formality": "professional casual"},
  "competitors": ["competitor1.com", "competitor2.com"],
  "social_handles": {"twitter": "@handle"},
  "content_generated": ["article-topic-1"],
  "reddit_threads_targeted": ["url1", "url2"],
  "hn_submitted": false,
  "seo_scores": {"seo": 82, "accessibility": 65, "performance": 48, "best_practices": 73}
}
```

**On re-run, operate in delta mode:**
- Skip re-crawling if site hasn't changed (check Last-Modified header)
- Find NEW Reddit threads only (filter out already-targeted)
- Generate NEXT article in the content calendar
- Report SEO score CHANGES since last run
- Update competitor tracking with recent moves

---

## Integration with Other Skills

| Skill | Use Case |
|-------|----------|
| `brand-research-agent` | Deep brand analysis → feeds brand voice to all agents |
| `competitive-intel-agent` | Detailed 4-agent competitive deep-dive |
| `copywriter-agent` | Additional marketing copy (ads, landing pages, emails) |
| `chart-generation` | SEO score gauges, opportunity breakdown charts |
| `image-generation` | Social media graphics, blog post images |
| `social-producer-agent` | Full social media asset creation (images + videos) |
| `media-utils` | PDF report generation from CMO dashboard |

**Generate PDF Report:**
```bash
python3 ${CLAUDE_PLUGIN_ROOT}/skills/media-utils/scripts/report_to_pdf.py \
  --input cmo_report.md \
  --output cmo_report.pdf \
  --title "AI CMO Report" \
  --style business
```

---

## Future Expansion

These channels are planned for future agent additions:
- **LinkedIn Agent** — Thought leadership posts, company page content
- **Email Agent** — Welcome sequences, newsletter templates, re-engagement
- **Product Hunt Agent** — Launch strategy, asset preparation, timing
- **YouTube Agent** — Video topic ideas, SEO optimization, thumbnail concepts
- **Link Building Agent** — Backlink opportunities, outreach templates
- **Influencer Agent** — Influencer identification, outreach, collaboration ideas

---

## Agents

| Agent | File | Focus |
|-------|------|-------|
| SEO Analyst | `seo-analyst.md` | Technical audit with exact fix snippets |
| GEO Analyst | `geo-analyst.md` | AI search visibility optimization |
| Content Writer | `content-writer.md` | Full articles + content calendar |
| Reddit Scout | `reddit-scout.md` | Thread discovery + copy-paste comments |
| HN Scout | `hackernews-scout.md` | Show HN submission package |
| X Scout | `x-scout.md` | Tweet threads + 7-day calendar |

---

## Example Prompts

**Full CMO analysis:**
> "Be my AI CMO for https://myproduct.com"

**Specific channel focus:**
> "Find Reddit opportunities for my SaaS product at https://myapp.io"

**Content generation:**
> "Write SEO articles for https://mysite.com — I want to rank for AI marketing tools"

**SEO audit only:**
> "Run a full SEO audit on https://mysite.com and give me exact fixes"

**Competitive analysis:**
> "Analyze my marketing position vs Competitor1 and Competitor2 for https://myproduct.com"

**Re-run / refresh:**
> "Refresh my CMO dashboard — find new opportunities since last run"
