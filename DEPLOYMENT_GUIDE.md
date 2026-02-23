# Deployment & Architecture Guide

This document outlines critical architectural decisions and constraints required for successful deployment on **Netlify** (and other serverless platforms).

**CRITICAL: Do not deviate from these patterns without extensive verification.**

## 1. Database (Turso / LibSQL)

### ❌ The Problem
The native `@libsql/client` package relies on binary bindings that often fail in Netlify's serverless environment (Linux Lambda functions), causing `500 Internal Server Errors` related to missing `.node` files.

### ✅ The Solution
We MUST use the **Web-compatible** HTTP driver which uses pure JavaScript (`fetch`).

**Implementation Rules:**
1.  **Import Path**: Always import `drizzle` from `drizzle-orm/libsql/web`.
    ```typescript
    // ✅ CORRECT
    import { drizzle } from 'drizzle-orm/libsql/web';
    import { createClient } from '@libsql/client/web';
    
    // ❌ INCORRECT (Causes 500 Error)
    import { drizzle } from 'drizzle-orm/libsql';
    import { createClient } from '@libsql/client';
    ```

2.  **Next.js Config**: Do **NOT** add `@libsql/client` to `serverExternalPackages` in `next.config.ts` if you are using the web driver. It should be bundled as standard JS.

## 2. Authentication (NextAuth)

### ❌ The Problem
Native crypto libraries like `bcrypt` (native C++ bindings) can cause build or runtime issues in serverless environments if the architecture doesn't match perfectly.

### ✅ The Solution
Use **pure JavaScript** implementations for cryptographic operations.

**Implementation Rules:**
1.  **Password Hashing**: Use `bcryptjs` (pure JS) instead of `bcrypt`.
    ```typescript
    // ✅ CORRECT
    import bcrypt from 'bcryptjs';
    
    // ❌ INCORRECT
    import bcrypt from 'bcrypt';
    ```
2.  Alternatively, use Node.js built-in `crypto` module if applicable.

## 3. Environment Variables
Ensure these variables are set in Netlify:
- `TURSO_DATABASE_URL`: The `libsql://` URL for your Turso database.
- `TURSO_AUTH_TOKEN`: The authentication token.
- `NEXTAUTH_SECRET`: A random string for session encryption.
- `NEXTAUTH_URL`: The canonical URL of the site (e.g., `https://santaanhope.netlify.app`).

## 4. Seeding Data
- Do **NOT** run seed scripts that depend on local SQLite files (`santaan.db`) against the production environment.
- Use dedicated scripts (e.g., `src/scripts/seed-prod.ts`) that connect via HTTP to the remote database.
