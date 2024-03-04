import { Cell } from "./Cell.js";

export class SeaCell extends Cell {
  #shipNumber;
  #isPossibleToShip;
  #isShot;
  #isHit;

  /**
   *
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    super(x, y);
    this.#shipNumber = 0;
    this.#isPossibleToShip = true;
    this.#isShot = false;
    this.#isHit = false;
  }

  set PossibleToShip(value) {
    this.#isPossibleToShip = value;
  }

  /**
   */
  set _shipNumber(number) {
    this.#shipNumber = number;
    if (this.#isPossibleToShip || !this.isBorder) {
      this.#shipNumber = number;
    } else {
      throw new Error(
        `${this.x} ${this.y} ${this.isBorder} ${this.#isPossibleToShip}`
      );
    }
  }

  set _isShot(value) {
    this.#isShot = value;
  }

  set _isHit(value) {
    this.#isHit = value;
  }

  get _isShot() {
    return this.#isShot;
  }

  get PossibleToShip() {
    return this.#isPossibleToShip;
  }

  get _shipNumber() {
    return this.#shipNumber;
  }

  get _isHit() {
    return this.#isHit;
  }

  /**
   * create HTMLElement reporesentatnion  of seaCell
   * @returns {HTMLElement}
   */
  createElement() {
    const element = document.createElement("div");
    element.classList.add(this.cssClasses.seaMapCell);
    element.setAttribute("data-sea-cell", "");
    element.setAttribute("data-x", this.x);
    element.setAttribute("data-y", this.y);
    element.setAttribute("data-is-border", this.isBorder);
    element.setAttribute("data-is-possible-to-ship", this.#isPossibleToShip);

    return element;
  }
}
