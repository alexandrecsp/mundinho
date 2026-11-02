/** @implements {import('../../domain/ports/theme-preference-repository.port.js').ThemePreferenceRepositoryPort} */
export class InMemoryThemePreferenceRepositoryAdapter {
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
