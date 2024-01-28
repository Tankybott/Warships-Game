export class UI {
  UISelectors = {
    playerVsComputerButton: "[data-pvc-button]",
    smallSelectButton: "[data-small-button]",
    normalSelectButton: "[data-normal-button]",
    bigSelectButton: "[data-big-button]",
    startPage: "[data-start-page]",
    selectLevel: "[data-select-level]",
    gameScreen: "[data-game-screen]",
    mainMenuScreen: "[data-main-menu-screen]",
    mapContainer: "[data-map-container]",
    seaMap: "[data-sea-map]",
    shootMap: "[data-shoot-map]",
    shipsDisplayCounter: "[data-ships-display-counter]",
    shipsDisplay: "[data-ships-display]",
    gameConsole: "[data-game-console]",
    placeButton: "[data-place-button]",
    rotateButton: "[data-rotate-button]",
    shootPanel: "[data-shoot-panel]",
    placingPanel: "[data-placing-panel]",
    shootButton: "[data-shoot-button]",
    changeButton: "[data-change-button]",
  };

  getElement(selector) {
    return document.querySelector(selector);
  }

  getElements(selector) {
    return document.querySelectorAll(selector);
  }

  toggleHideElement(elementToShow, elementToHide) {
    elementToShow.classList.toggle("hidden");
    elementToHide.classList.toggle("hidden");
  }

  toggleNonClickableElement(element) {
    element.classList.toggle("non-clickable");
  }

  changeNameOfKeysForValues(arrayOfObjects) {
    return arrayOfObjects.map(({ x, y }) => ({ XValue: x, YValue: y }));
  }
}
