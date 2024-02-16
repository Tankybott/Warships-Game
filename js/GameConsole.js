import { UI } from "./UI.js";

export class GameConsole extends UI {
  constructor() {
    super();

    this.#bindElements();
  }

  #bindElements() {
    this.gameConsoleElement = this.getElement(this.UISelectors.gameConsole);
  }

  sendConsoleMsg(message) {
    this.gameConsoleElement.innerHTML = "";

    return new Promise((resolve) => {
      const text = message;
      let index = 0;

      const typeNextCharacter = () => {
        if (index < text.length) {
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
          // Wait for an additional second (1000 milliseconds) before resolving
          setTimeout(resolve, 1100);
        }
      };

      typeNextCharacter();
    });
  }
}
