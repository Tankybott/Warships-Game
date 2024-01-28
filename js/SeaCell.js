import { Cell } from "./Cell.js";

export const DATA_SEA_CELL = "data-sea-cell";

const SEA_MAP_CELL_CSS = "sea-map__sea-cell";

export class SeaCell extends Cell {
  #shipNumber;
  #isPossibleToShip;
  #isShot;
  #isHit;

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

  createElement() {
    const element = document.createElement("div");
    element.classList.add(SEA_MAP_CELL_CSS);
    element.setAttribute(DATA_SEA_CELL, "");
    element.setAttribute("data-x", this.x);
    element.setAttribute("data-y", this.y);
    element.setAttribute("data-is-border", this.isBorder);
    element.setAttribute("data-is-possible-to-ship", this.#isPossibleToShip);

    return element;
  }
}
