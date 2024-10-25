import {
  getRichTextContent,
  getTextValue,
  parseImage,
  tryMoveInstrumentation,
} from "../../scripts/custom.js";

export default function decorate(block) {
  const [imageEl, richTextEl, imgPlacementEl] = [...block.children];
  const image = parseImage(imageEl);
  const richText = getRichTextContent(richTextEl);
  const imgPlacement = getTextValue(imgPlacementEl);

  if (imgPlacement === "right") {
    block.classList.add("reverse");
  }

  let htmlContent = ``;

  if (image) {
    htmlContent += `<img class="image" src="${image.url}" alt="${image.alt ?? ""}">`;
  }

  if (richText) {
    htmlContent += `
    <div class="text">
      ${richText.innerHTML}
    </div>
  `;
  }

  block.textContent = "";
  block.innerHTML = htmlContent;

  try {
    tryMoveInstrumentation(imageEl, block.querySelector(".image"));
  } catch (e) {
    console.error("error instrumenting component", e);
  }
}
