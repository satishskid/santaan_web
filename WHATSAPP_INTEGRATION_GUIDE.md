# WhatsApp Integration Guide (BhashSMS)

To enable WhatsApp notifications for new "At-Home Testing" leads, you need to configure the BhashSMS credentials.

## 1. Environment Variables
Add the following to your `.env.local` file (on Netlify or local).
**Note:** Defaults are now hardcoded in `src/services/whatsapp.ts` as a fallback.

```bash
BHASH_USER=Santaan_01
BHASH_SENDER=BUZWAP
BHASH_PASS=123456
next_public_admin_wa_phone=9742100448
```

## 2. API Usage
The system uses the configured BhashSMS account to:
1.  Send a "New Lead Alert" to the Admin Phone (`9742100448`).
2.  (Optional) Send a "Welcome/Confirmation" message to the user.

## 3. Templates
The current integration uses the `text` parameter for templates.
Example working template: `santaan_dem` (Demo template).
Ensure your BhashSMS account has templates approved if "Normal" priority requires them.

## 4. Current Configuration
- **Admin Receiver**: `9742100448`
- **Sender ID**: `BUZWAP`
- **User**: `Santaan_01`
- **Pass**: `123456`

## 5. Testing
You can run the test script to verify the integration:
```bash
npx tsx scripts/test-whatsapp-integration.ts
```
