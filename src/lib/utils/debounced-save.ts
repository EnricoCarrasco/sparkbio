/**
 * Creates a debounced save handle.
 *
 * - `schedule(fn)` cancels any pending save and schedules `fn` after `delay` ms
 *   of inactivity. The latest scheduled fn wins — earlier scheduled fns are
 *   discarded. Reads fresh state when it fires.
 * - `flush()` fires the pending save immediately (if any) and returns its
 *   promise. Safe to call when nothing is pending.
 *
 * Use `flush()` on unmount and `pagehide` so rapid edits don't get dropped
 * when the user navigates away inside the debounce window.
 */
export function createDebouncedSave(delay = 500) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: (() => Promise<void>) | null = null;

  return {
    schedule(saveFn: () => Promise<void>) {
      pending = saveFn;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        const fn = pending;
        pending = null;
        if (fn) void fn();
      }, delay);
    },
    flush(): Promise<void> {
      if (!timer || !pending) return Promise.resolve();
      clearTimeout(timer);
      timer = null;
      const fn = pending;
      pending = null;
      return fn();
    },
  };
}
