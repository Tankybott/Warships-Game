/**
 * For proper work of ship display of players ships there cant be a 0 ships that are shorter than a biggest one taht is set up,
 * for example (three = 1 two = 0  one = 1)/wrong
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
    mapSize: 3,
    numberOfFiveCellShips: 0,
    numberOfFourCellShips: 0,
    numberOfThreeCellShips: 0,
    numberOfTwoCellShips: 0,
    numberOfOneCellShips: 3,
  },
};
