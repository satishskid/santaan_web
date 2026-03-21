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
CREATE UNIQUE INDEX `meta_conversion_events_event_key_unique` ON `meta_conversion_events` (`event_key`);
CREATE INDEX `meta_conversion_events_contact_id_idx` ON `meta_conversion_events` (`contact_id`);
CREATE INDEX `meta_conversion_events_process_status_idx` ON `meta_conversion_events` (`process_status`);
CREATE INDEX `meta_conversion_events_received_at_idx` ON `meta_conversion_events` (`received_at`);
