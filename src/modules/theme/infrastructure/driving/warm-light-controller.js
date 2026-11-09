const RECHECK_MS = 60_000;

/**
 * Lays an amber layer over the whole page, games and videos included,
 * that multiplies away most of the blue light. Sets <html data-warm-light>,
 * re-reads the clock every minute and whenever the tablet wakes, so `auto`
 * turns on at night even mid-game, and tells subscribers when it changes.
 */
export function createWarmLightController({ getWarmLight, root = document.documentElement }) {
  const listeners = new Set();
  const layer = document.createElement('div');
  layer.className = 'warm-light';
  layer.setAttribute('aria-hidden', 'true');
  document.body.append(layer);
  let current = null;

  function refresh() {
    const next = getWarmLight.execute();
    const changed = !current || next.on !== current.on || next.preference !== current.preference;
    current = next;
    if (!changed) return current;
    root.dataset.warmLight = current.on ? 'on' : 'off';
    listeners.forEach((fn) => fn(current));
    return current;
  }

  refresh();
  setInterval(refresh, RECHECK_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refresh();
  });

  return {
    /** { preference, on, dayStartsAt, nightStartsAt } */
    get current() {
      return current;
    },
    refresh,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
