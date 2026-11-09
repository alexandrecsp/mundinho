import { ThemePreference } from '../../domain/value-objects/theme-preference.js';

/**
 * Keeps a choice in localStorage, and in memory for when the browser
 * blocks storage. Keeps the theme by default; pass `key` and `parse` to
 * keep another preference, such as the warm light.
 *
 * @implements {import('../../domain/ports/theme-preference-repository.port.js').ThemePreferenceRepositoryPort}
 * @implements {import('../../domain/ports/warm-light-preference-repository.port.js').WarmLightPreferenceRepositoryPort}
 */
export class LocalStorageThemePreferenceRepositoryAdapter {
  /**
   * @param {Storage | null} storage
   * @param {{ key?: string, parse?: (value: string) => { value: string } }} [options]
   */
  constructor(storage, { key = 'mundinho.theme', parse = (value) => new ThemePreference(value) } = {}) {
    this.storage = storage;
    this.key = key;
    this.parse = parse;
    this.latest = null;
  }

  load() {
    try {
      const saved = this.storage?.getItem(this.key);
      if (saved) return this.parse(saved);
    } catch {
      // Unreadable or unknown value: fall back to what this tab remembers.
    }
    return this.latest;
  }

  save(preference) {
    this.latest = preference;
    try {
      this.storage?.setItem(this.key, preference.value);
    } catch {
      // Storage blocked: the in-memory copy carries on.
    }
  }
}
