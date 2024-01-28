import { gameLevels } from "./GameLevels.js";
import { UI } from "./UI.js";
import { game } from "./Game.js";

export class MainMenu extends UI {
  constructor() {
    super();
    this.#bindToElements();
    this.#addEventListeners();
  }

  #bindToElements() {
    this.playerVsComputerButton = this.getElement(
      this.UISelectors.playerVsComputerButton
    );
    this.smallSelectButton = this.getElement(
      this.UISelectors.smallSelectButton
    );
    this.normalSelectButton = this.getElement(
      this.UISelectors.normalSelectButton
    );
    this.bigSelectButton = this.getElement(this.UISelectors.bigSelectButton);

    this.startPage = this.getElement(this.UISelectors.startPage);
    this.selectLevel = this.getElement(this.UISelectors.selectLevel);
  }

  #addEventListeners() {
    this.playerVsComputerButton.addEventListener("click", () =>
      this.#showSelectScreen()
    );
    this.normalSelectButton.addEventListener("click", () =>
      game.playGame(gameLevels.normal)
    );
    this.smallSelectButton.addEventListener("click", () =>
      game.playGame(gameLevels.small)
    );
    this.bigSelectButton.addEventListener("click", () =>
      game.playGame(gameLevels.big)
    );
  }

  #showSelectScreen() {
    this.toggleHideElement(this.startPage, this.selectLevel);
    this.#removeEventListeners();
  }

  #removeEventListeners() {
    this.playerVsComputerButton.removeEventListener("click", () =>
      this.#showSelectScreen()
    );
    this.normalSelectButton.removeEventListener("click", () =>
      game.playGame(gameLevels.normal)
    );
    this.smallSelectButton.removeEventListener("click", () =>
      game.playGame(gameLevels.normal)
    );
    this.bigSelectButton.removeEventListener("click", () =>
      game.playGame(gameLevels.normal)
    );
  }
}
