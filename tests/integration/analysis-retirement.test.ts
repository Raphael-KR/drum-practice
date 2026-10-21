import { expect, it } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
it("retirement removes all analysis tables and leaves unrelated data intact", () => {
  const db = new DatabaseSync(":memory:");
  try {
    for (const name of [
      "0000_fluffy_hobgoblin.sql",
      "0001_whole_doctor_faustus.sql",
    ])
      db.exec(readFileSync("hosting/drizzle/" + name, "utf8"));
    db.exec(
      "CREATE TABLE unrelated (value TEXT); INSERT INTO unrelated VALUES ('keep'); INSERT INTO audio_analysis VALUES ('hash',4,'{}'); INSERT INTO audio_analysis_pending VALUES ('hash',4,'{}',2,1); INSERT INTO audio_analysis_limits VALUES ('daily',1,1)",
    );
    db.exec(readFileSync("hosting/drizzle/0002_regular_jetstream.sql", "utf8"));
    expect(
      db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'audio_analysis%'",
        )
        .all(),
    ).toEqual([]);
    expect(db.prepare("SELECT value FROM unrelated").get()).toEqual({
      value: "keep",
    });
  } finally {
    db.close();
  }
});
