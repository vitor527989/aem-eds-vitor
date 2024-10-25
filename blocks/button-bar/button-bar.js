import {
  getButtonClasses,
  getTextValue,
  parseButton,
  tryMoveInstrumentation,
} from "../../scripts/custom.js";

export default function decorate(block) {
  const [backgroundEl, firstButtonEl, secondButtonEl] = [...block.children];

  const background = getTextValue(backgroundEl);
  const [firstButton, secondButton] = [
    firstButtonEl.children[0],
    secondButtonEl.children[0],
  ].map(parseButton);

  let htmlContent = ``;
  const hasDarkBackground = background === "bg-midnight";

  if (firstButton) {
    htmlContent += `<a class="button first-button ${getButtonClasses(firstButton.type, hasDarkBackground)}" href="${firstButton.link}">${firstButton.label}</a>`;
  }
  if (secondButton) {
    htmlContent += `<a class="button second-button ${getButtonClasses(secondButton.type, hasDarkBackground)}" href="${secondButton.link}">${secondButton.label}</a>`;
  }

  const buttonBarContainer = block.closest(".button-bar-container");
  // need for improved authoring experience, as the section is not re-rendered when a property on the block changes
  buttonBarContainer.classList.remove(
    "bg-white",
    "bg-stone",
    "bg-crystal",
    "bg-midnight",
  );
  if (background) {
    buttonBarContainer.classList.add(background);
  }

  block.textContent = "";
  block.innerHTML = htmlContent;

  try {
    tryMoveInstrumentation(firstButtonEl, block.querySelector(".first-button"));
    tryMoveInstrumentation(
      secondButtonEl,
      block.querySelector(".second-button"),
    );
  } catch (e) {
    console.error("error instrumenting component", e);
  }
}
