import { UI } from "./UI.js";

export class Map extends UI {
  /**
   * @param {number} numberOfCells
   */
  constructor(numberOfCells) {
    super();
    this.numberOfCells = numberOfCells;

    this.#bindElements();
  }

  #bindElements() {
    this.mapContainer = this.getElement(this.UISelectors.mapContainer);
  }

  /**
   * Calculates and sets size of map to be as big as possible and stay square.
   * Defines grid rows and columns by size of map.
   * @param {HTMLElement} map
   */
  setMapSize(map) {
    map.style.height = `${this.#calculateMapSize()}px`;
    map.style.width = `${this.#calculateMapSize()}px`;

    map.style.gridTemplateRows = `repeat(${this.numberOfCells + 2}, 1fr)`;
    map.style.gridTemplateColumns = `repeat(${this.numberOfCells + 2}, 1fr)`;
  }

  /**
   * Calculates map size as 95% of container shortest side
   * @returns {number}
   */
  #calculateMapSize() {
    const mapSize = Math.min(
      this.mapContainer.clientHeight - this.mapContainer.clientHeight * 0.05,
      this.mapContainer.clientWidth - this.mapContainer.clientWidth * 0.05
    );
    return mapSize;
  }

  /**
   * Add border class and data atribute for cells passed in parameter.
   * @param {Array} cells
   */
  configureBorderCells(cells) {
    this.#getBorderCellsElements(cells).forEach((cell) => {
      cell.classList.add(this.cssClasses.borderCell);
      cell.setAttribute("data-is-border", "true");
    });
  }

  /**
   * get HTML elements of cells that are passed in cells parameter
   * @param {Array} cells
   * @returns {Array}
   */
  #getBorderCellsElements(cells) {
    const selector = this.#getBorderCells(cells)
      .map(({ x, y }) => `[data-x="${x}"][data-y="${y}"]`)
      .join(",");

    const borderCellsElements = document.querySelectorAll(selector);
    return borderCellsElements;
  }

  /**
   * Change border property for true, for all cells passed in array
   * @param {Array} cells
   */
  setBorderValue(cells) {
    this.#getBorderCells(cells).forEach((cell) => {
      cell.isBorder = true;
    });
  }

  /**
   * Extracts border cells objects from array of cells passed in parameter.
   * @param {Array} cells
   * @returns {Array}
   */
  #getBorderCells(cells) {
    //border cells are all cells that lays on map edges
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
   * Adding numbers to top border of map
   * @param {Array} cells
   */
  numberTopMapEdge(cells, type) {
    this.#getMapEdgeElements(cells, type, "x").forEach((cell, index) => {
      const dataYValue = parseInt(cell.dataset.y, 10);
      if (
        !isNaN(dataYValue) &&
        dataYValue > 0 &&
        dataYValue < this.#getMapEdgeElements(cells, type, "x").length - 1
      ) {
        cell.innerText = index.toString();
      }
    });
  }

  /**
   * When coordinate y returns top map ednge, when x returns left map edge
   * @param {Array} cells
   * @param {string} type map type (data selector)
   * @param {string} coordinate 'x' for left edge, 'y' for top edge
   * @returns
   */
  #getMapEdgeElements(cells, type, coordinate) {
    const selector = this.#getMapEdge(cells, coordinate)
      .map(({ x, y }) => `${type}[data-x="${x}"][data-y="${y}"]`)
      .join(",");

    const mapEdgeElements = document.querySelectorAll(selector);
    return mapEdgeElements;
  }

  /**
   * Returns edge cell Objects from array that contains map cells.
   * Returns top cells for coordinate 'x' and left edge for coordinate 'y'
   * @param {Array} cells
   * @param {string} coordinate 'x' for left edge, 'y' for top edge
   * @returns
   */
  #getMapEdge(cells, coordinate) {
    const edgeCells = cells.flat().filter((cell) => cell[coordinate] === 0);
    return edgeCells;
  }

  /**
   * Adding letters to left border cells to help player navigate between cells
   * @param {Array} cells
   */
  numberLeftMapEdge(cells, type) {
    this.#getMapEdgeElements(cells, type, "y").forEach((cell, index) => {
      const dataXValue = parseInt(cell.dataset.x, 10);
      if (
        !isNaN(dataXValue) &&
        dataXValue > 0 &&
        dataXValue < this.#getMapEdgeElements(cells, type, "y").length - 1
      ) {
        cell.innerText = this.#converNumbersToLetters(index);
      }
    });
  }

  #converNumbersToLetters(number) {
    return String.fromCharCode("A".charCodeAt(0) + number - 1).toString();
  }
}
