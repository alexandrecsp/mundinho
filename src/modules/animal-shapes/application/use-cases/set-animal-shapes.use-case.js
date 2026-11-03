import { AnimalShapesPreference } from '../../domain/value-objects/animal-shapes-preference.js';
import { toAnimalShapesResult } from '../dtos/animal-shapes.result.js';

export class SetAnimalShapesUseCase {
  /** @param {import('../../domain/ports/animal-shapes-preference-repository.port.js').AnimalShapesPreferenceRepositoryPort} repository */
  constructor(repository) {
    this.repository = repository;
  }

  /** @param {{ shown: boolean }} command */
  execute({ shown }) {
    const chosen = new AnimalShapesPreference(shown);
    this.repository.save(chosen);
    return toAnimalShapesResult(chosen);
  }
}
