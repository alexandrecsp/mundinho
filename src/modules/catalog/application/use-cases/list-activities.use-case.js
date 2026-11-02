import { toActivityResult } from '../dtos/activity.result.js';

export class ListActivitiesUseCase {
  /** @param {import('../../domain/ports/catalog.port.js').CatalogPort} catalog */
  constructor(catalog) {
    this.catalog = catalog;
  }

  execute() {
    const activities = this.catalog.all();
    const ofType = (type) => activities.filter((activity) => activity.type === type).map(toActivityResult);
    return { games: ofType('game'), videos: ofType('video') };
  }
}
