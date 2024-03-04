import { Player } from "./Player.js";
import { SeaMap } from "./SeaMap.js";
import { ShootMap } from "./ShootMap.js";
import { ShipDisplay } from "./ShipDisplay.js";
import { GameConsole } from "./GameConsole.js";
import { SeaCell } from "./SeaCell.js";

export class HumanPlayer extends Player {
  #lastShipPlacement; // flag made for controlling displaying and replacing ship
  #isLastPlacePossibleToShip; // flag used in ship deploying
  #lastShootPlacement; // flag used for shooting

  #playerSeaMap;
  #playerShootMap;

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

    this.playerConsole = new GameConsole();
    this.#playerSeaMap = new SeaMap(mapSize);
    this.#playerShootMap = new ShootMap(mapSize);
    this.playerShipsDisplay = new ShipDisplay(
      numberOfFiveCellShips,
      numberOfFourCellShips,
      numberOfThreeCellShips,
      numberOfTwoCellShips,
      numberOfOneCellShips
    );

    //variables and flags for placing ships
    this.#lastShipPlacement = [];
    this.#isLastPlacePossibleToShip = false;

    //variables and flags for making shot
    this.#lastShootPlacement = null;

    this.#bindElemnts();
    this.#renderPlayersTable();
  }

  get _seaMap() {
    return this.#playerSeaMap;
  }

  get _shootMap() {
    return this.#playerShootMap;
  }

  #bindElemnts() {
    this.placingPanelElement = this.getElement(this.UISelectors.placingPanel);
    this.shootPanelElement = this.getElement(this.UISelectors.shootPanel);
    this.placeButtonElement = this.getElement(this.UISelectors.placeButton);
    this.rotateButtonElement = this.getElement(this.UISelectors.rotateButton);
    this.shootButtonElement = this.getElement(this.UISelectors.shootButton);
    this.changeButtonElement = this.getElement(this.UISelectors.changeButton);
    this.quitButtonElement = this.getElement(this.UISelectors.quitButton);
  }

  /**
   * renders map and
   */
  #renderPlayersTable() {
    this.#playerShootMap.renderShootMap();
    this.#playerSeaMap.renderSeaMap();
    this.setSeaMapSize();
  }

  setSeaMapSize() {
    this.#playerSeaMap.setMapSize(this.#playerSeaMap.seaMapElement);
    this.#playerShootMap.setMapSize(this.#playerShootMap.shootMapElement);
  }

  /*Asynchronic function which handles whole process of adding ships.
  It iterates through array "shipsToPlace" which contains values of all ship types, index of 
  "shipsToPlace" also describes how many cells ship that is placed at this moment will have.
  Loop always starts with biggest ships and it goes to smallest one.
  Another loop inside previous one is determines how many ships of specyfic size will be placed, 
  and handles this proces for each of the ships. So "numberOfSpecificShips" means how many ships
  of size "shipLenght" will be placed.
  */
  async deployPlayersShips() {
    //select all sea map Cells
    const allSeaCellsSelector = `[data-sea-cell][data-is-border="false"]`;
    const allSeaCellsElements = this.getElements(allSeaCellsSelector);

    const shipsToPlace = Object.values(this.ships);
    let iterator = 0; //determines numbering of ships
    let direction = 1; // modulo of that number determines to which side of our targeted cell ship will be displayed and placed
    let shipNumber = 1;

    for (let shipLength = shipsToPlace.length; shipLength > 0; shipLength--) {
      for (
        let numberOfSpecificShips = shipsToPlace[iterator];
        numberOfSpecificShips > 0;
        numberOfSpecificShips--
      ) {
        /* all functions had to be declarated a way that i could pass them to event listeners without any arguments,
        otherwise, there was a problem to delete specyfic event listener from elements, what was affecting on unwated
        calls of those functions with incorrect parameters */

        this.changeButtonElement.disabled = true; //makes rotate button dissabled until player set desired detination of ship
        this.placeButtonElement.disabled = true; // makes place button dissabled untill player set a desired destination of ship
        this.rotateButtonElement.disabled = false; //makes rotate button enabled after a ship placement
        const rotate = () => {
          direction++;
        };

        // handle functions made for easy add and delete event listeners to buttons that are used in each loop
        const handleCellMouseOver = (event) => {
          const cell = event.currentTarget;
          this.#showShipShape(cell, shipLength, direction % 4);
        };

        const handleCellClick = (event) => {
          const cell = event.currentTarget;
          this.#placeShip(cell, shipLength, direction % 4);
        };

        const handlePlaceButtonClick = () => {
          this.#addShip(this.#lastShipPlacement, shipNumber); //ship number has to be > 0
          removeEventListeners();
        };

        const handleChangeClick = () => {
          this.#changeShip();
        };

        allSeaCellsElements.forEach((cell) => {
          cell.addEventListener("mouseover", handleCellMouseOver);
          cell.addEventListener("mouseout", handleCellMouseOver);
          cell.addEventListener("click", handleCellClick);
        });

        this.changeButtonElement.addEventListener("click", handleChangeClick);
        this.rotateButtonElement.addEventListener("click", rotate);
        this.rotateButtonElement.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
          }
        });

        const removeEventListeners = () => {
          allSeaCellsElements.forEach((cell) => {
            cell.removeEventListener("mouseover", handleCellMouseOver);
            cell.removeEventListener("mouseout", handleCellMouseOver);
            cell.removeEventListener("click", handleCellClick);
          });

          this.placeButtonElement.removeEventListener(
            "click",
            handlePlaceButtonClick
          );
          this.rotateButtonElement.removeEventListener("click", rotate);
          this.changeButtonElement.removeEventListener(
            "click",
            handleChangeClick
          );
        };

        this.placeButtonElement.addEventListener(
          "click",
          handlePlaceButtonClick
        );

        //loop ends when place button is clicked
        await new Promise((resolve) => {
          this.placeButtonElement.addEventListener("click", () => resolve());
        });

        shipNumber++; // grows to set next number of ship 1 greater

        this.playerShipsDisplay.activateShip(shipLength, numberOfSpecificShips);
      }

      iterator++; //grows after itteration of outer for, describes ship length
    }
  }

  /**
   * Deletes shape of placed but not confirmed ship, enables map and proper buttons for clicking
   */
  #changeShip() {
    this.#deleteShipClassFromShip(this.#lastShipPlacement);
    this.placeButtonElement.disabled = true;
    this.changeButtonElement.disabled = true;
    this.rotateButtonElement.disabled = false;
    this.toggleNonClickableElement(this.#playerSeaMap.seaMapElement);
  }

  #placeShip(cell, length, direction) {
    if (this.#isLastPlacePossibleToShip) {
      const cellX = parseInt(cell.dataset.x, 10);
      const cellY = parseInt(cell.dataset.y, 10);
      this.toggleNonClickableElement(this.#playerSeaMap.seaMapElement); //turning off possibility to place another ship untill user save ship position or decides to change it by clicking correct button
      this.changeButtonElement.disabled = false;
      this.placeButtonElement.disabled = false;
      this.rotateButtonElement.disabled = true;

      // depending on direction and length of ship, gets all cells that ship will be placed on, and sets a class os ship for all of them
      switch (direction) {
        case 1:
          this.#handleShipPlacement(length, cellX, cellY, false, "x");
          break;
        case 2:
          this.#handleShipPlacement(length, cellX, cellY, false, "y");
          break;
        case 3:
          this.#handleShipPlacement(length, cellX, cellY, true, "x");
          break;
        case 0:
          this.#handleShipPlacement(length, cellX, cellY, true, "y");
          break;
      }
    } else {
      return;
    }
  }

  /**
   * Handles temporary placing ship on sea map. depending on length of ship, it's coordinates adding ship in direction,
   which is defined by boolean value isMinus(if true top/left, if false right/bottom) and changedValue which is string that takes "x"(top/bottom) or "y"(right/left). 
   * @param {number} length 
   * @param {number} cellX 
   * @param {number} cellY 
   * @param {boolean} isMinus 
   * @param {string} changedValue 
   */
  #handleShipPlacement(length, cellX, cellY, isMinus, changedValue) {
    this.#lastShipPlacement = [];
    for (let i = 0; i < length; i++) {
      const shipPiece = this.getElement(
        this.#generateSelector(cellX, cellY, i, isMinus, changedValue)
      );
      shipPiece.classList.add(this.cssClasses.ship);
      const cellCoordinates = {
        XValue: shipPiece.getAttribute("data-x"),
        YValue: shipPiece.getAttribute("data-y"),
      };
      this.#lastShipPlacement.push(cellCoordinates);
    }
  }

  #generateSelector(cellX, cellY, i, isMinus, changedValue) {
    if (isMinus) {
      return this.#generateMinusSelectors(cellX, cellY, i, changedValue);
    } else {
      return this.#generatePlusSelectors(cellX, cellY, i, changedValue);
    }
  }

  #generateMinusSelectors(cellX, cellY, i, changedValue) {
    if (changedValue === "x") {
      return `[data-x="${cellX - i}"][data-y="${cellY}"]`;
    } else if (changedValue === "y") {
      return `[data-x="${cellX}"][data-y="${cellY - i}"]`;
    }
  }

  #generatePlusSelectors(cellX, cellY, i, changedValue) {
    if (changedValue === "x") {
      return `[data-x="${cellX + i}"][data-y="${cellY}"]`;
    } else if (changedValue === "y") {
      return `[data-x="${cellX}"][data-y="${cellY + i}"]`;
    }
  }

  /**
   * Saves ship placement
   * @param {object} cellsCoordiates
   * @param {number} shipNumber
   */
  #addShip(cellsCoordiates, shipNumber) {
    this.#playerSeaMap.setShipCells(cellsCoordiates, shipNumber);
    this.#deleteShipClassFromShip(cellsCoordiates); //deletes a visual representation of ship

    // transforms keys names to keep equality of names
    const impossibleToShipCells = this.changeNameOfKeysForValues(
      this.getImpossibleToShipCells(cellsCoordiates)
    );
    this.#playerSeaMap.setImpossibleToShipCells(impossibleToShipCells);
    this.#playerSeaMap.refreshSeaMap();
    this.toggleNonClickableElement(this.#playerSeaMap.seaMapElement); // relese map for another ship placement
  }

  #deleteShipClassFromShip(cellsCoordiates) {
    const shipsToDelete = [];
    cellsCoordiates.forEach(({ XValue, YValue }) => {
      const selector = `[data-x="${XValue}"][data-y="${YValue}"]`;
      const shipToDelete = this.getElement(selector);
      shipsToDelete.push(shipToDelete);
    });

    shipsToDelete.forEach((ship) => {
      ship.classList.remove(this.cssClasses.ship);
    });
  }

  /**
   * Function handles hovering cell on sea map, depending on how big ship is, on which cell player hovers, and which direction is on.
   * If one of cells that are in range of ship that is displayed at this moment, ship display collapses to range of that cell and turns displayed ship to red color.
   * @param {SeaCell} cell
   * @param {number} length
   * @param {number} direction 1 = bottom, 2 = right, 3 = top, 4 = left;
   */
  #showShipShape(cell, length, direction) {
    const cellX = parseInt(cell.dataset.x, 10);
    const cellY = parseInt(cell.dataset.y, 10);
    let shipShape;
    let possibleShape;

    const targetedCell = this.getElement(
      `[data-x="${cellX}"][data-y="${cellY}"]`
    );

    if (targetedCell.dataset.isPossibleToShip == "false") {
      targetedCell.classList.toggle(this.cssClasses.declineBlink);
    }
    //dependind on direction and length, gets SeaCell elements and pushes it to ShipShape arrays
    switch (direction) {
      case 1:
        shipShape = [];
        possibleShape = [];
        for (let i = 0; i < length; i++) {
          const shipPiece = this.getElement(
            `[data-x="${cellX + i}"][data-y="${cellY}"]`
          );
          shipShape.push(shipPiece);
        }

        this.#handleShipShapeDisplay(shipShape, possibleShape);

        break;
      case 2:
        shipShape = [];
        possibleShape = [];
        for (let i = 0; i < length; i++) {
          const shipPiece = this.getElement(
            `[data-x="${cellX}"][data-y="${cellY + i}"]`
          );
          shipShape.push(shipPiece);
        }

        this.#handleShipShapeDisplay(shipShape, possibleShape);

        break;
      case 3:
        shipShape = [];
        possibleShape = [];
        for (let i = 0; i < length; i++) {
          const shipPiece = this.getElement(
            `[data-x="${cellX - i}"][data-y="${cellY}"]`
          );
          shipShape.push(shipPiece);
        }

        this.#handleShipShapeDisplay(shipShape, possibleShape);

        break;
      case 0:
        shipShape = [];
        possibleShape = [];

        for (let i = 0; i < length; i++) {
          const shipPiece = this.getElement(
            `[data-x="${cellX}"][data-y="${cellY - i}"]`
          );
          shipShape.push(shipPiece);
        }

        this.#handleShipShapeDisplay(shipShape, possibleShape);

        break;
    }
  }

  /**
   * Checks each of cell of shipShape array and if specyfic cell is not a border and do not colide with other ships. If so , pushes this cell to array passed as 2nd argument.
   * adds proper class (cells color) to ship shape, depends if ship is possible to place or not
   * @param {Array} shipShape
   * @param {Array} possibleShape
   */
  #handleShipShapeDisplay(shipShape, possibleShape) {
    for (let i = 0; i < shipShape.length; i++) {
      const cell = shipShape[i];
      if (
        cell.dataset.isBorder == "false" &&
        cell.dataset.isPossibleToShip == "true"
      ) {
        possibleShape.push(cell);
        this.#isLastPlacePossibleToShip = true;
      } else {
        this.#isLastPlacePossibleToShip = false;
        break;
      }
    }

    this.#addProperShipShapeClass(possibleShape);
  }

  /**
   * Sets proper css class depending if ship shape shows ship that is possible to place or not
   * @param {Array} possibleShape
   */
  #addProperShipShapeClass(possibleShape) {
    if (this.#isLastPlacePossibleToShip === false) {
      possibleShape.forEach((cell) => {
        cell.classList.toggle(this.cssClasses.declineBlink);
      });
    } else {
      possibleShape.forEach((cell) => {
        cell.classList.toggle(this.cssClasses.blink);
      });
    }
  }

  /**
   * Method handles selecting cell to shoot,
   * @returns {object}
   */
  async makeShoot() {
    let shoot = null;
    const allShootCellsSelector = `[data-shoot-cell][data-is-border="false"]`;
    const allShootCellsElements = this.getElements(allShootCellsSelector);

    this.shootButtonElement.disabled = true; //disable shoot button before player select any cell

    const handleCellMouseOver = (event) => {
      const cell = event.currentTarget;
      this.#showTargetedShootCell(cell);
    };

    const handleCellMouseOut = (event) => {
      const cell = event.currentTarget;
      this.#hideTargetedShootCell(cell);
    };

    const handleCellClick = (event) => {
      const cell = event.currentTarget;
      this.#setShootingTarget(cell);
    };

    const removeEventListeners = () => {
      allShootCellsElements.forEach((cell) => {
        cell.removeEventListener("mouseover", handleCellMouseOver);
        cell.removeEventListener("mouseout", handleCellMouseOut);
        cell.removeEventListener("click", handleCellClick);
      });

      this.shootButtonElement.removeEventListener(
        "click",
        handleShootButtonClick
      );

      this.quitButtonElement.removeEventListener("click", removeEventListeners);
    };

    const handleShootButtonClick = () => {
      shoot = this.#acceptShoot();
      removeEventListeners();
    };

    allShootCellsElements.forEach((cell) => {
      cell.addEventListener("mouseover", handleCellMouseOver);
      cell.addEventListener("mouseout", handleCellMouseOut);
      cell.addEventListener("click", handleCellClick);
    });

    //delete event listener in case that there is one after reseting game
    this.shootButtonElement.addEventListener("click", handleShootButtonClick);
    this.quitButtonElement.addEventListener("click", removeEventListeners);

    //resolve promise after shoot button was clicked
    await new Promise((resolve) => {
      this.shootButtonElement.addEventListener("click", () => resolve());
    });

    return shoot;
  }

  /**
   * Highlights cell passed in parameter
   * @param {Object} cell
   */
  #showTargetedShootCell(cell) {
    cell.classList.add(this.cssClasses.shootTargetHover);
  }

  /**
   * hides higlight of cell passed in parameter
   * @param {Object} cell
   */
  #hideTargetedShootCell(cell) {
    cell.classList.remove(this.cssClasses.shootTargetHover);
  }

  /**
   * Handles targeting cell, sets it as temporary target untill player accepts it by clicking shoot button.
   * @param {Object} cell
   */
  #setShootingTarget(cell) {
    const target = {
      x: cell.getAttribute("data-x"),
      y: cell.getAttribute("data-y"),
    };

    this.shootButtonElement.disabled = false; //enable shoot button after

    // removes target class from last choosen cell but only if there was any other cell choosen as target before.
    if (this.#lastShootPlacement != null) {
      const lastShootTarget = this.getElement(
        `[data-shoot-cell][data-x="${this.#lastShootPlacement.x}"][data-y="${
          this.#lastShootPlacement.y
        }"]`
      );
      lastShootTarget.classList.remove(this.cssClasses.shootTarget);
    }

    cell.classList.add(this.cssClasses.shootTarget);
    this.#lastShootPlacement = target; // sets target as LastShootPlacement for future accepting or changing target
  }

  /**
   * Accepts shoot choosen by player, returns targeted cell
   * @returns {Object}
   */
  #acceptShoot() {
    const shoot = {
      x: this.#lastShootPlacement.x,
      y: this.#lastShootPlacement.y,
    };

    this.shootButtonElement.disabled = true;

    const lastShootTarget = this.getElement(
      `[data-shoot-cell][data-x="${this.#lastShootPlacement.x}"][data-y="${
        this.#lastShootPlacement.y
      }"]`
    );
    this.#playerShootMap.setShootCell(shoot);
    lastShootTarget.classList.remove(this.cssClasses.shootTarget);
    this.#playerShootMap.refreshShootMap();
    this.#lastShootPlacement = null;
    return shoot;
  }
}
