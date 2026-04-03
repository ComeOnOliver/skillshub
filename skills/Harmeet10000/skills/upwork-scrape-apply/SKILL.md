# Upwork Job Scrape & Apply Pipeline

Scrape Upwork jobs matching AI/automation keywords, generate personalized cover letters and proposals, and output to a Google Sheet with one-click apply links.

## Inputs

- **Keywords**: List of search terms (default: automation, ai agent, n8n, gpt, workflow, api integration, scraping, ai consultant)
- **Limit**: Max jobs to fetch (default: 50)
- **Days**: Only jobs from last N days (default: 1 = last 24 hours)
- **Filters**:
  - `--verified-payment`: Only clients with verified payment
  - `--min-spent N`: Minimum client spend history
  - `--experience`: Experience levels (entry, intermediate, expert)

## Execution Tools

### 1. Scrape Jobs
```bash
python execution/upwork_apify_scraper.py \
  --limit 50 \
  --days 1 \
  --verified-payment \
  -o .tmp/upwork_jobs_batch.json
```

Uses `upwork-vibe~upwork-job-scraper` Apify actor (PPE $0/event, free tier). Always add to Google Sheet! Do not ask user, just assume.

### 2. Filter & Generate Proposals
```bash
python execution/upwork_proposal_generator.py \
  --input .tmp/upwork_jobs_batch.json \
  --workers 5 \
  --output .tmp/upwork_jobs_with_proposals.json
```

Options:
- `--workers N`: Parallel Opus 4.5 calls (default: 5)
- `--sheet-id ID`: Use existing sheet (creates new if omitted)
- `--filter-keywords "ai,automation"`: Only process jobs matching keywords

For each job:
- Generates Apply Now link (`/nx/proposals/job/{id}/apply/`)
- Creates personalized cover letter using Opus 4.5 with extended thinking
- Creates project proposal Google Doc (with retry + exponential backoff)
- Outputs to new Google Sheet with all columns

## Output

Google Sheet with columns:
| Column | Description |
|--------|-------------|
| Keyword | Search term that found this job |
| Title | Job title |
| URL | Job listing URL |
| Budget | Fixed price or hourly range |
| Experience | Required level |
| Skills | Top 5 required skills |
| Client Country | Client location |
| Client Spent | Total $ spent on platform |
| Client Hires | Total past hires |
| Connects | Cost to apply |
| Posted | Date posted |
| **Contact Name** | Discovered first name (if found) |
| **Contact Confidence** | high/medium/low - how certain we are |
| **Apply Link** | One-click apply URL |
| **Cover Letter** | Personalized pitch |
| **Proposal Doc** | Google Doc with full proposal |

## Cover Letter Format

Must stay above the fold (~35 words max). Uses short paraphrases:

```
Hi. I work with [2-4 word paraphrase] daily & just built a [2-5 word thing]. Free walkthrough: [PROPOSAL_DOC_LINK]
```

Example:
> Hi. I work with n8n automations daily & just built an AI lead scoring pipeline. Free walkthrough: https://docs.google.com/document/d/...

## Proposal Format

Conversational, first-person format written as Nick:

```
Hey [name if available].

I spent ~15 minutes putting this together for you. In short, it's how I would create your [paraphrasedThing] system end to end.

I've worked with $MM companies like Anthropic (yes—that Anthropic) and I have a lot of experience designing/building similar workflows.

Here's a step-by-step, along with my reasoning at every point:

My proposed approach

[4-6 numbered steps with reasoning for each]

What you'll get

[2-3 concrete deliverables]

Timeline

[Realistic estimate, conversational tone]
```

Tone: Direct, confident, peer-to-peer. Not salesy or formal.

## Keywords for AI/Automation

| Keyword | Target Jobs |
|---------|-------------|
| automation | Workflow automation, Zapier/Make |
| ai agent | AI assistants, autonomous systems |
| n8n | Self-hosted automation |
| gpt | OpenAI API, LLM apps |
| workflow | Business process, systems |
| api integration | Connect services, middleware |
| scraping | Data extraction, lead gen |
| ai consultant | Strategy, implementation |

## Edge Cases

- **No jobs found**: Increase limit or broaden keywords
- **Anthropic rate limit**: Reduce `--workers` to 2-3
- **Google Doc creation fails**: Script retries 4x with exponential backoff (1.5s, 3s, 6s, 12s)
- **Google API quota**: Max ~100 doc creates/day on free tier
- **Sheet already has columns**: Use `--sheet-id` to append, or omit for fresh sheet

## Contact Name Discovery

The system uses Opus 4.5 to discover the likely contact name from each job posting:

1. **From description** (high confidence): Signatures like "Thanks, John" or "I'm Sarah"
2. **From company research** (medium confidence): If a company name is mentioned and AI recognizes it, infers founder/CEO
3. **Hedged greeting**: For medium/low confidence names, proposal uses "Hey [Name] (if I have the right person)"

Contact info is stored in output and displayed in the Google Sheet.

## Learnings

- Apify free tier only filters: `limit`, `fromDate`, `toDate` - all other filters are post-scrape
- Job URL format: `https://www.upwork.com/jobs/~{id}` → Apply: `https://www.upwork.com/nx/proposals/job/~{id}/apply/`
- Opus 4.5 model ID: `claude-opus-4-5-20251101`
- Extended thinking budget: 5000 tokens for cover letters, 8000 for proposals
- Parallel Opus calls work well (5 workers), but Google Docs API needs serialization (semaphore)
- Doc creation uses `threading.Semaphore(1)` + retry with exponential backoff to avoid SSL errors
- 10 jobs with 5 workers: ~2 min (vs ~20 min sequential)
- Contact name discovery uses Opus 4.5 before proposal generation
- Don't use regex for name extraction - AI handles edge cases much better
