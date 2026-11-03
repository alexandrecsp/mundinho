import { AnimalShapesPreference } from '../../domain/value-objects/animal-shapes-preference.js';
import { toAnimalShapesResult } from '../dtos/animal-shapes.result.js';

export class GetAnimalShapesUseCase {
  /** @param {import('../../domain/ports/animal-shapes-preference-repository.port.js').AnimalShapesPreferenceRepositoryPort} repository */
  constructor(repository) {
    this.repository = repository;
  }

  /** Shown until the parents turn it off. */
  execute() {
    return toAnimalShapesResult(this.repository.load() ?? new AnimalShapesPreference(true));
  }
}
