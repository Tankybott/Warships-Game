import { MainMenu } from "./MainMenu.js";
import { UI } from "./UI.js";
import { HumanPlayer } from "./HumanPlayer.js";
import { ComputerPlayer } from "./ComputerPlayer.js";

const POPUP_HIDDEN_CSS = "popup-container--hidden";

class Game extends UI {
  #mainMenu = new MainMenu();

  #lastShoot = null;
  #firstPlayer = null;
  #secondPlayer = null;

  constructor() {
    super();
    this.#bindToElements();
    this.#addEventListeners();
    this.player = null;
    this.computerPlayer = null;
  }

  #bindToElements() {
    this.gameScreen = this.getElement(this.UISelectors.gameScreen);
    this.mainMenuScreen = this.getElement(this.UISelectors.mainMenuScreen);
    this.mainMenuButton = this.getElement(this.UISelectors.mainMenuButton);
    this.quitButtonElement = this.getElement(this.UISelectors.quitButton);
    this.quitCancelButtonElement = this.getElement(
      this.UISelectors.quitCancelButton
    );
    this.mainMenuPopup = this.getElement(this.UISelectors.mainMenuPopup);
  }

  #addEventListeners() {
    window.addEventListener("resize", () => this.#setMapSize());
    this.quitButtonElement.addEventListener("click", () => this.#resetGame());
    this.mainMenuButton.addEventListener("click", () =>
      this.#showMainMenuPopup()
    );
    this.quitCancelButtonElement.addEventListener("click", () =>
      this.#hideMainMenuPopup()
    );
  }

  #setMapSize() {
    if (this.player) {
      this.player.setSeaMapSize();
    }
  }

  playGame({
    mapSize,
    numberOfFiveCellShips,
    numberOfFourCellShips,
    numberOfThreeCellShips,
    numberOfTwoCellShips,
    numberOfOneCellShips,
  }) {
    this.toggleHideElement(this.gameScreen, this.mainMenuScreen);
    this.player = new HumanPlayer(
      mapSize,
      numberOfFiveCellShips,
      numberOfFourCellShips,
      numberOfThreeCellShips,
      numberOfTwoCellShips,
      numberOfOneCellShips
    );

    this.computerPlayer = new ComputerPlayer(
      mapSize,
      numberOfFiveCellShips,
      numberOfFourCellShips,
      numberOfThreeCellShips,
      numberOfTwoCellShips,
      numberOfOneCellShips
    );

    this.player.playerConsole.sendConsoleMsg("Deploy-your-ships");
    this.#drawPlayerToStart();
  }

  async #drawPlayerToStart() {
    const draw = Math.floor(Math.random() * 2) + 1;
    if (draw === 2) {
      this.#firstPlayer = this.computerPlayer;
      this.#secondPlayer = this.player;
      await this.player.deployPlayersShips();
      await this.player.playerConsole.sendConsoleMsg(
        "An-ennemy-starts-shooting"
      );
      this.#startShooting();
      this.#showShootingPanel();
    } else if (draw === 1) {
      this.#firstPlayer = this.player;
      this.#secondPlayer = this.computerPlayer;
      await this.player.deployPlayersShips();
      await this.player.playerConsole.sendConsoleMsg(
        "You-are-starting-shooting"
      );
      this.changeMapsDisplay(
        this.player._shootMap.shootMapElement,
        this.player._seaMap.seaMapElement
      );
      this.#startShooting();
      this.#showShootingPanel();
    }
  }
  //remember to set css classes as variables
  #showShootingPanel() {
    this.player.shootPanelElement.classList.add(
      "steering-panel__shoot-panel--shown"
    );
    this.player.placingPanelElement.classList.add(
      "steering-panel__placing-panel--hidden"
    );
  }

  async #startShooting() {
    let coordiantes;

    const getShoot = async () => {
      this.#lastShoot = await this.#firstPlayer.makeShoot();
      this.#sendShootInfoToPlayer();
    };
    await getShoot();

    if (this.#lastShoot === null) {
      return;
    }

    coordiantes = {
      XValue: this.#lastShoot.x,
      YValue: this.#lastShoot.y,
    };

    const shootResult = this.#secondPlayer._seaMap.checkIfHit(coordiantes);
    switch (shootResult) {
      case "hit":
        if (this.#firstPlayer === this.player) {
          await this.player.playerConsole.sendConsoleMsg(
            "You-hit-an-ennemy-hip!-Make-another-shoot!"
          );
          this.player._shootMap.setCellAsHit(this.#lastShoot);
          this.player._shootMap.refreshShootMap();
        } else if (this.#firstPlayer === this.computerPlayer) {
          await this.player.playerConsole.sendConsoleMsg(
            "An-enemy-hit-your-ship!-An-enemy-is-shooting "
          );
          this.player._seaMap.refreshSeaMap();
          this.#sendHitInfoToComputer();
        }
        this.#startShooting();
        break;

      case "sunk":
        if (this.#firstPlayer === this.player) {
          await this.player.playerConsole.sendConsoleMsg(
            "You-hit-and-sunk-an-enemy-ship!-Make-another-shoot!"
          );
          this.player._shootMap.setCellAsHit(this.#lastShoot);
          this.player._shootMap.refreshShootMap();
        } else if (this.#firstPlayer === this.computerPlayer) {
          await this.player.playerConsole.sendConsoleMsg(
            "An-enemy-hit-and-sunk-your-ship!-An-enemy-is-shooting"
          );
          //removes active status in players ship display of destroyed ship
          this.player.playerShipsDisplay.disactivateShip(
            this.player._seaMap.checkLengthOfSunkShip()
          );
          this.player._seaMap.refreshSeaMap();
          this.#sendHitInfoToComputer();
          this.#resetHitInfo();
        }
        this.#secondPlayer.decreseNumberOfShips();

        if (this.#checkIfWin()) {
          this.#win();
          return;
        }
        this.#startShooting();
        break;

      case "missed":
        if (this.#firstPlayer === this.player) {
          await this.player.playerConsole.sendConsoleMsg(
            "You-missed,-an-enemy-is-shooting!"
          );
          this.changeMapsDisplay(
            this.player._seaMap.seaMapElement,
            this.player._shootMap.shootMapElement
          );
        } else if (this.#firstPlayer === this.computerPlayer) {
          this.player._seaMap.refreshSeaMap();
          await this.player.playerConsole.sendConsoleMsg(
            "An-enemy-missed,-mark-yours-shoot!"
          );
          this.computerPlayer.handleMiss();
          this.changeMapsDisplay(
            this.player._shootMap.shootMapElement,
            this.player._seaMap.seaMapElement
          );
        }
        this.#changePlayers();

        this.#startShooting();
        break;
    }
  }

  #changePlayers() {
    const temp = this.#firstPlayer;
    this.#firstPlayer = this.#secondPlayer;
    this.#secondPlayer = temp;
  }

  //sends back an information if computer succesfully hit players ship
  #sendHitInfoToComputer() {
    this.computerPlayer.shotShip.push(this.#lastShoot);
  }

  //resets data about hit ship, it happens when one of players ship is sunk
  #resetHitInfo() {
    this.computerPlayer.resetHitInfo();
  }

  // sends information which cell were aimed by computer, makes an animation on players display
  #sendShootInfoToPlayer() {
    if (this.#firstPlayer === this.computerPlayer) {
      this.player._seaMap.setAnimationOnLastHit(this.#lastShoot);
    }
  }

  async #win() {
    if (this.computerPlayer._numberOfAllShips === 0) {
      await this.player.playerConsole.sendConsoleMsg(
        `You-won,-you-have-${this.player._numberOfAllShips}-ships-left`
      );
      this.changeMapsDisplay(
        this.player._seaMap.seaMapElement,
        this.player._shootMap.shootMapElement
      );
      return;
    } else if (this.player._numberOfAllShips === 0) {
      await this.player.playerConsole.sendConsoleMsg(
        `You-lost,-an-enemy-have-${this.computerPlayer._numberOfAllShips}-ships-left`
      );
      this.changeMapsDisplay(
        this.player._seaMap.seaMapElement,
        this.player._seaMap.seaMapElement
      );

      //site timeout is set to qdjust showing enemy ship map after players map fades out
      setTimeout(() => {
        this.computerPlayer._seaMap.renderSeaMap();
        this.computerPlayer._seaMap.refreshSeaMap();
      }, 300);

      return;
    }
  }

  #checkIfWin() {
    if (
      this.computerPlayer._numberOfAllShips === 0 ||
      this.player._numberOfAllShips === 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  #resetGame() {
    this.player.shootPanelElement.classList.remove(
      "steering-panel__shoot-panel--shown"
    );
    this.player.placingPanelElement.classList.remove(
      "steering-panel__placing-panel--hidden"
    );
    this.toggleHideElement(
      this.player._seaMap.seaMapElement,
      this.player._shootMap.shootMapElement
    );
    this.toggleHideElement(this.mainMenuScreen, this.gameScreen);
    this.#mainMenu.hideSelectScreen();
    this.#lastShoot = null;
    this.#firstPlayer = null;
    this.#secondPlayer = null;
    this.player = null;
    this.computerPlayer = null;
    this.#hideMainMenuPopup();
  }

  #showMainMenuPopup() {
    this.mainMenuPopup.classList.remove(POPUP_HIDDEN_CSS);
  }

  #hideMainMenuPopup() {
    this.mainMenuPopup.classList.add(POPUP_HIDDEN_CSS);
  }
}

export let game;

window.onload = function () {
  game = new Game();
};
