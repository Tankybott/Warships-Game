import { UI } from "./UI.js";

export const DATA_BORDER = "data-is-border";

const BORDER_CELL_CSS = "border-cell";

export class Map extends UI {
  constructor(numberOfCells) {
    super();
    this.numberOfCells = numberOfCells;

    this.#bindElements();
  }

  #bindElements() {
    this.mapContainer = this.getElement(this.UISelectors.mapContainer);
  }

  // Calculating and setting size of map
  setMapSize(map) {
    map.style.height = `${this.#calculateMapSize()}px`;
    map.style.width = `${this.#calculateMapSize()}px`;

    map.style.gridTemplateRows = `repeat(${this.numberOfCells + 2}, 1fr)`;
    map.style.gridTemplateColumns = `repeat(${this.numberOfCells + 2}, 1fr)`;
  }

  #calculateMapSize() {
    const mapSize = Math.min(
      this.mapContainer.clientHeight - this.mapContainer.clientHeight * 0.02,
      this.mapContainer.clientWidth - this.mapContainer.clientWidth * 0.02
    );
    return mapSize;
  }

  // Creating border cells on map

  configureBorderCells(cells) {
    this.#getBorderCellsElements(cells).forEach((cell) => {
      cell.classList.add(BORDER_CELL_CSS);
      cell.setAttribute(DATA_BORDER, "true");
    });
  }

  #getBorderCellsElements(cells) {
    const selector = this.#getBorderCells(cells)
      .map(({ x, y }) => `[data-x="${x}"][data-y="${y}"]`)
      .join(",");

    const borderCellsElements = document.querySelectorAll(selector);
    return borderCellsElements;
  }

  setBorderValue(cells) {
    this.#getBorderCells(cells).forEach((cell) => {
      cell.isBorder = true;
    });
  }

  #getBorderCells(cells) {
    const borderCells = cells
      .flat()
      .filter(
        (cell) =>
          cell.x === 0 ||
          cell.y === 0 ||
          cell.x === this.numberOfCells + 1 ||
          cell.y === this.numberOfCells + 1
      );
    return borderCells;
  }

  //Numbering left edge of map

  /**
   * function is dynamicly adding numbers which are made to navigate between cells, its numbering rows that are greater than 0, and 1 lower than number of rows, as last row is always border row, which has no usage
   * @param {Array} cells
   */
  numberLeftMapEdge(cells, type) {
    this.#getLeftMapEdgeElements(cells, type).forEach((cell, index) => {
      const dataYValue = parseInt(cell.dataset.y, 10);
      if (
        !isNaN(dataYValue) &&
        dataYValue > 0 &&
        dataYValue < this.#getLeftMapEdgeElements(cells, type).length - 1
      ) {
        cell.innerText = index.toString();
      }
    });
  }

  #getLeftMapEdgeElements(cells, type) {
    const selector = this.#getLeftMapEdge(cells)
      .map(({ x, y }) => `${type}[data-x="${x}"][data-y="${y}"]`)
      .join(",");

    const leftMapEdgeElements = document.querySelectorAll(selector);
    return leftMapEdgeElements;
  }

  #getLeftMapEdge(cells) {
    const leftEdgeCells = cells.flat().filter((cell) => cell.x === 0);

    return leftEdgeCells;
  }

  // numbering top edge of map

  numberTopMapEdge(cells, type) {
    this.#getTopMapEdgeElements(cells, type).forEach((cell, index) => {
      const dataXValue = parseInt(cell.dataset.x, 10);
      if (
        !isNaN(dataXValue) &&
        dataXValue > 0 &&
        dataXValue < this.#getTopMapEdgeElements(cells, type).length - 1
      ) {
        cell.innerText = this.#converNumbersToLetters(index);
      }
    });
  }

  #converNumbersToLetters(number) {
    return String.fromCharCode("A".charCodeAt(0) + number - 1).toString();
  }

  #getTopMapEdgeElements(cells, type) {
    const selector = this.#getTopMapEdge(cells, type)
      .map(({ x, y }) => `${type}[data-x="${x}"][data-y="${y}"]`)
      .join(",");

    const leftMapEdgeElements = document.querySelectorAll(selector);
    return leftMapEdgeElements;
  }

  #getTopMapEdge(cells) {
    const topEdgeCells = cells.flat().filter((cell) => cell.y === 0);

    return topEdgeCells;
  }
}
