import { getRichTextContent, getTextValue } from "../../scripts/custom.js";

let collapsableCounter = 0;

function toggleButton(buttonEl, expandLabel, collapseLabel) {
  const isExpanded = buttonEl.classList.toggle("expanded");
  buttonEl.innerText = isExpanded ? collapseLabel : expandLabel;
  buttonEl.setAttribute("aria-expanded", isExpanded);
}

export default function decorate(block) {
  collapsableCounter += 1;

  const [
    collapsableVariantEl,
    textEl,
    expandedTextEl,
    expandButtonLabelEl,
    collapseButtonLabelEl,
  ] = [...block.children];

  const variant = getTextValue(collapsableVariantEl);

  if (variant) {
    block.classList.add(`collapsable-text--${variant}`);
  }

  const [text, expandedText] = [textEl, expandedTextEl].map(getRichTextContent);
  const [expandButtonLabel = "Show More", collapseButtonLabel = "Show Less"] = [
    expandButtonLabelEl,
    collapseButtonLabelEl,
  ].map(getTextValue);

  block.innerText = "";
  block.innerHTML = `
    <div class="text">${text.innerHTML}</div>
    <button class="button" aria-expanded="false" aria-controls="collapsable-${collapsableCounter}">${expandButtonLabel}</button>
    <div class="expanded-text" id="collapsable-${collapsableCounter}"><div class="collapsable">${expandedText.innerHTML}</div></div>
  `;

  block.querySelector(".button").addEventListener("click", (event) => {
    const el = event.target;
    toggleButton(el, expandButtonLabel, collapseButtonLabel);
  });
}
