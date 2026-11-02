import { fromLocalStorageScreenTimeModel, toLocalStorageScreenTimeModel } from './dtos/local-storage-screen-time.model.js';

const KEY = 'mundinho.screen-time';

/**
 * Keeps the record in localStorage, and in memory too: when the browser
 * blocks storage (private mode, blocked site data) the limit still holds
 * for as long as the tab stays open.
 *
 * @implements {import('../../domain/ports/screen-time-repository.port.js').ScreenTimeRepositoryPort}
 */
export class LocalStorageScreenTimeRepositoryAdapter {
  /** @param {Storage | null} storage */
  constructor(storage) {
    this.storage = storage;
    this.latest = null;
  }

  load() {
    try {
      const raw = this.storage?.getItem(KEY);
      if (raw) return fromLocalStorageScreenTimeModel(JSON.parse(raw));
    } catch {
      // Unreadable or corrupt: fall back to what this tab remembers.
    }
    return this.latest;
  }

  save(record) {
    this.latest = record;
    try {
      this.storage?.setItem(KEY, JSON.stringify(toLocalStorageScreenTimeModel(record)));
    } catch {
      // Storage full or blocked: the in-memory copy carries on.
    }
  }
}
