CREATE TABLE `agency_performance_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`report_date` text NOT NULL,
	`platform` text NOT NULL,
	`center` text NOT NULL,
	`campaign_id` text NOT NULL,
	`campaign_name` text NOT NULL,
	`utm_source` text NOT NULL,
	`utm_medium` text NOT NULL,
	`utm_campaign` text NOT NULL,
	`spend` real NOT NULL,
	`impressions` integer DEFAULT 0,
	`clicks` integer DEFAULT 0,
	`leads` integer DEFAULT 0,
	`qualified_leads` integer DEFAULT 0,
	`registrations` integer DEFAULT 0,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`type` text DEFAULT 'news',
	`image_url` text,
	`link_url` text,
	`link_text` text,
	`is_active` integer DEFAULT true,
	`is_pinned` integer DEFAULT false,
	`publish_date` text DEFAULT CURRENT_TIMESTAMP,
	`expiry_date` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `auth_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` text,
	`refresh_token_expires_at` text,
	`scope` text,
	`password` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `auth_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` text NOT NULL,
	`token` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_sessions_token_unique` ON `auth_sessions` (`token`);--> statement-breakpoint
CREATE TABLE `auth_verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text NOT NULL,
	`html` text NOT NULL,
	`author` text DEFAULT 'Santaan Editorial Team',
	`thumbnail` text,
	`tags` text DEFAULT '[]',
	`source_url` text NOT NULL,
	`type` text DEFAULT 'blog',
	`read_minutes` integer DEFAULT 1,
	`is_active` integer DEFAULT true,
	`published_at` text NOT NULL,
	`synced_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_posts_slug_unique` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE TABLE `campaign_spend` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`spend_date` text NOT NULL,
	`channel` text NOT NULL,
	`utm_campaign` text NOT NULL,
	`center` text DEFAULT 'network',
	`asset` text,
	`amount` real NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `centers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`city` text NOT NULL,
	`title` text NOT NULL,
	`address` text NOT NULL,
	`description` text,
	`email` text NOT NULL,
	`phones` text NOT NULL,
	`map_url` text,
	`is_active` integer DEFAULT true,
	`sort_order` integer DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `field_activity_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`activity_date` text NOT NULL,
	`center` text NOT NULL,
	`activity_type` text NOT NULL,
	`asset_code` text NOT NULL,
	`location` text NOT NULL,
	`owner_name` text NOT NULL,
	`spend` real DEFAULT 0,
	`estimated_reach` integer DEFAULT 0,
	`actual_footfall` integer DEFAULT 0,
	`leads_collected` integer DEFAULT 0,
	`qualified_leads` integer DEFAULT 0,
	`registrations` integer DEFAULT 0,
	`utm_campaign` text NOT NULL,
	`qr_code_id` text,
	`call_number` text,
	`whatsapp_number` text,
	`proof_url` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `meta_audience_syncs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_id` text NOT NULL,
	`audience_key` text NOT NULL,
	`audience_id` text,
	`audience_name` text,
	`contact_count` integer DEFAULT 0,
	`batch_count` integer DEFAULT 0,
	`process_status` text DEFAULT 'received',
	`response_payload` text,
	`error_message` text,
	`processed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `meta_audiences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_id` text NOT NULL,
	`audience_key` text NOT NULL,
	`audience_id` text NOT NULL,
	`name` text NOT NULL,
	`last_synced_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `meta_audiences_account_key_unique` ON `meta_audiences` (`account_id`,`audience_key`);--> statement-breakpoint
CREATE TABLE `meta_conversion_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_key` text NOT NULL,
	`contact_id` integer,
	`event_name` text NOT NULL,
	`signal_type` text NOT NULL,
	`crm_status` text,
	`center` text,
	`source_channel` text,
	`action_source` text,
	`pixel_id` text,
	`lead_source` text,
	`utm_campaign` text,
	`event_time` text NOT NULL,
	`email_hash` text,
	`phone_hash` text,
	`external_id_hash` text,
	`payload` text NOT NULL,
	`response_payload` text,
	`process_status` text DEFAULT 'received',
	`retry_count` integer DEFAULT 0,
	`processed_at` text,
	`received_at` text DEFAULT CURRENT_TIMESTAMP,
	`error_message` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `meta_conversion_events_event_key_unique` ON `meta_conversion_events` (`event_key`);--> statement-breakpoint
CREATE TABLE `meta_launch_drafts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`channel` text DEFAULT 'meta',
	`account_id` text NOT NULL,
	`center` text DEFAULT 'network',
	`objective` text DEFAULT 'OUTCOME_LEADS',
	`campaign_name` text NOT NULL,
	`adset_name` text,
	`ad_name` text,
	`status` text DEFAULT 'draft',
	`priority` text DEFAULT 'medium',
	`audience_summary` text,
	`geo_targets` text,
	`placements` text,
	`budget_type` text DEFAULT 'daily',
	`budget_inr` real DEFAULT 0,
	`budget_notes` text,
	`utm_campaign` text,
	`landing_url` text,
	`content_angle` text,
	`hook` text,
	`primary_text` text,
	`headline` text,
	`description` text,
	`cta` text,
	`creative_format` text,
	`creative_brief` text,
	`content_keywords` text,
	`content_owner_name` text,
	`performance_owner_name` text,
	`requested_by_email` text,
	`requested_by_name` text,
	`approval_requested_at` text,
	`approved_by_email` text,
	`approved_by_name` text,
	`approved_at` text,
	`approval_notes` text,
	`ads_manager_link` text,
	`launch_checklist` text,
	`launch_notes` text,
	`launched_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `neodove_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_key` text NOT NULL,
	`lead_id` text,
	`contact_id` integer,
	`event_name` text NOT NULL,
	`mobile` text,
	`email` text,
	`campaign_id` text,
	`campaign` text,
	`stage_name` text,
	`status_code` text,
	`raw_status` text,
	`mapped_status` text,
	`disposition` text,
	`dispose_reason` text,
	`pipeline` text,
	`center` text,
	`assigned_to_id` text,
	`assigned_to` text,
	`call_connected` integer,
	`call_duration_sec` integer,
	`follow_up_at` text,
	`created_at_source` text,
	`updated_at_source` text,
	`notes` text,
	`raw_payload` text NOT NULL,
	`received_at` text DEFAULT CURRENT_TIMESTAMP,
	`processed_at` text,
	`process_status` text DEFAULT 'received',
	`is_duplicate` integer DEFAULT false,
	`duplicate_of_event_key` text,
	`error_message` text
);
--> statement-breakpoint
CREATE TABLE `ops_task_updates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_date` text NOT NULL,
	`profile_key` text NOT NULL,
	`center` text DEFAULT 'network',
	`task_code` text NOT NULL,
	`status` text DEFAULT 'pending',
	`note` text,
	`updated_by_email` text,
	`updated_by_name` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ops_task_updates_unique_day_task` ON `ops_task_updates` (`task_date`,`profile_key`,`center`,`task_code`);--> statement-breakpoint
CREATE TABLE `tv_ad_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`airing_date` text NOT NULL,
	`center` text NOT NULL,
	`channel_name` text NOT NULL,
	`program_name` text NOT NULL,
	`time_slot` text NOT NULL,
	`spot_duration_sec` integer DEFAULT 20,
	`spots_count` integer DEFAULT 1,
	`spend` real DEFAULT 0,
	`creative_code` text NOT NULL,
	`tv_campaign_code` text NOT NULL,
	`utm_campaign` text NOT NULL,
	`qr_code_id` text,
	`ivr_number` text,
	`whatsapp_keyword` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
INSERT INTO `__new_settings`("key", "value", "updated_at") SELECT "key", "value", "updated_at" FROM `settings`;--> statement-breakpoint
DROP TABLE `settings`;--> statement-breakpoint
ALTER TABLE `__new_settings` RENAME TO `settings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `contacts` ADD `owner_name` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `owner_email` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `next_follow_up_at` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `loss_reason` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `sentiment` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `neodove_lead_id` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `neodove_campaign_id` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `neodove_stage_name` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `neodove_status_code` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `neodove_raw_status` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `neodove_mapped_status` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `neodove_disposition` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `neodove_dispose_reason` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `neodove_pipeline` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `neodove_owner_id` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `neodove_owner_name` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `neodove_call_connected` integer;--> statement-breakpoint
ALTER TABLE `contacts` ADD `neodove_call_duration_sec` integer;--> statement-breakpoint
ALTER TABLE `contacts` ADD `neodove_created_at` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `neodove_updated_at` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `neodove_last_event` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `neodove_last_event_at` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `neodove_last_sync_at` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `neodove_sync_status` text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `users` ADD `email_verified` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `image` text;
