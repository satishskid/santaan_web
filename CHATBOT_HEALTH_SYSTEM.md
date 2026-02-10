# Chatbot Health Check System

## Overview
Implemented a comprehensive health check system to allow admins to monitor and control the AI chatbot's availability.

## Components

### 1. Health Check API (`/src/app/api/admin/chatbot/route.ts`)

**GET Endpoint:**
- Returns current chatbot status
- Response: `{ enabled: boolean }`

**POST Endpoint:**
- Toggles chatbot on/off
- Request: `{ enabled: boolean }`
- Response: `{ success: true, enabled: boolean }`
- Stores status in `settings` table with key `chatbot_enabled`

### 2. Chat Service Integration (`/src/services/chat/chatService.ts`)

**Pre-Flight Health Check:**
- Checks `/api/admin/chatbot` before sending messages
- If disabled, returns friendly maintenance message
- Error handling improved with IT team notification mention

**User-Facing Messages:**
- **When disabled:** "I'm currently offline for scheduled maintenance. Our IT team has been notified and is working to restore service. Please try again later or contact our team directly."
- **When error occurs:** "I'm currently experiencing technical difficulties. Our IT team has been notified and is working to restore service. Please try again later."

### 3. Admin CRM Toggle UI (`/src/components/admin/CRM.tsx`)

**Settings Tab Integration:**
- Added "System Controls" section
- Real-time status indicator (green = online, red = offline)
- Toggle switch to enable/disable chatbot
- Warning message about API errors

**Features:**
- Visual status indicator with colored dots
- Smooth toggle animation
- Disabled state during save operations
- Fetches initial status on component mount

## Database Schema

**Settings Table:**
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updatedAt INTEGER DEFAULT (unixepoch()) NOT NULL
);
```

**Chatbot Status:**
- Key: `chatbot_enabled`
- Value: `true` or `false` (string)

## Usage

### Admin Access
1. Navigate to `/admin/dashboard`
2. Click "Settings" tab
3. Locate "System Controls" section
4. Toggle chatbot on/off as needed

### When to Disable
- Groq API experiencing high traffic (429 errors)
- Model deprecation or breaking changes
- Scheduled maintenance
- Testing new prompt configurations

### When to Re-Enable
- After IT team confirms API is stable
- After model/configuration updates
- After successful testing in development

## Error Flow

```
User sends chat message
  ↓
chatService checks /api/admin/chatbot
  ↓
If disabled → return maintenance message
  ↓
If enabled → proceed with Groq API call
  ↓
If API error → catch and show technical difficulties message
```

## Benefits

1. **Graceful Degradation:** Users see friendly messages instead of errors
2. **Admin Control:** No code deployment needed to disable chatbot
3. **IT Notification:** Error messages mention IT team awareness
4. **Real-Time Status:** Visual indicator shows current state
5. **Database Persistence:** Toggle state survives server restarts

## Testing Checklist

- [ ] Toggle chatbot off in admin CRM
- [ ] Verify status indicator turns red
- [ ] Send chat message and confirm maintenance message
- [ ] Toggle chatbot back on
- [ ] Verify status indicator turns green
- [ ] Send chat message and confirm normal operation
- [ ] Test with actual Groq API errors
- [ ] Verify error message mentions IT team

## Next Steps

1. Monitor Groq API for "high traffic" errors
2. Consider alternative AI providers (OpenAI, Anthropic)
3. Add email notification when chatbot is disabled
4. Track chatbot uptime metrics in analytics
5. Add "last toggle" timestamp in admin UI
