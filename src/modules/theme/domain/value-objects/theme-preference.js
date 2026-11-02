const PREFERENCES = ['auto', 'light', 'dark'];

/**
 * What the parents chose: always light, always dark, or `auto`, which is
 * light by day and dark at night, so the screen dims for bedtime.
 */
export class ThemePreference {
  static DAY_STARTS_AT = 7;
  static NIGHT_STARTS_AT = 18;

  constructor(value) {
    if (!PREFERENCES.includes(value)) throw new RangeError(`Tema inválido: ${value}. Use ${PREFERENCES.join(', ')}.`);
    this.value = value;
    Object.freeze(this);
  }

  /** The theme to show at a local hour (0–23). */
  themeAt(hour) {
    if (this.value !== 'auto') return this.value;
    return hour >= ThemePreference.DAY_STARTS_AT && hour < ThemePreference.NIGHT_STARTS_AT ? 'light' : 'dark';
  }
}
