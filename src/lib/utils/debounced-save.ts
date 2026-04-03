/**
 * Creates a debounced save function with a module-scoped timer.
 * When called, cancels any pending save and schedules a new one
 * after `delay` ms of inactivity.
 */
export function createDebouncedSave(delay = 500) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function debouncedSave(saveFn: () => Promise<void>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(saveFn, delay);
  };
}
