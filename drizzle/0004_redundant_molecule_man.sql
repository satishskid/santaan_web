ALTER TABLE `contacts` ADD `newsletter_subscribed` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `contacts` ADD `whatsapp_number` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `whatsapp_opt_in` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `contacts` ADD `telegram_id` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `telegram_username` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `telegram_opt_in` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `contacts` ADD `preferred_channel` text DEFAULT 'email';--> statement-breakpoint
ALTER TABLE `contacts` ADD `tags` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `lead_source` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `lead_score` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `contacts` ADD `message` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `utm_source` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `utm_medium` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `utm_campaign` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `utm_term` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `utm_content` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `landing_path` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `last_message_at` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `conversation_count` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `contacts` ADD `submitted_at` integer;