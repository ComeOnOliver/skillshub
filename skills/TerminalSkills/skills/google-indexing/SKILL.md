# Google Indexing

## Overview

Submit URLs to Google for fast indexing using the Indexing API and service account authentication. Supports single URL submission, batch submission from sitemaps, and indexing status checks. Bypasses the slow sitemap-based discovery process and gets pages indexed within hours instead of days.

## Instructions

When a user asks to submit URLs to Google for indexing, follow these steps:

### Step 1: Verify credentials are set up

The Google Indexing API requires a Google Cloud service account. Check that the user has:

1. A Google Cloud project with the **Indexing API** enabled
2. A service account JSON key file
3. The service account email added as an **Owner** in Google Search Console for the target property

If the user doesn't have these, walk them through the setup:

```bash
# 1. Enable the Indexing API
# Visit: https://console.cloud.google.com/apis/library/indexing.googleapis.com

# 2. Create a service account and download JSON key
# Visit: https://console.cloud.google.com/iam-admin/serviceaccounts
# Create account → Keys → Add Key → JSON → Download

# 3. Add the service account email as Owner in Search Console
# Visit: https://search.google.com/search-console → Settings → Users and permissions
# Add the service account email (e.g., my-indexer@project.iam.gserviceaccount.com) as Owner
```

Verify the key file exists and is valid:

```bash
python3 -c "
import json
with open('service-account.json') as f:
    sa = json.load(f)
print(f'Project:  {sa[\"project_id\"]}')
print(f'Email:    {sa[\"client_email\"]}')
print('Key file is valid.')
"
```

### Step 2: Submit URLs for indexing

**Single URL submission:**

```python
import json
import time
import requests
from google.oauth2 import service_account

SCOPES = ["https://www.googleapis.com/auth/indexing"]
ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish"
CREDENTIALS_FILE = "service-account.json"

def get_auth_session(credentials_file):
    credentials = service_account.Credentials.from_service_account_file(
        credentials_file, scopes=SCOPES
    )
    session = requests.Session()
    credentials.refresh(requests.Request())
    session.headers.update({"Authorization": f"Bearer {credentials.token}"})
    return session

def submit_url(session, url, action="URL_UPDATED"):
    body = {"url": url, "type": action}
    response = session.post(ENDPOINT, json=body)
    return response.status_code, response.json()

session = get_auth_session(CREDENTIALS_FILE)
status, result = submit_url(session, "https://example.com/my-page")
print(f"Status: {status}")
print(json.dumps(result, indent=2))
```

The `type` field accepts:
- `URL_UPDATED` — request indexing or re-indexing (use this for new and updated pages)
- `URL_DELETED` — request removal from the index

**Batch submission from a list of URLs:**

```python
def batch_submit(session, urls, delay=1):
    results = {"success": 0, "failed": 0, "errors": []}
    for i, url in enumerate(urls, 1):
        status, response = submit_url(session, url)
        if status == 200:
            results["success"] += 1
            print(f"[{i}/{len(urls)}] OK    {url}")
        else:
            results["failed"] += 1
            error_msg = response.get("error", {}).get("message", "Unknown error")
            results["errors"].append({"url": url, "status": status, "error": error_msg})
            print(f"[{i}/{len(urls)}] FAIL  {url} — {error_msg}")
        if i < len(urls):
            time.sleep(delay)
    return results
```

### Step 3: Submit URLs from a sitemap

Parse the sitemap and submit all URLs:

```python
import xml.etree.ElementTree as ET

def parse_sitemap(sitemap_url):
    response = requests.get(sitemap_url, timeout=30)
    response.raise_for_status()
    root = ET.fromstring(response.content)
    ns = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}

    # Handle sitemap index (contains other sitemaps)
    sitemap_tags = root.findall("ns:sitemap/ns:loc", ns)
    if sitemap_tags:
        urls = []
        for sitemap_loc in sitemap_tags:
            print(f"Parsing child sitemap: {sitemap_loc.text}")
            urls.extend(parse_sitemap(sitemap_loc.text))
        return urls

    # Handle regular sitemap (contains URLs)
    return [loc.text for loc in root.findall("ns:url/ns:loc", ns)]

def submit_sitemap(credentials_file, sitemap_url, delay=1):
    print(f"Parsing sitemap: {sitemap_url}")
    urls = parse_sitemap(sitemap_url)
    print(f"Found {len(urls)} URLs\n")

    session = get_auth_session(credentials_file)
    results = batch_submit(session, urls, delay=delay)

    print(f"\nDone: {results['success']} submitted, {results['failed']} failed")
    if results["errors"]:
        print("\nFailed URLs:")
        for err in results["errors"]:
            print(f"  {err['url']} — {err['status']} {err['error']}")
    return results
```

### Step 4: Check indexing status

Query the notification metadata to see when Google last processed a URL:

```python
METADATA_ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications/metadata"

def check_status(session, url):
    response = session.get(METADATA_ENDPOINT, params={"url": url})
    if response.status_code == 200:
        data = response.json()
        print(f"URL:           {data.get('url')}")
        notify = data.get("latestUpdate", {})
        print(f"Last notified: {notify.get('notifyTime', 'never')}")
        print(f"Type:          {notify.get('type', 'n/a')}")
    elif response.status_code == 404:
        print(f"URL not found in notification history: {url}")
    else:
        print(f"Error {response.status_code}: {response.json()}")
```

## Examples

### Example 1: Submit all pages from a sitemap

**User request:** "Submit all URLs from my sitemap to Google for indexing"

**Output:**
```
Parsing sitemap: https://terminalskills.io/sitemap.xml
Found 87 URLs

[ 1/87] OK    https://terminalskills.io/
[ 2/87] OK    https://terminalskills.io/skills
[ 3/87] OK    https://terminalskills.io/skills/api-tester
[ 4/87] OK    https://terminalskills.io/skills/code-reviewer
[ 5/87] FAIL  https://terminalskills.io/old-page — URL not allowed for this service account
...
[87/87] OK    https://terminalskills.io/use-cases/automate-deployments

Done: 86 submitted, 1 failed

Failed URLs:
  https://terminalskills.io/old-page — 403 URL not allowed for this service account
```

### Example 2: Submit specific pages and check their status

**User request:** "Index these three new blog posts and check their status"

**Output:**
```
Submitting 3 URLs...

[1/3] OK    https://myblog.com/posts/nextjs-server-actions-guide
[2/3] OK    https://myblog.com/posts/typescript-decorators-explained
[3/3] OK    https://myblog.com/posts/docker-multi-stage-builds

Checking status...

URL:           https://myblog.com/posts/nextjs-server-actions-guide
Last notified: 2025-02-13T14:32:00Z
Type:          URL_UPDATED

URL:           https://myblog.com/posts/typescript-decorators-explained
Last notified: 2025-02-13T14:32:01Z
Type:          URL_UPDATED

URL:           https://myblog.com/posts/docker-multi-stage-builds
Last notified: 2025-02-13T14:32:02Z
Type:          URL_UPDATED

All 3 URLs submitted. Google typically processes these within 24-48 hours.
```

## Guidelines

- The Indexing API has a daily quota of **200 requests per day** by default. Request a quota increase via Google Cloud Console if you need more. The batch endpoint is not available — submit one URL at a time.
- Add a 1-second delay between requests to avoid rate limiting (429 errors). For large sitemaps, consider splitting across multiple days.
- The service account email must be added as an **Owner** (not just a user) in Search Console for the target property. This is the most common setup mistake.
- The API was officially designed for `JobPosting` and `BroadcastEvent` schema types, but works for any URL where the service account has Search Console ownership. Google does not enforce the schema restriction.
- Submitting a URL does **not guarantee** indexing. Google still evaluates content quality. If pages remain unindexed after submission, the issue is likely content quality or crawlability, not the API.
- Use `URL_UPDATED` for both new pages and re-indexing existing pages. Use `URL_DELETED` only to request removal.
- Never store the service account JSON key in version control. Use environment variables or a secrets manager for the file path.
- If you get a 403 "Permission denied" error, verify: (1) the Indexing API is enabled in Google Cloud, (2) the service account email is an Owner in Search Console, and (3) the URL belongs to the verified property.
- For sites with 1000+ pages, combine this with sitemap submission in Search Console — the API handles priority pages while the sitemap covers the long tail.