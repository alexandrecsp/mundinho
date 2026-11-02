import { ThemePreference } from '../../domain/value-objects/theme-preference.js';
import { toThemeResult } from '../dtos/theme.result.js';

export class SetThemePreferenceUseCase {
  /**
   * @param {import('../../domain/ports/theme-preference-repository.port.js').ThemePreferenceRepositoryPort} repository
   * @param {import('../../domain/ports/clock.port.js').ClockPort} clock
   */
  constructor(repository, clock) {
    this.repository = repository;
    this.clock = clock;
  }

  /** @param {{ preference: 'auto' | 'light' | 'dark' }} command */
  execute({ preference }) {
    const chosen = new ThemePreference(preference);
    this.repository.save(chosen);
    return toThemeResult(chosen, this.clock.hour());
  }
}
