/** @implements {import('../../domain/ports/color-words-preference-repository.port.js').ColorWordsPreferenceRepositoryPort} */
export class InMemoryColorWordsPreferenceRepositoryAdapter {
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
