export interface NumericDragOptions {
  /** Called once when a gesture becomes a drag, before its first preview. */
  onStart?: (value: number) => void;
  onPreview?: (value: number) => void;
  /** Receives every completed drag (even at a bound), keyboard steps and typed changes. */
  onCommit?: (value: number) => void;
  onTap?: (event: MouseEvent) => void;
  onCancel?: (value: number) => void;
  pixelsPerStep?: number;
  allowedValues?: readonly number[];
  wheel?: boolean;
  threshold?: number;
}

type Drag = {
  pointerId: number;
  x: number;
  y: number;
  original: string;
  value: number;
  axis: 'x' | 'y' | null;
};

const bindings = new WeakMap<HTMLInputElement, () => void>();
const installations = new WeakMap<Document | HTMLElement, () => void>();

function numericAttribute(input: HTMLInputElement, name: string): number | undefined {
  const value = input.getAttribute(name);
  if (value === null || value.trim() === '') return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function readValue(input: HTMLInputElement): number {
  const number = input.value.trim() === '' ? NaN : Number(input.value);
  return Number.isFinite(number) ? number : (numericAttribute(input, 'min') ?? 0);
}

function stepValue(input: HTMLInputElement, origin: number, steps: number, allowed?: readonly number[]): number {
  if (allowed?.length) {
    const nearest = allowed.reduce((best, value, index) => Math.abs(value-origin) < Math.abs(allowed[best]-origin) ? index : best, 0);
    return allowed[Math.max(0, Math.min(allowed.length-1, nearest+steps))];
  }
  const configuredStep = numericAttribute(input, 'step');
  const step = configuredStep !== undefined && configuredStep > 0 ? configuredStep : 1;
  const min = numericAttribute(input, 'min');
  const max = numericAttribute(input, 'max');
  const base = min ?? 0;
  const minIndex = min === undefined ? -Infinity : Math.ceil((min - base) / step - 1e-9);
  const maxIndex = max === undefined ? Infinity : Math.floor((max - base) / step + 1e-9);
  const index = Math.max(minIndex, Math.min(maxIndex, Math.round((origin + steps * step - base) / step)));
  const value = base + index * step;
  // Avoid values such as 0.30000000000000004 in both the field and its events.
  return Number(Math.max(min ?? -Infinity, Math.min(max ?? Infinity, value)).toFixed(10));
}

/**
 * Adds a two-axis numeric scrubber without removing direct numeric entry.
 * Drags emit input previews and one change on release; cancellation restores the
 * exact original text. Explicit bindings can replace an automatic binding.
 */
export function bindNumericDrag(input: HTMLInputElement, options: NumericDragOptions = {}): () => void {
  bindings.get(input)?.();
  const window = input.ownerDocument.defaultView!;
  // A document can be torn down before its queued mutation observer runs. Keep
  // the native methods needed to release listeners, independent of Window slots.
  const addWindowListener = window.addEventListener.bind(window);
  const removeWindowListener = window.removeEventListener.bind(window);
  const InputEvent = window.Event;
  const oldTouchAction = input.style.touchAction;
  const oldBound = input.getAttribute('data-numeric-drag-bound');
  const oldDragging = input.getAttribute('data-numeric-dragging');
  input.style.touchAction = 'none';
  input.setAttribute('data-numeric-drag-bound', 'true');
  const pixelsPerStep = Math.max(1, options.pixelsPerStep ?? 8);
  const threshold = Math.max(1, options.threshold ?? 6);
  let drag: Drag | null = null;
  let suppressClickUntil = 0;
  let disposed = false;
  const cancelledPointers = new Set<number>();

  const emit = (name: 'input' | 'change') => {
    input.dispatchEvent(new InputEvent(name, { bubbles: true }));
  };
  const preview = (value: number) => {
    if (input.value === String(value)) return;
    input.value = String(value);
    emit('input');
    options.onPreview?.(value);
  };
  const clearDragging = () => {
    if (oldDragging === null) input.removeAttribute('data-numeric-dragging');
    else input.setAttribute('data-numeric-dragging', oldDragging);
  };
  const cancel = () => {
    const current = drag;
    drag = null;
    clearDragging();
    if (!current?.axis) return;
    suppressClickUntil = Date.now() + 500;
    if (input.value !== current.original) {
      input.value = current.original;
      emit('input');
    }
    options.onCancel?.(current.value);
  };
  const pointerDown = (event: PointerEvent) => {
    if (cancelledPointers.size) return;
    if (input.disabled || event.button !== 0 || event.isPrimary === false) return;
    if (drag) { cancel(); return; }
    suppressClickUntil = 0;
    drag = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      original: input.value,
      value: readValue(input),
      axis: null,
    };
  };
  const otherPointerDown = (event: PointerEvent) => {
    if (cancelledPointers.size) { cancelledPointers.add(event.pointerId); return; }
    if (!drag || event.pointerId === drag.pointerId) return;
    cancelledPointers.add(drag.pointerId);
    cancelledPointers.add(event.pointerId);
    cancel();
    // A two-finger gesture is neither a numeric edit nor an activation tap.
    suppressClickUntil = Date.now() + 500;
  };
  const pointerMove = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (input.disabled) { cancel(); return; }
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.axis) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return;
      drag.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
      input.setAttribute('data-numeric-dragging', 'true');
      options.onStart?.(drag.value);
    }
    event.preventDefault();
    // Both directions stay active throughout the gesture, including turns.
    const distance = dx - dy;
    preview(stepValue(input, drag.value, Math.round(distance / pixelsPerStep), options.allowedValues));
  };
  const pointerUp = (event: PointerEvent) => {
    if (cancelledPointers.delete(event.pointerId)) {
      suppressClickUntil = Date.now() + 500;
      return;
    }
    if (!drag || event.pointerId !== drag.pointerId) return;
    const current = drag;
    drag = null;
    clearDragging();
    if (!current.axis) return;
    event.preventDefault();
    suppressClickUntil = Date.now() + 500;
    if (input.value !== current.original) emit('change');
    else options.onCommit?.(readValue(input));
  };
  const pointerCancel = (event: PointerEvent) => {
    cancelledPointers.delete(event.pointerId);
    if (event.pointerId === drag?.pointerId) cancel();
  };
  const click = (event: MouseEvent) => {
    if (Date.now() < suppressClickUntil) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (!input.disabled) options.onTap?.(event);
  };
  const change = () => {
    if (input.value.trim() !== '' && Number.isFinite(Number(input.value))) {
      options.onCommit?.(Number(input.value));
    }
  };
  const keyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && drag) { event.preventDefault(); cancel(); return; }
    if (input.disabled || event.altKey || event.ctrlKey || event.metaKey) return;
    if (options.onTap && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      event.stopPropagation();
      if (!event.repeat) {
        suppressClickUntil = 0;
        input.click();
      }
      return;
    }
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowUp' ? 1
      : event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    const previous = readValue(input);
    const value = stepValue(input, previous, direction, options.allowedValues);
    if (value === previous) return;
    options.onStart?.(previous);
    preview(value);
    emit('change');
  };
  const wheel = (event: WheelEvent) => {
    if (!options.wheel || input.disabled || input.readOnly || event.ctrlKey || event.metaKey || drag) return;
    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? -event.deltaY : event.deltaX;
    if (!delta) return;
    event.preventDefault();
    const previous = readValue(input);
    const value = stepValue(input, previous, Math.sign(delta), options.allowedValues);
    if (value === previous) return;
    options.onStart?.(previous);
    preview(value);
    emit('change');
  };
  input.addEventListener('wheel', wheel, { passive: false });
  input.addEventListener('pointerdown', pointerDown);
  input.addEventListener('click', click, true);
  input.addEventListener('change', change);
  input.addEventListener('keydown', keyDown);
  addWindowListener('pointerdown', otherPointerDown, true);
  addWindowListener('pointermove', pointerMove, { passive: false });
  addWindowListener('pointerup', pointerUp, { passive: false });
  addWindowListener('pointercancel', pointerCancel);
  addWindowListener('blur', cancel);

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    cancel();
    input.style.touchAction = oldTouchAction;
    if (oldBound === null) input.removeAttribute('data-numeric-drag-bound');
    else input.setAttribute('data-numeric-drag-bound', oldBound);
    input.removeEventListener('wheel', wheel);
    input.removeEventListener('pointerdown', pointerDown);
    input.removeEventListener('click', click, true);
    input.removeEventListener('change', change);
    input.removeEventListener('keydown', keyDown);
    removeWindowListener('pointerdown', otherPointerDown, true);
    removeWindowListener('pointermove', pointerMove);
    removeWindowListener('pointerup', pointerUp);
    removeWindowListener('pointercancel', pointerCancel);
    removeWindowListener('blur', cancel);
    if (bindings.get(input) === cleanup) bindings.delete(input);
  };
  bindings.set(input, cleanup);
  return cleanup;
}

/** Bind current and newly inserted numeric inputs; explicit callbacks take priority. */
export function installNumericInputs(root: Document | HTMLElement = document): () => void {
  installations.get(root)?.();
  const owned = new Map<HTMLInputElement, () => void>();
  const selector = 'input[type="number"], input[data-numeric-drag]';
  let disposed = false;
  const refresh = () => {
    if (disposed) return;
    for (const [input, cleanup] of owned) {
      if (!root.contains(input) || input.dataset.numericDrag === 'off' || !input.matches(selector)) {
        cleanup();
        owned.delete(input);
      }
    }
    const candidates = [...root.querySelectorAll<HTMLInputElement>(selector)];
    if (root.nodeName === 'INPUT' && (root as HTMLInputElement).matches(selector)) candidates.unshift(root as HTMLInputElement);
    for (const input of candidates) {
      if (input.dataset.numericDrag === 'off' || bindings.has(input)) continue;
      owned.set(input, bindNumericDrag(input));
    }
  };
  const window = (root.nodeType === 9 ? root as Document : root.ownerDocument!).defaultView!;
  const removeWindowListener = window.removeEventListener.bind(window);
  const observer = new window.MutationObserver(refresh);
  refresh();
  observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['type', 'data-numeric-drag'] });
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    observer.disconnect();
    for (const cleanup of owned.values()) cleanup();
    owned.clear();
    removeWindowListener('pagehide', pageHide);
    if (installations.get(root) === cleanup) installations.delete(root);
  };
  const pageHide = (event: PageTransitionEvent) => {
    if (!event.persisted) cleanup();
  };
  window.addEventListener('pagehide', pageHide);
  installations.set(root, cleanup);
  return cleanup;
}

/** Dispose an installed root during application/test teardown or HMR. */
export function disposeNumericInputs(root: Document | HTMLElement = document): void {
  installations.get(root)?.();
}
