import {
  tryMoveInstrumentation,
  getTextValue,
  parseButton,
  parseImage,
} from "../../scripts/custom.js";
import { moveInstrumentation } from "../../scripts/scripts.js";

export default function decorate(block) {
  const [headingEl, buttonEl, ...itemEls] = [...block.children];

  const heading = getTextValue(headingEl);
  const button = parseButton(buttonEl.children[0]);

  const items = itemEls.map((itemEl) => {
    const [picEl, titleEl, descEl] = [...itemEl.children];
    return {
      image: parseImage(picEl),
      title: getTextValue(titleEl),
      description: getTextValue(descEl),
    };
  });

  block.innerText = "";

  let htmlContent = "";

  if (heading) {
    htmlContent += `<h2 class="heading h4-black">${heading}</h2>`;
  }
  if (items && items.length > 0) {
    const isEven = items.length % 2 === 0 && items.length % 4 === 0;
    htmlContent += `<ul class="list${isEven ? " list--is-even" : ""}"></ul>`;
  }
  if (button) {
    htmlContent += `<a class="link button" href="${button.link}">${button.label}</a>`;
  }
  block.innerHTML = htmlContent;

  const ul = block.querySelector("ul");
  if (ul) {
    items.forEach((item) => {
      const li = document.createElement("li");
      li.classList.add("list-item");
      li.innerHTML = `
      <img class="list-item-image" src="${item?.image?.url}" alt="${item.title}">
      <div class="list-item-info">
        <h3 class="list-item-info-title h8-black">${item.title}</h3>
        <p class="list-item-info-description copy-standard-bold">${item.description}</p>
      </div>
    `;
      ul.appendChild(li);
    });
  }

  tryMoveInstrumentation(headingEl, block.querySelector(".heading"));
  tryMoveInstrumentation(buttonEl, block.querySelector(".link"));

  if (ul) {
    const createdListItems = [...ul.children];
    const originalListItems = itemEls;

    if (createdListItems.length === originalListItems.length) {
      // sanity check
      for (let i = 0; i < createdListItems.length; i += 1) {
        moveInstrumentation(originalListItems[i], createdListItems[i]);

        const [picEl, titleEl, descEl] = [...originalListItems[i].children];
        tryMoveInstrumentation(
          picEl,
          createdListItems[i].querySelector(".list-item-image"),
        );
        tryMoveInstrumentation(
          titleEl,
          createdListItems[i].querySelector(".list-item-info-title"),
        );
        tryMoveInstrumentation(
          descEl,
          createdListItems[i].querySelector(".list-item-info-description"),
        );
      }
    }
  }
}
