# Google SERP Lead Scraper

Scrapes Google search results for local businesses, fetches their websites, extracts contact information using GPT-5, and stores structured leads in Google Sheets.

## When to Use

- Building lead lists for local service businesses (plumbers, electricians, roofers, etc.)
- Prospecting for outreach campaigns targeting specific geographic areas
- Populating CRM with enriched contact data

## How to Call

**Webhook URL (test mode):**
```
GET https://nicksaraev.app.n8n.cloud/webhook-test/8aee83a4-ae72-4f96-a834-e1c6afd4d080
```

**Production URL:** TBD (deploy workflow to get production webhook)

No parameters required currently—query is hardcoded to "calgary plumber".

## What It Does

1. **Google Search** → Apify's `google-search-scraper` actor searches with:
   - Query: "calgary plumber" (hardcoded)
   - Country: Canada (`ca`)
   - Language: English
   - 5 pages × 10 results = up to 50 organic results

2. **Limit** → Currently capped at 2 results (for testing). Remove or adjust the Limit node for full runs.

3. **Fetch & Convert** → Each result URL is fetched and converted to markdown.

4. **GPT-5 Extraction** → Extracts 100+ fields per lead including:
   - Company info (name, tagline, industry, keywords)
   - Owner/decision-maker details
   - Multiple emails with confidence scores and provenance
   - Phones normalized to E.164
   - Full address parsing
   - Social profiles (LinkedIn, Facebook, Instagram, Twitter, etc.)
   - Best contact method recommendation
   - Custom icebreaker line for outreach

5. **Google Sheets** → Appends to [Google SERP Scraping Database](https://docs.google.com/spreadsheets/d/1oWYDtvh8g6A94ubK9FZlLUm1vlb4W3dHcVGFchoVj6U/edit)

## Output Schema (Key Fields)

| Field | Description |
|-------|-------------|
| `company_name` | Business name |
| `owner_name` | Decision-maker name (if found) |
| `best_email_to_try` | Highest-confidence email for outreach |
| `best_phone_to_try` | Recommended phone number |
| `email_1`, `email_2`, `email_3` | All extracted emails |
| `email_X_confidence` | 0.0–1.0 confidence score |
| `email_X_provenance` | Source location (e.g., `/contact|#footer`) |
| `phone_1_e164` | Phone in E.164 format |
| `address_full` | Complete address string |
| `linkedin_company_url` | Company LinkedIn page |
| `one_liner_for_icebreaker` | Pre-formatted outreach opener |

See the full 100+ field schema in the n8n workflow's GPT prompt.

## Icebreaker Format

The extraction generates icebreakers in this format:
```
Hey {FirstName}. I work with a $2M/yr plumber out of Calgary (NE-specific),
pretty similar to {CompanyName}. Not sure if you have exposure to the NE,
but wanted to run something by you.
```

## Confidence Scoring

Extraction uses tiered confidence based on source:
- **1.0** — Schema.org structured data
- **0.9** — OpenGraph/meta tags
- **0.85** — /contact or /about pages
- **0.8** — Footer/header blocks
- **0.6** — Visible text near contact labels
- **0.4** — Inferred/heuristic values

Fields below 0.6 confidence are flagged for manual review.

## Current Limitations

1. **Hardcoded query** — "calgary plumber" is baked into the workflow. To change:
   - Edit the Apify node's `queries` parameter in n8n
   - Or parameterize via webhook query string (requires workflow update)

2. **Test limit** — Only processes 2 results. Remove the Limit node for production.

3. **No deduplication** — Repeated runs may create duplicate rows. Consider adding a check against `source_url` or `domain`.

4. **Rate limits** — Apify has usage limits; large batches may need pagination or scheduling.

## Future Improvements

- [ ] Accept `query` and `location` as webhook parameters
- [ ] Add deduplication against existing sheet rows
- [ ] Batch processing with progress tracking
- [ ] Error handling for failed URL fetches
- [ ] Deploy to production webhook URL

## Related Files

- **Output:** [Google SERP Scraping Database](https://docs.google.com/spreadsheets/d/1oWYDtvh8g6A94ubK9FZlLUm1vlb4W3dHcVGFchoVj6U/edit)
- **Workflow platform:** n8n Cloud (nicksaraev.app.n8n.cloud)
- **Scraping service:** Apify (google-search-scraper actor)
