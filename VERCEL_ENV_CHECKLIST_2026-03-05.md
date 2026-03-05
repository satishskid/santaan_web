# Vercel Environment Checklist (Santaan)

Use this as copy checklist while adding env vars in Vercel Project Settings -> Environment Variables.

## Required (Go-live blocker)
- AUTH_SECRET
- NEXTAUTH_SECRET
- TURSO_DATABASE_URL
- TURSO_AUTH_TOKEN
- NEODOVE_WEBHOOK_SECRET
- BLOG_SYNC_SECRET

## Required for communication flows
- BHASH_USER
- BHASH_PASS
- BHASH_SENDER
- WHATSAPP_VERIFY_TOKEN
- CALL_WEBHOOK_SECRET

## Required for analytics automations
- META_ACCESS_TOKEN
- META_AD_ACCOUNT_IDS
- META_APP_SECRET
- META_GRAPH_API_VERSION
- META_REPORTING_TIMEZONE
- META_SPEND_SYNC_SECRET
- GA4_PROPERTY_ID
- GOOGLE_SERVICE_ACCOUNT_EMAIL
- GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

## Optional
- GOOGLE_ANALYTICS_ID
- FACEBOOK_PIXEL_ID
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- TELEGRAM_BOT_TOKEN

## Rules
1. No secret values in Git.
2. Add values in Production + Preview as applicable.
3. After adding, redeploy preview and run UAT.
4. Rotate any credential that has been shared in open chat/doc.
