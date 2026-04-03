# Lead Scraping & Verification

## Goal
Scrape leads using Apify (`code_crafter/leads-finder`), verify their relevance (industry match > 80%), and save them to a Google Sheet. For large scrapes (1000+ leads), use parallel scraping for 3-5x faster performance.

## Inputs
- **Industry**: The target industry (e.g., "Plumbers", "Software Agencies").
- **Location**: The target location (e.g., "New York", "United States").
- **Total Count**: The total number of leads desired.

## Tools/Scripts
- Script: `execution/scrape_apify.py` (single scrape, for <1000 leads)
- Script: `execution/scrape_apify_parallel.py` (parallel scraping, for 1000+ leads)
- Script: `execution/update_sheet.py` (batch sheet updates, optimized for large datasets)
- Dependencies: Apify API Token, Google Service Account Credentials

## Process

### Small Scrapes (<1000 leads)
1. **Test Scrape**
   - Run `execution/scrape_apify.py` with `max_items=25` and `--no-email-filter`.
   - Output: `.tmp/test_leads.json` (temporary file).

2. **Verification**
   - Agent (You) reads `.tmp/test_leads.json`.
   - Check if at least 20/25 (80%) leads match the **Industry**.
   - **Decision**:
     - **Pass**: Proceed to step 3.
     - **Fail**: Stop. Ask user to refine **Industry** or **Location** keywords.

3. **Full Scrape**
   - Run `execution/scrape_apify.py` with full **Total Count** and `--no-email-filter`.
   - Output: `.tmp/leads_[timestamp].json` (temporary file).

4. **[OPTIONAL] LLM Classification for Harder Niches**
   - **When to use**: For complex distinctions (e.g., "product SaaS vs agencies")
   - **Command**:
     ```bash
     python3 execution/classify_leads_llm.py .tmp/leads_[timestamp].json \
       --classification_type product_saas \
       --output .tmp/classified_leads.json
     ```
   - **Performance**: ~2 minutes for 3,000 leads
   - See [classify_leads_llm.md](classify_leads_llm.md) for details

5. **Upload to Google Sheet** (DELIVERABLE)
   - Run `execution/update_sheet.py` with the final JSON file (classified or original).
   - **Output**: Google Sheet URL (this is the actual deliverable the user receives).

6. **Enrich Missing Emails**
   - Run `execution/enrich_emails.py` with the Google Sheet URL.
   - Script auto-detects dataset size and uses appropriate API strategy.
   - **Output**: Updated Google Sheet URL (final deliverable with enriched emails).

### Large Scrapes (1000+ leads) - FASTER with Parallel Processing
1. **Test Scrape** (same as above)
   - Run `execution/scrape_apify.py` with `max_items=25` and `--no-email-filter`.
   - Verify industry match > 80%.

2. **Parallel Full Scrape**
   - Run `execution/scrape_apify_parallel.py` with:
     - `--total_count` (e.g., 4000)
     - `--location` (e.g., "United States", "EU", "UK", "Canada", "Australia")
     - `--strategy regions` (auto-detects based on location)
     - `--no-email-filter` (scrape without email requirement, enrich after)
   - **Geographic Partitioning (Cost-Neutral)**:
     - **Auto-detects region** based on location:
       - **United States**: 4-way (Northeast, Southeast, Midwest, West)
       - **EU/Europe**: 4-way (Western, Southern, Northern, Eastern)
       - **UK**: 4-way (SE England, N England, Scotland/Wales, SW England)
       - **Canada**: 4-way (Ontario, Quebec, West, Atlantic)
       - **Australia**: 4-way (NSW, VIC/TAS, QLD, WA/SA)
     - **Alternative strategies**:
       - `--strategy metros`: 8-way US metro areas
       - `--strategy apac`: 8-way Asia-Pacific split
       - `--strategy global`: 8-way worldwide continental split
     - **Custom**: Comma-separated cities/states (e.g., `--location "London,Paris,Berlin,Madrid"`)
   - **Cost**: SAME as sequential (4 partitions × 1000 = 4000 total leads)
   - **Automatic Deduplication**: Handles leads appearing in multiple regions
   - Output: `.tmp/leads_[timestamp].json` (deduplicated, temporary file).
   - **Time Savings**: 3-4x faster than sequential, no extra cost.

3. **[OPTIONAL] LLM Classification for Harder Niches**
   - **When to use**: For complex distinctions that keywords can't capture:
     - ✅ "Product SaaS vs IT consulting agencies" (use LLM)
     - ✅ "High-ticket vs low-ticket businesses" (use LLM)
     - ✅ "Subscription vs one-time payment models" (use LLM)
     - ❌ "Dentists" or "Realtors" (simple keyword matching works)
   - **Command**:
     ```bash
     python3 execution/classify_leads_llm.py .tmp/leads_[timestamp].json \
       --classification_type product_saas \
       --output .tmp/classified_leads.json
     ```
   - **Performance**: ~2 minutes for 3,000 leads, ~$0.30 per 1,000 leads
   - **Default behavior**: Includes "unclear" classifications (medium confidence)
   - **Output**: `.tmp/classified_leads.json` (use this instead of original file for next step)
   - See [classify_leads_llm.md](classify_leads_llm.md) for full details

4. **Upload to Google Sheet** (DELIVERABLE)
   - Run `execution/update_sheet.py` with the final JSON file (classified or original).
   - Script automatically uses chunked batch updates for datasets >1000 rows.
   - **Output**: Google Sheet URL (this is the actual deliverable the user receives).

5. **Enrich Missing Emails** (ALWAYS USE BULK API)
   - **IMPORTANT**: Always run `execution/enrich_emails.py` in the foreground and wait for completion before notifying the user.
   - Run: `python3 execution/enrich_emails.py <SHEET_URL>`
   - **Bulk API Strategy** (200+ rows, PREFERRED):
     - Creates a single AnyMailFinder bulk job for all missing emails
     - Processes ~1000 rows in 5 minutes (much faster than individual calls)
     - Automatically polls until complete
     - **Agent must wait** until enrichment finishes and sheet is updated
   - **Concurrent API Fallback** (<200 rows or if bulk fails):
     - Makes up to 20 concurrent individual API calls
     - Automatically used if bulk API fails
   - **Output**: Updated Google Sheet URL (final deliverable with enriched emails).
   - **Workflow**: DO NOT notify user until enrichment completes and sheet is updated.

## Outputs (Deliverables)
**The ONLY deliverable is the Google Sheet URL.** This sheet contains all verified leads with company info, contact details, etc.

**Important**: Local JSON files (`.tmp/test_leads.json`, `.tmp/leads_*.json`, `.tmp/classified_leads.json`) are temporary intermediates used for processing. They are NOT deliverables and should never be presented to the user as final outputs.

## Edge Cases
- **No leads found**: Apify returns empty list. -> Ask user to broaden search.
- **API Error**: Apify or Google API fails. -> Check credentials in `.env`.
- **Low quality classifications**: If >80% classified as "unclear", consider improving scrape keywords or using custom classification prompt.

## Error Handling
- **Authentication Error**: Ensure `APIFY_API_TOKEN` and `GOOGLE_APPLICATION_CREDENTIALS` are set.
