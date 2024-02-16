import { Player } from "./Player.js";
import { SeaMap } from "./SeaMap.js";
import { ShootMap } from "./ShootMap.js";
import { ShipDisplay } from "./ShipDisplay.js";
import { GameConsole } from "./GameConsole.js";
import { DATA_SEA_CELL } from "./SeaCell.js";

export const SHIP_CSS = "ship";
export const SHOOT_TARGET_CSS = "shoot-target";
const SHOOT_TARGET_HOVER_CSS = "shoot-target-hover";
export const HIT_CSS = "hit";
const BLINK_CSS = "blink";
const DECLINE_BLINK_CSS = "blink-red";

export class HumanPlayer extends Player {
  #lastShipPlacement;
  #isLastPlacePossibleToShip;
  #lastShootPlacement;

  #playerSeaMap;
  #playerShootMap;

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
    this.#lastShootPlacement = null;
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
  "shipsToPlace" also describes how many cells ship that is placed at time will have.
  Loop always starts with biggest ships and it goes to smallest one.
  Another loop inside previous one is determines how many ships of specyfic size will be placed, 
  and handles this proces for each of the ships. So "numberOfSpecificShips" means how many ships
  of size "shipLenght" will be placed.
  */
  async deployPlayersShips() {
    //select all sea map Cells
    const allSeaCellsSelector = `[${DATA_SEA_CELL}][data-is-border="false"]`;
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

  #changeShip() {
    this.#deleteCssClassFromShips(this.#lastShipPlacement);
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
      this.changeButtonElement.disabled = false; // enables possibility to change place of ship
      this.placeButtonElement.disabled = false; //enables possibility to click button which saves ship destination
      this.rotateButtonElement.disabled = true;

      switch (direction) {
        case 1:
          this.#lastShipPlacement = [];
          for (let i = 0; i < length; i++) {
            const shipPiece = this.getElement(
              `[data-x="${cellX + i}"][data-y="${cellY}"]`
            );
            shipPiece.classList.add(SHIP_CSS);
            const cellCoordinates = {
              XValue: shipPiece.getAttribute("data-x"),
              YValue: shipPiece.getAttribute("data-y"),
            };
            this.#lastShipPlacement.push(cellCoordinates);
          }
          break;
        case 2:
          this.#lastShipPlacement = [];
          for (let i = 0; i < length; i++) {
            const shipPiece = this.getElement(
              `[data-x="${cellX}"][data-y="${cellY + i}"]`
            );
            shipPiece.classList.add(SHIP_CSS);
            const cellCoordinates = {
              XValue: shipPiece.getAttribute("data-x"),
              YValue: shipPiece.getAttribute("data-y"),
            };
            this.#lastShipPlacement.push(cellCoordinates);
          }
          break;
        case 3:
          this.#lastShipPlacement = [];
          for (let i = 0; i < length; i++) {
            const shipPiece = this.getElement(
              `[data-x="${cellX - i}"][data-y="${cellY}"]`
            );
            shipPiece.classList.add(SHIP_CSS);
            const cellCoordinates = {
              XValue: shipPiece.getAttribute("data-x"),
              YValue: shipPiece.getAttribute("data-y"),
            };
            this.#lastShipPlacement.push(cellCoordinates);
          }
          break;
        case 0:
          this.#lastShipPlacement = [];
          for (let i = 0; i < length; i++) {
            const shipPiece = this.getElement(
              `[data-x="${cellX}"][data-y="${cellY - i}"]`
            );
            shipPiece.classList.add(SHIP_CSS);
            const cellCoordinates = {
              XValue: shipPiece.getAttribute("data-x"),
              YValue: shipPiece.getAttribute("data-y"),
            };
            this.#lastShipPlacement.push(cellCoordinates);
          }
          break;
      }
    } else {
      return;
    }
  }

  #addShip(cellsCoordiates, shipNumber) {
    this.#playerSeaMap.setShipCells(cellsCoordiates, shipNumber);
    this.#deleteCssClassFromShips(cellsCoordiates); //deletes a visual representation of ship

    // transforms keys names to keep equality of names
    const impossibleToShipCells = this.changeNameOfKeysForValues(
      this.getImpossibleToShipCells(cellsCoordiates)
    );
    this.#playerSeaMap.setImpossibleToShipCells(impossibleToShipCells);
    this.#playerSeaMap.refreshSeaMap();
    this.toggleNonClickableElement(this.#playerSeaMap.seaMapElement); // relese map for another ship placement
  }

  #deleteCssClassFromShips(cellsCoordiates) {
    const shipsToDelete = [];
    cellsCoordiates.forEach(({ XValue, YValue }) => {
      const selector = `[data-x="${XValue}"][data-y="${YValue}"]`;
      const shipToDelete = this.getElement(selector);
      shipsToDelete.push(shipToDelete);
    });

    shipsToDelete.forEach((ship) => {
      ship.classList.remove(SHIP_CSS);
    });
  }

  #showShipShape(cell, length = 3, direction) {
    const cellX = parseInt(cell.dataset.x, 10);
    const cellY = parseInt(cell.dataset.y, 10);
    let shipShape;
    let possibleShape;

    const targetedCell = this.getElement(
      `[data-x="${cellX}"][data-y="${cellY}"]`
    );

    //shows user that targeted cell is impossible to ship
    if (targetedCell.dataset.isPossibleToShip == "false") {
      targetedCell.classList.toggle(DECLINE_BLINK_CSS);
    }

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

        if (this.#isLastPlacePossibleToShip === false) {
          possibleShape.forEach((cell) => {
            cell.classList.toggle(DECLINE_BLINK_CSS);
          });
        } else {
          possibleShape.forEach((cell) => {
            cell.classList.toggle(BLINK_CSS);
          });
        }

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

        if (this.#isLastPlacePossibleToShip === false) {
          possibleShape.forEach((cell) => {
            cell.classList.toggle(DECLINE_BLINK_CSS);
          });
        } else {
          possibleShape.forEach((cell) => {
            cell.classList.toggle(BLINK_CSS);
          });
        }

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

        if (this.#isLastPlacePossibleToShip === false) {
          possibleShape.forEach((cell) => {
            cell.classList.toggle(DECLINE_BLINK_CSS);
          });
        } else {
          possibleShape.forEach((cell) => {
            cell.classList.toggle(BLINK_CSS);
          });
        }

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

        if (this.#isLastPlacePossibleToShip === false) {
          possibleShape.forEach((cell) => {
            cell.classList.toggle(DECLINE_BLINK_CSS);
          });
        } else {
          possibleShape.forEach((cell) => {
            cell.classList.toggle(BLINK_CSS);
          });
        }

        break;
    }
  }

  async makeShoot() {
    let shoot = null;
    const allShootCellsSelector = `[data-shoot-cell][data-is-border="false"]`;
    const allShootCellsElements = this.getElements(allShootCellsSelector);

    this.shootButtonElement.disabled = true;
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

    await new Promise((resolve) => {
      this.shootButtonElement.addEventListener("click", () => resolve());
    });

    return shoot;
  }

  #showTargetedShootCell(cell) {
    cell.classList.add(SHOOT_TARGET_HOVER_CSS);
  }

  #hideTargetedShootCell(cell) {
    cell.classList.remove(SHOOT_TARGET_HOVER_CSS);
  }

  #setShootingTarget(cell) {
    const target = {
      x: cell.getAttribute("data-x"),
      y: cell.getAttribute("data-y"),
    };

    this.shootButtonElement.disabled = false;

    if (this.#lastShootPlacement != null) {
      const lastShootTarget = this.getElement(
        `[data-shoot-cell][data-x="${this.#lastShootPlacement.x}"][data-y="${
          this.#lastShootPlacement.y
        }"]`
      );
      lastShootTarget.classList.remove(SHOOT_TARGET_CSS);
    }

    cell.classList.add(SHOOT_TARGET_CSS);
    this.#lastShootPlacement = target;
  }

  #acceptShoot() {
    const shoot = {
      x: this.#lastShootPlacement.x,
      y: this.#lastShootPlacement.y,
    };
    const shootValues = {
      XValue: this.#lastShootPlacement.x,
      YValue: this.#lastShootPlacement.y,
    };

    this.shootButtonElement.disabled = true;

    const lastShootTarget = this.getElement(
      `[data-shoot-cell][data-x="${this.#lastShootPlacement.x}"][data-y="${
        this.#lastShootPlacement.y
      }"]`
    );
    this.#playerShootMap.setShootCell(shootValues);
    lastShootTarget.classList.remove(SHOOT_TARGET_CSS);
    this.#playerShootMap.refreshShootMap();
    this.#lastShootPlacement = null;
    this.#playerShootMap.showCells();
    return shoot;
  }
}
