/** @implements {import('../../domain/ports/animal-shapes-preference-repository.port.js').AnimalShapesPreferenceRepositoryPort} */
export class InMemoryAnimalShapesPreferenceRepositoryAdapter {
  constructor(preference = null) {
    this.preference = preference;
  }

  load() {
    return this.preference;
  }

  save(preference) {
    this.preference = preference;
  }
}
