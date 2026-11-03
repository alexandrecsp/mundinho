import { AnimalShapesPreference } from '../../domain/value-objects/animal-shapes-preference.js';

const KEY = 'mundinho.animal-shapes';
const SAVED = { on: true, off: false };

/**
 * Keeps the choice in localStorage, and in memory for when the browser
 * blocks storage.
 *
 * @implements {import('../../domain/ports/animal-shapes-preference-repository.port.js').AnimalShapesPreferenceRepositoryPort}
 */
export class LocalStorageAnimalShapesPreferenceRepositoryAdapter {
  /** @param {Storage | null} storage */
  constructor(storage) {
    this.storage = storage;
    this.latest = null;
  }

  load() {
    try {
      const saved = this.storage?.getItem(KEY);
      if (Object.hasOwn(SAVED, saved ?? '')) return new AnimalShapesPreference(SAVED[saved]);
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
