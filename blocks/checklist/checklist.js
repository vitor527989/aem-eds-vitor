import { getTextValue, tryMoveInstrumentation } from "../../scripts/custom.js";
import { moveInstrumentation } from "../../scripts/scripts.js";

export default function decorate(block) {
  const [listIconEl, ...listItemEls] = [...block.children];
  const listIcon = getTextValue(listIconEl);

  const domUL = document.createElement("ul");
  if (listIcon) {
    // we cannot do it with CSS here as we need to provide a customized url for the author view
    domUL.style.setProperty(
      "list-style-image",
      `url(${window.hlx.codeBasePath}/icons/${listIcon}.svg)`,
    );
  }

  for (let i = 0; i < listItemEls.length; i += 1) {
    const listItemEl = listItemEls[i];
    const [textEl] = [...listItemEl.children];
    const textValue = getTextValue(textEl) ?? "";

    const domLI = document.createElement("li");
    const domP = document.createElement("p");
    domP.innerText = textValue;

    domLI.append(domP);
    domUL.append(domLI);

    moveInstrumentation(listItemEl, domLI);
    tryMoveInstrumentation(textEl, domP);
  }

  block.innertext = "";
  block.innerHTML = domUL.outerHTML;
}
