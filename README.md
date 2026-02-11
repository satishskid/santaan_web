# Santaan Web Application

This is the main web application for Santaan, built with Next.js 14, Drizzle ORM, and NextAuth.js.

## Features

- **Authentication**: Custom Email/Password login with role-based access control (Admin/User).
- **Database**: 
  - **Local**: SQLite (`santaan.db`) using `better-sqlite3`.
  - **Production**: Turso (LibSQL) for edge-compatible persistence.
- **Admin CRM**: Protected dashboard for managing contacts and seminar registrations.
- **Analytics**: Dynamic script injection for Google Analytics and Facebook Pixel.
- **SEO**: Optimized metadata and semantic HTML structure.

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
    NEXT_PUBLIC_GROQ_API_KEY=your_key
    ```

4.  **Database Setup (Local):**
    ```bash
    # Push schema to local SQLite
    npx drizzle-kit push

    # Seed initial admin user
    npx tsx src/scripts/seed-users.ts
    ```
    *Default Admin:* `raghab.panda@santaan.in` / `password123`

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## Deployment (Netlify)

This project is configured for deployment on Netlify.

1.  **Connect to GitHub**: Link your repository to a new Netlify site.
2.  **Build Settings**:
    -   **Build Command**: `npm run build`
    -   **Publish Directory**: `.next`
3.  **Environment Variables**:
    Set the following in Netlify Site Settings:
    -   `AUTH_SECRET` (Use a strong random string)
    -   `TURSO_DATABASE_URL`
    -   `TURSO_AUTH_TOKEN`
    -   `NEXT_PUBLIC_GOOGLE_AI_API_KEY`
    -   `NEXT_PUBLIC_GROQ_API_KEY`

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

## Future Enhancement: Google Analytics API Integration

To display **live GA data** in the admin dashboard (instead of just external links), follow these steps:

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

### Admin Credentials (Production)
| Email | Password |
|-------|----------|
| raghab.panda@santaan.in | Santaan@2026! |
| satish.rath@santaan.in | Santaan@2026! |
| satish@skids.health | Santaan@2026! |
| demo@santaan.com | Demo@2026! |

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
