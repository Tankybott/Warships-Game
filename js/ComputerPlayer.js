import { Player } from "./Player.js";
import { SeaCell } from "./SeaCell.js";
import { SeaMap } from "./SeaMap.js";

/**
 * Class handles computer Player ships deploying and shooting enemy targets on way to win game
 */
export class ComputerPlayer extends Player {
  #allCells; // 2d array of all cells
  #cellsToShoot; // cells left to shoot
  #seaMap;
  #forbiddenShotDirections; // 1-bottom, 2-right, 3-top, 4 left

  /**
   *
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
    super(
      mapSize,
      numberOfFiveCellShips,
      numberOfFourCellShips,
      numberOfThreeCellShips,
      numberOfTwoCellShips,
      numberOfOneCellShips
    );
    this.shotShip = []; // Cells of enemy ship that was shot and not sunk yet
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
    const shipsToPlace = Object.values(this.ships); //each list element contains amount of each type of ship to be placed starting from biggest
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
          const randomDirection = this.#getRandomDirection();
          tempShipShape = this.#getPossibleShipShape(
            this.#getRandomCell(cellsFreeToShip),
            shipLength,
            randomDirection
          );
        } while (tempShipShape.length !== shipLength); // finish loop when getPossibleShipShape returns ship with desired length

        const shipShape = tempShipShape;
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
   * @param {number} direction // 1-bottom, 2-right, 3-top, 4 left
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
   * Algoritm to get rest of cells that are included in ship that alredy was hit but not sunk, returns single cell that may be enemy ship
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
   * Selects the next cell to shoot when attempting to destroy a partially hit ship.
   * Determines the direction of shooting based on previous hits and ship layout.
   * If the ship is detected to be oriented horizontally or vertically, the next cell
   * is selected accordingly to maximize the chances of hitting the ship.
   * @returns {SeaCell} next cell to shoot
   */
  #destroyAnotherCell() {
    let cellX = this.shotShip[0].x;
    let cellY = this.shotShip[0].y;
    let randomDirection = this.#getRandomDirection();
    let nextShootCoordinates = {};

    randomDirection = this.#validateRandomDirection(
      randomDirection,
      cellX,
      cellY
    );

    // depends on direction, sets coordinates for next shoot
    if (randomDirection === 1) {
      cellX = this.#getShipCellWithgreatestValue("x"); //when moving top start from cell with highest x
      nextShootCoordinates = {
        x: cellX + 1,
        y: cellY,
      };
    }

    if (randomDirection === 2) {
      cellY = this.#getShipCellWithgreatestValue("y"); //when moving right start from cell with highest y
      nextShootCoordinates = {
        x: cellX,
        y: cellY + 1,
      };
    }

    if (randomDirection === 3) {
      cellX = this.#getShipCellWithMinValue("x"); //when moving top start from cell with smallest x
      nextShootCoordinates = {
        x: cellX - 1,
        y: cellY,
      };
    }

    if (randomDirection === 4) {
      cellY = this.#getShipCellWithMinValue("y"); //when moving left start from cell with smallest y
      nextShootCoordinates = {
        x: cellX,
        y: cellY - 1,
      };
    }

    this.lastShootDirection = randomDirection; // saves this direction, to use after feedback if shoot was succesful or not

    const nextShoot = this.#getCellFromCellsToShoot(nextShootCoordinates);

    if (nextShoot === null) {
      return this.#destroyAnotherCell();
    }

    //if targeted cell is not inside array of cells left to shoot, destroyAnotherCell again
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

  /**
   * Validates if next shot direction is not forbidden direction or is border
   * If validation passed, returns direction that was validated
   * if validation not passed, returns one of possible directions
   * @param {number} randomDirection The randomly selected shooting direction.
   * @param {number} cellX The X-coordinate of the current cell.
   * @param {number} cellY The Y-coordinate of the current cell.
   * @returns {number}
   */
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

  /**
   * returns number from 1 to 4
   * @returns {number}
   */
  #getRandomDirection() {
    return Math.floor(Math.random() * 4) + 1;
  }

  /**
   * Finds cell matching coordinates passed in argument, in array of cells that are still possible to be shoot.
   * If found, returns it.
   * If not found returns null.
   * @param {number, number} param0
   * @returns {SeaCell}
   */
  #getCellFromCellsToShoot({ x, y }) {
    return (
      this.#cellsToShoot.find((cell) => cell.x === x && cell.y === y) || null
    );
  }

  /**
   * removes cell from array of cells left to shoot
   * @param {SeaCell} cell
   */
  #eliminateCellToShoot(cell) {
    const newCellsToShoot = this.#cellsToShoot.filter(
      (cellToShoot) => !(cellToShoot.x === cell.x && cellToShoot.y === cell.y)
    );
    this.#cellsToShoot = newCellsToShoot;
  }

  /**
   * Returns number of lowest y or x of cell that belongs to alredy shot but not sunk ship, depends what passed in parameter
   * @param {string} value // x or y
   * @returns {number}
   */
  #getShipCellWithMinValue(value) {
    let minValue = Infinity;

    // Iterates through shot ship cells, if value (choosen in parameter) of current cell is lower
    // han minValue, overwrites minValue for this value, same with cell object that contains this value
    for (let i = 0; i < this.shotShip.length; i++) {
      if (this.shotShip[i][value] < minValue) {
        minValue = this.shotShip[i][value];
      }
    }

    return minValue;
  }

  /**
   * Returns number of highest y or x of cell that belongs to alredy shot but not sunk ship, depends what passed in parameter
   * @param {string} value // x or y
   * @returns {number}
   */
  #getShipCellWithgreatestValue(value) {
    let greatestValue = 0;

    // Iterates through shot ship cells, if value (choosen in parameter) of current cell is greater
    // than greatestValue, overwrites greatestValue for this value, same with cell object that contains this value

    for (let i = 0; i < this.shotShip.length; i++) {
      if (this.shotShip[i][value] > greatestValue) {
        greatestValue = this.shotShip[i][value];
      }
    }
    return greatestValue;
  }

  /**
   * Determines the shooting directions based on the orientation of the partially hit ship.
   * Forbids shooting directions that are oposite to the ship's orientation to prevent
   * shooting in wrong directions. Adjusts the shooting strategy based on whether the
   * ship is detected to be oriented horizontally or vertically.
   */
  #findDirectionsToShoot() {
    // Compares both cells x, and y. If X matches it means that ship lays horizontaly.
    // If Y matches ship lays Verticaly
    const firstCellX = this.shotShip[0].x;
    const firstCellY = this.shotShip[0].y;
    const restOfShotShip = this.shotShip.slice(1);
    if (
      restOfShotShip.some(({ x }) => {
        return x === firstCellX;
      })
    ) {
      this.#forbiddenShotDirections.push(1, 3);
    }

    if (
      restOfShotShip.some(({ y }) => {
        return y === firstCellY;
      })
    ) {
      this.#forbiddenShotDirections.push(2, 4);
    }
  }

  /**Resets flags for destroying algorythm, deletes cells of sunk ship and cells around it from cells possible to shoot */
  resetHitInfo() {
    const shotShip = this.shotShip;
    this.shotShip = [];
    this.#forbiddenShotDirections = [];
    this.#eliminateCellsToShoot(shotShip);
  }

  /**
   * deletes cells of ships and around it from cells possible to shoot
   * @param {array} shotShip
   */
  #eliminateCellsToShoot(shotShip) {
    const shotShipCoordinates = this.changeNameOfKeysForValues(shotShip);
    const impossibleToShipCells =
      this.getImpossibleToShipCells(shotShipCoordinates);

    //filters out cells that are still possible to ship without cells around sunken ship
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
        // If the last shoot direction is not in the forbidden shot directions
        // and it is defined, add it to the forbidden shot directions
        this.#forbiddenShotDirections.push(lastShootDirection);
      }
    }
  }
}
