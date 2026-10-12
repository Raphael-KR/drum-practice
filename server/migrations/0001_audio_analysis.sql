CREATE TABLE IF NOT EXISTS audio_analysis (
  sha256 TEXT NOT NULL,
  analyzer_version INTEGER NOT NULL,
  result_json TEXT NOT NULL,
  PRIMARY KEY (sha256, analyzer_version)
);
