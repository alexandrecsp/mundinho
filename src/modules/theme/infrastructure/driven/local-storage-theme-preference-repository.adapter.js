import { ThemePreference } from '../../domain/value-objects/theme-preference.js';

const KEY = 'mundinho.theme';

/**
 * Keeps the choice in localStorage, and in memory for when the browser
 * blocks storage.
 *
 * @implements {import('../../domain/ports/theme-preference-repository.port.js').ThemePreferenceRepositoryPort}
 */
export class LocalStorageThemePreferenceRepositoryAdapter {
  /** @param {Storage | null} storage */
  constructor(storage) {
    this.storage = storage;
    this.latest = null;
  }

  load() {
    try {
      const saved = this.storage?.getItem(KEY);
      if (saved) return new ThemePreference(saved);
    } catch {
      // Unreadable or unknown value: fall back to what this tab remembers.
    }
    return this.latest;
  }

  save(preference) {
    this.latest = preference;
    try {
      this.storage?.setItem(KEY, preference.value);
    } catch {
      // Storage blocked: the in-memory copy carries on.
    }
  }
}
