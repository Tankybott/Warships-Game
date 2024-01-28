import { Cell } from "./cell.js";

export const DATA_SHOOT_CELL = "data-shoot-cell";

const SHOOT_MAP_CELL_CSS = "shoot-map__shoot-cell";

export class ShootCell extends Cell {
  #isShot;
  #isHit;
  #isMissed;

  constructor(x, y) {
    super(x, y);
    this.#isShot = false;
    this.#isHit = false;
    this.#isMissed = false;
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

  createElement() {
    const element = document.createElement("div");
    element.classList.add(SHOOT_MAP_CELL_CSS);
    element.setAttribute(DATA_SHOOT_CELL, "");
    element.setAttribute("data-x", this.x);
    element.setAttribute("data-y", this.y);
    element.setAttribute("data-is-border", this.isBorder);

    return element;
  }
}
