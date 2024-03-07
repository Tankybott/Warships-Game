import { SeaCell } from "./SeaCell.js";
import { Map } from "./Map.js";

export class SeaMap extends Map {
  #seaCells;
  #lastSunkShipNumber;

  /**
   *
   * @param {number} numberOfCells
   */
  constructor(numberOfCells) {
    super(numberOfCells);
    this.numberOfCells = numberOfCells;

    this.#seaCells = [];
    this.#lastSunkShipNumber = 0;

    this.#generateSeaCells();
    this.setBorderValue(this.#seaCells);
    this.#bindElements();
  }

  get seaCells() {
    return this.#seaCells;
  }

  #bindElements() {
    this.seaMapElement = this.getElement(this.UISelectors.seaMap);
  }

  /**
   * Changes properties of seaCells setting possiblity of being ship to false.
   * @param {Array} cellsToChange
   */
  setImpossibleToShipCells(cellsToChange) {
    cellsToChange.forEach(({ XValue, YValue }) => {
      const cellToChange = this.#seaCells
        .flat()
        .find(
          (cell) =>
            cell.x === parseInt(XValue, 10) && cell.y === parseInt(YValue, 10)
        );
      if (cellToChange) {
        cellToChange.PossibleToShip = false;
      }
    });
  }

  /**
   * Changes properties of seaCells setting number of ship to cells passed in argumnet.
   * @param {Array} cellsToChange
   * @param {number} number
   */
  setShipCells(cellsToChange, number) {
    cellsToChange.forEach(({ XValue, YValue }) => {
      const cellToChange = this.#seaCells
        .flat()
        .find(
          (cell) =>
            cell.x === parseInt(XValue, 10) && cell.y === parseInt(YValue, 10)
        );
      if (cellToChange) {
        cellToChange._shipNumber = number;
      }
    });
  }

  #generateSeaCells() {
    // this.numberOfCells + 2 beacuse of border cells
    for (let row = 0; row < this.numberOfCells + 2; row++) {
      this.#seaCells[row] = [];
      for (let col = 0; col < this.numberOfCells + 2; col++) {
        this.#seaCells[row].push(new SeaCell(row, col));
      }
    }
  }

  /**
   * renders html representation of empty sea map
   */
  renderSeaMap() {
    this.seaMapElement.innerHTML = "";
    const type = "[data-sea-cell]";
    this.#seaCells.flat().forEach((cell) => {
      this.seaMapElement.appendChild(cell.createElement());
    });
    this.configureBorderCells(this.#seaCells);
    this.numberLeftMapEdge(this.#seaCells, type);
    this.numberTopMapEdge(this.#seaCells, type);
  }

  /**
   * refreshes sea map to represent seaCells objects as html elements live.
   */
  refreshSeaMap() {
    const shipCells = [];
    const impossibleToShipCells = [];
    const hitCells = [];
    // itreates through #seaCells, pushes cells matching specyfic requirements to correct arrays
    this.#seaCells.flat().forEach((cell) => {
      if (cell._shipNumber > 0) {
        shipCells.push(cell);
      }

      if (!cell.PossibleToShip) {
        impossibleToShipCells.push(cell);
      }

      if (cell._isShot && cell._shipNumber > 0) {
        hitCells.push(cell);
      }
    });

    if (shipCells.length > 0) {
      const shipCellsElements = this.getElements(
        this.#createSelector(shipCells).join(", ")
      );
      this.#refreshConfigurationForCells(shipCellsElements);
    }

    if (impossibleToShipCells.length > 0) {
      const impossibleToShipCellsElements = this.getElements(
        this.#createSelector(impossibleToShipCells).join(", ")
      );
      this.#refreshConfigurationForCells(
        undefined,
        impossibleToShipCellsElements
      );
    }

    if (hitCells.length > 0) {
      const hitCellsElements = this.getElements(
        this.#createSelector(hitCells).join(", ")
      );
      this.#refreshConfigurationForCells(
        undefined,
        undefined,
        hitCellsElements
      );
    }
  }

  #createSelector(cells) {
    const selectors = cells.map(
      ({ x, y }) => `[data-sea-cell][data-x="${x}"][data-y="${y}"]`
    );
    return selectors;
  }

  #refreshConfigurationForCells(
    shipCellsElements = [],
    imposibleToShipElements = [],
    hitCellsElements = []
  ) {
    shipCellsElements.forEach((cell) => {
      cell.classList.add(this.cssClasses.ship);
    });

    imposibleToShipElements.forEach((cell) => {
      cell.setAttribute("data-is-possible-to-ship", "false");
    });

    hitCellsElements.forEach((cell) => {
      cell.classList.add(this.cssClasses.sunk);
    });
  }

  /**
   * return 1 = hit, return 2 = hit, and sunk, return 3 = missed;
   */
  checkIfHit({ XValue, YValue }) {
    const cell = this.#seaCells
      .flat()
      .find(
        (cell) =>
          cell.x === parseInt(XValue, 10) && cell.y === parseInt(YValue, 10)
      );
    cell._isShot = true;

    if (cell._shipNumber > 0) {
      cell._isHit = true;
      const shipNumber = cell._shipNumber;
      if (this.#checkIfSunk(shipNumber)) {
        return this.cssClasses.sunk;
      } else {
        return "hit";
      }
    } else {
      return "missed";
    }
  }

  /**
   * checks if there are any of ship cells with passed ship number
   * @param {number} shipNumber
   * @returns {bolean}
   */
  #checkIfSunk(shipNumber) {
    if (
      this.#seaCells
        .flat()
        .some((cell) => cell._shipNumber === shipNumber && !cell._isHit)
    ) {
      return false;
    } else {
      this.#lastSunkShipNumber = shipNumber;
      return true;
    }
  }

  /**
   * returns length of last sunken ship
   * @returns {number}
   */
  checkLengthOfSunkShip() {
    if (this.#lastSunkShipNumber != 0) {
      const sunkShipCells = this.#seaCells
        .flat()
        .filter((cell) => cell._shipNumber === this.#lastSunkShipNumber);
      return sunkShipCells.length;
    }
  }

  /**
   * shows animation of last enemy shot on players map
   * @param {object}
   */
  setAnimationOnLastHit({ x, y }) {
    console.log(x, y);
    const selector = `[data-sea-cell][data-x="${x}"][data-y="${y}"]`;
    const cellToAnimate = this.getElement(selector);
    const removeAnimation = () => {
      cellToAnimate.classList.remove(this.cssClasses.shot);
    };

    cellToAnimate.classList.add(this.cssClasses.shot);
    cellToAnimate.addEventListener("animationend", removeAnimation);
  }
}
