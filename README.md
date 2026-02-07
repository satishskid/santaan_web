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
