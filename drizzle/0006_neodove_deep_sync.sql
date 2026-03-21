ALTER TABLE `contacts` ADD COLUMN `neodove_lead_id` text;
ALTER TABLE `contacts` ADD COLUMN `neodove_campaign_id` text;
ALTER TABLE `contacts` ADD COLUMN `neodove_stage_name` text;
ALTER TABLE `contacts` ADD COLUMN `neodove_status_code` text;
ALTER TABLE `contacts` ADD COLUMN `neodove_raw_status` text;
ALTER TABLE `contacts` ADD COLUMN `neodove_mapped_status` text;
ALTER TABLE `contacts` ADD COLUMN `neodove_disposition` text;
ALTER TABLE `contacts` ADD COLUMN `neodove_dispose_reason` text;
ALTER TABLE `contacts` ADD COLUMN `neodove_pipeline` text;
ALTER TABLE `contacts` ADD COLUMN `neodove_owner_id` text;
ALTER TABLE `contacts` ADD COLUMN `neodove_owner_name` text;
ALTER TABLE `contacts` ADD COLUMN `neodove_call_connected` integer;
ALTER TABLE `contacts` ADD COLUMN `neodove_call_duration_sec` integer;
ALTER TABLE `contacts` ADD COLUMN `neodove_created_at` text;
ALTER TABLE `contacts` ADD COLUMN `neodove_updated_at` text;
ALTER TABLE `contacts` ADD COLUMN `neodove_last_event` text;
ALTER TABLE `contacts` ADD COLUMN `neodove_last_event_at` text;
ALTER TABLE `contacts` ADD COLUMN `neodove_last_sync_at` text;
ALTER TABLE `contacts` ADD COLUMN `neodove_sync_status` text DEFAULT 'pending';

CREATE TABLE IF NOT EXISTS `neodove_events` (
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
