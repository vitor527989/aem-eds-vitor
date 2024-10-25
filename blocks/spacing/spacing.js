import { getTextValue } from "../../scripts/custom.js";

export default function decorate(block) {
  const [spacingEl] = [...block.children];
  const spacing = getTextValue(spacingEl);
  block.innerHTML = `<div class="${spacing}"></div>`;
}
