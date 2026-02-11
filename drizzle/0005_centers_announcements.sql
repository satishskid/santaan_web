-- Centers/Locations table for admin-manageable clinic locations
CREATE TABLE IF NOT EXISTS `centers` (
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

-- News/Announcements table for admin-manageable updates
CREATE TABLE IF NOT EXISTS `announcements` (
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

-- Insert initial centers data (existing locations)
INSERT INTO `centers` (`city`, `title`, `address`, `description`, `email`, `phones`, `sort_order`) VALUES
('Bhubaneswar', 'The Temple City', 'District Center, Chandrasekharpur & IRC Village', 'Our flagship center of excellence featuring advanced IVF labs and the Santaan Academy.', 'bbsr@santaan.in', '["+91 9337326896", "+91 7328839934", "+91 7008990586"]', 1),
('Berhampur', 'The Silk City', 'Comprehensive Fertility Care Center', 'Bringing world-class fertility solutions to Southern Odisha.', 'bbsr@santaan.in', '["+91 7008990582", "+91 9777989739"]', 2),
('Bengaluru', 'Silicon Valley of India', 'New Center of Innovation', 'Expanding our footprint with tech-integrated fertility care.', 'bng@santaan.in', '["+91 8105108416"]', 3);
