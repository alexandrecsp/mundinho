/** What a card on the home page shows. */
export function toActivityResult({ id, title, description, emoji, color, ages }) {
  return { id, title, description, emoji, color, ages };
}

/** What the player needs to start an activity. */
export function toPlayableResult({ id, title, kind, src, load }) {
  return { id, title, kind, src, load };
}
