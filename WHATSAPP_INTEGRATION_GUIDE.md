# WhatsApp Integration Guide (BhashSMS)

To enable WhatsApp notifications for new "At-Home Testing" leads, you need to configure the BhashSMS credentials.

## 1. Environment Variables
Add the following to your `.env.local` file (on Netlify or local):

```bash
BHASH_USER=Santaan_01
BHASH_SENDER=BUZWAP
BHASH_PASS=YOUR_PASSWORD_HERE
next_public_admin_wa_phone=9668904011
```

## 2. API Usage
The system uses the configured BhashSMS account to:
1.  Send a "New Lead Alert" to the Admin Phone (`9668904011`).
2.  (Optional) Send a "Welcome/Confirmation" message to the user.

## 3. Templates
The current integration uses the `text` parameter for templates.
Ensure your BhashSMS account has templates approved if "Normal" priority requires them.
If you can send free text, no action needed.

## 4. Current Configuration
- **Admin Receiver**: `9668904011`
- **Sender ID**: `BUZWAP`
- **User**: `Santaan_01`
