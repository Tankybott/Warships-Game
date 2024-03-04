import { UI } from "./UI.js";

/**
 * Class creates universal cell
 */
export class Cell extends UI {
  #isBorder;

  /**
   *
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.#isBorder = false;
  }

  set isBorder(value) {
    this.#isBorder = value;
  }

  get isBorder() {
    return this.#isBorder;
  }
}
