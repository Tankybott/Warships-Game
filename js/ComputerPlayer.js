import { Cell } from "./Cell.js";
import { Player } from "./Player.js";
import { SeaCell } from "./SeaCell.js";
import { SeaMap } from "./SeaMap.js";

export class ComputerPlayer extends Player {
  #allCells; // 2d array of all cells
  #cellsToShoot; // cells left to shoot
  #seaMap;
  #forbiddenShotDirections;

  constructor(
    mapSize,
    numberOfFiveCellShips,
    numberOfFourCellShips,
    numberOfThreeCellShips,
    numberOfTwoCellShips,
    numberOfOneCellShips
  ) {
    super(
      mapSize,
      numberOfFiveCellShips,
      numberOfFourCellShips,
      numberOfThreeCellShips,
      numberOfTwoCellShips,
      numberOfOneCellShips
    );
    this.shotShip = []; // Cells of ship that was shot and not sunk yet
    this.#forbiddenShotDirections = []; // numbers between 1-4
    this.#seaMap = new SeaMap(mapSize);
    this.#allCells = this.#seaMap.seaCells;
    this.#cellsToShoot = this.#allCells.flat().filter((cell) => !cell.isBorder);

    this.#deployComputersShips();
  }

  get _seaMap() {
    return this.#seaMap;
  }

  #deployComputersShips() {
    const shipsToPlace = Object.values(this.ships); //each list elementcontains amount of each type of ship to be placed starting from biggest
    let iterator = 0; //determining type of ship that is placed
    let shipNumber = 1; //determining a uniqe number ship for ship that is placed
    let cellsFreeToShip = this.#allCells.flat(); //array of avaliable cells for placing ship

    /**
     * iterate over all types(each type have different length) of ships, starting from longest one.
     * shipsToPlace[0] contains amount of largest ships, so shipsToPlace.lenght returns size of that ship as difference of size of each type is always one. shipToPlace[1] contains amount of ships that are 1 cell smaller than shipsToPlace[0], so shipsToPlace.lenght-1 will determine 
     length of ship as 1 lower than the las one added, and so on untill counter hits 1
     */
    for (let shipLength = shipsToPlace.length; shipLength > 0; shipLength--) {
      //loops to place all ships of each type
      for (
        let numberOfSpecificShips = shipsToPlace[iterator]; //sets amount of ships from specyfic type
        numberOfSpecificShips > 0;
        numberOfSpecificShips--
      ) {
        let tempShipShape; // array of cells that are possible to ship
        do {
          const randomDirection = Math.floor(Math.random() * 4) + 1; //gets random direction, number from 1 to 4
          tempShipShape = this.#getPossibleShipShape(
            this.#getRandomCell(cellsFreeToShip),
            shipLength,
            randomDirection
          );
        } while (tempShipShape.length !== shipLength); // finish loop when getPossibleShipShape returns ship with desired length

        const shipShape = tempShipShape; // sets shipShape for array that contains Cell instances possible to ship
        const impossibleToShipCells = this.getImpossibleToShipCells(
          this.changeNameOfKeysForValues(shipShape)
        );
        this.#seaMap.setImpossibleToShipCells(
          this.changeNameOfKeysForValues(impossibleToShipCells)
        );
        this.#seaMap.setShipCells(
          this.changeNameOfKeysForValues(shipShape),
          shipNumber
        );

        shipNumber++; // after adding whole ship, creates next uniqe number for next ship
      }
      iterator++; // type set for 1 cell smaller
    }
  }

  /**
   *Method returns an array of cells that are possible to place ship in, array length  is same as length parameter if ship can be placed.
   Any shorter array than parameter length, means that desired ship shape collides with something
   * @param {SeaCell} cell // starting cell
   * @param {number} length //  length of ship
   * @param {number} direction // 1-top, 2-right, 3-down, 4 left
   * @returns {array}
   */
  #getPossibleShipShape(cell, length, direction) {
    let possibleShape = [];

    switch (direction) {
      case 1:
        //checks if there is enough of cells in desired direction and check if starting cell is possible to ship
        if (cell.x <= this.mapSize - (length - 1) && cell.PossibleToShip) {
          possibleShape = [];
          //iterates through all desired cells and checks if thre is no collision with other ships or borders
          for (let i = 0; i < length; i++) {
            const cellToCheck = this.#allCells[cell.x + i][cell.y];
            if (cellToCheck.PossibleToShip && !cellToCheck.isBorder) {
              possibleShape.push(cellToCheck); //adds possible
            }
          }
        } else {
          possibleShape = [];
        }
        break;

      // checks rest of directions with similiar logic
      case 2:
        if (cell.y <= this.mapSize - (length - 1) && cell.PossibleToShip) {
          possibleShape = [];
          for (let i = 0; i < length; i++) {
            const cellToCheck = this.#allCells[cell.x][cell.y + i];
            if (cellToCheck.PossibleToShip && !cellToCheck.isBorder) {
              possibleShape.push(cellToCheck);
            }
          }
        } else {
          possibleShape = [];
        }
        break;

      case 3:
        if (cell.x >= 1 + (length - 1) && cell.PossibleToShip) {
          possibleShape = [];
          for (let i = 0; i < length; i++) {
            const cellToCheck = this.#allCells[cell.x - i][cell.y];
            if (cellToCheck.PossibleToShip && !cellToCheck.isBorder) {
              possibleShape.push(cellToCheck);
            }
          }
        } else {
          possibleShape = [];
        }
        break;

      case 4:
        if (cell.y >= 1 + (length - 1) && cell.PossibleToShip) {
          possibleShape = [];
          for (let i = 0; i < length; i++) {
            const cellToCheck = this.#allCells[cell.x][cell.y - i];
            if (cellToCheck.PossibleToShip && !cellToCheck.isBorder) {
              possibleShape.push(cellToCheck);
            }
          }
        } else {
          possibleShape = [];
        }
        break;
    }

    return possibleShape; // returns array of possible to ship cells
  }

  /**
   * returns random cell from array of cells
   * @param {array} cells array of cells
   * @returns {SeaCell}
   */
  #getRandomCell(cells) {
    const randomIndex = Math.floor(Math.random() * cells.length);
    return cells[randomIndex];
  }

  /**
   * returns shoot target
   * @returns {SeaCell}
   */
  makeShoot() {
    //if no ship hit or shit was sunk in last shot, keep hunt algorithm, if ship was hit, start destroy algorithm
    if (this.shotShip.length === 0) {
      return this.#hunt();
    } else {
      return this.#destroy();
    }
  }

  /**
   * Returns random cell from cells left to shoot, and deletes this cell from cells left to shoot
   * @returns {SeaCell}
   */
  #hunt() {
    const randomCellToShootIndex = Math.floor(
      Math.random() * this.#cellsToShoot.length
    );
    const randomCellToShoot = this.#cellsToShoot[randomCellToShootIndex];
    this.#cellsToShoot.splice(randomCellToShootIndex, 1);

    return randomCellToShoot;
  }

  /**
   * Algoritm to get rest of cells that are included in ship that alredy was hit, returns single cell
   * @returns {SeaCell}
   */
  #destroy() {
    if (this.shotShip.length === 1) {
      return this.#destroyAnotherCell();
    } else if (this.shotShip.length > 1) {
      this.#findDirectionsToShoot();
      return this.#destroyAnotherCell();
    }
  }

  /**
   * Returns next possible to be ship cell
   * @returns {SeaCell}
   */
  #destroyAnotherCell() {
    let cellX = this.shotShip[0].x; //
    let cellY = this.shotShip[0].y;
    let randomDirection = this.#getRandomDirection();
    let nextShootCoordinates = {};

    randomDirection = this.#validateRandomDirection(
      randomDirection,
      cellX,
      cellY
    );

    // // while random directions is forbidden, get another random direction
    // while (this.#forbiddenShotDirections.includes(randomDirection)) {
    //   randomDirection = this.#getRandomDirection();
    // }

    // //prevents from choosing border cell as target
    // if (cellX === 1 && randomDirection === 3) {
    //   randomDirection = this.#getRandomDirection();
    // }
    // if (cellX === this.mapSize && randomDirection === 1) {
    //   randomDirection = this.#getRandomDirection();
    // }
    // if (cellY === 1 && randomDirection === 4) {
    //   randomDirection = this.#getRandomDirection();
    // }
    // if (cellX === this.mapSize && randomDirection === 2) {
    //   randomDirection = this.#getRandomDirection();
    // }

    if (randomDirection === 1) {
      cellX = this.#getShipCellWithMaxValue("x");
      nextShootCoordinates = {
        x: cellX + 1,
        y: cellY,
      };
    }

    if (randomDirection === 2) {
      cellY = this.#getShipCellWithMaxValue("y");
      nextShootCoordinates = {
        x: cellX,
        y: cellY + 1,
      };
    }

    if (randomDirection === 3) {
      cellX = this.#getShipCellWithMinValue("x");
      nextShootCoordinates = {
        x: cellX - 1,
        y: cellY,
      };
    }

    if (randomDirection === 4) {
      cellY = this.#getShipCellWithMinValue("y");
      nextShootCoordinates = {
        x: cellX,
        y: cellY - 1,
      };
    }

    this.lastShootDirection = randomDirection;
    const nextShoot = this.#getCellFromCellsToShoot(nextShootCoordinates);

    if (nextShoot === null) {
      return this.#destroyAnotherCell();
    }

    if (
      !this.#cellsToShoot.some(
        (cell) => cell.x === nextShoot.x && cell.y === nextShoot.y
      )
    ) {
      return this.#destroyAnotherCell();
    }

    this.#eliminateCellToShoot(nextShoot);
    return nextShoot;
  }

  #validateRandomDirection(randomDirection, cellX, cellY) {
    let newDirection;
    newDirection = randomDirection;
    // while random directions is forbidden, get another random direction
    while (this.#forbiddenShotDirections.includes(newDirection)) {
      newDirection = this.#getRandomDirection();
    }

    //prevents from choosing border cell as target
    if (cellX === 1 && newDirection === 3) {
      newDirection = this.#getRandomDirection();
    }
    if (cellX === this.mapSize && newDirection === 1) {
      newDirection = this.#getRandomDirection();
    }
    if (cellY === 1 && newDirection === 4) {
      newDirection = this.#getRandomDirection();
    }
    if (cellX === this.mapSize && newDirection === 2) {
      newDirection = this.#getRandomDirection();
    }

    return newDirection;
  }

  #getRandomDirection() {
    return Math.floor(Math.random() * 4) + 1;
  }

  #getCellFromCellsToShoot({ x, y }) {
    return (
      this.#cellsToShoot.find((cell) => cell.x === x && cell.y === y) || null
    );
  }

  #eliminateCellToShoot(cell) {
    const newCellsToShoot = this.#cellsToShoot.filter(
      (cellToShoot) => !(cellToShoot.x === cell.x && cellToShoot.y === cell.y)
    );
    this.#cellsToShoot = newCellsToShoot;
  }

  #getShipCellWithMinValue(value) {
    let minValue = Infinity;
    let minValueShipCell = null;

    for (let i = 0; i < this.shotShip.length; i++) {
      if (this.shotShip[i][value] < minValue) {
        minValue = this.shotShip[i][value];
        minValueShipCell = this.shotShip[i];
      }
    }
    return minValueShipCell[value];
  }

  #getShipCellWithMaxValue(value) {
    let maxValue = 0;
    let maxValueShipCell = null;

    for (let i = 0; i < this.shotShip.length; i++) {
      if (this.shotShip[i][value] > maxValue) {
        maxValue = this.shotShip[i][value];
        maxValueShipCell = this.shotShip[i];
      }
    }
    return maxValueShipCell[value];
  }

  /**
   * Method is made to reveal if ship that destroying is in progress were placed horizontaly or verticaly
   */
  #findDirectionsToShoot() {
    /**in case that algorythm blind aimed next ship element, set possibilities to shot verticaly or horizontaly depending
     * on how were aimed two first elements
     */
    const firstCellX = this.shotShip[0].x;
    const firstCellY = this.shotShip[0].y;
    const restOfShotShip = this.shotShip.slice(1);
    if (
      restOfShotShip.some(({ x }) => {
        return x === firstCellX;
      })
    ) {
      this.#forbiddenShotDirections.push(1, 3);
      console.log("dodaje zakzane 1 i 3");
    }

    if (
      restOfShotShip.some(({ y }) => {
        return y === firstCellY;
      })
    ) {
      this.#forbiddenShotDirections.push(2, 4);
      console.log("dodaje zakzane 2 i 4");
    }
  }

  resetHitInfo() {
    const shotShip = this.shotShip;
    this.shotShip = [];
    this.#forbiddenShotDirections = [];
    this.#eliminateCellsToShoot(shotShip);
  }

  #eliminateCellsToShoot(shotShip) {
    const shotShipCoordinates = this.changeNameOfKeysForValues(shotShip);
    const impossibleToShipCells =
      this.getImpossibleToShipCells(shotShipCoordinates);
    const newCellsToShoot = this.#cellsToShoot.filter((cellToShot) => {
      return !impossibleToShipCells.some((impossibleCell) => {
        return (
          impossibleCell.x === cellToShot.x && impossibleCell.y === cellToShot.y
        );
      });
    });

    this.#cellsToShoot = newCellsToShoot;
  }

  handleMiss() {
    if (this.shotShip.length > 0) {
      const lastShootDirection = this.lastShootDirection;
      if (
        !this.#forbiddenShotDirections.some(
          (direction) => direction === lastShootDirection
        ) &&
        lastShootDirection !== undefined
      ) {
        this.#forbiddenShotDirections.push(lastShootDirection);
      }
    }
  }
}
