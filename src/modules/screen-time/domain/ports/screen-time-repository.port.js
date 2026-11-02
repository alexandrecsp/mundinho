/**
 * Keeps the latest screen-time record, whatever day it belongs to.
 *
 * @typedef {object} ScreenTimeRepositoryPort
 * @property {() => import('../entities/daily-screen-time.js').DailyScreenTime | null} load
 * @property {(record: import('../entities/daily-screen-time.js').DailyScreenTime) => void} save
 */
export {};
