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
    ownerName: text('owner_name'),
    ownerEmail: text('owner_email'),
    nextFollowUpAt: text('next_follow_up_at'),

    // AI Analysis
    lossReason: text('loss_reason'),
    sentiment: text('sentiment'),
    notes: text('notes'),

    // Structured NeoDove sync fields
    neodoveLeadId: text('neodove_lead_id'),
    neodoveCampaignId: text('neodove_campaign_id'),
    neodoveStageName: text('neodove_stage_name'),
    neodoveStatusCode: text('neodove_status_code'),
    neodoveRawStatus: text('neodove_raw_status'),
    neodoveMappedStatus: text('neodove_mapped_status'),
    neodoveDisposition: text('neodove_disposition'),
    neodoveDisposeReason: text('neodove_dispose_reason'),
    neodovePipeline: text('neodove_pipeline'),
    neodoveOwnerId: text('neodove_owner_id'),
    neodoveOwnerName: text('neodove_owner_name'),
    neodoveCallConnected: integer('neodove_call_connected', { mode: 'boolean' }),
    neodoveCallDurationSec: integer('neodove_call_duration_sec'),
    neodoveCreatedAt: text('neodove_created_at'),
    neodoveUpdatedAt: text('neodove_updated_at'),
    neodoveLastEvent: text('neodove_last_event'),
    neodoveLastEventAt: text('neodove_last_event_at'),
    neodoveLastSyncAt: text('neodove_last_sync_at'),
    neodoveSyncStatus: text('neodove_sync_status').default('pending'),
    
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

export const neodoveEvents = sqliteTable('neodove_events', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    eventKey: text('event_key').notNull(),
    leadId: text('lead_id'),
    contactId: integer('contact_id'),
    eventName: text('event_name').notNull(),
    mobile: text('mobile'),
    email: text('email'),
    campaignId: text('campaign_id'),
    campaign: text('campaign'),
    stageName: text('stage_name'),
    statusCode: text('status_code'),
    rawStatus: text('raw_status'),
    mappedStatus: text('mapped_status'),
    disposition: text('disposition'),
    disposeReason: text('dispose_reason'),
    pipeline: text('pipeline'),
    center: text('center'),
    assignedToId: text('assigned_to_id'),
    assignedTo: text('assigned_to'),
    callConnected: integer('call_connected', { mode: 'boolean' }),
    callDurationSec: integer('call_duration_sec'),
    followUpAt: text('follow_up_at'),
    createdAtSource: text('created_at_source'),
    updatedAtSource: text('updated_at_source'),
    notes: text('notes'),
    rawPayload: text('raw_payload').notNull(),
    receivedAt: text('received_at').default(sql`CURRENT_TIMESTAMP`),
    processedAt: text('processed_at'),
    processStatus: text('process_status').default('received'),
    isDuplicate: integer('is_duplicate', { mode: 'boolean' }).default(false),
    duplicateOfEventKey: text('duplicate_of_event_key'),
    errorMessage: text('error_message'),
});

export const voiceCallLogs = sqliteTable(
    'voice_call_logs',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        eventKey: text('event_key').notNull(),
        externalCallId: text('external_call_id'),
        contactId: integer('contact_id'),
        provider: text('provider').notNull().default('bolna'),
        agentName: text('agent_name').default('Swara'),
        fromNumber: text('from_number'),
        toNumber: text('to_number'),
        entryPoint: text('entry_point'), // main | tv
        sourceCampaign: text('source_campaign'),
        callStatus: text('call_status'),
        startedAt: text('started_at'),
        endedAt: text('ended_at'),
        durationSec: integer('duration_sec'),
        language: text('language'),
        callerName: text('caller_name'),
        callerType: text('caller_type'),
        city: text('city'),
        preferredCentre: text('preferred_centre'),
        tryingDuration: text('trying_duration'),
        knownCondition: text('known_condition'),
        priorTreatment: text('prior_treatment'),
        callbackWindow: text('callback_window'),
        whatsappNumber: text('whatsapp_number'),
        transcriptUrl: text('transcript_url'),
        summary: text('summary'),
        transferRequested: integer('transfer_requested', { mode: 'boolean' }).default(false),
        transferCompleted: integer('transfer_completed', { mode: 'boolean' }).default(false),
        intentScore: integer('intent_score').default(0),
        intentBucket: text('intent_bucket'), // hot | warm | cool
        neodovePushStatus: text('neodove_push_status').default('pending'), // pending | pushed | skipped | error
        whatsappPushStatus: text('whatsapp_push_status').default('pending'), // pending | sent | skipped | error
        rawPayload: text('raw_payload').notNull(),
        receivedAt: text('received_at').default(sql`CURRENT_TIMESTAMP`),
        processedAt: text('processed_at'),
        processStatus: text('process_status').default('received'), // received | processing | processed | ignored | duplicate | error
        errorMessage: text('error_message'),
    },
    (table) => ({
        uniqueEventKey: uniqueIndex('voice_call_logs_event_key_unique').on(table.eventKey),
    })
);

export const metaConversionEvents = sqliteTable(
    'meta_conversion_events',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        eventKey: text('event_key').notNull(),
        contactId: integer('contact_id'),
        eventName: text('event_name').notNull(),
        signalType: text('signal_type').notNull(), // lead_qualified | consultation_booked | consultation_completed | patient_converted
        crmStatus: text('crm_status'),
        center: text('center'),
        sourceChannel: text('source_channel'),
        actionSource: text('action_source'),
        pixelId: text('pixel_id'),
        leadSource: text('lead_source'),
        utmCampaign: text('utm_campaign'),
        eventTime: text('event_time').notNull(),
        emailHash: text('email_hash'),
        phoneHash: text('phone_hash'),
        externalIdHash: text('external_id_hash'),
        payload: text('payload').notNull(),
        responsePayload: text('response_payload'),
        processStatus: text('process_status').default('received'), // received | processing | processed | skipped | error
        retryCount: integer('retry_count').default(0),
        processedAt: text('processed_at'),
        receivedAt: text('received_at').default(sql`CURRENT_TIMESTAMP`),
        errorMessage: text('error_message'),
    },
    (table) => ({
        uniqueEventKey: uniqueIndex('meta_conversion_events_event_key_unique').on(table.eventKey),
    })
);

export const metaAudiences = sqliteTable(
    'meta_audiences',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        accountId: text('account_id').notNull(),
        audienceKey: text('audience_key').notNull(), // qualified | converted
        audienceId: text('audience_id').notNull(),
        name: text('name').notNull(),
        lastSyncedAt: text('last_synced_at'),
        createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
        updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    },
    (table) => ({
        uniqueAudienceKey: uniqueIndex('meta_audiences_account_key_unique').on(table.accountId, table.audienceKey),
    })
);

export const metaAudienceSyncs = sqliteTable('meta_audience_syncs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    accountId: text('account_id').notNull(),
    audienceKey: text('audience_key').notNull(),
    audienceId: text('audience_id'),
    audienceName: text('audience_name'),
    contactCount: integer('contact_count').default(0),
    batchCount: integer('batch_count').default(0),
    processStatus: text('process_status').default('received'), // received | processed | error
    responsePayload: text('response_payload'),
    errorMessage: text('error_message'),
    processedAt: text('processed_at'),
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
    updatedAt: text('updated_at'),
});

export const users = sqliteTable('users', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name'),
    email: text('email').notNull().unique(),
    emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
    image: text('image'),
    password: text('password').notNull(),
    role: text('role').default('user'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const authSessions = sqliteTable('auth_sessions', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    expiresAt: text('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
});

export const authAccounts = sqliteTable('auth_accounts', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: text('access_token_expires_at'),
    refreshTokenExpiresAt: text('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const authVerifications = sqliteTable('auth_verifications', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: text('expires_at').notNull(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
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

// Internal Meta launch planning and approval workflow
export const metaLaunchDrafts = sqliteTable('meta_launch_drafts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    channel: text('channel').default('meta'),
    accountId: text('account_id').notNull(),
    center: text('center').default('network'),
    objective: text('objective').default('OUTCOME_LEADS'),
    campaignName: text('campaign_name').notNull(),
    adsetName: text('adset_name'),
    adName: text('ad_name'),
    status: text('status').default('draft'), // draft | content_ready | pending_approval | approved | launched | blocked
    priority: text('priority').default('medium'),
    audienceSummary: text('audience_summary'),
    geoTargets: text('geo_targets'),
    placements: text('placements'),
    budgetType: text('budget_type').default('daily'),
    budgetInr: real('budget_inr').default(0),
    budgetNotes: text('budget_notes'),
    utmCampaign: text('utm_campaign'),
    landingUrl: text('landing_url'),
    contentAngle: text('content_angle'),
    hook: text('hook'),
    primaryText: text('primary_text'),
    headline: text('headline'),
    description: text('description'),
    cta: text('cta'),
    creativeFormat: text('creative_format'),
    creativeBrief: text('creative_brief'),
    contentKeywords: text('content_keywords'),
    contentOwnerName: text('content_owner_name'),
    performanceOwnerName: text('performance_owner_name'),
    requestedByEmail: text('requested_by_email'),
    requestedByName: text('requested_by_name'),
    approvalRequestedAt: text('approval_requested_at'),
    approvedByEmail: text('approved_by_email'),
    approvedByName: text('approved_by_name'),
    approvedAt: text('approved_at'),
    approvalNotes: text('approval_notes'),
    adsManagerLink: text('ads_manager_link'),
    launchChecklist: text('launch_checklist'),
    launchNotes: text('launch_notes'),
    launchedAt: text('launched_at'),
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

export const chatMessages = sqliteTable('chat_messages', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    contactId: integer('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
    phone: text('phone').notNull(),
    role: text('role').notNull(), // user | assistant
    content: text('content').notNull(),
    channel: text('channel').default('whatsapp'), // whatsapp | web
    metadata: text('metadata'), // JSON string for extra info
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
