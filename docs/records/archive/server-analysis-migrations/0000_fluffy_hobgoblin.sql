CREATE TABLE `audio_analysis` (
	`sha256` text NOT NULL,
	`analyzer_version` integer NOT NULL,
	`result_json` text NOT NULL,
	PRIMARY KEY(`sha256`, `analyzer_version`)
);
