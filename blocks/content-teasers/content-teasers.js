import {
  getTextValue,
  parseButton,
  parseLink,
  parseImage,
  tryMoveInstrumentation,
} from "../../scripts/custom.js";
import { loadCSS, loadScript } from "../../scripts/aem.js";
import { moveInstrumentation } from "../../scripts/scripts.js";

await loadScript(
  "https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/carousel/carousel.umd.js",
);
await loadCSS(
  "https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/carousel/carousel.css",
);
/* global Carousel */

export default function decorate(block) {
  const [headingEl, textEl, sizeEl, ...itemEls] = [...block.children];
  const [heading, text, size] = [headingEl, textEl, sizeEl].map(getTextValue);

  const isTallSize = size === "tall";

  const teaserItems = itemEls.map((itemEl) => {
    const [teaserImgEl, teaserHeadingEl, teaserTextEl, teaserLinkEl] = [
      ...itemEl.children,
    ];

    const teaserImg = parseImage(teaserImgEl);
    const [teaserHeading, teaserText] = [teaserHeadingEl, teaserTextEl].map(
      getTextValue,
    );
    const parsedButton = parseButton(teaserLinkEl);
    const link = parsedButton?.link ?? parseLink(teaserLinkEl);
    const linkLabel = parsedButton?.label;
    return {
      heading: teaserHeading,
      text: teaserText,
      image: teaserImg,
      link,
      linkLabel,
    };
  });

  let htmlContent = `<div class="teaser-top">`;

  if (heading) {
    htmlContent += `<h2 class="heading h3-black">${heading}</h2>`;
  }

  if (text) {
    htmlContent += `<p class="text copy-large-regular">${text}</p>`;
  }

  htmlContent += `</div>`;

  if (teaserItems && teaserItems.length > 0) {
    htmlContent += `<div class="teasers f-carousel" style="--slides-count: ${Math.max(teaserItems.length, 1)}">`;
    teaserItems.forEach((teaserItem) => {
      // image and headline defined mandatory

      const { link, linkLabel } = teaserItem;

      const slideClickable = !isTallSize && link;

      if (slideClickable) {
        htmlContent += `<a href="${link}" class="teaser f-carousel__slide">`;
      } else {
        htmlContent += `<div class="teaser f-carousel__slide">`;
      }

      htmlContent += `<img class="teaser-image" src="${teaserItem.image.url}" alt="${teaserItem.heading}">`;
      htmlContent += `<h3 class="teaser-heading${isTallSize ? " h7-black" : " h8-bold"}">${teaserItem.heading}</h3>`;
      if (teaserItem.text) {
        htmlContent += `<p class="teaser-text${isTallSize ? " copy-small-regular" : ""}">${teaserItem.text}</p>`;
      }
      if (isTallSize && link) {
        htmlContent += `<a class="button tertiary button--small" href="${link}">${linkLabel}</a>`;
      }
      if (slideClickable) {
        htmlContent += `</a>`;
      } else {
        htmlContent += `</div>`;
      }
    });
    htmlContent += `</div>`;
  }

  block.innerText = "";
  block.innerHTML = htmlContent;

  if (isTallSize) {
    block.classList.add("content-teasers--tall");
  }

  // https://fancyapps.com/carousel/getting-started/#initialize
  // eslint-disable-next-line no-new
  new Carousel(block.querySelector(".teasers"), {
    infinite: false,
    Navigation: false,
  });

  try {
    tryMoveInstrumentation(headingEl, block.querySelector(".heading"));
    tryMoveInstrumentation(textEl, block.querySelector(".text"));

    const createdSlides = block.querySelectorAll(".teaser");

    itemEls.forEach((item, index) => {
      const createdSlide = createdSlides[index];

      moveInstrumentation(item, createdSlides[index]);

      const [teaserImgEl, teaserHeadingEl, teaserTextEl] = [...item.children];

      tryMoveInstrumentation(
        teaserImgEl,
        createdSlide.querySelector(".teaser-image"),
      );
      tryMoveInstrumentation(
        teaserHeadingEl,
        createdSlide.querySelector(".teaser-heading"),
      );
      tryMoveInstrumentation(
        teaserTextEl,
        createdSlide.querySelector(".teaser-text"),
      );
    });
  } catch (e) {
    console.error("error initializing instrumentation", e);
  }
}
