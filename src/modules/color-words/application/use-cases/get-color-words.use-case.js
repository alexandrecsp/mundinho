import { ColorWordsPreference } from '../../domain/value-objects/color-words-preference.js';
import { toColorWordsResult } from '../dtos/color-words.result.js';

export class GetColorWordsUseCase {
  /** @param {import('../../domain/ports/color-words-preference-repository.port.js').ColorWordsPreferenceRepositoryPort} repository */
  constructor(repository) {
    this.repository = repository;
  }

  /** Shown until the parents turn it off. */
  execute() {
    return toColorWordsResult(this.repository.load() ?? new ColorWordsPreference(true));
  }
}
