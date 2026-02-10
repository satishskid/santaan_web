# CRM Enhancements & Multi-Channel Integration

## 🎯 Overview

Your CRM now supports comprehensive lead tracking across multiple channels:
- 📧 **Email** (Newsletter subscriptions)
- 💬 **WhatsApp Business** (Two-way messaging)
- ✈️ **Telegram** (Bot + Channel broadcasts)
- 🌐 **Website** (UTM tracking, form submissions)

---

## 📦 What's Been Implemented

### 1. Database Schema Enhancements
**New fields in `contacts` table:**
- `newsletterSubscribed` - Newsletter opt-in flag
- `whatsappNumber` - WhatsApp contact number
- `whatsappOptIn` - WhatsApp messaging consent
- `telegramId` - Telegram user ID
- `telegramUsername` - Telegram handle
- `telegramOptIn` - Telegram messaging consent
- `preferredChannel` - Primary communication channel (email/whatsapp/telegram)
- `tags` - Comma-separated tags (newsletter, at_home_test, consultation, etc.)
- `leadSource` - Origin of lead (website, whatsapp, telegram, referral)
- `leadScore` - Numeric score 0-100 (higher = more engaged)
- `message` - Latest message/inquiry from contact
- `lastMessageAt` - Timestamp of last interaction
- `conversationCount` - Number of messages exchanged

### 2. Newsletter Subscription System
**Component:** `src/components/sections/NewsletterSubscribe.tsx`
**API:** `src/app/api/newsletter/subscribe/route.ts`

**Features:**
- Footer newsletter form (already integrated)
- Automatic UTM attribution tracking
- Duplicate email handling (updates existing contacts)
- Auto-tags as 'newsletter'
- Base lead score: 10 points

### 3. WhatsApp Business Integration
**API Endpoint:** `src/app/api/whatsapp/webhook/route.ts`

**Supports Multiple Providers:**
- ✅ **Meta Cloud API** (Facebook/Meta official)
- ✅ **Twilio** (Enterprise-grade)
- ✅ **Gupshup** (Popular in India)
- ✅ **Interakt** (India-focused)

**Features:**
- Webhook verification (GET)
- Incoming message processing (POST)
- Auto-reply system with smart routing
- Intent detection (at-home test, consultation, treatment)
- Lead scoring based on message content
- Contact creation/update in CRM
- Tag management

**Auto-Reply Templates:**
- Welcome message with menu
- At-home test information
- Consultation booking
- Treatment information

### 4. Telegram Bot Integration
**API Endpoint:** `src/app/api/telegram/webhook/route.ts`

**Features:**
- `/start` command welcome message
- Interactive button menu
- Intent-based responses
- Contact creation in CRM
- Lead scoring
- Broadcast channel integration ready

**Menu Options:**
1. 📰 Newsletter subscription
2. 🏠 At-Home Test information
3. 👨‍⚕️ Consultation booking
4. 💉 Treatment information

### 5. Enhanced CRM Dashboard
**Component:** `src/components/admin/CRM.tsx`

**New Tabs:**
- 🔥 **Hot Leads** - Lead score ≥ 50
- 🏠 **At-Home Test** - Tagged with at_home_test interest
- 📰 **Newsletter** - Newsletter subscribers
- 💬 **WhatsApp** - WhatsApp contacts
- ✈️ **Telegram** - Telegram contacts
- 📅 **Seminar** - Seminar registrants (existing)

**New Features:**
- Advanced filtering (channel, tags, search)
- Lead score display
- Tag management
- CSV export functionality
- Multi-channel contact info
- Conversation count tracking

### 6. Migration Script
**Script:** `src/scripts/migrate-crm.ts`

Adds all new columns to existing database.

---

## 🔧 Setup Instructions

### Step 1: Run Database Migration

```bash
cd "/Users/spr/santaan hope/santaan-web"
npx tsx src/scripts/migrate-crm.ts
```

This adds all new fields to your contacts table.

---

### Step 2: WhatsApp Business Setup

#### Option A: Meta Cloud API (Free tier available)
1. Go to: https://developers.facebook.com/apps
2. Create app → Business → WhatsApp
3. Get credentials:
   - Phone Number ID
   - WhatsApp Business Account ID
   - Access Token
4. Set webhook URL: `https://santaan-web.netlify.app/api/whatsapp/webhook`
5. Add to `.env.local`:
```env
WHATSAPP_PROVIDER=meta
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_account_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_VERIFY_TOKEN=santaan_verify_2026
```

#### Option B: Interakt (Recommended for India)
1. Sign up: https://app.interakt.ai/signup
2. Complete WhatsApp Business verification
3. Get API Key from Settings
4. Set webhook: `https://santaan-web.netlify.app/api/whatsapp/webhook`
5. Add to `.env.local`:
```env
WHATSAPP_PROVIDER=interakt
WHATSAPP_API_KEY=your_api_key_here
WHATSAPP_PHONE_NUMBER=+91xxxxxxxxxx
WHATSAPP_VERIFY_TOKEN=santaan_verify_2026
```

#### Option C: Twilio
1. Sign up: https://www.twilio.com/try-twilio
2. Get WhatsApp sandbox or activate WhatsApp Sender
3. Get credentials from console
4. Add to `.env.local`:
```env
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
WHATSAPP_VERIFY_TOKEN=santaan_verify_2026
```

**Test WhatsApp Integration:**
1. Send test message to your WhatsApp number
2. Check admin CRM → WhatsApp tab
3. Verify contact created with tags and lead score

---

### Step 3: Telegram Bot Setup

#### 3.1 Create Bot
1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Follow prompts to name your bot
4. Copy the bot token

#### 3.2 Set Webhook
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://santaan-web.netlify.app/api/telegram/webhook"
```

Replace `<YOUR_BOT_TOKEN>` with your actual token.

#### 3.3 Create Telegram Channel (for broadcasts)
1. In Telegram, create new channel
2. Name it "Santaan Fertility Updates"
3. Make it public with username `@SantaanFertility`
4. Add your bot as admin

#### 3.4 Add to `.env.local`
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHANNEL_ID=@SantaanFertility
```

**Test Telegram Bot:**
1. Search for your bot in Telegram
2. Send `/start`
3. Click menu buttons
4. Check admin CRM → Telegram tab

---

### Step 4: Update Environment Variables

Add to `.env.local` (create if doesn't exist):

```env
# Database (already configured)
DATABASE_URL=libsql://santaan-hope-satishskid.aws-ap-south-1.turso.io
DATABASE_AUTH_TOKEN=your_token

# WhatsApp (choose one provider - see above)
WHATSAPP_PROVIDER=meta
WHATSAPP_ACCESS_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_id
WHATSAPP_VERIFY_TOKEN=santaan_verify_2026

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHANNEL_ID=@SantaanFertility
```

---

### Step 5: Deploy to Netlify

```bash
git add -A
git commit -m "Add multi-channel CRM with WhatsApp and Telegram integration"
git push
```

Netlify will auto-deploy. New environment variables will need to be added in Netlify dashboard:
1. Go to Netlify Dashboard
2. Site settings → Environment variables
3. Add all variables from `.env.local`

---

## 📊 Lead Scoring System

**Automatic scoring:**
- Newsletter signup: +10 points
- Telegram bot start: +15 points
- WhatsApp message: +20 points
- At-home test intent: +30 points
- Consultation request: +40 points
- Treatment inquiry: +50 points

**Lead Categories:**
- 0-20: Cold Lead
- 21-49: Warm Lead
- 50-79: Hot Lead (🔥 tab)
- 80-100: Very Hot Lead

---

## 🎯 CRM Workflow Examples

### Scenario 1: Newsletter Subscriber
1. User submits email in footer
2. Contact created with tag: `newsletter`
3. Lead score: 10
4. Visible in: All, Newsletter tabs
5. Admin can export for email campaigns

### Scenario 2: WhatsApp Inquiry
1. User messages on WhatsApp: "I want at-home test"
2. Webhook creates contact with tags: `whatsapp,at_home_test`
3. Lead score: 20 (WhatsApp) + 30 (at-home test) = 50
4. Auto-reply sent with information
5. Visible in: All, WhatsApp, At-Home Test, Hot Leads tabs
6. Admin gets notification to follow up

### Scenario 3: Telegram Bot Engagement
1. User starts Telegram bot
2. Selects "Consultation" from menu
3. Contact created with tags: `telegram,consultation`
4. Lead score: 15 (Telegram) + 40 (consultation) = 55
5. Visible in: All, Telegram, Hot Leads tabs
6. Auto-reply with booking information

### Scenario 4: Multi-Channel Contact
1. User subscribes to newsletter (email)
2. Later messages on WhatsApp about IVF
3. Contact updated with combined tags: `newsletter,whatsapp,treatment`
4. Lead score: 10 + 20 + 50 = 80 (Very Hot)
5. Preferred channel set to WhatsApp
6. Admin sees full conversation history

---

## 📤 Export Functionality

**CSV Export includes:**
- Name, Email, Phone
- WhatsApp Number
- Telegram Username
- Lead Score
- Tags
- Preferred Channel
- Lead Source
- Status
- Latest Message
- Newsletter/Seminar flags
- Last Contact Date
- Created At
- UTM Attribution (Source, Medium, Campaign)

**How to use:**
1. Filter contacts by tab (e.g., Hot Leads)
2. Click "Export CSV" button
3. File downloads: `santaan-contacts-hot_leads-2026-02-10.csv`
4. Use for:
   - Email campaigns
   - Call center lists
   - Analytics/reporting
   - CRM import (Salesforce, HubSpot, etc.)

---

## 🔔 Admin Notifications (Future Enhancement)

Can be added later:
- Email notification when new hot lead (score ≥ 50)
- Telegram notification to admin channel
- WhatsApp message to admin number
- SMS alert for very hot leads (score ≥ 80)

---

## 📱 WhatsApp Message Templates

For approved template messages (required for WhatsApp Business API):

**Template 1: At-Home Test Confirmation**
```
Hello {{1}}, 

Your at-home fertility test is confirmed for {{2}}.

Our executive will arrive between {{3}}.

If you need to reschedule: +91 897 123 4567

- Team Santaan
```

**Template 2: Appointment Reminder**
```
Hi {{1}},

Reminder: Your consultation with Dr. {{2}} is tomorrow at {{3}}.

Location: {{4}}

Looking forward to seeing you!

- Santaan Fertility
```

Submit these templates for approval in your WhatsApp Business dashboard.

---

## 🎨 Customization Options

### Auto-Reply Messages
Edit in: `src/app/api/whatsapp/webhook/route.ts`
Edit in: `src/app/api/telegram/webhook/route.ts`

### Lead Scoring Rules
Edit in webhook files to adjust point values.

### Tags
Add custom tags in webhook processing logic.

### CRM Filters
Add more tabs in `src/components/admin/CRM.tsx`

---

## 🐛 Troubleshooting

### WhatsApp webhook not receiving messages
1. Check webhook URL is HTTPS
2. Verify token matches in provider and `.env`
3. Check Netlify function logs
4. Test with WhatsApp sandbox first

### Telegram bot not responding
1. Verify bot token is correct
2. Check webhook is set: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
3. Ensure Netlify environment variables are set
4. Check bot permissions

### Contacts not appearing in CRM
1. Run migration script
2. Check database connection
3. Verify API endpoints are deployed
4. Check browser console for errors

### CSV export not working
1. Check browser allows downloads
2. Verify contacts are loaded
3. Try different browser

---

## 📞 Next Steps

### Immediate (Do Now):
1. ✅ Run database migration
2. ✅ Set up Telegram bot (free, easy)
3. ✅ Test newsletter subscription
4. ✅ Export sample CSV

### Short-term (This Week):
1. Get WhatsApp Business API credentials
2. Configure WhatsApp webhook
3. Test WhatsApp auto-replies
4. Create Telegram broadcast channel
5. Post first blog on Telegram channel

### Medium-term (This Month):
1. Build email drip campaigns for newsletter
2. Create WhatsApp message templates
3. Train call center on new CRM features
4. Set up admin notifications
5. Integrate payment links in WhatsApp

### Long-term (Ongoing):
1. A/B test auto-reply messages
2. Optimize lead scoring algorithm
3. Build chatbot flow for common queries
4. Integrate with booking system
5. Add video call scheduling

---

## 🎉 Benefits Summary

**For Admin:**
- ✅ All leads in one dashboard
- ✅ Multi-channel visibility
- ✅ Lead prioritization (scoring)
- ✅ Easy export for campaigns
- ✅ UTM tracking for ROI

**For Call Center:**
- ✅ Contact context before calling
- ✅ Preferred communication channel known
- ✅ Message history visible
- ✅ Hot leads flagged automatically
- ✅ Tags show intent (at-home test, consultation)

**For Patients:**
- ✅ Choose their preferred channel
- ✅ Instant auto-replies
- ✅ No missed inquiries
- ✅ Consistent experience across channels
- ✅ Privacy maintained

---

## 📧 Support

For any setup issues or questions:
- Check Netlify function logs
- Review database schema in Drizzle Studio
- Test API endpoints individually
- Verify environment variables are set

Happy CRM-ing! 🎊
