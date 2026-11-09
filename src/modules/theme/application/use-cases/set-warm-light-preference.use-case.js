import { WarmLightPreference } from '../../domain/value-objects/warm-light-preference.js';
import { toWarmLightResult } from '../dtos/warm-light.result.js';

export class SetWarmLightPreferenceUseCase {
  /**
   * @param {import('../../domain/ports/warm-light-preference-repository.port.js').WarmLightPreferenceRepositoryPort} repository
   * @param {import('../../domain/ports/clock.port.js').ClockPort} clock
   */
  constructor(repository, clock) {
    this.repository = repository;
    this.clock = clock;
  }

  /** @param {{ preference: 'auto' | 'on' | 'off' }} command */
  execute({ preference }) {
    const chosen = new WarmLightPreference(preference);
    this.repository.save(chosen);
    return toWarmLightResult(chosen, this.clock.hour());
  }
}
