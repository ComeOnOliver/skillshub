# Provided by TippyEntertainment

# CRM Integrations

Comprehensive webhook integrations for major CRMs with bidirectional sync capabilities.

## Supported CRMs

- **HubSpot**: OAuth 2.0 integration, contact sync, deal creation
- **Salesforce**: REST API integration, lead sync, opportunity creation
- **Pipedrive**: API token integration, person/deal sync
- **Custom Webhooks**: Generic webhook support for other CRMs

## Features

- Bidirectional sync (leads in, scores out)
- Field mapping configuration
- OAuth 2.0 flow for HubSpot and Salesforce
- API token auth for Pipedrive
- Webhook receivers for real-time updates
- Rate limiting and retry logic
- Error handling and logging

## Setup

### HubSpot OAuth

1. Create a HubSpot Developer Account
2. Create a Public App in the Developer Dashboard
3. Add redirect URL: `https://yourapp.com/oauth/hubspot/callback`
4. Required scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.objects.deals.read`
   - `crm.objects.deals.write`

### Salesforce OAuth

1. Create a Connected App in Salesforce Setup
2. Enable OAuth with scopes: `api`, `refresh_token`, `offline_access`
3. Add callback URL: `https://yourapp.com/oauth/salesforce/callback`

### Pipedrive API Token

1. Go to Settings > Personal preferences > API
2. Generate API token
3. Store securely

## Parameters

- `crm`: string (required) - CRM type: "hubspot", "salesforce", "pipedrive", or "custom"
- `action`: string (required) - Action: "sync_leads", "sync_contacts", "create_deal", "update_lead", "get_scores", "configure_webhook"
- `data`: object (required) - Data payload for the action
- `field_mapping`: object (optional) - Custom field mapping configuration

## Returns

- `success`: boolean
- `synced_count`: number - Number of records synced
- `errors`: array - Any errors encountered
- `data`: object - Response data from CRM

## Usage Examples

### Sync Leads from HubSpot

```javascript
crmIntegrations({
  crm: "hubspot",
  action: "sync_leads",
  data: {
    limit: 100,
    after: "cursor_token"
  }
});
```

### Create Salesforce Opportunity

```javascript
crmIntegrations({
  crm: "salesforce",
  action: "create_deal",
  data: {
    name: "Enterprise Deal",
    amount: 50000,
    stage: "Proposal",
    lead_id: "00QXXXXXXXXXXXX"
  }
});
```

### Sync Pipedrive Persons

```javascript
crmIntegrations({
  crm: "pipedrive",
  action: "sync_contacts",
  data: {
    start: 0,
    limit: 100
  }
});
```

### Push Scores to CRM

```javascript
crmIntegrations({
  crm: "hubspot",
  action: "get_scores",
  data: {
    lead_ids: ["123", "456", "789"],
    scores: {
      "123": 85,
      "456": 92,
      "789": 67
    }
  }
});
```

### Configure Custom Webhook

```javascript
crmIntegrations({
  crm: "custom",
  action: "configure_webhook",
  data: {
    endpoint: "https://your-crm.com/webhook",
    secret: "webhook_secret",
    events: ["lead.created", "lead.updated", "deal.closed"]
  }
});
```

## Field Mapping

Configure custom field mappings between your system and CRM:

```javascript
{
  field_mapping: {
    "email": "Email",
    "first_name": "FirstName",
    "last_name": "LastName",
    "company": "Company",
    "phone": "Phone",
    "lead_score": "Lead_Score__c",
    "custom_field": "Custom_Field__c"
  }
}
```

## API Endpoints

### HubSpot
- Base URL: `https://api.hubapi.com`
- Contacts: `/crm/v3/objects/contacts`
- Deals: `/crm/v3/objects/deals`
- OAuth: `/oauth/v1/token`

### Salesforce
- Base URL: `{instance_url}/services/data/v61.0`
- Leads: `/sobjects/Lead`
- Opportunities: `/sobjects/Opportunity`
- OAuth: `/services/oauth2/token`

### Pipedrive
- Base URL: `https://api.pipedrive.com/v1`
- Persons: `/persons`
- Deals: `/deals`
- Organizations: `/organizations`

## Error Handling

All integrations include:
- Automatic retry with exponential backoff
- Rate limit handling
- Detailed error logging
- Graceful degradation

## Webhook Events

Supported webhook events for bidirectional sync:
- `lead.created` - New lead created in CRM
- `lead.updated` - Lead updated in CRM
- `deal.created` - New deal/opportunity created
- `deal.updated` - Deal stage changed
- `deal.won` - Deal closed won
- `deal.lost` - Deal closed lost

## Security

- OAuth tokens stored encrypted
- API tokens never logged
- Webhook signature verification
- HTTPS only
- IP whitelisting support
