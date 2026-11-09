import { GetThemeUseCase } from '../../application/use-cases/get-theme.use-case.js';
import { GetWarmLightUseCase } from '../../application/use-cases/get-warm-light.use-case.js';
import { SetThemePreferenceUseCase } from '../../application/use-cases/set-theme-preference.use-case.js';
import { SetWarmLightPreferenceUseCase } from '../../application/use-cases/set-warm-light-preference.use-case.js';
import { WarmLightPreference } from '../../domain/value-objects/warm-light-preference.js';
import { LocalStorageThemePreferenceRepositoryAdapter } from '../driven/local-storage-theme-preference-repository.adapter.js';
import { SystemClockAdapter } from '../driven/system-clock.adapter.js';
import { createThemeController } from '../driving/theme-controller.js';
import { createWarmLightController } from '../driving/warm-light-controller.js';

export function createThemeModule({ storage }) {
  const repository = new LocalStorageThemePreferenceRepositoryAdapter(storage);
  const warmLightRepository = new LocalStorageThemePreferenceRepositoryAdapter(storage, {
    key: 'mundinho.warmLight',
    parse: (value) => new WarmLightPreference(value),
  });
  const clock = new SystemClockAdapter();
  return {
    setThemePreference: new SetThemePreferenceUseCase(repository, clock),
    controller: createThemeController({ getTheme: new GetThemeUseCase(repository, clock) }),
    setWarmLightPreference: new SetWarmLightPreferenceUseCase(warmLightRepository, clock),
    warmLight: createWarmLightController({ getWarmLight: new GetWarmLightUseCase(warmLightRepository, clock) }),
  };
}
