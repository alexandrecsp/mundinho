import { mountPlayer } from '../modules/player/index.js';
import { mountHome } from './home-page.js';

const PLAY_ROUTE = /^#\/brincar\/([a-z0-9-]+)$/;

/**
 * Two screens: the home (#/) the adult browses, and the player
 * (#/brincar/<id>) the baby plays in. Each mount returns its cleanup.
 */
export function startRouter(root, app) {
  let cleanup = () => {};

  function render() {
    cleanup();
    root.replaceChildren();
    const match = PLAY_ROUTE.exec(location.hash);
    cleanup = match
      ? mountPlayer(root, { ...app, activityId: match[1], onExit: goHome })
      : mountHome(root, { ...app, onOpen: open });
  }

  // Runs inside the card's click, the only moment browsers allow
  // fullscreen and audio to start.
  function open(id) {
    app.synth.unlock();
    document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }).catch(() => {});
    location.hash = `#/brincar/${id}`;
  }

  function goHome() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    location.hash = '#/';
  }

  window.addEventListener('hashchange', render);
  render();
}
