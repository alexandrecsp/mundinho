/**
 * @implements {import('../../domain/ports/theme-preference-repository.port.js').ThemePreferenceRepositoryPort}
 * @implements {import('../../domain/ports/warm-light-preference-repository.port.js').WarmLightPreferenceRepositoryPort}
 */
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
