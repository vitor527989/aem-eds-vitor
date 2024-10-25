import { fetchPlaceholders } from "../../scripts/aem.js";
import {
  getLanguagePrefix,
  isLocalEnvironment,
  getTextValue,
} from "../../scripts/custom.js";

const getSpreadsheetResults = async () => {
  let data;
  await fetch(`${getLanguagePrefix()}/need-to-know.json`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      return {};
    })
    .then((json) => {
      data = json.data;
    });

  return data;
};

export default async function decorate(block) {
  const [headingEl, checkboxesEL] = [...block.children];
  const PUBLIC_URL = "https://author-p139364-e1423304.adobeaemcloud.com";
  const isLocalEnv = isLocalEnvironment();
  const checkboxes = getTextValue(checkboxesEL);
  const optionList = checkboxes.split(",");

  const details = await getSpreadsheetResults();
  const placeholders = await fetchPlaceholders(getLanguagePrefix());

  const list = document.createElement("ul");

  optionList.forEach((option) => {
    const li = document.createElement("li");
    li.classList.add("copy-standard-regular", "need-to-know-item");
    const selectedItem = details.filter(
      (item) => item.Key.toLowerCase() === option.toLowerCase(),
    )[0];

    li.innerHTML = `
      ${
        selectedItem.Icon
          ? `<div class="icon" style="mask-image: url(${isLocalEnv ? PUBLIC_URL : ""}/content/dam/celestyal/${selectedItem.Icon.replaceAll(" ", "%20")})"></div>`
          : `<div class="no-icon"></div>`
      }
      <p>${placeholders[selectedItem.Text.replaceAll(/([.]\w)/g, (c) => c.toUpperCase()).replaceAll(".", "")]}</p>
    `;

    list.append(li);
  });

  block.innerHTML = `
      <h3 class="h7-bold need-to-know-title">${getTextValue(headingEl)}</h3>
      ${list.outerHTML}
    `;
}
