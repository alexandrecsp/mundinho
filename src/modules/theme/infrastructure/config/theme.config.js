import { GetThemeUseCase } from '../../application/use-cases/get-theme.use-case.js';
import { SetThemePreferenceUseCase } from '../../application/use-cases/set-theme-preference.use-case.js';
import { LocalStorageThemePreferenceRepositoryAdapter } from '../driven/local-storage-theme-preference-repository.adapter.js';
import { SystemClockAdapter } from '../driven/system-clock.adapter.js';
import { createThemeController } from '../driving/theme-controller.js';

export function createThemeModule({ storage }) {
  const repository = new LocalStorageThemePreferenceRepositoryAdapter(storage);
  const clock = new SystemClockAdapter();
  const getTheme = new GetThemeUseCase(repository, clock);
  return {
    setThemePreference: new SetThemePreferenceUseCase(repository, clock),
    controller: createThemeController({ getTheme }),
  };
}
