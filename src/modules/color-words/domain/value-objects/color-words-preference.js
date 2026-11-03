/**
 * Whether the parents want colour names written in the games, as in the
 * bubbles, where each bubble carries its colour's name. The baby does not
 * read yet: the word is a cue for the adult to say it out loud.
 */
export class ColorWordsPreference {
  constructor(shown) {
    if (typeof shown !== 'boolean') throw new TypeError(`Escolha inválida: ${shown}. Use true ou false.`);
    this.shown = shown;
    Object.freeze(this);
  }
}
