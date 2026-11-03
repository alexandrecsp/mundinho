import { ColorWordsPreference } from '../../domain/value-objects/color-words-preference.js';
import { toColorWordsResult } from '../dtos/color-words.result.js';

export class SetColorWordsUseCase {
  /** @param {import('../../domain/ports/color-words-preference-repository.port.js').ColorWordsPreferenceRepositoryPort} repository */
  constructor(repository) {
    this.repository = repository;
  }

  /** @param {{ shown: boolean }} command */
  execute({ shown }) {
    const chosen = new ColorWordsPreference(shown);
    this.repository.save(chosen);
    return toColorWordsResult(chosen);
  }
}
