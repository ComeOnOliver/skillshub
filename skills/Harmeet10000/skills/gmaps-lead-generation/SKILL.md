# Google Maps Lead Generation

Generate high-quality B2B leads from Google Maps with deep contact enrichment.

## Overview

This pipeline scrapes Google Maps for businesses, then enriches each result by:
1. Scraping their website (main page + up to 5 contact pages)
2. Searching DuckDuckGo for additional contact info
3. Using Claude to extract structured contact data from all sources

**Tested at scale**: 50+ leads per run, 68 total leads across plumbers, electricians, HVAC, and roofing contractors.

## When to Use

- Building outbound sales lists for local service businesses
- Generating leads for B2B services (contractors, medical, legal, etc.)
- Researching businesses in a specific geographic area
- Creating prospecting lists with verified contact info

## Inputs

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--search` | Yes | Search query (e.g., "plumbers in Austin TX") |
| `--limit` | No | Max results to scrape (default: 10) |
| `--location` | No | Additional location filter |
| `--sheet-url` | No | Existing Google Sheet to append to |
| `--sheet-name` | No | Name for new sheet if creating |
| `--workers` | No | Parallel workers for enrichment (default: 3) |

## Execution

```bash
# Basic usage - creates new sheet
python3 execution/gmaps_lead_pipeline.py --search "plumbers in Austin TX" --limit 10

# Append to existing sheet (recommended for building lead database)
python3 execution/gmaps_lead_pipeline.py --search "dentists in Miami FL" --limit 25 \
  --sheet-url "https://docs.google.com/spreadsheets/d/..."

# Higher volume run
python3 execution/gmaps_lead_pipeline.py --search "roofing contractors in Austin TX" \
  --limit 50 --workers 5
```

## Output Schema (36 fields)

### Business Basics (from Google Maps)
- `business_name`, `category`, `address`, `city`, `state`, `zip_code`, `country`
- `phone`, `website`, `google_maps_url`, `place_id`
- `rating`, `review_count`, `price_level`

### Extracted Contacts (from website + web search + Claude)
- `emails` - All email addresses found (comma-separated)
- `additional_phones` - Phone numbers from website
- `business_hours` - Operating hours

### Social Media
- `facebook`, `twitter`, `linkedin`, `instagram`, `youtube`, `tiktok`

### Owner/Key Person Info
- `owner_name`, `owner_title`, `owner_email`, `owner_phone`, `owner_linkedin`

### Team Contacts
- `team_contacts` - JSON array of team members with name, title, email, phone, linkedin

### Metadata
- `lead_id` - Unique identifier (MD5 hash of name|address, for deduplication)
- `scraped_at` - ISO timestamp
- `search_query` - Original search term used
- `pages_scraped` - Number of pages fetched (1 main + up to 5 contact pages)
- `search_enriched` - Whether DuckDuckGo search was used (yes/no)
- `enrichment_status` - success/partial/error

## Pipeline Steps

1. **Google Maps Scrape** - Apify `compass/crawler-google-places` actor returns business listings with basic info
2. **Website Scraping** - Fetches main page + up to 5 prioritized contact pages (/contact, /about, /team, etc.)
3. **Web Search Enrichment** - DuckDuckGo search for `"{business}" owner email contact` + scrapes first relevant result
4. **Claude Extraction** - Claude 3.5 Haiku extracts structured contacts from all gathered content
5. **Google Sheet Sync** - Appends new leads, automatically deduplicates by `lead_id`

## Contact Page Patterns (22 total, priority-ordered)

High priority: `/contact`, `/about`, `/team`, `/contact-us`, `/about-us`, `/our-team`
Medium: `/staff`, `/people`, `/meet-the-team`, `/leadership`, `/management`, `/founders`, `/who-we-are`
Lower: `/company`, `/meet-us`, `/our-story`, `/the-team`, `/employees`, `/directory`, `/locations`, `/offices`

## Cost Considerations

| Component | Cost per lead |
|-----------|---------------|
| Apify Google Maps | ~$0.01-0.02 |
| Claude Haiku extraction | ~$0.002 |
| DuckDuckGo search | Free |
| HTTP requests (6-7 pages) | Free |
| Google Sheets | Free |
| **Total** | **~$0.012-0.022** |

**For 100 leads**: ~$1.50-2.50 total

The pipeline maximizes value per Apify dollar by scraping 6+ pages + web search per business.

## Dependencies

```
apify-client
httpx
html2text
anthropic
gspread
google-auth
google-auth-oauthlib
python-dotenv
```

## Files

- `execution/gmaps_lead_pipeline.py` - Main orchestration script
- `execution/scrape_google_maps.py` - Google Maps scraper (standalone)
- `execution/extract_website_contacts.py` - Website contact extractor (standalone)

## Troubleshooting

### "No businesses found"
- Check search query is valid
- Include location in query (e.g., "plumbers in Austin, TX" not just "plumbers")

### 403 Forbidden errors
- ~10-15% of sites block scrapers with 403/503 errors
- These are handled gracefully and marked as errors in `enrichment_status`
- The lead is still saved with Google Maps data (phone, address, etc.)

### "Could not fetch website"
- Some sites have broken DNS or are offline
- Marked as `error` in enrichment_status
- Reduce `--workers` if seeing many timeouts

### "APIFY_API_TOKEN not found"
- Ensure `.env` file has valid Apify token
- Check token hasn't expired at apify.com

### Google Sheet auth issues
- Delete `token.json` and re-authenticate
- Ensure `credentials.json` is valid OAuth client

### Duplicate detection
- Pipeline uses `lead_id` (MD5 of name|address) to skip existing leads
- Running same search twice will show "No new leads to add (all duplicates)"

## Learnings

- Google Maps actor returns `website` field directly - no need to scrape for it
- Contact pages commonly use /contact, /about, /team URL patterns
- Claude Haiku is sufficient for extraction and costs 10x less than Sonnet
- ~10-15% of business websites return 403/503 errors - this is normal
- Facebook URLs always fail with 400 errors (blocks scrapers)
- Some sites have broken DNS - handled gracefully as errors
- DuckDuckGo HTML search is free and doesn't block (unlike Google)
- `stringify_value()` helper needed because Claude sometimes returns dicts instead of strings
- Deduplication by lead_id prevents re-adding existing businesses across runs
- 50 leads takes ~3-4 minutes with 3 workers

## Production Sheet

Active lead database: https://docs.google.com/spreadsheets/d/1ATrOiq3wfph8Or5BE8VCybgvqK5gh7hVPWiSlgb3QiU

Contains: plumbers, electricians, HVAC contractors, roofing contractors (Austin TX)
