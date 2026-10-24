import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

/** Include pending source additions, but never ignored media, caches or checkouts. */
export function projectFiles() {
  return [
    ...new Set(
      execFileSync(
        "git",
        ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
        { encoding: "utf8" },
      )
        .split("\0")
        .filter(Boolean),
    ),
  ]
    .filter((file) => existsSync(file))
    .sort();
}
