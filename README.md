# Santaan Web Application

This is the main web application for Santaan, built with Next.js, Drizzle ORM, and NextAuth.js.

## Features

- **Authentication**: Custom Email/Password login with role-based access control (Admin/User).
- **Database**: 
  - **Local**: SQLite (`santaan.db`) using `better-sqlite3`.
  - **Production**: Turso (LibSQL) for edge-compatible persistence.
- **Admin CRM**: Protected dashboard for managing contacts and seminar registrations.
- **Analytics**: Dynamic script injection for Google Analytics and Facebook Pixel.
- **SEO**: Optimized metadata, schema, sitemap/robots, and service landing pages.
- **Blog Engine**: Medium posts are synced into Turso and published on `santaan.in/fertility-insights/*`.

## Website CTA and CRM Routing

- **Primary call CTA**: `+91 80 6548 1541`
- **Primary WhatsApp CTA**: `+91 96689 04011`
- **Default WhatsApp prefill**: `Hi, I'd like more info on IVF`
- **CTA source of truth**: [src/data/centers.ts](./src/data/centers.ts)

### Warm-lead landing paths

- `/fertility-guides`
- `/fertility-conditions`
- `/know-your-score`
- `/fertility-tips`
- `/newsletter` redirects to `/fertility-tips`

These pages are meant for CRM, WhatsApp, SMS, and remarketing follow-up where the click goal is education first, then a soft conversion action.

### CTA consistency rules

- Primary website call/WhatsApp CTAs route through the shared network numbers above.
- Local clinic phone numbers remain visible as office details on location/service pages and do not compete with the primary CTAs.
- Public button labels use sentence case and are aligned to click intent:
  - `Chat on WhatsApp`
  - `Book consultation`
  - `Know your score`
  - `Explore centres`
  - `Explore at-home testing`

### Booking section behavior

- The homepage Practo booking shell now includes:
  - a loading state
  - a WhatsApp fallback
  - a direct call fallback
  - a direct Practo fallback link when the embed does not render

This prevents the booking area from appearing blank on slower devices or partial widget loads.

## Domains

- Canonical site URL defaults to `https://santaan.in` via [site.ts](./src/lib/site.ts) and can be overridden with `NEXT_PUBLIC_SITE_URL` / `NEXTAUTH_URL`.
- If you configure `santaan.in` → `www.santaan.in` as a redirect at the Vercel domain level, keep `www.santaan.in` pointing at the latest deployment because `santaan.in` will follow it.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/satishskid/santaan_web.git
    cd santaan-web
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Environment Variables (`.env.local`):**
    Copy `.env.example` to `.env.local` and fill in the values:
    ```env
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your_generated_secret
    TURSO_DATABASE_URL=your_turso_url
    TURSO_AUTH_TOKEN=your_turso_token
    NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_key
    GROQ_API_KEY=your_key
    BLOG_SYNC_SECRET=choose_a_strong_secret
    META_AD_ACCOUNT_IDS=act_1234567890,act_0987654321
    META_ACCESS_TOKEN=your_meta_long_lived_ads_read_token
    META_APP_SECRET=your_meta_app_secret
    META_GRAPH_API_VERSION=v21.0
    META_REPORTING_TIMEZONE=Asia/Kolkata
    META_SPEND_SYNC_SECRET=choose_a_strong_secret
    GA4_PROPERTY_ID=123456789
    GOOGLE_SERVICE_ACCOUNT_EMAIL=santaan-analytics-reader@project-id.iam.gserviceaccount.com
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
    ```

4.  **Database Setup (Local):**
    ```bash
    # Push schema to local SQLite
    npx drizzle-kit push

    # Seed initial admin user
    npx tsx src/scripts/seed-users.ts
    ```
    Default admin users can be seeded via `npx tsx src/scripts/seed-users.ts` with `SANTAAN_SEED_PASSWORD` set in `.env.local`.

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## Admin Note: Usernames + PINs (UAT / Small Team)

- **Login URL:** `https://www.santaan.in/login`
- **Login ID:** use role-based usernames like `telecaller1.bbsr`, `counselor1.bam` (admins can still use email).
- **PIN:** 6 digits.

### Create users + set PIN (Admin dashboard)

1. Sign in to the Admin dashboard.
2. Go to `Team` tab → `User Access (Username + PIN)`.
3. Create a user:
   - `Username`: `telecaller1.bbsr` / `counselor1.bam` / etc.
   - `Role`: choose the correct role (telecaller, counselor, etc.)
   - `PIN`: enter a 6-digit PIN
   - Click `Create User`
4. Manage users:
   - `Edit` to change username/name/role
   - `Reset PIN` to set a new 6-digit PIN
   - `Disable` when an employee leaves (login blocked)

### Set default UAT PINs (bulk)

- In the same `User Access` section:
  - `Set UAT PIN (Admins)` resets PIN for the admin/leadership group.
  - `Set UAT PIN (Staff)` resets PIN for all non-admin active users.
- This is meant for short UAT windows (example: 2 weeks). After that, reset individual PINs per user.

## Deployment (Vercel)

This project is deployed on Vercel.

1. **Connect to GitHub**: Import this repository in Vercel and set `main` as the Production Branch.
2. **Build Settings**:
   - **Build Command**: `npm run build`
   - **Output Directory**: default (Next.js)
3. **Environment Variables**:
   Set the following in Vercel Project Settings → Environment Variables:
   - `NEXTAUTH_SECRET` (Use a strong random string)
   - `NEXTAUTH_URL` (e.g., `https://www.santaan.in`)
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `BLOG_SYNC_SECRET`
   - `META_AD_ACCOUNT_ID` or `META_AD_ACCOUNT_IDS`
   - `META_ACCESS_TOKEN`
   - `META_APP_SECRET`
   - `META_SPEND_SYNC_SECRET`
   - `GA4_PROPERTY_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
   - `EMAIL_SMTP_HOST`
   - `EMAIL_SMTP_PORT`
   - `EMAIL_SMTP_USER`
   - `EMAIL_SMTP_PASSWORD`
   - `EMAIL_SMTP_SECURE` (optional, set to `true` for port 465)
   - `EMAIL_FROM` (example: `Santaan CRM <noreply@santaan.in>`)
   - `NEXT_PUBLIC_GOOGLE_AI_API_KEY`
   - `GROQ_API_KEY`

Once connected, a `git push` to `main` triggers a production deployment automatically.

### ⚠️ Critical Architecture Constraints
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for essential rules regarding Database (Turso/LibSQL) and Authentication to prevent production errors.

### Production Domains (Vercel)

- Ensure `santaan.in`, `www.santaan.in`, and `ivf.santaan.in` are attached to the same Vercel project.
- To point a domain at a specific production deployment (CLI):
  ```bash
  vercel deploy --prod
  vercel alias set <prod-deployment-url> santaan.in
  vercel alias set <prod-deployment-url> www.santaan.in
  vercel alias set <prod-deployment-url> ivf.santaan.in
  ```

### Meta Spend Auto-Sync

- UI: Admin `Spend` tab now has `Sync Meta`.
- API: `POST /api/admin/spend/sync-meta?date=YYYY-MM-DD`
  - Auth: admin session OR `x-sync-token: META_SPEND_SYNC_SECRET`
- You can call this endpoint from an external cron/scheduler for daily auto-sync.

## Database Migration (Production)

To update the remote Turso database:

```bash
npx tsx src/scripts/migrate-prod.ts
```

To seed the production database with initial users:

```bash
npx tsx src/scripts/seed-prod.ts
```

---

## Google Analytics API Integration (Live)

The CRM Analytics tab now supports **live GA4 API pull** via:

- `GET /api/admin/analytics/ga4?days=7`
- UI section: `Admin Dashboard → Analytics → Website Demand Signals (GA4 · 7 days)`

If credentials are missing, the widget safely shows a "not configured" notice.

To activate it in production:

### Prerequisites
- Access to the Google account that owns the GA4 property
- Google Cloud Console access

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: **"Santaan Analytics"**
3. Enable the **Google Analytics Data API**:
   - Go to "APIs & Services" → "Enable APIs"
   - Search for "Google Analytics Data API"
   - Click "Enable"

### Step 2: Create Service Account Credentials

1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
   - Name: `santaan-analytics-reader`
   - Description: "Reads GA4 data for dashboard"
3. Skip role assignment (we'll add in GA4 directly)
4. Click "Done"
5. Click on the created service account email
6. Go to "Keys" tab → "Add Key" → "Create new key" → **JSON**
7. **Download the JSON file** - keep it secure!

### Step 3: Grant Access in Google Analytics

1. Go to [Google Analytics](https://analytics.google.com)
2. Select your Santaan property
3. Admin (gear icon) → Property Access Management
4. Click "+" → "Add users"
5. Paste the service account email from the JSON file
   - Format: `santaan-analytics-reader@project-id.iam.gserviceaccount.com`
6. Set role: **Viewer**
7. Uncheck "Notify new users by email"
8. Click "Add"

### Step 4: Get GA4 Property ID

1. In Google Analytics → Admin → Property Settings
2. Copy the **Property ID** (numeric, e.g., `123456789`)

### Step 5: Add Environment Variables

Add to Netlify (Site Settings → Environment Variables):

```env
GA4_PROPERTY_ID=123456789
GOOGLE_SERVICE_ACCOUNT_EMAIL=santaan-analytics-reader@project-id.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBAD...\n-----END PRIVATE KEY-----\n"
```

**Note:** The private key is in the downloaded JSON file. Copy the entire value including `\n` characters.

### Step 6: Install Dependencies

```bash
npm install @google-analytics/data
```

### Step 7: Create API Route

Create `/src/app/api/admin/analytics/route.ts`:

```typescript
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

export async function GET() {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${process.env.GA4_PROPERTY_ID}`,
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'screenPageViews' },
      { name: 'bounceRate' },
    ],
  });
  
  return Response.json({ data: response });
}
```

### Step 8: Update Dashboard

Modify `AnalyticsTab` in `CRM.tsx` to fetch from `/api/admin/analytics` and display live data.

---

## Facebook Pixel API (Optional)

For Facebook/Meta analytics API access:

1. Create app at [Meta for Developers](https://developers.facebook.com)
2. Request Marketing API access
3. Generate System User Access Token
4. Use Marketing API to fetch pixel events

**Note:** Facebook API requires business verification and app review for production use. The external links in the dashboard provide immediate access without API setup.

---

## Admin Access

| URL | Purpose |
|-----|---------|
| `/login` | Admin login page |
| `/admin/dashboard` | CRM & Settings |

## CRM Roles & Responsibilities (Shareable Note)

Use `/login` (or the hidden footer dot link) and pick the correct role for your email. Your role controls which CRM tabs you can access.

### Roles

| Role | Primary responsibilities | CRM access |
|------|--------------------------|-----------|
| `admin` | Full control, system configuration, user + role management | All tabs + delete contacts |
| `ceo` | Daily review of wiring health, priorities, performance | All tabs + CEO Command |
| `crm_ops_admin` | Owns CRM hygiene, lead routing, SLA enforcement | All tabs + delete contacts |
| `marketing_manager` | Marketing operations, agency coordination, spend + performance review | Analytics + Ops Inputs + Spend |
| `agency_ops` | Agency reporting, campaign ops, performance logs | Analytics + Ops Inputs + Spend |
| `performance_marketer` | Paid performance, attribution hygiene, daily spend + funnel review | Analytics + Ops Inputs + Spend |
| `content_manager` | Content pipeline, publishing, tag hygiene, insight velocity | Analytics |
| `field_exec` | Field activity logging, center-level ops inputs | Ops Inputs |
| `ivr_manager` | Inbound lead capture, IVR hygiene, routing to telecalling/counseling | Contacts + Analytics |
| `telecaller_manager` | Lead assignment, follow-up SLAs, quality monitoring | Contacts + Analytics |
| `telecaller` | Calling + WhatsApp follow-ups, status updates, follow-up scheduling | Contacts |
| `counselor` | Qualification + counseling notes, conversion support | Contacts |

### Rules of use (everyone)

- Update contact status and next follow-up date after every interaction.
- Never delete contacts unless you are `admin` / `ceo` / `crm_ops_admin`.
- Use tags consistently (comma-separated) for source, intent, and priority.

### Admin Credentials (Production)
- Admin credentials are managed by leadership / CRM Ops Admin.
- For seeding or resets, use the seeding scripts with `SANTAAN_SEED_PASSWORD` in your environment (never commit passwords to git).

### Secret Footer Link
A tiny "•" dot after "Terms of Service" in footer links to `/login`

---

## Content Management

### Centers (Admin Dashboard)
- Go to Dashboard → "📍 Centers" tab
- Add/Edit/Delete clinic locations
- Changes reflect immediately on homepage

### News & Announcements (via Medium)
- Publish on Medium (@santaanIVF)
- Add tag `santaan-news` for it to appear in News section
- See `BLOG_WRITER_GUIDE.md` for details

## Medium-to-Santaan Sync

This project now stores Medium content in Turso and serves it from Santaan routes.

### 1) Create blog table

```bash
npm run migrate:blogs
```

### 2) Trigger manual sync (optional)

```bash
curl -X POST "https://santaan.in/api/blogs/sync?token=<BLOG_SYNC_SECRET>"
```

### 3) Automated daily sync

Netlify Scheduled Function runs at `02:00 UTC` using:

`netlify/functions/sync-medium-blogs.ts`

It calls `/api/blogs/sync` securely using `BLOG_SYNC_SECRET`.
