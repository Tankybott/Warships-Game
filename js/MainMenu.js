import { gameLevels } from "./GameLevels.js";
import { UI } from "./UI.js";
import { game } from "./Game.js";
import { Rules } from "./Rules.js";

export class MainMenu extends UI {
  constructor() {
    super();
    this.#bindToElements();
    this.#addEventListeners();

    this.rules = new Rules();
  }

  #bindToElements() {
    this.playerVsComputerButtonElement = this.getElement(
      this.UISelectors.playerVsComputerButton
    );
    this.smallSelectButtonElement = this.getElement(
      this.UISelectors.smallSelectButton
    );
    this.normalSelectButtonElement = this.getElement(
      this.UISelectors.normalSelectButton
    );
    this.bigSelectButtonElement = this.getElement(
      this.UISelectors.bigSelectButton
    );

    this.startPageElement = this.getElement(this.UISelectors.startPage);
    this.selectLevelElement = this.getElement(this.UISelectors.selectLevel);
    this.rulesOpenButtonElement = this.getElement(
      this.UISelectors.rulesOpenButton
    );
  }

  #addEventListeners() {
    this.playerVsComputerButtonElement.addEventListener("click", () =>
      this.#showSelectScreen()
    );
    this.normalSelectButtonElement.addEventListener("click", () => {
      game.playGame(gameLevels.normal);
    });
    this.smallSelectButtonElement.addEventListener("click", () => {
      game.playGame(gameLevels.small);
    });
    this.bigSelectButtonElement.addEventListener("click", () => {
      game.playGame(gameLevels.big);
    });
    this.rulesOpenButtonElement.addEventListener("click", () => {
      this.rules.openRules();
    });
  }

  #showSelectScreen() {
    this.toggleHideElement(this.selectLevelElement, this.startPageElement);
  }

  hideSelectScreen() {
    this.toggleHideElement(this.startPageElement, this.selectLevelElement);
  }
}
