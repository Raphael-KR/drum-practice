// @vitest-environment jsdom
import { expect, it } from "vitest";
import { renderKeepingTopHeader } from "../src/top-edge-header";

it("keeps the sampled header connected across library, playback and teardown", () => {
  const root = document.createElement("div");
  document.body.append(root);
  renderKeepingTopHeader(root, '<header class="library-header"><h1>Library</h1></header><main>List</main>');
  const header = root.firstElementChild!;
  const observer = new MutationObserver(() => {});
  observer.observe(root, { childList: true });
  renderKeepingTopHeader(root, '<header><button>Play</button></header><main>Score</main>');
  expect(root.firstElementChild).toBe(header);
  expect(header.hasAttribute("class")).toBe(false);
  expect(header.textContent).toBe("Play");
  renderKeepingTopHeader(root, "");
  expect(root.innerHTML).toBe("<header></header>");
  renderKeepingTopHeader(root, '<header class="library-header"><h1>Library</h1></header><main>List</main>');
  expect(root.firstElementChild).toBe(header);
  expect(header.isConnected).toBe(true);
  expect(observer.takeRecords().flatMap(r => Array.from(r.removedNodes))).not.toContain(header);
  observer.disconnect();
  root.remove();
});
