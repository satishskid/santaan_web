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
CREATE UNIQUE INDEX `meta_audiences_account_key_unique` ON `meta_audiences` (`account_id`, `audience_key`);

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
CREATE INDEX `meta_audience_syncs_account_idx` ON `meta_audience_syncs` (`account_id`);
CREATE INDEX `meta_audience_syncs_status_idx` ON `meta_audience_syncs` (`process_status`);
