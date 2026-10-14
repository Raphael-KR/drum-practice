// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { confirmDuplicateAudio } from "../src/audio-duplicate-dialog";
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function(this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function(this: HTMLDialogElement, value?: string) {
    this.returnValue = value ?? ""; this.open = false; this.dispatchEvent(new Event("close"));
  } });
});
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });
it("shows a literal filename and explicit Add/Cancel actions", async () => {
  const result = confirmDuplicateAudio('<img src=x>.mp3');
  const dialog = document.querySelector("dialog")!;
  expect(dialog.textContent).toContain('<img src=x>.mp3이미 내 음원 목록에 있습니다.\n중복으로 추가하시겠습니까?');
  expect(dialog.querySelector("p img")).toBeNull();
  expect(dialog.getAttribute("aria-label")).toBe("중복 추가");
  expect(dialog.querySelector("h2, .close-button")).toBeNull();
  expect([...dialog.querySelectorAll("button")].map(button => button.textContent)).toEqual(["추가", "취소"]);
  expect(document.activeElement).toBe(dialog);
  dialog.querySelector<HTMLButtonElement>('[data-answer="yes"]')!.click();
  expect(await result).toBe(true);
  expect(document.querySelector("dialog")).toBeNull();
});
it("cancels without adding", async () => {
  const result = confirmDuplicateAudio("song.mp3");
  document.querySelector<HTMLButtonElement>('[data-answer="no"]')!.click();
  expect(await result).toBe(false);
});
it("treats Escape's native close as cancellation", async () => {
  const result = confirmDuplicateAudio("song.mp3");
  document.querySelector<HTMLDialogElement>("dialog")!.close();
  expect(await result).toBe(false);
});
