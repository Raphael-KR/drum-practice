#!/usr/bin/env node
// Run with the project's documented Node; shared TypeScript store needs no second database.
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { createScoreProjectStore } from "../../server/score-project-store.ts";
const root = fileURLToPath(new URL("../../", import.meta.url));
const store = createScoreProjectStore(root);
const [command, id, file] = process.argv.slice(2);
const input = async () => JSON.parse(await readFile(file, "utf8"));
try {
  let result;
  if (command === "list") result = await store.list();
  else if (command === "read" && id) result = await store.read(id);
  else if (command === "init" && id && file) {
    const value = await input();
    result = await store.save(
      id,
      {
        base: null,
        expectedDraft: null,
        record: value.record ?? value,
        editDraft: value.editDraft,
      },
      "producer",
    );
  } else if (command === "save" && id && file) {
    const value = await input();
    if (!value.base || !("expectedDraft" in value))
      throw Error(
        "save requires the previously read base and expectedDraft; refusing an implicit overwrite",
      );
    result = await store.save(id, value, "producer");
  } else if (command === "work" && id && file) {
    const value = await input();
    if (
      !["progress", "question", "answer"].includes(value.kind) ||
      typeof value.text !== "string" ||
      !value.text.trim()
    )
      throw Error("work requires kind=progress|question|answer and text");
    result = await store.appendWork(id, {
      ...value,
      id: randomUUID(),
      at: new Date().toISOString(),
      author: "producer",
    });
  } else
    throw Error(
      "Usage: node tools/score-production/score_project.mjs list | read <songId> | init <songId> <packed-record.json> | save <songId> <project-write.json> | work <songId> <entry.json>",
    );
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
} catch (error) {
  process.stderr.write(String(error) + "\n");
  process.exitCode = 1;
}
