import { describe, it, expect } from "vitest";
import ko from "../src/locales/ko.json";
import { t, formatDate, formatNumber, type MessageKey } from "../src/i18n";
import { execFileSync } from "node:child_process";
describe("Korean message catalog", () => {
  it("keeps replacement values literal and validates missing variables", () => {
    const key = Object.keys(ko).find((k) =>
      /\{/.test(ko[k as MessageKey]),
    ) as MessageKey;
    const names = [...ko[key].matchAll(/\{([\w$]+)\}/g)].map((m) => m[1]);
    const values = Object.fromEntries(
      names.map((n) => [n, "$& {untouched} <b>"]),
    );
    expect(t(key, values)).toContain("$& {untouched} <b>");
    expect(() => t(key)).toThrow("Missing translation value");
  });
  it("validates every message and interpolation call against source", () => {
    expect(
      execFileSync(process.execPath, ["scripts/check-i18n.mjs"], {
        encoding: "utf8",
      }),
    ).toContain('"unregisteredKoreanUI":0');
  });
  it("uses explicit locale and timezone without altering user content", () => {
    expect(formatNumber(1234.5)).toBe("1,234.5");
    expect(
      formatDate(new Date("2026-09-21T00:00:00Z"), {
        timeZone: "Asia/Seoul",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    ).toBe("09:00");
    expect(t("song.newTitle")).toBe("새 연습곡");
  });
});
