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

To display live GA data in the admin dashboard (instead of just links), follow these steps:

### Step 1: Create Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select project: "Santaan Analytics"
3. Enable API:
   - Go to "APIs & Services" → "Enable APIs"
   - Search for "Google Analytics Data API"
   - Click "Enable"

### Step 2: Create Service Account Credentials

1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
   - Name: `santaan-analytics-reader`
   - Role: None (we'll add in GA4)
3. Click on the created service account
4. Go to "Keys" tab → "Add Key" → "Create new key" → JSON
5. Download the JSON file

### Step 3: Add Service Account to GA4

1. Go to [Google Analytics](https://analytics.google.com)
2. Admin → Property Access Management
3. Click "+" → "Add users"
4. Enter the service account email (from JSON file, looks like `xxx@project.iam.gserviceaccount.com`)
5. Set role: "Viewer"
6. Save

### Step 4: Add Credentials to Environment

Add to `.env.local`:
```env
GA4_PROPERTY_ID=123456789
GOOGLE_SERVICE_ACCOUNT_EMAIL=santaan-analytics@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Step 5: Install Package & Implement

```bash
npm install @google-analytics/data
```

Then create API route `/api/admin/analytics` to fetch:
- Active users (real-time)
- Page views (today, week, month)
- Top pages
- Traffic sources

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
