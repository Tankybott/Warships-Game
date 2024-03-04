import { MainMenu } from "./MainMenu.js";
import { UI } from "./UI.js";
import { HumanPlayer } from "./HumanPlayer.js";
import { ComputerPlayer } from "./ComputerPlayer.js";

class Game extends UI {
  #mainMenu = new MainMenu();

  #lastShoot = null; //last shoot made in game
  #firstPlayer = null; //player whose turn is right at the moment
  #secondPlayer = null; //player who is waiting for his turn
  #player = null; // human player
  #computerPlayer = null; // computer player

  constructor() {
    super();
    this.#bindToElements();
    this.#addEventListeners();
    this.#player = null;
    this.#computerPlayer = null;
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

  /**
   * Adjust size of map to be square, and take as much space as possible
   */
  #setMapSize() {
    if (this.#player) {
      this.#player.setSeaMapSize();
    }
  }

  /**
   * Creates new instances of ComputerPlayer and HumanPlayer.
   * Hides main menu screen and shows game screen.
   * Throws game terminal messege leading player to deploy his ships.
   * Draws Player to start and after deploying players ships starts shooting phase.
   * @param {object}
   */
  playGame({
    mapSize,
    numberOfFiveCellShips,
    numberOfFourCellShips,
    numberOfThreeCellShips,
    numberOfTwoCellShips,
    numberOfOneCellShips,
  }) {
    this.toggleHideElement(this.gameScreen, this.mainMenuScreen);
    this.#player = new HumanPlayer(
      mapSize,
      numberOfFiveCellShips,
      numberOfFourCellShips,
      numberOfThreeCellShips,
      numberOfTwoCellShips,
      numberOfOneCellShips
    );

    this.#computerPlayer = new ComputerPlayer(
      mapSize,
      numberOfFiveCellShips,
      numberOfFourCellShips,
      numberOfThreeCellShips,
      numberOfTwoCellShips,
      numberOfOneCellShips
    );

    this.#player.playerConsole.sendConsoleMsg("Deploy-your-ships...");
    this.#drawPlayerToStart();
  }

  /**
   * Draws player to start. and starts shooting phase for drawed player, sends console messege which says who is staring shooting phase
   */
  async #drawPlayerToStart() {
    const draw = Math.floor(Math.random() * 2) + 1; // draws 1 or 2

    //if drawed 2 computer player starts shooting
    if (draw === 2) {
      await this.#handleComputerPlayerDraw();
    } else if (draw === 1) {
      await this.#handleHumanPlayerDraw();
    }
  }

  /**
   * Sets first player as human player and second player as computer player.
   * Awaits player to deploy his ships before continueing logic.
   * Throws game terminal messege saying that player is starting .
   * Shows shoot map and hides sea map.
   * Starts shooting phase.
   * Changes steering panel display, shows shooting panel and hides placing panel.
   */
  async #handleHumanPlayerDraw() {
    this.#firstPlayer = this.#player;
    this.#secondPlayer = this.#computerPlayer;
    //awaits deploying ships, and finishing displaying console msg
    await this.#player.deployPlayersShips();
    await this.#player.playerConsole.sendConsoleMsg(
      "You-are-starting-shooting..."
    );
    // show shootMap and hides seaMap
    this.changeMapsDisplay(
      this.#player._shootMap.shootMapElement,
      this.#player._seaMap.seaMapElement
    );

    this.#startShooting();
    this.#showShootingPanel();
  }

  /**
   * Sets first player as computer player and second player as human player.
   * Awaits player to deploy his ships before continueing logic.
   * Throws game terminal messege saying that computer is starting is starting.
   * Starts shooting phase.
   * Changes steering panel display, shows shooting panel and hides placing panel.
   */
  async #handleComputerPlayerDraw() {
    this.#firstPlayer = this.#computerPlayer;
    this.#secondPlayer = this.#player;
    //awaits deploying ships, and finishing displaying console msg
    await this.#player.deployPlayersShips();
    await this.#player.playerConsole.sendConsoleMsg(
      "An-ennemy-starts-shooting..."
    );

    this.#startShooting();
    this.#showShootingPanel();
  }

  /**
   * Shows shooting panel and hides placing panel
   */
  #showShootingPanel() {
    this.#player.shootPanelElement.classList.add(
      this.cssClasses.shootPanelShown
    );
    this.#player.placingPanelElement.classList.add(
      this.cssClasses.placingPanelHidden
    );
  }

  async #startShooting() {
    let coordiantes;

    await this.#getShoot(); // wait for one of players make shoot

    if (this.#lastShoot === null) {
      return;
    }

    this.#sendShootInfoToPlayer();

    coordiantes = {
      XValue: this.#lastShoot.x,
      YValue: this.#lastShoot.y,
    };
    //Declares shootResult as result of first player shoot
    const shootResult = this.#secondPlayer._seaMap.checkIfHit(coordiantes);
    switch (shootResult) {
      case "hit":
        await this.#handleHit();
        break;

      case "sunk":
        await this.#handleSunk();
        break;

      case "missed":
        await this.#handleMiss();
        break;
    }
  }

  /**
   * Overwrites this.#lastShot for what is returned as shoot of #firstPlayer
   */
  async #getShoot() {
    this.#lastShoot = await this.#firstPlayer.makeShoot();
  }

  /**
   * If computer player is #firstPlayer. Shows on player's map animation of computer's shoot.
   */
  #sendShootInfoToPlayer() {
    if (this.#firstPlayer === this.#computerPlayer) {
      this.#player._seaMap.setAnimationOnLastHit(this.#lastShoot);
    }
  }

  /**
   * Depending if human or computer player hit. Displays propper messege in game terminal.
   * Sends feedback about hit to Player instance which made shoot. Feedback is used for handling animations and displaying changes
    on players maps. Or adjusting shooting algorythm if Player instance is a computer player.
   */
  async #handleHit() {
    if (this.#firstPlayer === this.#player) {
      await this.#handleHumanPlayerHit();
    } else if (this.#firstPlayer === this.#computerPlayer) {
      await this.#handleComputerPlayerHit();
    }
    this.#startShooting();
  }

  /**
   * Sends terminal messege about players hit.
   * Sets shotMap cell value as hit, and refreshes map to display changes.
   */
  async #handleHumanPlayerHit() {
    await this.#player.playerConsole.sendConsoleMsg(
      "You-hit-an-ennemy-ship!-Make-another-shoot!"
    );
    this.#player._shootMap.setCellAsHit(this.#lastShoot);
    this.#player._shootMap.refreshShootMap();
  }

  /**
   * Sends terminal messege about computers hit.
   * sends feedback to computer player instance, used for updating shooting algorythm
   */
  async #handleComputerPlayerHit() {
    await this.#player.playerConsole.sendConsoleMsg(
      "An-enemy-hit-your-ship!-An-enemy-is-shooting..."
    );
    this.#player._seaMap.refreshSeaMap();
    this.#sendHitInfoToComputer();
  }

  /**
   * Change first player for second, and second for first
   */
  #changePlayers() {
    const temp = this.#firstPlayer;
    this.#firstPlayer = this.#secondPlayer;
    this.#secondPlayer = temp;
  }

  /**
   * Pushes hit cell to shotShip which is an array of all hit cells of ship which is being destroyed at this moment.
   * Used for updating shooting algorythm.
   */
  #sendHitInfoToComputer() {
    this.#computerPlayer.shotShip.push(this.#lastShoot);
  }

  async #handleMiss() {
    if (this.#firstPlayer === this.#player) {
      await this.#handleHumanPlayerMiss();
    } else if (this.#firstPlayer === this.#computerPlayer) {
      await this.#handleComputerPlayerMiss();
    }
    this.#changePlayers();

    this.#startShooting();
  }

  /**
   * Throws game terminal messege saying that player missed.
   * Hides shotMap and shows SeaMap.
   */
  async #handleHumanPlayerMiss() {
    await this.#player.playerConsole.sendConsoleMsg(
      "You-missed,-an-enemy-is-shooting!"
    );
    this.changeMapsDisplay(
      this.#player._seaMap.seaMapElement,
      this.#player._shootMap.shootMapElement
    );
  }

  /**
   * Throws game terminal messege saying that player missed.
   * Updates shooting algoritm to avoid shooting repeating cells
   * Hides seaMap and shows shootMap.
   */
  async #handleComputerPlayerMiss() {
    await this.#player.playerConsole.sendConsoleMsg(
      "An-enemy-missed,-mark-yours-shoot!"
    );
    this.#computerPlayer.handleMiss();
    this.changeMapsDisplay(
      this.#player._shootMap.shootMapElement,
      this.#player._seaMap.seaMapElement
    );
  }

  /**
   * Throws proper game terminal messege depending on which player sunk ship.
   * Handles logic of sunking human and computer player ship.
   * Decreses number of ships for #secondPlayer.
   * Checks if one of player won, if so handles wining logic.
   * @returns {void}
   */
  async #handleSunk() {
    if (this.#firstPlayer === this.#player) {
      await this.#handleSunkOfComputerShip();
      ////////////////////////////////////////////////////
    } else if (this.#firstPlayer === this.#computerPlayer) {
      await this.#handleSunkOfHumanShip();
    }

    //decrese number of ships for player who lost ship
    this.#secondPlayer.decreseNumberOfShips();

    if (this.#checkIfWin()) {
      this.#win();
      return;
    }

    this.#startShooting();
  }

  /**
   * Throws game terminal messege about sunking enemy ship.
   * Displays cell as hit on players sea map element.
   */
  async #handleSunkOfComputerShip() {
    await this.#player.playerConsole.sendConsoleMsg(
      "You-hit-and-sunk-an-enemy-ship!-Make-another-shoot!"
    );
    this.#player._shootMap.setCellAsHit(this.#lastShoot); //set cell value as hit
    this.#player._shootMap.refreshShootMap(); // display changes on map
  }

  /**
   * Throws game terminal messege about sunking players ship.
   * Disactivates sunken ship on players ship display.
   *
   */
  async #handleSunkOfHumanShip() {
    await this.#player.playerConsole.sendConsoleMsg(
      "An-enemy-hit-and-sunk-your-ship!-An-enemy-is-shooting..."
    );
    this.#player.playerShipsDisplay.disactivateShip(
      this.#player._seaMap.checkLengthOfSunkShip() // checking length of ship, so right ship would be disactivated on display
    );
    this.#player._seaMap.refreshSeaMap();
    //push last cell of sinking ship before reseting flags and setting for destroying algorythm;
    this.#sendHitInfoToComputer();
    this.#resetHitInfo();
  }

  /**
   * Resets flags and setting for destroying algorythm.
   */
  #resetHitInfo() {
    this.#computerPlayer.resetHitInfo();
  }

  /**
   * Throws proper messege on terminal depends on which player won
   * Displays SeaMap with left ships of victorious player
   */
  async #win() {
    if (this.#computerPlayer._numberOfAllShips === 0) {
      await this.#handleHumanPlayerWin();
    } else if (this.#player._numberOfAllShips === 0) {
      await this.#handleComputerPlayerWin();
    }
  }

  /**
   * Throws terminal messege about how many ships player got left.
   * Changes map display from shotMap to SeaMap
   * @returns {void}
   */
  async #handleHumanPlayerWin() {
    await this.#player.playerConsole.sendConsoleMsg(
      `You-won,-you-have-${this.#player._numberOfAllShips}-ships-left.`
    );
    this.changeMapsDisplay(
      this.#player._seaMap.seaMapElement,
      this.#player._shootMap.shootMapElement
    );
    return;
  }

  /**
   * Throws terminal messege about how many ships computer got left.
   * Renders and shows SeaMap of computer player.
   * @returns {vouid}
   */
  async #handleComputerPlayerWin() {
    await this.#player.playerConsole.sendConsoleMsg(
      `You-lost,-an-enemy-have-${
        this.#computerPlayer._numberOfAllShips
      }-ships-left`
    );
    //changeMapsDisplay to start fade-out fade-in Animation
    this.changeMapsDisplay(
      this.#player._seaMap.seaMapElement,
      this.#player._seaMap.seaMapElement
    );

    //timeout is set to adjust showing enemy ship map after players map fades out
    //have to be calculated with changeMapsDisplay
    setTimeout(() => {
      this.#computerPlayer._seaMap.renderSeaMap();
      this.#computerPlayer._seaMap.refreshSeaMap();
    }, 300);

    return;
  }

  /**
   * Returns true if one of players won by checking if one of players has no ships left
   * @returns {boolean}
   */
  #checkIfWin() {
    if (
      this.#computerPlayer._numberOfAllShips === 0 ||
      this.#player._numberOfAllShips === 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * reseting game flags and settings
   */
  #resetGame() {
    this.#player.shootPanelElement.classList.remove(
      "steering-panel__shoot-panel--shown"
    );
    this.#player.placingPanelElement.classList.remove(
      "steering-panel__placing-panel--hidden"
    );
    this.toggleHideElement(
      this.#player._seaMap.seaMapElement,
      this.#player._shootMap.shootMapElement
    );
    this.toggleHideElement(this.mainMenuScreen, this.gameScreen);
    this.#mainMenu.hideSelectScreen();
    //reseting flags
    this.#lastShoot = null;
    this.#firstPlayer = null;
    this.#secondPlayer = null;
    this.#player = null;
    this.#computerPlayer = null;

    this.#hideMainMenuPopup();
  }

  #showMainMenuPopup() {
    this.mainMenuPopup.classList.remove(this.cssClasses.popupContainerHidden);
  }

  #hideMainMenuPopup() {
    this.mainMenuPopup.classList.add(this.cssClasses.popupContainerHidden);
  }
}

export let game;

window.onload = function () {
  game = new Game();
};
