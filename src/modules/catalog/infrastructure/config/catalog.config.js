import { ListActivitiesUseCase } from '../../application/use-cases/list-activities.use-case.js';
import { OpenActivityUseCase } from '../../application/use-cases/open-activity.use-case.js';
import { StaticCatalogAdapter } from '../driven/static-catalog.adapter.js';

export function createCatalogModule({ entries }) {
  const catalog = new StaticCatalogAdapter(entries);
  return {
    listActivities: new ListActivitiesUseCase(catalog),
    openActivity: new OpenActivityUseCase(catalog),
  };
}
