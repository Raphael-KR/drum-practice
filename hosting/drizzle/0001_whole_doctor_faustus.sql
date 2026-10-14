CREATE TABLE `audio_analysis_limits` (
	`bucket` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `limits_expiry` ON `audio_analysis_limits` (`expires_at`);--> statement-breakpoint
CREATE TABLE `audio_analysis_pending` (
	`sha256` text NOT NULL,
	`analyzer_version` integer NOT NULL,
	`result_json` text NOT NULL,
	`payload_bytes` integer NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`sha256`, `analyzer_version`)
);
--> statement-breakpoint
CREATE INDEX `pending_created_at` ON `audio_analysis_pending` (`created_at`);