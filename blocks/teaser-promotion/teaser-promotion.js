import {
  getTextValues,
  parseButton,
  tryMoveInstrumentation,
} from "../../scripts/custom.js";

export default function decorate(block) {
  const [
    colorPropEl,
    shapePropEl,
    imagePropEl, // eslint-disable-line
    titlePropEl,
    descriptionPropEl,
    buttonPropEl,
  ] = [...block.children];

  let promotion = "";

  const [color, shape, title, description] = getTextValues(
    colorPropEl,
    shapePropEl,
    titlePropEl,
    descriptionPropEl,
  );
  const button = parseButton(buttonPropEl.children[0]);

  promotion = `
  <div class="container">
  <div class="shape-wrapper shape-wrapper--${shape || "chora"}">
    <div class="shape shape--${color}">
      <h2 class="shape-title h4-black">${title}</h2>
      ${description ? `<p class="shape-description copy-large-regular">${description}</p>` : ""}
      <a href="${button.link}" class="button secondary">${button.label}</a>
    </div>
  </div></div>
  `;

  colorPropEl.remove();
  shapePropEl.remove();
  titlePropEl.remove();
  descriptionPropEl.remove();
  buttonPropEl.remove();

  block.innerHTML += promotion;

  tryMoveInstrumentation(shapePropEl, block.querySelector(".shape-wrapper"));
  tryMoveInstrumentation(colorPropEl, block.querySelector(".shape"));
  tryMoveInstrumentation(titlePropEl, block.querySelector(".shape-title"));
  tryMoveInstrumentation(titlePropEl, block.querySelector(".shape-title"));
  tryMoveInstrumentation(
    descriptionPropEl,
    block.querySelector(".shape-description"),
  );
  tryMoveInstrumentation(buttonPropEl, block.querySelector(".button"));
}
