import { createOptimizedPicture } from "../../scripts/aem.js";
import {
  getTextValue,
  tryMoveInstrumentation,
  getRichTextContent,
  parseButton,
  parseImage,
} from "../../scripts/custom.js";

export default function decorate(block) {
  const [imageEl, headlineEl, richTextEl, buttonEl, buttonTypeEl] = [
    ...block.children,
  ];
  const image = parseImage(imageEl);
  const headline = getTextValue(headlineEl);
  const richText = getRichTextContent(richTextEl);
  const button = parseButton(buttonEl.children[0]);

  let htmlContent = ``;

  if (image) {
    const optimizedPicture = createOptimizedPicture(
      image.url,
      image.alt,
      false,
      [{ media: "(min-width: 768px)", width: "470" }, { width: "750" }],
    );
    optimizedPicture.classList.add("image");
    htmlContent += optimizedPicture.outerHTML;
  }

  htmlContent += `<div class="brochure-content-wrapper">`;

  if (headline) {
    htmlContent += `<h2 class="h5-black brochure-headline">${headline}</h2>`;
  }
  if (richText.innerHTML) {
    htmlContent += `<div class="brochure-text">${richText.innerHTML}</div>`;
  }

  if (button) {
    button.type = getTextValue(buttonTypeEl) || "primary";
    const targetBlank =
      button.link?.includes(".pdf") || button.link?.includes("http");

    htmlContent += `
        <a href="${button.link}" ${targetBlank ? `target="_blank"` : ``} class="button ${button.type === "tertiary" ? `${button.type}` : `${button.type}-outlined`} brochure-cta">
          ${button.label}
        </a>
      `;
  }

  htmlContent += `</div>`;
  block.innerHTML = htmlContent;

  try {
    tryMoveInstrumentation(imageEl, block.querySelector(".image"));
    tryMoveInstrumentation(
      headlineEl,
      block.querySelector(".brochure-headline"),
    );
    tryMoveInstrumentation(buttonEl, block.querySelector(".brochure-cta"));
  } catch (e) {
    console.error("error instrumenting component", e);
  }
}
