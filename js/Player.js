import { UI } from "./UI.js";

export class Player extends UI {
  #numberOfAllShips;

  /**
   * @param {number} mapSize
   * @param {number} numberOfFiveCellShips
   * @param {number} numberOfFourCellShips
   * @param {number} numberOfThreeCellShips
   * @param {number} numberOfTwoCellShips
   * @param {number} numberOfOneCellShips
   */
  constructor(
    mapSize,
    numberOfFiveCellShips,
    numberOfFourCellShips,
    numberOfThreeCellShips,
    numberOfTwoCellShips,
    numberOfOneCellShips
  ) {
    super();
    this.mapSize = mapSize;

    this.ships = {
      fiveCellShips: numberOfFiveCellShips,
      fourCellShips: numberOfFourCellShips,
      threeCellShips: numberOfThreeCellShips,
      twoCellShips: numberOfTwoCellShips,
      oneCellShips: numberOfOneCellShips,
    };

    this.#numberOfAllShips = this.#countAllShips();
  }

  get _numberOfAllShips() {
    return this.#numberOfAllShips;
  }

  /**
   * As you pass an array of cells which may represent ship. returns array of all cells that are impossible to be ship according to passed ship poistion
   * @param {Array} cellsCoordiates
   * @returns {Array}
   */
  getImpossibleToShipCells(cellsCoordiates) {
    const impossibleToShipCells = [];

    cellsCoordiates.forEach(({ XValue, YValue }) => {
      const x = parseInt(XValue, 10);
      const y = parseInt(YValue, 10);

      //case of having ship cell touching left border
      if (x > 1 && y === 1 && x < this.mapSize) {
        this.#findCellsAround(x, y, -1, 2, 0, 2, impossibleToShipCells);
      }

      //case of having ship cell touching bottom border
      if (x === this.mapSize && y > 1 && y < this.mapSize) {
        this.#findCellsAround(x, y, -1, 1, -1, 2, impossibleToShipCells);
      }

      //case of having ship cell toutching right border
      if (x < this.mapSize && y === this.mapSize && x > 1) {
        this.#findCellsAround(x, y, -1, 2, -1, 1, impossibleToShipCells);
      }
      //case of having ship cell toutching top border
      if (x === 1 && y < this.mapSize && y > 1) {
        this.#findCellsAround(x, y, 0, 2, -1, 2, impossibleToShipCells);
      }

      //case of ship cell is not toutching border
      if (x > 1 && x < this.mapSize && y > 1 && y < this.mapSize) {
        this.#findCellsAround(x, y, -1, 2, -1, 2, impossibleToShipCells);
      }

      //case of ship cell is toutching left-top corner
      if (x === 1 && y === 1) {
        this.#findCellsAround(x, y, 0, 2, 0, 2, impossibleToShipCells);
      }

      //case of ship cell is toutching left-bottom corner
      if (x === this.mapSize && y === 1) {
        this.#findCellsAround(x, y, -1, 1, 0, 2, impossibleToShipCells);
      }

      //case of ship cell is toutching right-bottom corner
      if (x === this.mapSize && y === this.mapSize) {
        this.#findCellsAround(x, y, -1, 1, -1, 1, impossibleToShipCells);
      }

      //case of ship cell is toutching right-top corner
      if (x === 1 && y === this.mapSize) {
        this.#findCellsAround(x, y, 0, 2, -1, 1, impossibleToShipCells);
      }
    });

    return impossibleToShipCells;
  }

  /**
   * Modifies impossibleToShipCells array passed in argument.
   * Pushes cells to modified array which are around cell with x,y coordinates.
   * You can modify wheather you pushing there all cells that are around or cells from choosen side, you can adjust that by setting correct numbers from -1 to 1 as parameters startX, lastX, startY and lastY
   * @param {number} startX
   * @param {number} lastX
   * @param {number} startY
   * @param {number} lastY
   * @param {Array} impossibleToShipCells
   */
  #findCellsAround(x, y, startX, lastX, startY, lastY, impossibleToShipCells) {
    for (let row = startX; row < lastX; row++) {
      for (let col = startY; col < 2; col++) {
        const cell = {
          x: x + row,
          y: y + col,
        };
        if (
          !impossibleToShipCells.some((insideCell) => {
            return insideCell.x === cell.x && insideCell.y === cell.y;
          })
        ) {
          impossibleToShipCells.push(cell);
        }
      }
    }
  }

  /**
   * @returns {number}
   */
  #countAllShips() {
    const values = Object.values(this.ships);

    const numberOfAllShips = values.reduce(
      (summaryNumberOfAllShips, numberOfSpecyficShips) =>
        summaryNumberOfAllShips + numberOfSpecyficShips,
      0
    );
    return numberOfAllShips;
  }

  decreseNumberOfShips() {
    this.#numberOfAllShips--;
  }
}
