import { SeaCell, DATA_SEA_CELL } from "./SeaCell.js";
import { Map } from "./Map.js";

export const DATA_IMPOSSIBLE_TO_SHIP = "data-impossible-to-ship";

export class SeaMap extends Map {
  #seaCells;
  #lastSunkShipNumber;

  constructor(numberOfCells) {
    super(numberOfCells);
    this.numberOfCells = numberOfCells;

    this.#seaCells = [];
    this.#lastSunkShipNumber = 0;

    this.#generateSeaCells();
    this.setBorderValue(this.#seaCells);
  }

  showCells() {
    // console.log(this.#seaCells);
  }

  get seaCells() {
    return this.#seaCells;
  }

  bindElements() {
    this.seaMapElement = this.getElement(this.UISelectors.seaMap);
  }

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
    for (let row = 0; row < this.numberOfCells + 2; row++) {
      this.#seaCells[row] = [];
      for (let col = 0; col < this.numberOfCells + 2; col++) {
        this.#seaCells[row].push(new SeaCell(row, col));
      }
    }
  }

  renderSeaMap() {
    const type = "[data-sea-cell]";
    this.#seaCells.flat().forEach((cell) => {
      this.seaMapElement.appendChild(cell.createElement());
    });
    this.configureBorderCells(this.#seaCells);
    this.numberLeftMapEdge(this.#seaCells, type);
    this.numberTopMapEdge(this.#seaCells, type);
  }

  refreshSeaMap() {
    const shipCells = [];
    const impossibleToShipCells = [];
    const hitCells = [];
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
      cell.classList.add("ship");
    });

    imposibleToShipElements.forEach((cell) => {
      cell.setAttribute("data-is-possible-to-ship", "false");
    });

    hitCellsElements.forEach((cell) => {
      cell.classList.add("sunk");
    });
  }

  //return 1 = hit, return 2 = hit, and sunk, return 3 = missed;
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
        return "sunk";
      } else {
        return "hit";
      }
    } else {
      return "missed";
    }
  }

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

  checkLengthOfSunkShip() {
    if (this.#lastSunkShipNumber != 0) {
      const sunkShipCells = this.#seaCells
        .flat()
        .filter((cell) => cell._shipNumber === this.#lastSunkShipNumber);
      return sunkShipCells.length;
    }
  }

  setAnimationOnLastHit({ x, y }) {
    const selector = `[data-sea-cell][data-x="${x}"][data-y="${y}"]`;
    const cellToAnimate = this.getElement(selector);
    const removeAnimation = () => {
      cellToAnimate.classList.remove("shot");
    };

    cellToAnimate.classList.add("shot");
    cellToAnimate.addEventListener("animationend", removeAnimation);
  }
}
