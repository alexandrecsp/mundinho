import { GetAnimalShapesUseCase } from '../../application/use-cases/get-animal-shapes.use-case.js';
import { SetAnimalShapesUseCase } from '../../application/use-cases/set-animal-shapes.use-case.js';
import { LocalStorageAnimalShapesPreferenceRepositoryAdapter } from '../driven/local-storage-animal-shapes-preference-repository.adapter.js';

export function createAnimalShapesModule({ storage }) {
  const repository = new LocalStorageAnimalShapesPreferenceRepositoryAdapter(storage);
  return {
    getAnimalShapes: new GetAnimalShapesUseCase(repository),
    setAnimalShapes: new SetAnimalShapesUseCase(repository),
  };
}
