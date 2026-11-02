import { InvalidActivityError } from '../errors/invalid-activity.error.js';

const TYPES = ['game', 'video'];
const VIDEO_KINDS = ['animation', 'file', 'youtube'];

/**
 * One thing the portal offers: a game or a video.
 *
 * - A game is always `interactive`: a module the player mounts on a stage.
 * - A video is an `animation` (a module, like a game the baby only watches),
 *   a `file` (an .mp4 or .webm at `src`) or a `youtube` video (`src` is its id).
 */
export class Activity {
  constructor({ id, type, kind, title, description = '', emoji = '⭐', color = '#ffd166', ages = null, src = null, load = null }) {
    const fail = (reason) => {
      throw new InvalidActivityError(id, reason);
    };
    kind ??= type === 'game' ? 'interactive' : 'animation';

    if (typeof id !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) fail('o id usa só letras minúsculas, números e hífens');
    if (!TYPES.includes(type)) fail(`o type é ${TYPES.join(' ou ')}`);
    if (type === 'game' && kind !== 'interactive') fail('jogo é sempre interactive');
    if (type === 'video' && !VIDEO_KINDS.includes(kind)) fail(`o kind de um vídeo é ${VIDEO_KINDS.join(', ')}`);
    if (!title) fail('falta o title');
    if (!/^#[0-9a-f]{3,8}$/i.test(color)) fail('a color é um hexadecimal, como #ffd166');
    if (ages !== null && !(Array.isArray(ages) && ages.length === 2 && ages[0] <= ages[1])) {
      fail('ages é [mínimo, máximo], em meses');
    }
    const runsCode = kind === 'interactive' || kind === 'animation';
    if (runsCode && typeof load !== 'function') fail("falta load: () => import('./caminho/do/modulo.js')");
    if (!runsCode && !src) fail('falta o src');

    Object.assign(this, { id, type, kind, title, description, emoji, color, ages, src, load });
    Object.freeze(this);
  }

  /** Whether the player mounts a module, rather than showing a media file. */
  get runsCode() {
    return this.kind === 'interactive' || this.kind === 'animation';
  }
}
