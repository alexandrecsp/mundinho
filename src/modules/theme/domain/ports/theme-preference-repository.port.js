/**
 * @typedef {object} ThemePreferenceRepositoryPort
 * @property {() => import('../value-objects/theme-preference.js').ThemePreference | null} load
 * @property {(preference: import('../value-objects/theme-preference.js').ThemePreference) => void} save
 */
export {};
