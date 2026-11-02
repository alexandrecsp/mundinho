const EMOJI_FONT = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Fn']);

/**
 * The surface every game and animation draws on: a canvas that fills its
 * container, one input stream for taps, drags and key presses, and a frame
 * loop. Everything registered here is released by destroy(), so a plugin
 * only cleans up what it started itself.
 *
 * A key press arrives as a press at a random spot, so a baby slapping the
 * keyboard gets the same joy as one tapping the screen.
 *
 * @param {HTMLElement} container
 * @param {{ audio: object }} options  the activity's synth channel
 */
export function createStage(container, { audio }) {
  const canvas = document.createElement('canvas');
  canvas.className = 'stage-canvas';
  container.append(canvas);
  const ctx = canvas.getContext('2d');

  const handlers = { frame: [], press: [], drag: [], resize: [] };
  const pressedPointers = new Set();
  const removers = [];
  let lastInputAt = performance.now();
  let frameId = 0;

  const stage = {
    canvas,
    ctx,
    audio,
    width: 0,
    height: 0,
    /** fn(dt, t): dt and t in seconds. */
    onFrame: (fn) => handlers.frame.push(fn),
    /** fn({ x, y, source: 'pointer' | 'key', id?, key? }) */
    onPress: (fn) => handlers.press.push(fn),
    /** fn({ x, y, id }) while a finger or button is down. */
    onDrag: (fn) => handlers.drag.push(fn),
    onResize: (fn) => handlers.resize.push(fn),
    /** Seconds since the last tap, drag or key press. */
    get idleSeconds() {
      return (performance.now() - lastInputAt) / 1000;
    },
    random: (min, max) => min + Math.random() * (max - min),
    pick: (list) => list[Math.floor(Math.random() * list.length)],
    emojiFont: (size) => `${Math.round(size)}px ${EMOJI_FONT}`,
    destroy,
  };

  function listen(target, type, fn) {
    target.addEventListener(type, fn);
    removers.push(() => target.removeEventListener(type, fn));
  }

  function emit(kind, event) {
    lastInputAt = performance.now();
    for (const fn of handlers[kind]) fn(event);
  }

  function pointAt(event) {
    const box = canvas.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top, id: event.pointerId };
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = container.clientWidth;
    const height = container.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    stage.width = width;
    stage.height = height;
    for (const fn of handlers.resize) fn(width, height);
  }

  listen(canvas, 'pointerdown', (event) => {
    pressedPointers.add(event.pointerId);
    emit('press', { ...pointAt(event), source: 'pointer' });
  });
  listen(canvas, 'pointermove', (event) => {
    if (pressedPointers.has(event.pointerId)) emit('drag', pointAt(event));
  });
  for (const type of ['pointerup', 'pointercancel', 'pointerleave']) {
    listen(canvas, type, (event) => pressedPointers.delete(event.pointerId));
  }
  listen(window, 'keydown', (event) => {
    if (event.repeat || MODIFIER_KEYS.has(event.key)) return;
    event.preventDefault();
    emit('press', {
      x: stage.random(stage.width * 0.15, stage.width * 0.85),
      y: stage.random(stage.height * 0.2, stage.height * 0.8),
      source: 'key',
      key: event.key,
    });
  });

  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  let last = performance.now();
  let elapsed = 0;
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += dt;
    for (const fn of handlers.frame) fn(dt, elapsed);
    frameId = requestAnimationFrame(frame);
  }
  frameId = requestAnimationFrame(frame);

  function destroy() {
    cancelAnimationFrame(frameId);
    observer.disconnect();
    removers.forEach((remove) => remove());
    canvas.remove();
  }

  return stage;
}
