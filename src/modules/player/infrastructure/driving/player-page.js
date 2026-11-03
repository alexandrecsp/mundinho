import { createStage } from '../../../../shared/stage/create-stage.js';
import { h } from '../../../../shared/ui/dom.js';
import { createHoldToExit } from './hold-to-exit.js';
import { renderRestScreen } from './rest-screen.js';

const METER_TICK_MS = 1000;

/**
 * Plays one activity full screen. The baby can tap anything; only an adult
 * holding the corner button gets out. Screen time counts while the page is
 * visible, and the activity gives way to a rest screen when today's limit
 * runs out.
 */
export function mountPlayer(root, { activityId, catalog, screenTime, theme, colorWords, animalShapes, synth, onExit }) {
  const surface = h('div', { class: 'player-surface' });
  const exit = createHoldToExit({ onExit });
  root.append(h('div', { class: 'player', oncontextmenu: (event) => event.preventDefault() }, surface, exit.element));

  const wakeLock = keepScreenOn();
  let stopActivity = () => {};
  let stopMeter = () => {};
  let closed = false;
  // Bumped whenever the surface changes hands, so a module that finishes
  // loading after the rest screen took over is stopped, not shown.
  let turn = 0;

  function show(element, stop = () => {}) {
    turn += 1;
    stopActivity();
    surface.replaceChildren(element);
    stopActivity = stop;
  }

  function rest() {
    stopMeter();
    const screen = renderRestScreen(synth);
    show(screen.element, screen.destroy);
  }

  let playable;
  try {
    playable = catalog.openActivity.execute({ id: activityId });
  } catch {
    show(message('🙈', 'Não achei essa brincadeira.'));
  }

  if (playable && screenTime.getScreenTime.execute().exhausted) {
    rest();
  } else if (playable) {
    stopMeter = startMeter(screenTime, rest);
    const myTurn = turn;
    const choices = { colorWords: colorWords.getColorWords.execute().shown, animalShapes: animalShapes.getAnimalShapes.execute().shown };
    start(playable, surface, synth, () => theme.controller.current.theme, choices)
      .then((stop) => (closed || turn !== myTurn ? stop() : (stopActivity = stop)))
      .catch((error) => {
        console.error(error);
        if (!closed) show(message('😵', 'Ops! Não consegui abrir.'));
      });
  }

  return function cleanup() {
    closed = true;
    stopMeter();
    stopActivity();
    exit.destroy();
    wakeLock.release();
  };
}

async function start(playable, surface, synth, theme, { colorWords, animalShapes }) {
  if (playable.kind === 'file') return playFile(playable, surface);
  if (playable.kind === 'youtube') return playYoutube(playable, surface);

  const { default: plugin } = await playable.load();
  if (typeof plugin?.mount !== 'function') throw new Error(`"${playable.id}" não exporta default { mount(stage) }`);
  const audio = synth.channel();
  const stage = createStage(surface, { audio, theme, colorWords, animalShapes });
  const unmount = plugin.mount(stage);
  return () => {
    if (typeof unmount === 'function') unmount();
    stage.destroy();
    audio.close();
  };
}

function playFile({ src }, surface) {
  const video = h('video', { class: 'player-video', src, autoplay: true, playsinline: true });
  video.volume = 0.6;
  const replay = h('button', { class: 'replay', hidden: true, 'aria-label': 'Ver de novo' }, '▶');
  replay.addEventListener('click', () => {
    replay.hidden = true;
    video.currentTime = 0;
    video.play();
  });
  video.addEventListener('ended', () => {
    replay.hidden = false;
  });
  surface.append(video, replay);
  video.play().catch(() => {
    replay.hidden = false;
  });
  return () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
  };
}

function playYoutube({ src, title }, surface) {
  const params = new URLSearchParams({ autoplay: '1', controls: '0', rel: '0', playsinline: '1', modestbranding: '1', iv_load_policy: '3' });
  surface.append(
    h('iframe', {
      class: 'player-video',
      src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(src)}?${params}`,
      allow: 'autoplay; encrypted-media',
      title,
    }),
    // Taps land here, never on YouTube's links to other videos.
    h('div', { class: 'tap-shield' }),
  );
  return () => {};
}

function startMeter(screenTime, onExhausted) {
  let last = performance.now();
  const id = setInterval(() => {
    const now = performance.now();
    const elapsedMs = Math.min(now - last, 5 * METER_TICK_MS);
    last = now;
    if (document.visibilityState !== 'visible') return;
    if (screenTime.recordScreenTime.execute({ elapsedMs }).exhausted) {
      clearInterval(id);
      onExhausted();
    }
  }, METER_TICK_MS);
  return () => clearInterval(id);
}

function keepScreenOn() {
  let lock = null;
  navigator.wakeLock?.request('screen').then((granted) => (lock = granted)).catch(() => {});
  return { release: () => lock?.release().catch(() => {}) };
}

function message(emoji, text) {
  return h('div', { class: 'player-message' }, h('span', { 'aria-hidden': 'true' }, emoji), h('p', {}, text));
}
