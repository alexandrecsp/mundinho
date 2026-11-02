import { ThemePreference } from '../../domain/value-objects/theme-preference.js';
import { toThemeResult } from '../dtos/theme.result.js';

export class GetThemeUseCase {
  /**
   * @param {import('../../domain/ports/theme-preference-repository.port.js').ThemePreferenceRepositoryPort} repository
   * @param {import('../../domain/ports/clock.port.js').ClockPort} clock
   */
  constructor(repository, clock) {
    this.repository = repository;
    this.clock = clock;
  }

  execute() {
    return toThemeResult(this.repository.load() ?? new ThemePreference('auto'), this.clock.hour());
  }
}
