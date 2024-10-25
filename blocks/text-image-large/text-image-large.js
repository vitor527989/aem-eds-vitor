import {
  getRichTextContent,
  getTextValue,
  parseButton,
  parseImage,
  tryMoveInstrumentation,
} from "../../scripts/custom.js";
import { createOptimizedPicture } from "../../scripts/aem.js";

export default function decorate(block) {
  const [
    imageEl,
    headlineEl,
    richTextEl,
    imgPlacementEl,
    primaryButtonEl,
    secondaryButtonEl,
  ] = [...block.children];
  const image = parseImage(imageEl);
  const richText = getRichTextContent(richTextEl);
  const [headline, imgPlacement] = [headlineEl, imgPlacementEl].map(
    getTextValue,
  );
  const [primaryButton, secondaryButton] = [
    primaryButtonEl,
    secondaryButtonEl,
  ].map((el) => parseButton(el.children[0]));

  if (imgPlacement === "right") {
    block.classList.add("reverse");
  }

  let htmlContent = ``;

  if (image) {
    const optimizedPicture = createOptimizedPicture(
      image.url,
      image.alt,
      false,
      [{ media: "(min-width: 750px)", width: "450" }, { width: "750" }],
    );
    optimizedPicture.classList.add("image");
    htmlContent += optimizedPicture.outerHTML;
  }

  htmlContent += `<div class="content">`;

  if (headline) {
    htmlContent += `<h4 class="headline h6-bold">${headline}</h4>`;
  }

  if (richText) {
    htmlContent += `
      <div class="text">
      ${richText.innerHTML}
      </div>
  `;
  }

  if (primaryButton || secondaryButton) {
    htmlContent += `<div class="buttons">`;
    if (primaryButton) {
      htmlContent += `<a class="button button--small primary" href="${primaryButton.link}">${primaryButton.label}</a>`;
    }
    if (secondaryButton) {
      htmlContent += `<a class="button button--small primary-outlined" href="${secondaryButton.link}">${secondaryButton.label}</a>`;
    }
    htmlContent += `</div>`;
  }

  htmlContent += `</div>`;

  block.textContent = "";
  block.innerHTML = htmlContent;

  try {
    tryMoveInstrumentation(imageEl, block.querySelector(".image"));
    tryMoveInstrumentation(headlineEl, block.querySelector(".headline"));
    tryMoveInstrumentation(
      primaryButtonEl,
      block.querySelector(".button.primary"),
    );
    tryMoveInstrumentation(
      secondaryButtonEl,
      block.querySelector(".button.primary-outlined"),
    );
  } catch (e) {
    console.error("error instrumenting component", e);
  }
}
