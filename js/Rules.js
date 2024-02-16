import { UI } from "./UI.js";

const PAGE_HIDDEN_CSS = "rules__card--hidden";
const RULES_CONTAINER_HIDDEN_CSS = "rules-container--hidden";

export class Rules extends UI {
  constructor() {
    super();
    this.#bindElements();
    this.#addEventListeners();

    this.pageNumber = 0;
    this.lastPageNumber = null;
    this.numberOfPages = this.rulesCardsElement.children.length;
  }

  /**
   * Binds html elements to properites
   */
  #bindElements() {
    this.exitButtonElement = this.getElement(this.UISelectors.rulesExitButton);
    this.rightArrowButtonElement = this.getElement(
      this.UISelectors.arrowButtonRight
    );
    this.leftArrowButtonElement = this.getElement(
      this.UISelectors.arrowButtonLeft
    );
    this.rulesCardsElement = this.getElement(this.UISelectors.rulesCards);
    this.rulesContainerElement = this.getElement(
      this.UISelectors.rulesContainer
    );
  }

  #addEventListeners() {
    this.rightArrowButtonElement.addEventListener("click", () => {
      this.#changeRulesPage(1);
    });
    this.leftArrowButtonElement.addEventListener("click", () => {
      this.#changeRulesPage(-1);
    });
    this.exitButtonElement.addEventListener("click", () => this.#closeRules());
  }

  /**
   * Checks if there is possibility to change page in desired direction, if so changes page, if not ends function
   * @param {number} direction direction is 1 or -1
   * @returns
   */
  #changeRulesPage(direction) {
    if (this.pageNumber === 0 && direction === -1) {
      return;
    }

    if (this.pageNumber === this.numberOfPages - 1 && direction === 1) {
      return;
    }

    this.lastPageNumber = this.pageNumber;
    this.pageNumber = this.pageNumber + direction;

    this.#displayPage(this.pageNumber);
  }

  /**
   * displays desired page, adds hidden class to it and disables arrow buttons.
   * On end of transition of hiding last page, starts showing page that suposed to be shown.
   */
  #displayPage() {
    const page = this.rulesCardsElement.children[this.pageNumber];
    const lastPage = this.rulesCardsElement.children[this.lastPageNumber];

    //when lastg page === null it means that rules were just turned on it just displays first rules page
    if (this.lastPageNumber != null) {
      lastPage.classList.add(PAGE_HIDDEN_CSS);
      this.rightArrowButtonElement.disabled = true;
      this.leftArrowButtonElement.disabled = true;

      const handleTransitionEnd = () => {
        this.#handleLastPageFadeOut(page);
        lastPage.removeEventListener("transitionend", handleTransitionEnd);
      };

      lastPage.addEventListener("transitionend", handleTransitionEnd);
    } else {
      page.classList.remove(PAGE_HIDDEN_CSS);
    }
  }

  /**
   *Shows page and turns buttons on page transitionend
   * @param {HTMLElement} page
   */
  #handleLastPageFadeOut(page) {
    page.classList.remove(PAGE_HIDDEN_CSS);
    const handleTransitionEnd = () => {
      this.leftArrowButtonElement.disabled = false;
      this.rightArrowButtonElement.disabled = false;
      page.removeEventListener("transitionend", handleTransitionEnd);
    };
    page.addEventListener("transitionend", handleTransitionEnd);
  }

  #closeRules() {
    this.#hideAllCards();
    this.rulesContainerElement.classList.add(RULES_CONTAINER_HIDDEN_CSS);
  }

  #hideAllCards() {
    const allCards = this.rulesCardsElement.children;
    for (let card of allCards) {
      if (!card.classList.contains(PAGE_HIDDEN_CSS)) {
        card.classList.add(PAGE_HIDDEN_CSS);
      }
    }
  }

  openRules() {
    this.pageNumber = 0;
    this.lastPageNumber = null;
    this.#displayPage();
    this.rulesContainerElement.classList.remove(RULES_CONTAINER_HIDDEN_CSS);
  }
}
