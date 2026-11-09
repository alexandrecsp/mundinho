import { ThemePreference } from '../../domain/value-objects/theme-preference.js';

export function toWarmLightResult(preference, hour) {
  return {
    preference: preference.value,
    on: preference.isOnAt(hour),
    dayStartsAt: ThemePreference.DAY_STARTS_AT,
    nightStartsAt: ThemePreference.NIGHT_STARTS_AT,
  };
}
