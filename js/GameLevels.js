/**
 * There is possibility to change levels, but, a setup is limited to 5 types of ship, if there is no need for having one of types
 * set numberOf"ship-type" on  0.
 * If you set up too many ships, so there is possibility to 'selfblock', game may crash because
 * of computer player may block himself.
 * There may be also some visual issues with ships display screen which is representing active and disactive ships of player.
 * Game is styled for 3 default leves, logic supose to work with all possible setups, but from visual side, there must be applied changes
 * for specyfic level and window size in case of overflowing ships representation
 */
export const gameLevels = {
  normal: {
    mapSize: 10,
    numberOfFiveCellShips: 0,
    numberOfFourCellShips: 1,
    numberOfThreeCellShips: 2,
    numberOfTwoCellShips: 3,
    numberOfOneCellShips: 4,
  },

  small: {
    mapSize: 6,
    numberOfFiveCellShips: 0,
    numberOfFourCellShips: 0,
    numberOfThreeCellShips: 1,
    numberOfTwoCellShips: 1,
    numberOfOneCellShips: 2,
  },

  big: {
    mapSize: 15,
    numberOfFiveCellShips: 1,
    numberOfFourCellShips: 2,
    numberOfThreeCellShips: 3,
    numberOfTwoCellShips: 3,
    numberOfOneCellShips: 4,
  },

  test: {
    mapSize: 4,
    numberOfFiveCellShips: 0,
    numberOfFourCellShips: 1,
    numberOfThreeCellShips: 0,
    numberOfTwoCellShips: 0,
    numberOfOneCellShips: 0,
  },
};
