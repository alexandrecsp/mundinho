const RECHECK_MS = 60_000;

/**
 * Keeps the page on the right theme: sets <html data-theme>, re-reads the
 * clock every minute and whenever the tablet wakes, so `auto` turns dark
 * at night even mid-game, and tells subscribers when the theme changes.
 */
export function createThemeController({ getTheme, root = document.documentElement }) {
  const listeners = new Set();
  let current = null;

  function refresh() {
    const next = getTheme.execute();
    const changed = !current || next.theme !== current.theme || next.preference !== current.preference;
    current = next;
    if (!changed) return current;
    root.dataset.theme = current.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(root).getPropertyValue('--bg').trim());
    listeners.forEach((fn) => fn(current));
    return current;
  }

  refresh();
  setInterval(refresh, RECHECK_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refresh();
  });

  return {
    /** { preference, theme, dayStartsAt, nightStartsAt } */
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
