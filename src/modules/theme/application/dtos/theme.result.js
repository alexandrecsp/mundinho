import { ThemePreference } from '../../domain/value-objects/theme-preference.js';

export function toThemeResult(preference, hour) {
  return {
    preference: preference.value,
    theme: preference.themeAt(hour),
    dayStartsAt: ThemePreference.DAY_STARTS_AT,
    nightStartsAt: ThemePreference.NIGHT_STARTS_AT,
  };
}
