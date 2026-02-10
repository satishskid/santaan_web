ALTER TABLE contacts ADD COLUMN newsletter_subscribed INTEGER DEFAULT 0;
--> statement-breakpoint
ALTER TABLE contacts ADD COLUMN whatsapp_number TEXT;
--> statement-breakpoint
ALTER TABLE contacts ADD COLUMN whatsapp_opt_in INTEGER DEFAULT 0;
--> statement-breakpoint
ALTER TABLE contacts ADD COLUMN telegram_id TEXT;
--> statement-breakpoint
ALTER TABLE contacts ADD COLUMN telegram_username TEXT;
--> statement-breakpoint
ALTER TABLE contacts ADD COLUMN telegram_opt_in INTEGER DEFAULT 0;
--> statement-breakpoint
ALTER TABLE contacts ADD COLUMN preferred_channel TEXT DEFAULT 'email';
--> statement-breakpoint
ALTER TABLE contacts ADD COLUMN tags TEXT;
--> statement-breakpoint
ALTER TABLE contacts ADD COLUMN lead_source TEXT;
--> statement-breakpoint
ALTER TABLE contacts ADD COLUMN lead_score INTEGER DEFAULT 0;
--> statement-breakpoint
ALTER TABLE contacts ADD COLUMN message TEXT;
--> statement-breakpoint
ALTER TABLE contacts ADD COLUMN last_message_at TEXT;
--> statement-breakpoint
ALTER TABLE contacts ADD COLUMN conversation_count INTEGER DEFAULT 0;
--> statement-breakpoint
ALTER TABLE contacts ADD COLUMN submitted_at INTEGER;
