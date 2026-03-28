# Santaan Growth OS & CRM User Manual (March 2026)

This manual serves as the operational source of truth for the Santaan CRM and Content Management System.

---

## 1. Role-Based Access Control (RBAC)
The system adapts based on your assigned role. Each role has a specific "Rider" (Daily Checklist) on the **Today** tab.

| Role | Key Responsibilities | Primary Dashboards |
| :--- | :--- | :--- |
| **CEO** | Weekly strategy, budget approvals, bottleneck review | CEO Command, Analytics, Action Board |
| **Content Manager** | Website publishing, blog pipeline, SEO hygiene | Publish Content, Meta Launch, Analytics |
| **Ads/Marketing** | Spend tracking, UTM governance, agency sync | Spend Management, Meta Launch, Analytics |
| **Telecaller Manager** | Lead assignment, SLA enforcement, NeoDove sync | Action Board, NeoDove Ops, All Contacts |
| **Counselor** | Patient qualification, conversion updates, notes | All Contacts, Hot Leads, Follow-ups |

---

## 2. Daily Operating Rhythm (The "Rider" System)
Every user should start their day on the **Today** tab.

1.  **Morning Standup (09:30 AM - 10:00 AM)**: Review what moved yesterday and set 2-3 priorities.
2.  **Execution Window (10:00 AM - 06:30 PM)**: Complete tasks in your role-specific rider.
3.  **Evening Closure (07:00 PM - 09:00 PM)**: Confirm outcomes, log blockers, and set tomorrow's carry-overs.

---

## 3. Direct Website Publishing (CMS)
*For Mousam / Content Team*

You can now publish directly to `santaan.in` without using Medium for urgent updates.

1.  Navigate to the **Publish Content** tab.
2.  Enter a **Title** and select a **Category** (News, Blog, or Doctor Update).
3.  Write your **Content** in plain text (the system handles formatting).
4.  Click **Publish Live**.
    *   **News** appears in the announcements sections.
    *   **Blogs** go to `/fertility-insights`.
    *   **Doctor Updates** go to `/clinical-insights`.

---

## 4. NeoDove & CRM Integration
The system automatically syncs leads from NeoDove via webhooks.

### **Lead Lifecycle Statuses**
- **New**: Fresh lead from website, IVR, or social.
- **Contacted**: Initial touchpoint completed.
- **Qualified**: High-intent patient ready for consultation.
- **Converted**: Patient registered/treatment started.
- **Lost**: Lead disposed with a specific reason.

### **Monitoring Health**
- **NeoDove Ops Tab**: Use this to catch "leaking" leads (missing follow-ups, missing owners, or status drift).
- **Wiring Health**: (CEO only) Confirms if webhooks are hitting the system in real-time.

---

## 5. NeoDove Call Chips Setup (Suggestions)
To get the most out of the NeoDove integration, ensure your NeoDove webhooks are sending "Call Chips" (Metadata).

### **Setup Requirements in NeoDove Webhook Settings:**
1.  **Events**: Ensure `Lead Dispose` and `Lead Update` are enabled.
2.  **Payload Mapping**: Ensure these fields are mapped to the Santaan Webhook (`/api/neodove/webhook`):
    - `call_connected` (Boolean)
    - `call_duration_sec` (Number)
    - `disposition` (Text)
    - `dispose_reason` (Text)
    - `notes` (Text - AI analysis will auto-extract sentiment)

### **Operational Chips for Telecallers:**
- **Hot Lead Chip**: Tag leads as `hot_lead` in NeoDove to immediately move them to the "Hot Leads" tab in Santaan CRM.
- **Center Chip**: Always select the `Branch/Center` in NeoDove so the CEO dashboard can attribute leads to the correct clinic (Bhubaneswar, Berhampur, etc.).
- **Follow-up Chip**: Setting the `Next Follow-up Date` in NeoDove will automatically populate the "Follow-ups" queue in Santaan.

---

## 6. Agentic WhatsApp to NeoDove Sync (New)
The Santaan AI Agent now acts as the "Brain" for your WhatsApp leads, even if you use NeoDove for calling.

1.  **Incoming Chat**: When a patient messages on WhatsApp, the AI Agent (Claude/Groq) analyzes the intent.
2.  **Chip Extraction**: The system automatically extracts "chips" such as:
    - **Sentiment**: Is the patient happy, confused, or urgent?
    - **Intent**: Are they asking about IVF, cost, or a specific doctor?
    - **Tags**: Auto-tags the lead in the CRM (e.g., `wa_chip_high_intent`).
3.  **NeoDove Push**: These insights are instantly pushed to NeoDove as a "Lead Update" or "New Lead".
    - Telecallers in NeoDove will see a note like: `[WA AI AGENT] Sentiment: Positive | Intent: Ready to visit | Message: ...`
4.  **Operational Benefit**: This allows your telecallers to have the most up-to-date context before they even pick up the phone.

---

## 7. Support & Maintenance
- **Database Management**: Use `npm run db:studio` for manual data cleanup (Admins only).
- **Deployment**: Any changes pushed to GitHub are automatically deployed to Vercel.
- **Support**: For technical issues, contact the Skids engineering team.
