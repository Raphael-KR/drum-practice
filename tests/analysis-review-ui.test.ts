// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { installAnalysisReview } from "../src/analysis-review-ui";
import { libraryHTML } from "../src/player-library-view";
const hash = "a".repeat(64),
  value = {
    analyzerVersion: 4,
    sha256: hash,
    title: "<img src=x>",
    artist: "가수",
    duration: 10,
    bpm: 120,
    firstBeat: 0.2,
    beats: 4,
    denominator: 4,
    confidence: 0.8,
  };
afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
it("shows review count only locally and preserves the remote failure warning after approval", async () => {
  expect(libraryHTML(false)).not.toContain('id="analysis-review"');
  expect(libraryHTML(true)).toContain('id="analysis-review"');
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  const fetch = vi.fn<typeof globalThis.fetch>(async (input) => {
    const path = String(input);
    return Response.json(
      path.includes("/summary")
        ? {
            csrf: "secret",
            remoteAvailable: false,
            rows: [{ ...value, source: "local" }],
          }
        : path.includes("/item")
          ? { value, revision: "revision" }
          : { cleanupPending: false },
    );
  });
  vi.stubGlobal("fetch", fetch);
  const button = document.createElement("button");
  document.body.append(button);
  await installAnalysisReview(button);
  expect(button.textContent).toContain("01건");
  expect(button.textContent).toContain("서버 확인 불가");
  button.click();
  await vi.waitFor(() =>
    expect(
      document.querySelector(".analysis-review-list button"),
    ).not.toBeNull(),
  );
  (
    document.querySelector(".analysis-review-list button") as HTMLButtonElement
  ).click();
  await vi.waitFor(() =>
    expect(
      document.querySelector(".analysis-review-form input"),
    ).not.toBeNull(),
  );
  expect(document.querySelector(".analysis-review-list img")).toBeNull();
  const approve = document.querySelector(
    ".analysis-review-form .primary",
  ) as HTMLButtonElement;
  expect(approve.disabled).toBe(true);
  const check = document.querySelector(
    "input[type=checkbox]",
  ) as HTMLInputElement;
  check.checked = true;
  check.dispatchEvent(new Event("change"));
  approve.click();
  await vi.waitFor(() => expect(button.textContent).toContain("00건"));
  expect(button.textContent).toContain("서버 확인 불가");
  const call = fetch.mock.calls.find((c) => String(c[0]).includes("/approve"))!;
  expect(JSON.parse(call[1]!.body as string)).toMatchObject({
    revision: "revision",
    reviewed: true,
    value,
  });
});
it("shows an unavailable state instead of an invented zero count", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  const button = document.createElement("button");
  await installAnalysisReview(button);
  expect(button.textContent).toBe("검토대기 확인 불가");
  expect(button.textContent).not.toContain("00");
});
