import { sql } from "drizzle-orm";
import { text, integer, real, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";

export const contacts = sqliteTable('contacts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    role: text('role').default('Patient'),
    status: text('status').default('New'),
    lastContact: text('last_contact').default(sql`CURRENT_TIMESTAMP`),
    
    // Engagement tracking
    seminarRegistered: integer('seminar_registered', { mode: 'boolean' }).default(false),
    seminarScore: integer('seminar_score'),
    seminarSignal: text('seminar_signal'),
    seminarQuestion: text('seminar_question'),
    newsletterSubscribed: integer('newsletter_subscribed', { mode: 'boolean' }).default(false),
    
    // Communication channels
    whatsappNumber: text('whatsapp_number'),
    whatsappOptIn: integer('whatsapp_opt_in', { mode: 'boolean' }).default(false),
    telegramId: text('telegram_id'),
    telegramUsername: text('telegram_username'),
    telegramOptIn: integer('telegram_opt_in', { mode: 'boolean' }).default(false),
    preferredChannel: text('preferred_channel').default('email'), // email, whatsapp, telegram
    
    // Lead tracking
    tags: text('tags'), // comma-separated: newsletter,at_home_test,hot_lead
    leadSource: text('lead_source'), // website, whatsapp, telegram, referral
    leadScore: integer('lead_score').default(0), // 0-100
    message: text('message'), // Initial message/inquiry
    
    // UTM Attribution
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    utmTerm: text('utm_term'),
    utmContent: text('utm_content'),
    landingPath: text('landing_path'),
    
    // Activity tracking
    lastMessageAt: text('last_message_at'),
    conversationCount: integer('conversation_count').default(0),
    submittedAt: integer('submitted_at'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const admins = sqliteTable('admins', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    role: text('role').default('admin'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const settings = sqliteTable('settings', {
    key: text('key').primaryKey(),
    value: text('value').notNull(),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const users = sqliteTable('users', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name'),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: text('role').default('user'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Centers/Locations - Admin-manageable clinic locations
export const centers = sqliteTable('centers', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    city: text('city').notNull(),
    title: text('title').notNull(), // e.g., "The Temple City"
    address: text('address').notNull(),
    description: text('description'),
    email: text('email').notNull(),
    phones: text('phones').notNull(), // JSON array of phone numbers
    mapUrl: text('map_url'), // Google Maps embed URL
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    sortOrder: integer('sort_order').default(0),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// News/Announcements - Admin-manageable updates, campaigns, awards
export const announcements = sqliteTable('announcements', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    content: text('content'), // Short description/body
    type: text('type').default('news'), // news, award, campaign, event
    imageUrl: text('image_url'), // Optional image
    linkUrl: text('link_url'), // Optional external link
    linkText: text('link_text'), // e.g., "Learn More"
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    isPinned: integer('is_pinned', { mode: 'boolean' }).default(false), // Show at top
    publishDate: text('publish_date').default(sql`CURRENT_TIMESTAMP`),
    expiryDate: text('expiry_date'), // Optional auto-hide date
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Campaign spend tracking for financial ROI (CPL / CPP) in admin dashboards
export const campaignSpend = sqliteTable('campaign_spend', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    spendDate: text('spend_date').notNull(), // YYYY-MM-DD
    channel: text('channel').notNull(), // meta, google, youtube, offline, etc.
    utmCampaign: text('utm_campaign').notNull(),
    center: text('center').default('network'),
    asset: text('asset'),
    amount: real('amount').notNull(), // INR amount
    notes: text('notes'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Daily paid media reporting from agency (Meta/Google/YouTube)
export const agencyPerformanceLogs = sqliteTable('agency_performance_logs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    reportDate: text('report_date').notNull(), // YYYY-MM-DD
    platform: text('platform').notNull(), // meta | google | youtube
    center: text('center').notNull(), // bhubaneswar | berhampur | bangalore
    campaignId: text('campaign_id').notNull(),
    campaignName: text('campaign_name').notNull(),
    utmSource: text('utm_source').notNull(),
    utmMedium: text('utm_medium').notNull(),
    utmCampaign: text('utm_campaign').notNull(),
    spend: real('spend').notNull(), // INR
    impressions: integer('impressions').default(0),
    clicks: integer('clicks').default(0),
    leads: integer('leads').default(0),
    qualifiedLeads: integer('qualified_leads').default(0),
    registrations: integer('registrations').default(0),
    notes: text('notes'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Offline activity logs entered by field team
export const fieldActivityLogs = sqliteTable('field_activity_logs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    activityDate: text('activity_date').notNull(), // YYYY-MM-DD
    center: text('center').notNull(),
    activityType: text('activity_type').notNull(), // doctor_visit | hoarding | camp | event
    assetCode: text('asset_code').notNull(),
    location: text('location').notNull(),
    ownerName: text('owner_name').notNull(),
    spend: real('spend').default(0),
    estimatedReach: integer('estimated_reach').default(0),
    actualFootfall: integer('actual_footfall').default(0),
    leadsCollected: integer('leads_collected').default(0),
    qualifiedLeads: integer('qualified_leads').default(0),
    registrations: integer('registrations').default(0),
    utmCampaign: text('utm_campaign').notNull(),
    qrCodeId: text('qr_code_id'),
    callNumber: text('call_number'),
    whatsappNumber: text('whatsapp_number'),
    proofUrl: text('proof_url'),
    notes: text('notes'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// TV ad log entered by media/marketing operations
export const tvAdLogs = sqliteTable('tv_ad_logs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    airingDate: text('airing_date').notNull(), // YYYY-MM-DD
    center: text('center').notNull(),
    channelName: text('channel_name').notNull(),
    programName: text('program_name').notNull(),
    timeSlot: text('time_slot').notNull(), // HH:mm or label
    spotDurationSec: integer('spot_duration_sec').default(20),
    spotsCount: integer('spots_count').default(1),
    spend: real('spend').default(0),
    creativeCode: text('creative_code').notNull(),
    tvCampaignCode: text('tv_campaign_code').notNull(),
    utmCampaign: text('utm_campaign').notNull(),
    qrCodeId: text('qr_code_id'),
    ivrNumber: text('ivr_number'),
    whatsappKeyword: text('whatsapp_keyword'),
    notes: text('notes'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Daily execution status by role/profile for interim Growth OS operations
export const opsTaskUpdates = sqliteTable(
    'ops_task_updates',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        taskDate: text('task_date').notNull(), // YYYY-MM-DD
        profileKey: text('profile_key').notNull(), // agency_ops, field_exec_bhubaneswar, etc.
        center: text('center').default('network'),
        taskCode: text('task_code').notNull(),
        status: text('status').default('pending'), // pending | in_progress | done | blocked
        note: text('note'),
        updatedByEmail: text('updated_by_email'),
        updatedByName: text('updated_by_name'),
        updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    },
    (table) => ({
        uniqueTaskPerDay: uniqueIndex('ops_task_updates_unique_day_task').on(
            table.taskDate,
            table.profileKey,
            table.center,
            table.taskCode
        ),
    })
);

export const reputationReviews = sqliteTable(
    'reputation_reviews',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        source: text('source').notNull(), // google | meta | manual
        center: text('center').notNull(), // bhubaneswar | berhampur | bangalore | angul | network
        externalReviewId: text('external_review_id'),
        sourceLocation: text('source_location'),
        reviewerName: text('reviewer_name'),
        rating: integer('rating').notNull(),
        reviewDate: text('review_date').notNull(), // YYYY-MM-DD
        headline: text('headline'),
        reviewText: text('review_text').notNull(),
        publicUrl: text('public_url'),
        sentiment: text('sentiment').default('neutral'), // positive | neutral | negative
        themes: text('themes').default('[]'), // JSON array of theme codes
        responseStatus: text('response_status').default('pending'), // pending | responded | escalated | not_needed
        responseOwner: text('response_owner'),
        responseText: text('response_text'),
        respondedAt: text('responded_at'),
        isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
        isActive: integer('is_active', { mode: 'boolean' }).default(true),
        notes: text('notes'),
        createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
        updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    },
    (table) => ({
        uniqueExternalReview: uniqueIndex('reputation_reviews_source_external_review_unique').on(
            table.source,
            table.externalReviewId
        ),
    })
);

export const contentAssets = sqliteTable('content_assets', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    assetType: text('asset_type').notNull(), // blog | clinical_brief | reel | social_post | landing_page | faq | email | ad_copy
    title: text('title').notNull(),
    url: text('url'),
    center: text('center').default('network'),
    audience: text('audience').default('patient'),
    funnelStage: text('funnel_stage').default('awareness'),
    primaryKeyword: text('primary_keyword'),
    secondaryKeywords: text('secondary_keywords').default('[]'), // JSON array
    tags: text('tags').default('[]'), // JSON array
    sourcePlatform: text('source_platform').default('manual'), // instagram | facebook | linkedin | website | youtube | whatsapp | manual
    status: text('status').default('published'),
    owner: text('owner'),
    notes: text('notes'),
    publishedAt: text('published_at'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const contentFeedback = sqliteTable('content_feedback', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    feedbackDate: text('feedback_date').notNull(), // YYYY-MM-DD
    source: text('source').notNull(), // telecaller | counselor | review | agency | search | social | whatsapp | field | manual
    center: text('center').default('network'),
    topic: text('topic').notNull(),
    suggestedKeyword: text('suggested_keyword'),
    patientQuestion: text('patient_question'),
    audience: text('audience').default('patient'),
    funnelStage: text('funnel_stage').default('awareness'),
    priority: text('priority').default('medium'),
    occurrenceCount: integer('occurrence_count').default(1),
    recommendedAction: text('recommended_action').default('write_blog'),
    owner: text('owner'),
    status: text('status').default('open'),
    notes: text('notes'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Blog posts synced from Medium and served on Santaan domain
export const blogPosts = sqliteTable('blog_posts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    excerpt: text('excerpt').notNull(),
    html: text('html').notNull(),
    author: text('author').default('Santaan Editorial Team'),
    thumbnail: text('thumbnail'),
    tags: text('tags').default('[]'), // JSON array of tags
    sourceUrl: text('source_url').notNull(),
    type: text('type').default('blog'), // blog | news
    readMinutes: integer('read_minutes').default(1),
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    publishedAt: text('published_at').notNull(),
    syncedAt: text('synced_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});
