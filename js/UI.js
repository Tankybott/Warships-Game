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
    displayedShip: "[data-displayed-ship]", //ships on screen with active/disactive ships
    mainMenuButton: "[data-main-menu-button]",
    quitButton: "[data-confirmation-quit-button]",
    quitCancelButton: "[data-confirmation-quit-cancel-button]",
    mainMenuPopup: "[data-main-menu-popup]",
    rulesExitButton: "[data-rules-exit-button]",
    arrowButtonRight: "[data-arrow-button-right]",
    arrowButtonLeft: "[data-arrow-button-left]",
    rulesCards: "[data-rules-cards]",
    rulesContainer: "[data-rules-container]",
    rulesOpenButton: "[data-rules-button]",
  };

  cssClasses = {
    shootPanelShown: "steering-panel__shoot-panel--shown",
    placingPanelHidden: "steering-panel__placing-panel--hidden",
    popupContainerHidden: "popup-container--hidden",
    ship: "ship",
    shootTarget: "shoot-target",
    sunk: "sunk",
    shootTargetHover: "shoot-target-hover",
    hit: "hit",
    shit: "shot",
    blink: "blink",
    declineBlink: "blink-red",
    borderCell: "border-cell",
    rulesCardHidden: "rules__card--hidden",
    rulesContainerHidden: "rules-container--hidden",
    seaMapCell: "sea-map__sea-cell",
    displayColumn: "ships-display__display-column",
    displayShip: "ships-display__ship",
    displayShipDisactivated: "ships-display__ship--disactive",
    displayShipSmallGame: "ships-display__ship--small-game",
    displayCounterHidden: "ships-display__ship-counter--hidden",
    shootMapCell: "shoot-map__shoot-cell",
  };

  getElement(selector) {
    return document.querySelector(selector);
  }

  getElements(selector) {
    return document.querySelectorAll(selector);
  }

  toggleHideElement(elementToShow, elementToHide) {
    elementToShow.classList.remove("hidden");
    elementToHide.classList.add("hidden");
  }

  /**
   * method adds fade out to map which supose to be hidden, after 
    transition of fade out ends, removes mapToHide from display, adds to display mapToShow and starts fadeIn animation
   * @param {HTMLElement} mapToShow 
   * @param {HTMLElement} mapToHide 
   */
  changeMapsDisplay(mapToShow, mapToHide) {
    const handleMapChange = () => {
      mapToHide.classList.add("hidden");
      mapToHide.classList.remove("fade-out");
      mapToShow.classList.remove("hidden");
      mapToShow.classList.add("fade-in");

      mapToHide.removeEventListener("animationend", handleMapChange);
    };

    const handleFadeInEnd = () => {
      mapToShow.classList.remove("fade-in");
      mapToShow.removeEventListener("animationend", handleFadeInEnd);
    };

    // mapToHide.addEventListener("transitionend", handleTransitionEnd);

    mapToHide.addEventListener("animationend", handleMapChange);
    mapToShow.addEventListener("animationend", handleFadeInEnd);

    mapToHide.classList.add("fade-out");
  }

  toggleNonClickableElement(element) {
    element.classList.toggle("non-clickable");
  }

  /**
   * For proper work of some methods a name of keys x, and y inside cell objects hast to be changed
   * @param {Array} arrayOfObjects
   * @returns {Array}
   */
  changeNameOfKeysForValues(arrayOfObjects) {
    return arrayOfObjects.map(({ x, y }) => ({ XValue: x, YValue: y }));
  }
}
