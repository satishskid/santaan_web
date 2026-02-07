CREATE TABLE `admins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'admin',
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_email_unique` ON `admins` (`email`);--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`role` text DEFAULT 'Patient',
	`status` text DEFAULT 'New',
	`last_contact` text DEFAULT CURRENT_TIMESTAMP,
	`seminar_registered` integer DEFAULT false,
	`seminar_score` integer,
	`seminar_signal` text,
	`seminar_question` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
