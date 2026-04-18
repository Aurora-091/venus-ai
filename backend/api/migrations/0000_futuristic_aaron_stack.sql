CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` text NOT NULL,
	`caller_number` text,
	`caller_name` text,
	`service` text,
	`slot_start` text NOT NULL,
	`slot_end` text,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`google_event_id` text,
	`notes` text,
	`created_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `call_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` text NOT NULL,
	`caller_number` text,
	`direction` text DEFAULT 'inbound' NOT NULL,
	`duration_seconds` integer,
	`outcome` text DEFAULT 'completed',
	`transcript` text,
	`summary` text,
	`conversation_id` text,
	`created_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `demo_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` text NOT NULL,
	`order_number` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_phone` text,
	`status` text NOT NULL,
	`items_summary` text NOT NULL,
	`total` real NOT NULL,
	`expected_delivery` text,
	`created_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`type` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`token_expiry` text,
	`calendar_id` text DEFAULT 'primary',
	`config` text DEFAULT '{}',
	`connected` integer DEFAULT false,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`vertical` text NOT NULL,
	`slug` text NOT NULL,
	`plan` text DEFAULT 'starter' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`agent_id` text DEFAULT '',
	`phone_number_id` text DEFAULT '',
	`phone_number` text DEFAULT '',
	`agent_status` text DEFAULT 'not_configured' NOT NULL,
	`agent_name` text DEFAULT 'Aria' NOT NULL,
	`agent_language` text DEFAULT 'en' NOT NULL,
	`agent_voice_id` text DEFAULT '21m00Tcm4TlvDq8ikWAM' NOT NULL,
	`agent_greeting` text DEFAULT '',
	`business_hours_start` text DEFAULT '09:00',
	`business_hours_end` text DEFAULT '18:00',
	`timezone` text DEFAULT 'Asia/Kolkata',
	`whitelabel_enabled` integer DEFAULT false,
	`whitelabel_brand` text DEFAULT '',
	`created_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_slug_unique` ON `tenants` (`slug`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`role` text DEFAULT 'tenant_admin' NOT NULL,
	`tenant_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
