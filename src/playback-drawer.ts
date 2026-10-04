import { t } from "./i18n";
import type { PlaybackBindings } from "./playback-ui";

type Panel = "loop" | "marker";
/** Existing forms and their listeners move intact into one shared drawer. */
export function mountPlaybackDrawer(root: HTMLElement, ids: PlaybackBindings & {mark: string; rewindButton: string}) {
  const get = (id: string) => root.querySelector<HTMLElement>(`#${id}`)!;
  const group = root.querySelector<HTMLElement>(".playback-group")!;
  const transport = root.querySelector<HTMLElement>(".transport")!;
  group.classList.add("playback-dock");
  root.classList.add("drawer-playback");
  const left = document.createElement("div"); left.className = "dock-navigation";
  const center = document.createElement("div"); center.className = "dock-play";
  const right = document.createElement("div"); right.className = "dock-repeat";
  const progress = get(ids.progress).closest("label") || get(ids.progress);
  left.append(get(ids.markers), progress);
  center.append(get("home"), get("play"));
  const rewind = get(ids.rewind);
  rewind.classList.add("transport-rewind-number");
  const rewindControls = document.createElement("div"); rewindControls.className = "dock-rewind";
  rewindControls.append(get(ids.rewindButton), rewind);
  center.append(rewindControls);
  right.append(get(ids.adjust), root.querySelector(".repeat-presets")!);
  const position = root.querySelector<HTMLElement>(`#${ids.position}`);
  transport.replaceChildren(left, center, right);
  get(ids.adjust).querySelector(".icon-caption")?.remove();
  root.querySelector(".repeat-controls")?.remove();
  const drawer = document.createElement("section");
  drawer.id = "playback-drawer"; drawer.className = "playback-drawer liquid-glass";
  drawer.setAttribute("aria-label", t("drawer.controls"));
  const panels = new Map<Panel, HTMLElement>();
  for (const name of ["loop", "marker"] as const) {
    const panel = document.createElement("div");
    panel.dataset.drawerPanel = name; panel.className = "drawer-panel";
    panel.hidden = false;
    panel.tabIndex = -1;
    const dialog = get(`${name}-dialog`);
    panel.append(...Array.from(dialog.children).filter(child => !child.classList.contains("dialoghead")));
    dialog.remove();
    if (name === "loop" && position) panel.append(position);
    panels.set(name, panel); drawer.append(panel);
  }
  group.append(drawer);
  const triggers = [get(ids.adjust)];
  group.dataset.drawerOpen = "true";
  for (const trigger of triggers) {
    trigger.removeAttribute("aria-haspopup");
    trigger.removeAttribute("aria-expanded");
    trigger.removeAttribute("aria-controls");
  }
  // Toolbar shortcuts focus their fixed controls; nothing opens or collapses.
  const show = (name: Panel, _toggle = true) => {
    const target = panels.get(name)!;
    target.focus({preventScroll:true});
  };
  return {show, dispose() {}};
}
