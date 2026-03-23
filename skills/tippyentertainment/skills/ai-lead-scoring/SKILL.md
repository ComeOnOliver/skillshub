# AI Lead Scoring

Scores leads based on weighted factors and provides classification with action recommendations.

## Scoring Weights
- Demographics: 30% (company size, industry, title, tech stack)
- Behavior: 50% (website visits, email engagement, form submissions, webinar attendance)
- Engagement: 20% (time on site, return visits, content depth, pricing page views)

## Thresholds
- HOT: 80+ (immediate sales follow-up)
- WARM: 60-79 (nurture + sales touch)
- COOL: 40-59 (marketing automation)
- COLD: <40 (re-engage or disqualify)

## Score Decay
- -5 points per week of inactivity

## Usage
```typescript
import { AILeadScoring } from './lib/ai-lead-scoring';

const scorer = new AILeadScoring();
const result = scorer.scoreLead({
  id: 'lead-123',
  employees: 150,
  industry: 'SaaS',
  title: 'VP of Engineering',
  uses_target_tech: true,
  activities: {
    website_visits: 5,
    email_opens: 3,
    email_clicks: 2,
    form_submissions: 1
  },
  engagement: {
    avg_time_on_site: 180,
    return_visits: 3,
    unique_pages: 8,
    viewed_pricing: true
  },
  last_activity_date: new Date()
});
// Result: { score: 72.5, classification: 'WARM', recommendation: 'Nurture sequence + sales touch' }
```

## CRM Integration (HubSpot)
```typescript
async function updateHubSpotScore(contactId: string, score: number, classification: string) {
  await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        lead_score: score,
        lead_classification: classification,
        last_scored: new Date().toISOString()
      }
    })
  });
}
```

## Webhook Endpoint
```typescript
app.post('/webhook/lead-activity', async (req, res) => {
  const { lead_id } = req.body;
  const leadData = await crm.getLead(lead_id);
  const result = scorer.scoreLead(leadData);
  await crm.updateLeadScore(lead_id, result.score, result.classification);
  if (result.classification === 'HOT') await notifySalesTeam(lead_id, result.score);
  res.json({ status: 'success', ...result });
});
```

## Deployment Checklist
1. Set env vars: CRM_API_KEY, CRM_INSTANCE_URL, WEBHOOK_SECRET
2. Deploy to AWS Lambda, Google Cloud Functions, or Vercel
3. Create CRM custom fields: lead_score, lead_classification, last_scored
4. Configure webhook triggers for lead activities
5. Set up automated workflows by score tier
6. Monitor scoring accuracy weekly
7. Adjust weights based on conversion data
