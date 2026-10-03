// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { showDialogFromButton } from "../src/dialog-transition";
function setup() {
  document.body.innerHTML =
    '<button id="opener">?</button><dialog><button class="close-button">close</button></dialog>';
  const d = document.querySelector("dialog")!;
  d.showModal = () => {
    d.open = true;
  };
  d.close = () => {
    d.open = false;
  };
  return { d, b: document.querySelector<HTMLButtonElement>("#opener")! };
}
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(document, "startViewTransition");
});
it("animates only the modal in both directions and restores styles", async () => {
  const { d, b } = setup();
  const animate = vi.fn();
  Object.defineProperty(document.documentElement, "animate", {
    configurable: true,
    value: animate,
  });
  const names: string[] = [];
  const start = vi.fn((update: () => void) => {
    names.push(d.style.viewTransitionName);
    expect(b.style.viewTransitionName).toBe("");
    update();
    names.push(d.style.viewTransitionName);
    expect(b.style.viewTransitionName).toBe("");
    return { ready: Promise.resolve(), finished: Promise.resolve() };
  });
  Object.defineProperty(document, "startViewTransition", {
    configurable: true,
    value: start,
  });
  showDialogFromButton(d, b);
  await Promise.resolve();
  expect(d.open).toBe(true);
  expect(animate).toHaveBeenCalledWith(
    expect.any(Array),
    expect.objectContaining({
      pseudoElement: "::view-transition-new(help-modal-morph)",
      duration: 320,
    }),
  );
  expect(b.style.viewTransitionName).toBe("");
  d.querySelector<HTMLButtonElement>("button")!.click();
  await Promise.resolve();
  expect(d.open).toBe(false);
  expect(names).toEqual(Array(4).fill("help-modal-morph"));
  expect(
    document.documentElement.classList.contains("help-modal-transition"),
  ).toBe(false);
});
it("uses an immediate change for reduced motion", () => {
  const { d, b } = setup();
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  showDialogFromButton(d, b);
  expect(d.open).toBe(true);
  d.dispatchEvent(new Event("cancel", { cancelable: true }));
  expect(d.open).toBe(false);
});
