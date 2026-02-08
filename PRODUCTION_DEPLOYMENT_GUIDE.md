# Production Deployment Guide - Santaan.in

**Production Domain:** https://www.santaan.in/  
**Status:** Ready for deployment ✅

## Pre-Deployment Checklist

### ✅ Already Completed
- [x] Google OAuth credentials configured
- [x] Development redirect URIs added to Google Cloud Console
- [x] Test users configured in OAuth consent screen
- [x] All UI sections tested and functional
- [x] Database (Turso) configured
- [x] API keys configured (Google AI, Groq)
- [x] Production build tested successfully

### 🎯 Required for Production Deployment

## 1. Google Cloud Console - Production OAuth Configuration

### Add Production Redirect URI
1. Go to https://console.cloud.google.com/
2. Navigate to **APIs & Services → Credentials**
3. Click on your OAuth 2.0 Client ID: `1025550266658-pes9ibitrfa3f40j6uun0rojn47uig35.apps.googleusercontent.com`
4. Under **Authorized redirect URIs**, click **+ ADD URI**
5. Add the production redirect URI:
   ```
   https://www.santaan.in/api/auth/callback/google
   ```
6. Click **SAVE**

### Update OAuth Consent Screen
1. Go to **OAuth consent screen**
2. If still in "Testing" mode, consider publishing the app:
   - Click **PUBLISH APP** to move to production
   - OR keep in Testing and ensure all real users are added as test users
3. Verify OAuth consent screen information is accurate

## 2. Environment Variables - Production

Create `.env.production` or configure in your hosting platform:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET="<your-nextauth-secret-from-.env.local>"
NEXTAUTH_URL="https://www.santaan.in"

# Google OAuth (use same credentials from development)
GOOGLE_CLIENT_ID="<your-google-client-id>"
GOOGLE_CLIENT_SECRET="<your-google-client-secret>"

# Google AI
NEXT_PUBLIC_GOOGLE_AI_API_KEY="<your-google-ai-api-key>"

# Groq AI
NEXT_PUBLIC_GROQ_API_KEY="<your-groq-api-key>"

# Turso Database (Production)
TURSO_DATABASE_URL="<your-turso-database-url>"
TURSO_AUTH_TOKEN="<your-turso-auth-token>"
```

**Note:** Copy the actual values from your `.env.local` file. Only change `NEXTAUTH_URL` to the production domain.

**⚠️ IMPORTANT CHANGES FOR PRODUCTION:**
- Update `NEXTAUTH_URL` from `http://localhost:3000` to `https://www.santaan.in`
- All other variables remain the same

## 3. Deployment Platform Configuration

### If using Vercel:
1. Import repository from GitHub
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

**Vercel Configuration:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

### If using Other Platforms (Railway, Render, etc.):
1. Set all environment variables in platform dashboard
2. Configure build command: `npm run build`
3. Configure start command: `npm start`
4. Ensure Node.js version: 18+ or 20+

## 4. Domain Configuration

### DNS Settings (Already configured if site is live)
- Ensure `www.santaan.in` and `santaan.in` point to your hosting platform
- SSL certificate should be auto-provisioned

### Verify Domain Access
- https://www.santaan.in/ should resolve
- https://santaan.in/ should redirect to www version (or vice versa)

## 5. Post-Deployment Testing

### Critical Tests to Run After Deployment:

1. **Homepage Load**
   - Visit https://www.santaan.in/
   - Verify hero carousel loads
   - Check all sections render correctly

2. **Google OAuth Authentication**
   - Complete the 4-step Santaan Signal assessment
   - Click "Sign in with Google"
   - Verify successful authentication
   - Confirm assessment results display
   - Test seminar registration after sign-in

3. **Navigation Links**
   - Test all navigation buttons:
     - "Begin Your Journey" → #santaan-signal
     - "Read Today's Insight" → #insights
     - "Contact Us" → #contact
     - All section anchor links

4. **Interactive Features**
   - FAQ accordion expand/collapse
   - Myth Busting cards expand/collapse
   - Assessment wizard navigation
   - BMI calculator in assessment

5. **Contact Information**
   - Email links (mailto:) working
   - Phone links (tel:) working
   - All 3 location details visible

6. **Admin Access** (for whitelisted users)
   - Sign in with admin email
   - Access /admin/dashboard
   - Verify CRM data loads
   - Test data export functionality

## 6. Performance Optimization (Optional but Recommended)

- [ ] Enable image optimization
- [ ] Configure CDN for static assets
- [ ] Set up performance monitoring
- [ ] Configure analytics (Google Analytics already in code)

## 7. Security Checklist

- [x] HTTPS enabled (automatic with most platforms)
- [x] Environment variables secured (not in repository)
- [x] OAuth credentials properly configured
- [x] Admin access restricted to whitelisted emails
- [x] Database connection encrypted (Turso)

## 8. Monitoring & Maintenance

### Set Up Monitoring:
1. **Error Tracking:** Consider Sentry or similar
2. **Performance:** Vercel Analytics or Google PageSpeed Insights
3. **Uptime:** UptimeRobot or similar service

### Admin Emails for Access:
- satish@skids.health
- satish.rath@gmail.com
- demo@santaan.com
- raghab.panda@santaan.in
- satish.rath@santaan.in

## Quick Deploy Commands

### Build for Production:
```bash
npm run build
```

### Test Production Build Locally:
```bash
npm run build && npm start
```

### Deploy to Vercel (if using Vercel CLI):
```bash
vercel --prod
```

## Rollback Plan

If issues occur after deployment:
1. Revert to previous deployment in platform dashboard
2. Or rollback Git commit and redeploy
3. Check logs for errors
4. Verify environment variables are correct

## Support Contacts

**For OAuth Issues:**
- Verify redirect URI: `https://www.santaan.in/api/auth/callback/google`
- Check Google Cloud Console credentials
- Ensure app is published or test users are configured

**For Database Issues:**
- Verify Turso connection string and auth token
- Check database migrations are applied
- Review schema matches application code

## Expected Timeline

1. **Add Production Redirect URI:** 2 minutes
2. **Deploy to Platform:** 5-10 minutes (first deploy)
3. **DNS Propagation:** Instant (if already configured)
4. **Test All Features:** 15-20 minutes
5. **Total:** ~30 minutes for full production deployment

---

## 🎉 Ready to Deploy!

Your application is production-ready. Once you:
1. Add the production redirect URI to Google Cloud Console
2. Deploy to your hosting platform with correct environment variables
3. Test the OAuth flow on production

You'll have a fully functional fertility clinic website with AI-powered assessments and authentication!

**Production URL:** https://www.santaan.in/
