import { WarmLightPreference } from '../../domain/value-objects/warm-light-preference.js';
import { toWarmLightResult } from '../dtos/warm-light.result.js';

export class GetWarmLightUseCase {
  /**
   * @param {import('../../domain/ports/warm-light-preference-repository.port.js').WarmLightPreferenceRepositoryPort} repository
   * @param {import('../../domain/ports/clock.port.js').ClockPort} clock
   */
  constructor(repository, clock) {
    this.repository = repository;
    this.clock = clock;
  }

  execute() {
    return toWarmLightResult(this.repository.load() ?? new WarmLightPreference('auto'), this.clock.hour());
  }
}
