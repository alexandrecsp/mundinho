import { ColorWordsPreference } from '../../domain/value-objects/color-words-preference.js';

const KEY = 'mundinho.color-words';
const SAVED = { on: true, off: false };

/**
 * Keeps the choice in localStorage, and in memory for when the browser
 * blocks storage.
 *
 * @implements {import('../../domain/ports/color-words-preference-repository.port.js').ColorWordsPreferenceRepositoryPort}
 */
export class LocalStorageColorWordsPreferenceRepositoryAdapter {
  /** @param {Storage | null} storage */
  constructor(storage) {
    this.storage = storage;
    this.latest = null;
  }

  load() {
    try {
      const saved = this.storage?.getItem(KEY);
      if (Object.hasOwn(SAVED, saved ?? '')) return new ColorWordsPreference(SAVED[saved]);
    } catch {
      // Unreadable: fall back to what this tab remembers.
    }
    return this.latest;
  }

  save(preference) {
    this.latest = preference;
    try {
      this.storage?.setItem(KEY, preference.shown ? 'on' : 'off');
    } catch {
      // Storage blocked: the in-memory copy carries on.
    }
  }
}
