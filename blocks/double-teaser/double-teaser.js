import {
  getTextValue,
  getTextValues,
  parseButton,
  tryMoveInstrumentation,
} from "../../scripts/custom.js";
import { moveInstrumentation } from "../../scripts/scripts.js";

export default function decorate(block) {
  const [titleEl, descriptionEl, ...teasers] = [...block.children];
  const [title, description] = getTextValues(titleEl, descriptionEl);

  let teasersMarkup = `
  <h2 class="h3-black double-title">${title}</h2>
  <p class="copy-large-regular double-description">${description}</p>
  <div class="double-teasers-wrapper">`;
  teasers.forEach((teaser) => {
    const [imageEl, teaserTitleEl, buttonEl] = [...teaser.children];
    const button = parseButton(buttonEl);

    teasersMarkup += `
    <div class="double-teaser-item">
        <div class="image-wrapper">${imageEl.innerHTML}</div>
        <h3 class="double-teaser-title h5-bold">${getTextValue(teaserTitleEl)}</h3>
        <a class="link button" href="${button?.link}">${button?.label}</a>
    </div>
    `;
  });

  teasersMarkup += "</div>";
  block.innerHTML = teasersMarkup;

  titleEl.remove();
  descriptionEl.remove();

  tryMoveInstrumentation(titleEl, block.querySelector(".double-title"));
  tryMoveInstrumentation(
    descriptionEl,
    block.querySelector(".double-description"),
  );

  teasers.forEach((teaser, i) => {
    const [imageEl, teaserTitleEl, buttonEl] = [...teaser.children];
    moveInstrumentation(
      teaser,
      block.querySelectorAll(".double-teaser-item")[i],
    );
    tryMoveInstrumentation(
      imageEl,
      teaser.querySelector(".image-wrapper picture"),
    );
    tryMoveInstrumentation(
      teaserTitleEl,
      block.querySelectorAll(".double-teaser-title")[i],
    );
    tryMoveInstrumentation(buttonEl, block.querySelectorAll(".button")[i]);

    teaser.remove();
  });
}
