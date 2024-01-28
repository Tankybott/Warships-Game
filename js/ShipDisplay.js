import { UI } from "./UI.js";

const DISPLAY_COLUMN_CSS = "ships-display__display-column";
const SHIP_CSS = "ships-display__ship";
const SHIP_DISCATIVE_CSS = "ships-display__ship--disactive";

const DATA_DISPLAYED_SHIP = "data-displayed-ship";

export class ShipDisplay extends UI {
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

  #countAllShips() {
    const numberOfAllShips = this.shipsArray.reduce(
      (summaryNumberOfAllShips, numberOfSpecyficShips) =>
        summaryNumberOfAllShips + numberOfSpecyficShips,
      0
    );

    return numberOfAllShips;
  }

  #displayNumberOfShips() {
    this.shipsDisplayCounterElement.innerText =
      this.numberOfAllShips.toString();
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
    element.classList.add(DISPLAY_COLUMN_CSS);
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
  }

  #createShipElement(shipSize) {
    const element = document.createElement("div");
    element.classList.add(SHIP_CSS);
    element.classList.add(SHIP_DISCATIVE_CSS);
    element.innerText = shipSize;
    element.setAttribute(DATA_DISPLAYED_SHIP, "");

    return element;
  }

  decreseNumberOfShips() {
    this.numberOfAllShips--;
  }

  activateShip(colNumber, shipNumber) {
    const column = this.getElement(`[data-column-${colNumber}]`);
    const shipElement = column.querySelector(`:nth-last-child(${shipNumber})`);

    shipElement.classList.remove(SHIP_DISCATIVE_CSS);
  }

  disactivateShip(colNumber) {
    const column = this.getElement(`[data-column-${colNumber}]`);
    //selects first element in column which has no class Disactive
    const columnElements = column.children;

    for (let i = columnElements.length - 1; i >= 0; i--) {
      const columnElement = columnElements[i];
      if (!columnElement.classList.contains(SHIP_DISCATIVE_CSS)) {
        columnElement.classList.add(SHIP_DISCATIVE_CSS);
        break;
      }
    }
  }
}
