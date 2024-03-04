import { UI } from "./UI.js";

/**
 * Class made for handling displaing messeges in game terminal
 */
export class GameConsole extends UI {
  constructor() {
    super();

    this.#bindElements();
  }

  #bindElements() {
    this.gameConsoleElement = this.getElement(this.UISelectors.gameConsole);
  }

  /**
   * Displays letter after letter a text passed in argument.
   * For typing whitespace use "-"
   * @param {string} message
   * @returns
   */
  sendConsoleMsg(message) {
    this.gameConsoleElement.innerHTML = "";

    return new Promise((resolve) => {
      const text = message;
      let index = 0;

      // Displays each next letter of text after 25 miliseconds
      const typeNextCharacter = () => {
        if (index < text.length) {
          // If letter is "-" turn it to whitespace
          if (text.charAt(index).match("-")) {
            const spanElement = document.createElement("span");
            spanElement.innerHTML = "&nbsp;";
            this.gameConsoleElement.appendChild(spanElement);
          } else {
            this.gameConsoleElement.innerText += text.charAt(index);
          }
          index++;
          setTimeout(typeNextCharacter, 25);
        } else {
          // Wait for 1100 miliseconds before resolving
          setTimeout(resolve, 1100);
        }
      };

      typeNextCharacter();
    });
  }
}
