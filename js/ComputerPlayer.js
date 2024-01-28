import { Player } from "./Player.js";
import { SeaMap } from "./SeaMap.js";

export class ComputerPlayer extends Player {
  #allCells;
  #cellsToShoot;
  #seaMap;
  #shotDirection;
  #forbiddenShotDirections;
  #lastShootDirection;

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
    this.shotShip = [];
    this.#forbiddenShotDirections = [];
    this.#seaMap = new SeaMap(mapSize);
    this.#allCells = this.#seaMap.seaCells;
    this.#cellsToShoot = this.#allCells.flat().filter((cell) => !cell.isBorder);

    this.#deployComputersShips();
  }

  get _seaMap() {
    return this.#seaMap;
  }

  #deployComputersShips() {
    const shipsToPlace = Object.values(this.ships);
    let iterator = 0; //determines numbering of ships
    let shipNumber = 1;
    let cellsFreeToShip = this.#allCells.flat();

    for (let shipLength = shipsToPlace.length; shipLength > 0; shipLength--) {
      for (
        let numberOfSpecificShips = shipsToPlace[iterator];
        numberOfSpecificShips > 0;
        numberOfSpecificShips--
      ) {
        let tempShipShape;
        do {
          const randomDirection = Math.floor(Math.random() * 4) + 1;
          tempShipShape = this.#getPossibleShipShape(
            this.#getRandomCell(cellsFreeToShip),
            shipLength,
            randomDirection
          );
        } while (tempShipShape.length !== shipLength);

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

        shipNumber++;
      }
      iterator++;
    }
  }

  #getPossibleShipShape(cell, length = 3, direction) {
    let possibleShape = [];

    switch (direction) {
      case 1:
        if (cell.x <= this.mapSize - (length - 1) && cell.PossibleToShip) {
          possibleShape = [];
          for (let i = 0; i < length; i++) {
            const cellToCheck = this.#allCells[cell.x + i][cell.y];
            if (cellToCheck.PossibleToShip && !cellToCheck.isBorder) {
              possibleShape.push(cellToCheck);
            }
          }
        } else {
          possibleShape = [];
        }
        break;
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

    return possibleShape;
  }

  #getRandomCell(cells) {
    const randomIndex = Math.floor(Math.random() * cells.length);
    return cells[randomIndex];
  }

  makeShoot() {
    if (this.shotShip.length === 0) {
      return this.#hunt();
    } else {
      return this.#destroy();
    }
  }

  #hunt() {
    const randomCellToShootIndex = Math.floor(
      Math.random() * this.#cellsToShoot.length
    );
    const randomCellToShoot = this.#cellsToShoot[randomCellToShootIndex];
    this.#cellsToShoot.splice(randomCellToShootIndex, 1);

    return randomCellToShoot;
  }

  #destroy() {
    /**if there is only once cell inside shotShip(ship that were hit), get a random number between 1-4 to decide
     * which direction next shot will be made, eliminate possibilities to shot in directions where ship is
     * toutching border cells.   Numbers meaning 1 - bottom, 2 right, 3 top , 4 left*/

    if (this.shotShip.length === 1) {
      return this.#destroyAnotherCell();
    } else if (this.shotShip.length > 1) {
      console.log("startuje destroy");
      this.#findDirectionsToShoot();
      return this.#destroyAnotherCell();
    }
  }

  #destroyAnotherCell() {
    let cellX = this.shotShip[0].x;
    let cellY = this.shotShip[0].y;
    let randomDirection = this.#getRandomDirection();
    let nextShootCoordinates = {};

    while (this.#forbiddenShotDirections.includes(randomDirection)) {
      randomDirection = this.#getRandomDirection();
    }

    if (cellX === 1 && randomDirection === 3) {
      randomDirection = this.#getRandomDirection();
    }
    if (cellX === this.mapSize && randomDirection === 1) {
      randomDirection = this.#getRandomDirection();
    }
    if (cellY === 1 && randomDirection === 4) {
      randomDirection = this.#getRandomDirection();
    }
    if (cellX === this.mapSize && randomDirection === 2) {
      randomDirection = this.#getRandomDirection();
    }

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

    return nextShoot;
  }

  #getRandomDirection() {
    return Math.floor(Math.random() * 4) + 1;
  }

  #getCellFromCellsToShoot({ x, y }) {
    return (
      this.#cellsToShoot.find((cell) => cell.x === x && cell.y === y) || null
    );
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
        console.log(`to jest x ${x}`);
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
    console.log(`shot ship ${shotShip.x}${shotShip.y}`);
    console.log(impossibleToShipCells);
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
