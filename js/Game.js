import { MainMenu } from "./MainMenu.js";
import { UI } from "./UI.js";
import { HumanPlayer } from "./HumanPlayer.js";
import { ComputerPlayer } from "./ComputerPlayer.js";

class Game extends UI {
  #mainMenu = new MainMenu();

  #lastShoot = null;
  #firstPlayer = null;
  #secondPlayer = null;
  #isLastShotHit = false;

  constructor() {
    super();
    this.#bindToElements();
  }

  #bindToElements() {
    this.gameScreen = this.getElement(this.UISelectors.gameScreen);
    this.mainMenuScreen = this.getElement(this.UISelectors.mainMenuScreen);
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
    } else if (draw === 1) {
      this.#firstPlayer = this.player;
      this.#secondPlayer = this.computerPlayer;
      await this.player.deployPlayersShips();
      await this.player.playerConsole.sendConsoleMsg(
        "You-are-starting-shooting"
      );
      this.toggleHideElement(
        this.player._shootMap.shootMapElement,
        this.player._seaMap.seaMapElement
      );
      this.#startShooting();
    }
  }

  async #startShooting() {
    const getShoot = async () => {
      this.#lastShoot = await this.#firstPlayer.makeShoot();
      this.#sendShootInfoToPlayer();
    };
    await getShoot();
    const coordiantes = {
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
            "An-enemy-hit-your-ship!-An-enemy-is-is-shooting "
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
        } else if (this.#firstPlayer === this.computerPlayer) {
          this.player._seaMap.refreshSeaMap();
          await this.player.playerConsole.sendConsoleMsg(
            "An-enemy-missed,-mark-yours-shoot!"
          );
          this.computerPlayer.handleMiss();
        }
        this.#changePlayers();

        this.toggleHideElement(
          this.player._shootMap.shootMapElement,
          this.player._seaMap.seaMapElement
        );

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
      return;
    } else if (this.player._numberOfAllShips === 0) {
      await this.player.playerConsole.sendConsoleMsg(
        `You-lost,-an-enemy-have-${this.computerPlayer._numberOfAllShips}-ships-left`
      );
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
}

export const game = new Game();
