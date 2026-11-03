import { GetColorWordsUseCase } from '../../application/use-cases/get-color-words.use-case.js';
import { SetColorWordsUseCase } from '../../application/use-cases/set-color-words.use-case.js';
import { LocalStorageColorWordsPreferenceRepositoryAdapter } from '../driven/local-storage-color-words-preference-repository.adapter.js';

export function createColorWordsModule({ storage }) {
  const repository = new LocalStorageColorWordsPreferenceRepositoryAdapter(storage);
  return {
    getColorWords: new GetColorWordsUseCase(repository),
    setColorWords: new SetColorWordsUseCase(repository),
  };
}
