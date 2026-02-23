# NeoDove Integration Runbook (Santaan)

## What is now wired

1. **Website -> NeoDove (push)**
   - CTA click leads from `/api/track-call` are pushed to NeoDove when a valid phone is available.
   - At-home registration leads from `/api/at-home/register` are pushed to NeoDove.

2. **NeoDove -> Santaan CRM (webhook)**
   - New endpoint added: `POST /api/neodove/webhook`
   - NeoDove lead create/dispose events can update local `contacts` for CEO dashboard analytics.

## Environment Variables

Set in Netlify production:

1. `NEODOVE_INTEGRATION_ID=<your_custom_integration_id>`
   - Used to build:
   - `https://connect.neodove.com/integration/custom/<integration_id>/leads`

OR

2. `NEODOVE_CUSTOM_INTEGRATION_URL=https://connect.neodove.com/integration/custom/<integration_id>/leads`
   - If this is set, it overrides `NEODOVE_INTEGRATION_ID`.

Optional but recommended:

3. `NEODOVE_WEBHOOK_SECRET=<strong_random_string>`
   - Protects inbound `/api/neodove/webhook`.
   - Send in header: `x-neodove-token: <secret>`
   - Or query param: `?token=<secret>`

## NeoDove Webhook Setup

In NeoDove Webhook settings:

1. Webhook URL:
   - `https://santaan.in/api/neodove/webhook`
   - or
   - `https://santaan.in/api/neodove/webhook?token=<NEODOVE_WEBHOOK_SECRET>`

2. Method: `POST`
3. Content-Type: `application/json`
4. Events:
   - Lead Create
   - Lead Dispose

## Campaign Mapping (Website push)

1. Call CTA -> `DIRECT CALLS`
2. WhatsApp CTA -> `WhatsApp Leads`
3. Book/At-home form -> `CHATBOTS`

## Data captured for CEO dashboard

From NeoDove webhook events, Santaan contacts are tagged with:

1. `neodove`
2. `neodove_campaign_<campaign_name>`
3. `neodove_event_<event_name>`
4. `center_<center_name>`

And attribution fields are updated:

1. `utm_source=neodove`
2. `utm_medium=crm`
3. `utm_campaign=<campaign_name_or_fallback>`

## UAT Quick Script

1. Click website Call CTA with UTM URL.
2. Verify contact appears in Santaan admin (source `cta_call`).
3. Verify same lead appears in NeoDove custom integration campaign.
4. Change status in NeoDove (for example Convert/Lost).
5. Confirm webhook updates Santaan contact status and tags.
