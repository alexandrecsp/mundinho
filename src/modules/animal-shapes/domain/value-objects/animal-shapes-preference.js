/**
 * Whether the parents want the bubbles shaped like little animals (bear,
 * cat, bunny, fish, chick), like party balloons, or plain and round. The
 * animal is one more thing for the adult to name: "estourou o gatinho!".
 */
export class AnimalShapesPreference {
  constructor(shown) {
    if (typeof shown !== 'boolean') throw new TypeError(`Escolha inválida: ${shown}. Use true ou false.`);
    this.shown = shown;
    Object.freeze(this);
  }
}
