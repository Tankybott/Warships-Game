import { UI } from "./UI.js";

export class Player extends UI {
  #numberOfFiveCellShips;
  #numberOfFourCellShips;
  #numberOfThreeCellShips;
  #numberOfTwoCellShips;
  #numberOfOneCellShips;
  #numberOfAllShips;

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
    this.#numberOfFiveCellShips = numberOfFiveCellShips;
    this.#numberOfFourCellShips = numberOfFourCellShips;
    this.#numberOfThreeCellShips = numberOfThreeCellShips;
    this.#numberOfTwoCellShips = numberOfTwoCellShips;
    this.#numberOfOneCellShips = numberOfOneCellShips;

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

  getImpossibleToShipCells(cellsCoordiates) {
    const impossibleToShipCells = [];

    cellsCoordiates.forEach(({ XValue, YValue }) => {
      const x = parseInt(XValue, 10);
      const y = parseInt(YValue, 10);
      if (x > 1 && y === 1 && x < this.mapSize) {
        for (let row = -1; row < 2; row++) {
          for (let col = 0; col < 2; col++) {
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

      //case of having ship cell touching bottom border
      if (x === this.mapSize && y > 1 && y < this.mapSize) {
        for (let row = -1; row < 1; row++) {
          for (let col = -1; col < 2; col++) {
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

      //case of having ship cell toutching right border
      if (x < this.mapSize && y === this.mapSize && x > 1) {
        for (let row = -1; row < 2; row++) {
          for (let col = -1; col < 1; col++) {
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
      //case of having ship cell toutching top border
      if (x === 1 && y < this.mapSize && y > 1) {
        for (let row = 0; row < 2; row++) {
          for (let col = -1; col < 2; col++) {
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

      //case of ship cell is not toutching border
      if (x > 1 && x < this.mapSize && y > 1 && y < this.mapSize) {
        for (let row = -1; row < 2; row++) {
          for (let col = -1; col < 2; col++) {
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

      //case of ship cell is toutching left-top corner
      if (x === 1 && y === 1) {
        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 2; col++) {
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

      //case of ship cell is toutching left-bottom corner
      if (x === this.mapSize && y === 1) {
        for (let row = -1; row < 1; row++) {
          for (let col = 0; col < 2; col++) {
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

      //case of ship cell is toutching right-bottom corner
      if (x === this.mapSize && y === this.mapSize) {
        for (let row = -1; row < 1; row++) {
          for (let col = -1; col < 1; col++) {
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

      //case of ship cell is toutching right-top corner
      if (x === 1 && y === this.mapSize) {
        for (let row = 0; row < 2; row++) {
          for (let col = -1; col < 1; col++) {
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
    });

    return impossibleToShipCells;
  }

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
