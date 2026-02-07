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
    seminarRegistered: integer('seminar_registered', { mode: 'boolean' }).default(false),
    seminarScore: integer('seminar_score'),
    seminarSignal: text('seminar_signal'),
    seminarQuestion: text('seminar_question'),
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
