import { Cell } from "./Cell.js";

export class ShootCell extends Cell {
  #isShot;
  #isHit;

  constructor(x, y) {
    super(x, y);
    this.#isShot = false;
    this.#isHit = false;
  }

  set _isShot(value) {
    this.#isShot = value;
  }

  get _isShot() {
    return this.#isShot;
  }

  set _isHit(value) {
    this.#isHit = value;
  }

  get _isHit() {
    return this.#isHit;
  }

  /**
   * creates HTML representation of shootMapCell
   * @returns {HTMLElement}
   */
  createElement() {
    const element = document.createElement("div");
    element.classList.add(this.cssClasses.shootMapCell);
    element.setAttribute("data-shoot-cell", "");
    element.setAttribute("data-x", this.x);
    element.setAttribute("data-y", this.y);
    element.setAttribute("data-is-border", this.isBorder);

    return element;
  }
}
