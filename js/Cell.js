export class Cell {
  #isBorder;

  constructor(x, y) {
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
