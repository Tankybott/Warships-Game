import { UI } from "./UI.js";

export class ShipDisplay extends UI {
  /**
   *
   * @param {number} numberOfFiveCellShips
   * @param {number} numberOfFourCellShips
   * @param {number} numberOfThreeCellShips
   * @param {number} numberOfTwoCellShips
   * @param {number} numberOfOneCellShips
   */
  constructor(
    numberOfFiveCellShips,
    numberOfFourCellShips,
    numberOfThreeCellShips,
    numberOfTwoCellShips,
    numberOfOneCellShips
  ) {
    super();
    this.ships = {
      fiveCellShips: numberOfFiveCellShips,
      fourCellShips: numberOfFourCellShips,
      threeCellShips: numberOfThreeCellShips,
      twoCellShips: numberOfTwoCellShips,
      oneCellShips: numberOfOneCellShips,
    };

    this.shipsArray = Object.values(this.ships);
    this.#bindToElements();
    this.#resetShipsDisplay();
    this.numberOfAllShips = this.#countAllShips();
    this.#displayNumberOfShips();
    this.#displayColumns();
    this.#displayShips();
  }

  #bindToElements() {
    this.shipsDisplayCounterElement = this.getElement(
      this.UISelectors.shipsDisplayCounter
    );
    this.shipsDisplayElement = this.getElement(this.UISelectors.shipsDisplay);
  }

  #resetShipsDisplay() {
    this.shipsDisplayElement.innerHTML = "";
  }

  /**
   * @returns {number}
   */
  #countAllShips() {
    const numberOfAllShips = this.shipsArray.reduce(
      (summaryNumberOfAllShips, numberOfSpecyficShips) =>
        summaryNumberOfAllShips + numberOfSpecyficShips,
      0
    );

    return numberOfAllShips;
  }

  #displayNumberOfShips() {
    this.shipsDisplayCounterElement.innerText = `You got ${this.numberOfAllShips.toString()} ships left`;
  }

  #decreseNumberOfShips() {
    this.numberOfAllShips--;
    this.#fadeOutInShipsNumber();
  }

  /**
   * Handles animating when number of ship decresed
   */
  #fadeOutInShipsNumber() {
    const refreshText = () => {
      this.#displayNumberOfShips();
      this.shipsDisplayCounterElement.classList.remove(
        this.cssClasses.displayCounterHidden
      );
    };

    this.shipsDisplayCounterElement.classList.add(
      this.cssClasses.displayCounterHidden
    );
    this.shipsDisplayCounterElement.addEventListener(
      "transitionend",
      refreshText
    );
  }

  #displayColumns() {
    this.shipsDisplayElement.style.gridTemplateColumns = `repeat(${this.#getNumberOfShipTypes()}, 1fr)`;

    this.shipsArray.reverse().forEach((shipType, index) => {
      if (shipType > 0) {
        this.shipsDisplayElement.insertBefore(
          this.#createColumnElement(index + 1),
          this.shipsDisplayElement.firstChild
        );
      }
    });
  }

  /**
   * returns amount of all ship types in game right now
   * @returns {number}
   */
  #getNumberOfShipTypes() {
    let numberOfShipsTypes = 0;
    this.shipsArray.forEach((shipType) => {
      if (shipType > 0) {
        numberOfShipsTypes++;
      }
    });

    return numberOfShipsTypes;
  }

  #createColumnElement(shipTypeDestination) {
    const element = document.createElement("div");
    element.classList.add(this.cssClasses.displayColumn);
    element.setAttribute(`data-column-${shipTypeDestination}`, "");
    return element;
  }

  /**
   * displaying ship in specyfic column, as columns were created before with number in css class that describes a length of ships that are inside
   * this specyfic column. It itterates through ShipsArray, as far as it finds that array element is > 0, which means that specyfic type of ship exists, it pushing an amount of ships described as shipType, to a column that was created for that type of ships, it finds column by forEach index
   */
  #displayShips() {
    this.shipsArray.forEach((shipType, index) => {
      if (shipType > 0) {
        const column = this.getElement(`[data-column-${index + 1}]`);
        for (let i = shipType; i > 0; i--) {
          column.appendChild(this.#createShipElement(index + 1));
        }
      }
    });

    this.#adjustShipsSize();
  }

  //adjust size of ship, if there is more less than 4 types of ships, it adjust size of ship so it keeps a good proportion on mobile
  #adjustShipsSize() {
    if (this.#getNumberOfShipTypes() <= 3) {
      this.#addShipSmallGameClass();
    } else {
      this.#removeShipSmallGameClass();
    }
  }

  //handles changes for css that have to be done because of various game levels
  #addShipSmallGameClass() {
    const ships = this.getElements(this.UISelectors.displayedShip);
    ships.forEach((ship) => {
      ship.classList.add(this.cssClasses.displayShipSmallGame);
    });
  }

  #removeShipSmallGameClass() {
    const ships = this.getElements(this.UISelectors.displayedShip);
    ships.forEach((ship) => {
      if (ship.classList.contains(this.cssClasses.displayShipSmallGame)) {
        ship.classList.remove(this.cssClasses.displayShipSmallGame);
      }
    });
  }

  #createShipElement(shipSize) {
    const element = document.createElement("div");
    element.classList.add(this.cssClasses.displayShip);
    element.classList.add(this.cssClasses.displayShipDisactivated);
    element.innerText = shipSize;
    element.setAttribute("data-displayed-ship", "");

    return element;
  }

  /**
   * shows ship as avtive in choosen column
   * @param {number} colNumber
   * @param {number} shipNumber
   */
  activateShip(colNumber, shipNumber) {
    const column = this.getElement(`[data-column-${colNumber}]`);
    const shipElement = column.querySelector(`:nth-last-child(${shipNumber})`);

    shipElement.classList.remove(this.cssClasses.displayShipDisactivated);
  }

  /**
   * shows ship as disactive in choosen column
   * @param {number} colNumber
   */
  disactivateShip(colNumber) {
    const column = this.getElement(`[data-column-${colNumber}]`);
    //selects first element in column which has no class Disactive
    const columnElements = column.children;

    for (let i = columnElements.length - 1; i >= 0; i--) {
      const columnElement = columnElements[i];
      if (
        !columnElement.classList.contains(
          this.cssClasses.displayShipDisactivated
        )
      ) {
        columnElement.classList.add(this.cssClasses.displayShipDisactivated);
        break;
      }
    }

    this.#decreseNumberOfShips();
  }
}
