// @vitest-environment jsdom
import { it, expect, vi, beforeEach, afterEach } from "vitest";
import { installHelp } from "../../src/modules/help/help";
import { createDialog } from "../../src/shared/ui/dialog-ui";
beforeEach(() => {
  document.body.innerHTML =
    '<main id="app"><header><div class="actions"></div></header><main class="library-main"><button id="import-package">음원 불러오기</button><button data-open>열기</button><button data-remove>삭제</button></main></main>';
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 100,
    y: 100,
    left: 100,
    top: 100,
    right: 200,
    bottom: 144,
    width: 100,
    height: 44,
    toJSON: () => ({}),
  } as DOMRect);
  HTMLElement.prototype.showPopover = function () {
    this.dataset.popoverOpen = "true";
  };
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
  installHelp(document.querySelector("#app")!);
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
const guide = () => document.querySelector<HTMLElement>("#app-help-dialog")!;
const open = () =>
  document.querySelector<HTMLButtonElement>("#app-help-button")!.click();
const close = () =>
  guide().querySelector<HTMLButtonElement>(".close-button")!.click();
const pointer = (target: Element, type: string, x = 0) => {
  const e = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    clientX: x,
  });
  Object.defineProperties(e, {
    pointerId: { value: 1 },
    isPrimary: { value: true },
    pointerType: { value: "touch" },
  });
  target.dispatchEvent(e);
};
it("has one bottom instruction and no pages; common close stays at the help opener", () => {
  open();
  expect(guide().querySelector("h2")).toBeNull();
  expect(guide().querySelector(".help-pages")).toBeNull();
  expect(guide().textContent).toContain("길게 누르고 있으면");
  expect(
    guide().querySelector(".close-button[data-common-icon]"),
  ).not.toBeNull();
  expect(guide().querySelector<HTMLElement>(".dialoghead")!.style.left).toBe(
    "100px",
  );
  close();
});
it("focus moves one bubble between real controls without activation", () => {
  const first = document.querySelector<HTMLButtonElement>("#import-package")!,
    second = document.querySelector<HTMLButtonElement>("[data-remove]")!;
  const action = vi.fn();
  second.onclick = action;
  open();
  first.focus();
  expect(guide().textContent).toContain("기기의 음원을 추가");
  second.focus();
  second.click();
  expect(action).not.toHaveBeenCalled();
  expect(guide().querySelectorAll(".help-bubble:not([hidden])")).toHaveLength(
    1,
  );
  expect(guide().textContent).toContain("원본 파일은 유지");
  expect(guide().textContent).not.toContain("기기의 음원을 추가");
  expect(first.hasAttribute("aria-describedby")).toBe(false);
  close();
  expect(second.hasAttribute("aria-describedby")).toBe(false);
  expect(document.activeElement?.id).toBe("app-help-button");
  second.click();
  expect(action).toHaveBeenCalledOnce();
});
it("keeps only the common close in ordinary modals and restores main help after closing", async () => {
  const modal = createDialog("audio-practice-setup", "조정", "audio-setup");
  modal.showModal(); await Promise.resolve();
  const help = document.querySelector<HTMLButtonElement>("#app-help-button")!;
  const closeButton = modal.querySelector<HTMLButtonElement>(".close-button[data-common-icon]")!;
  closeButton.focus();
  await Promise.resolve();
  expect(document.activeElement).toBe(closeButton);
  expect(modal.querySelector("#app-help-button")).toBeNull();
  expect(help.hidden).toBe(true);
  open(); expect(guide()).toBeNull();
  closeButton.click(); await Promise.resolve();
  expect(modal.open).toBe(false);
  expect(help.hidden).toBe(false);
});
it.each(["audio-duplicate-dialog", "discard-changes-dialog", "edit-exit-dialog"])("keeps help out of %s and its underlying modal while preserving held explanations", async (id) => {
  vi.useFakeTimers();
  const modal = document.createElement("dialog");
  modal.id = "settings-dialog";
  modal.innerHTML = '<div class="dialoghead"></div>';
  document.body.append(modal); modal.showModal(); await Promise.resolve();
  const popup = document.createElement("dialog");
  popup.id = id;
  if (id === "audio-duplicate-dialog") popup.className = "confirmation-dialog";
  popup.innerHTML = '<button title="수정한 내용을 유지합니다.">계속 수정</button>';
  modal.append(popup); popup.showModal(); await Promise.resolve();
  const help = document.querySelector<HTMLButtonElement>("#app-help-button")!;
  expect(help.hidden).toBe(true);
  expect(popup.querySelector("#app-help-button")).toBeNull();
  open(); expect(guide()).toBeNull();
  const target = popup.querySelector<HTMLButtonElement>("button")!;
  pointer(target,"pointerdown"); vi.advanceTimersByTime(650);
  expect(popup.querySelector("#control-hold-help")!.textContent).toContain("수정한 내용을 유지합니다.");
  pointer(target,"pointerup"); expect(popup.querySelector("#control-hold-help")).toBeNull();
  popup.close(); popup.remove(); await Promise.resolve();
  expect(help.hidden).toBe(true);
  expect(modal.querySelector("#app-help-button")).toBeNull();
  modal.close(); await Promise.resolve();
  expect(help.hidden).toBe(false);
});
it("keeps detailed backup advice on held popup controls", async () => {
  vi.useFakeTimers();
  const modal = document.createElement("dialog"); modal.id = "settings-dialog";
  modal.innerHTML = '<div class="dialoghead"></div><button data-practice-save>백업</button><button data-practice-load>복원</button>';
  document.querySelector("#app")!.append(modal); modal.showModal(); await Promise.resolve();
  const save=modal.querySelector<HTMLButtonElement>("[data-practice-save]")!;
  pointer(save,"pointerdown"); vi.advanceTimersByTime(650);
  expect(modal.querySelector("#control-hold-help")!.textContent).toContain("사이트 데이터를 지우면");
  pointer(save,"pointerup");
  const load=modal.querySelector<HTMLButtonElement>("[data-practice-load]")!;
  pointer(load,"pointerdown"); vi.advanceTimersByTime(650);
  expect(modal.querySelector("#control-hold-help")!.textContent).toContain("재분석 없이");
  pointer(load,"pointerup");
});
it("supports unlisted and dynamically created buttons using their accessible explanation", () => {
  const target = document.createElement("button");
  target.ariaLabel = "새로고침";
  target.title = "최신 목록을 다시 읽습니다.";
  document.querySelector("#app")!.append(target);
  open();
  target.focus();
  expect(guide().textContent).toContain(target.title);
  close();
});
it("shows a hint only while held and prevents the release click", () => {
  vi.useFakeTimers();
  const target = document.querySelector<HTMLButtonElement>("[data-remove]")!,
    action = vi.fn();
  target.onclick = action;
  document.querySelector<HTMLButtonElement>("#import-package")!.focus();
  pointer(target, "pointerdown");
  target.focus();
  vi.advanceTimersByTime(649);
  expect(document.querySelector("#control-hold-help")).toBeNull();
  vi.advanceTimersByTime(1);
  expect(document.querySelector("#control-hold-help")!.textContent).toContain(
    "원본 파일은 유지",
  );
  pointer(target, "pointerup");
  expect(document.querySelector("#control-hold-help")).toBeNull();
  target.click();
  expect(action).not.toHaveBeenCalled();
  pointer(target, "pointerdown");
  pointer(target, "pointerup");
  target.click();
  expect(action).toHaveBeenCalledOnce();
});
it("moving, cancelling and scrolling prevent accidental hold hints", () => {
  vi.useFakeTimers();
  const target = document.querySelector<HTMLButtonElement>("[data-open]")!;
  for (const cancel of [
    () => pointer(target, "pointermove", 20),
    () => pointer(target, "pointercancel"),
    () => window.dispatchEvent(new Event("scroll")),
  ]) {
    pointer(target, "pointerdown");
    cancel();
    vi.advanceTimersByTime(800);
    expect(document.querySelector("#control-hold-help")).toBeNull();
  }
  pointer(target, "pointerdown");
  vi.advanceTimersByTime(650);
  expect(document.querySelector("#control-hold-help")).not.toBeNull();
  window.dispatchEvent(new Event("blur"));
  expect(document.querySelector("#control-hold-help")).toBeNull();
});
it("opens approved drum symbols and returns to the same guide", () => {
  open();
  const surface = guide(),
    button = surface.querySelector<HTMLButtonElement>(".help-legend-button")!;
  button.click();
  const legend =
    document.querySelector<HTMLDialogElement>("#app-legend-dialog")!;
  expect(legend.querySelectorAll("dt")).toHaveLength(27);
  expect(legend.querySelectorAll(".help-legend svg")).toHaveLength(2);
  expect(legend.querySelector("h2")).toBeNull();
  expect(legend.querySelector(".close-button")).not.toBeNull();
  expect(legend.textContent).toContain("크로스 스틱");
  legend.querySelector<HTMLButtonElement>(".close-button")!.click();
  expect(guide()).toBe(surface);
  expect(document.activeElement).toBe(button);
  close();
});
it("blocks keyboard actions on real controls in help mode but permits Tab", () => {
  open();
  const target = document.querySelector<HTMLButtonElement>("[data-open]")!;
  target.focus();
  for (const key of ["Enter", " ", "ArrowRight", "m"]) {
    const e = new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
  }
  const tab = new KeyboardEvent("keydown", {
    key: "Tab",
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(tab);
  expect(tab.defaultPrevented).toBe(false);
  close();
});

it("keeps common close and backdrop dismissal on the same guarded cancellation path", async () => {
  const modal = createDialog("settings-dialog", "설정", "");
  modal.showModal();
  await Promise.resolve();
  expect(modal.classList.contains("backdrop-dismissible")).toBe(true);
  const cancel = vi.fn((e: Event) => e.preventDefault());
  modal.addEventListener("cancel", cancel);
  const tapOutside = () => {
    pointer(modal, "pointerdown");
    modal.dispatchEvent(
      new MouseEvent("click", {
        clientX: 0,
        clientY: 0,
        bubbles: true,
        cancelable: true,
      }),
    );
  };
  open();
  expect(guide()).toBeNull();
  modal.querySelector<HTMLButtonElement>(".close-button")!.click();
  expect(cancel).toHaveBeenCalledOnce();
  expect(modal.open).toBe(true);
  tapOutside();
  expect(cancel).toHaveBeenCalledTimes(2);
  expect(modal.open).toBe(true);
  modal.removeEventListener("cancel", cancel);
  pointer(modal.querySelector("button")!, "pointerdown");
  modal.dispatchEvent(
    new MouseEvent("click", { clientX: 0, clientY: 0, bubbles: true }),
  );
  expect(modal.open).toBe(true);
  tapOutside();
  expect(modal.open).toBe(false);
  modal.remove();
  await Promise.resolve();
  expect(
    document.querySelector("header .actions #app-help-button"),
  ).not.toBeNull();
});
