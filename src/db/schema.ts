import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

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
