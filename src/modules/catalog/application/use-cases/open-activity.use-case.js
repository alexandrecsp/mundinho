import { ActivityNotFoundError } from '../../domain/errors/activity-not-found.error.js';
import { toPlayableResult } from '../dtos/activity.result.js';

export class OpenActivityUseCase {
  /** @param {import('../../domain/ports/catalog.port.js').CatalogPort} catalog */
  constructor(catalog) {
    this.catalog = catalog;
  }

  execute({ id }) {
    const activity = this.catalog.all().find((candidate) => candidate.id === id);
    if (!activity) throw new ActivityNotFoundError(id);
    return toPlayableResult(activity);
  }
}
