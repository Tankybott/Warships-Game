import { ShootCell } from "./ShootCell.js";
import { Map } from "./Map.js";

export class ShootMap extends Map {
  constructor(numberOfCells) {
    super(numberOfCells);
    this.numberOfCells = numberOfCells;

    this.#bindElements();
    this.#generateShootCells();
  }
  #shootCells = [];

  #bindElements() {
    this.shootMapElement = this.getElement(this.UISelectors.shootMap);
  }

  #generateShootCells() {
    for (let row = 0; row < this.numberOfCells + 2; row++) {
      this.#shootCells[row] = [];
      for (let col = 0; col < this.numberOfCells + 2; col++) {
        this.#shootCells[row].push(new ShootCell(row, col));
      }
    }
  }

  setShootCell({ x, y }) {
    const cell = this.#shootCells
      .flat()
      .find((cell) => cell.x === parseInt(x, 10) && cell.y === parseInt(y, 10));

    cell._isShot = true;
  }

  /**
   * renders HTML reresentation of empty shoot map
   */
  renderShootMap() {
    this.shootMapElement.innerHTML = "";
    const type = "[data-shoot-cell]";
    this.#shootCells.flat().forEach((cell) => {
      this.shootMapElement.appendChild(cell.createElement());
    });
    this.configureBorderCells(this.#shootCells);
    this.numberLeftMapEdge(this.#shootCells, type);
    this.numberTopMapEdge(this.#shootCells, type);
  }

  /**
   * refreshes shoot map to represent shoot cells objects as html elements live.
   */
  refreshShootMap() {
    const shotCells = [];
    const hitCells = [];
    this.#shootCells.flat().forEach((cell) => {
      if (cell._isShot) {
        shotCells.push(cell);
      }
      if (cell._isHit) {
        hitCells.push(cell);
      }
    });

    if (shotCells.length > 0) {
      const shotCellsElements = this.getElements(
        this.#createSelector(shotCells).join(", ")
      );
      this.#refreshConfigurationForCells(shotCellsElements);
    }

    if (hitCells.length > 0) {
      const hitCellsElements = this.getElements(
        this.#createSelector(hitCells).join(", ")
      );
      this.#refreshConfigurationForCells(undefined, hitCellsElements);
    }
  }

  #createSelector(cells) {
    const selectors = cells.map(
      ({ x, y }) => `[data-shoot-cell][data-x="${x}"][data-y="${y}"]`
    );
    return selectors;
  }

  #refreshConfigurationForCells(shotCellsElements = [], hitCellsElements = []) {
    shotCellsElements.forEach((cell) => {
      cell.classList.add(this.cssClasses.shootTarget);
    });

    hitCellsElements.forEach((cell) => {
      cell.classList.add(this.cssClasses.hit);
    });
  }
  
  setCellAsHit({ x, y }) {
    const cell = this.#shootCells
      .flat()
      .find((cell) => cell.x == x && cell.y == y);

    cell._isHit = true;
  }
}
