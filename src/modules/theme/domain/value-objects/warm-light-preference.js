import { ThemePreference } from './theme-preference.js';

const PREFERENCES = ['auto', 'on', 'off'];

/**
 * Whether an amber filter cuts the screen's blue light: always, never, or
 * `auto`, which turns it on at night, on the same hours as the dark theme.
 */
export class WarmLightPreference {
  constructor(value) {
    if (!PREFERENCES.includes(value)) throw new RangeError(`Luz quente inválida: ${value}. Use ${PREFERENCES.join(', ')}.`);
    this.value = value;
    Object.freeze(this);
  }

  /** Whether the filter is on at a local hour (0–23). */
  isOnAt(hour) {
    if (this.value !== 'auto') return this.value === 'on';
    return hour < ThemePreference.DAY_STARTS_AT || hour >= ThemePreference.NIGHT_STARTS_AT;
  }
}
