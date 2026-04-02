# WhatsApp Integration Guide (BhashSMS & AI Agent)

The Santaan CRM now features a production-ready **WhatsApp AI Agent** powered by Claude 3.5 Sonnet. It can handle patient inquiries, clinical questions, and lead scoring 24/7.

## 1. Environment Variables
Add the following to your `.env.local` file (on Netlify or local).

### **Core BhashSMS Credentials**
```bash
BHASH_USER=Santaan_01
BHASH_SENDER=BUZWAP
BHASH_PASS=your_real_bhash_password
BHASH_API_URL=http://bhashsms.com/api/sendmsg.php
next_public_admin_wa_phone=9742100448
```

### **Voice Post-Call Template**
Use these when Santaan's post-call template name and variable order are confirmed by Bhash.
```bash
BHASH_VOICE_POST_CALL_TEMPLATE=your_approved_template_name
BHASH_VOICE_POST_CALL_PARAM_ORDER=caller_name,education_link
BHASH_VOICE_POST_CALL_ATTACHMENT_TYPE=
BHASH_VOICE_POST_CALL_ATTACHMENT_URL=
BHASH_VOICE_POST_CALL_ATTACHMENT_NAME=
```

Supported `BHASH_VOICE_POST_CALL_PARAM_ORDER` tokens:
- `caller_name`
- `education_link`
- `city`
- `preferred_centre`
- `callback_window`
- `agent_name`
- `entry_point`
- `known_condition`
- `trying_duration`
- `source_campaign`

### **AI Agent Brain (Choose one)**
The system will prioritize **Groq** for high-speed performance, then fallback to OpenRouter/Claude.
```bash
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=llama-3.1-8b-instant,llama-3.2-3b-preview # Optional
# OR
OPENROUTER_API_KEY=your_openrouter_key_here
# OR
ANTHROPIC_API_KEY=your_anthropic_key_here
```

## 2. BhashSMS Webhook Configuration
To allow the AI Agent to receive and respond to user messages, you must set up the Webhook in the BhashSMS portal.

### **Webhook Settings**
*   **Webhook URL**: `https://santaan.in/api/whatsapp/webhook`
*   **Method**: `POST` (preferred) or `GET`
*   **Required Chips (Payload Mapping)**:
    Ensure your BhashSMS setup sends these exact keys in the payload:

| Bhash Key | Description | System Usage |
| :--- | :--- | :--- |
| **`mobile`** | User's phone number | Identifying the patient |
| **`msg`** | The message text | Input for the AI Agent |
| **`name`** | User's profile name | Personalizing the response |

## 3. How the AI Agent Works
1.  **Incoming**: User sends a message to your BhashSMS WhatsApp number.
2.  **Context**: The system fetches the patient's history from the CRM database.
3.  **Brain**: Claude 3.5 Sonnet analyzes the query and the history.
4.  **Response**: The agent generates a clinical-safe response and sends it back via BhashSMS.
5.  **Tracking**: The lead score is automatically updated in the CRM based on the conversation quality.

## 4. Testing
You can run the test script to verify the **outgoing** logic:
```bash
npx tsx scripts/test-whatsapp-integration.ts
```

To test the **AI Agent**, send a message to your business number and check the CRM "WhatsApp" tab.

## 5. Bhash Template Notes

- Bhash expects the approved template identifier in the `text` parameter
- template variables go in `Params` as comma-separated values in exact order
- media can be attached with:
  - `htype=document|image|video`
  - `url=https://...`
  - `fname=...` for documents only
- if your password was ever shared in plain text, rotate it before production use
