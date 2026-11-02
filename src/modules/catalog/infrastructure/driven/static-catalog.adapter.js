import { Activity } from '../../domain/entities/activity.js';

/**
 * Reads the hand-written list in content/catalog.js. A broken entry is
 * skipped with a warning, so one mistake never takes the whole portal down.
 * Being in memory already, it is also the adapter the use-case tests run on.
 *
 * @implements {import('../../domain/ports/catalog.port.js').CatalogPort}
 */
export class StaticCatalogAdapter {
  constructor(entries, logger = console) {
    const seen = new Set();
    this.activities = [];
    for (const entry of entries) {
      try {
        const activity = new Activity(entry);
        if (seen.has(activity.id)) {
          logger.warn(`Atividade "${activity.id}" repetida no catálogo; ficou a primeira.`);
          continue;
        }
        seen.add(activity.id);
        this.activities.push(activity);
      } catch (error) {
        logger.warn(error.message);
      }
    }
  }

  all() {
    return this.activities;
  }
}
