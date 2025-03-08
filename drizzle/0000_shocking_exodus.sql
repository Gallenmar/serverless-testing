CREATE TABLE `counters` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`count` integer NOT NULL,
	`description` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
