import { randomBytes, createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { resolve, dirname } from "node:path";
export function reviewCredential(root: string) {
  const path = resolve(root, "data/runtime/analysis-review-token");
  mkdirSync(dirname(path), { recursive: true });
  try {
    writeFileSync(path, randomBytes(32).toString("hex"), {
      flag: "wx",
      mode: 0o600,
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
  }
  chmodSync(path, 0o600);
  const token = readFileSync(path, "utf8").trim();
  if (!/^[a-f0-9]{64}$/.test(token)) throw Error("Invalid review credential");
  return { token, hash: createHash("sha256").update(token).digest("hex") };
}
