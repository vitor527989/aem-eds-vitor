import {
  getTextValue,
  parseButton,
  parseLink,
  parseImage,
  tryMoveInstrumentation,
} from "../../scripts/custom.js";
import {
  createOptimizedPicture,
  loadCSS,
  loadScript,
} from "../../scripts/aem.js";
import { moveInstrumentation } from "../../scripts/scripts.js";

await loadScript(
  "https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/carousel/carousel.umd.js",
);
await loadCSS(
  "https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/carousel/carousel.css",
);
/* global Carousel */

export default function decorate(block) {
  const [linkEl, ...itemEls] = [...block.children];
  const parsedButton = parseButton(linkEl.children[0]);

  const items = itemEls.map((itemEl) => {
    const [tagsEl, imageEl, headingEl, textEl, itemLinkEl, colorVariationEl] = [
      ...itemEl.children,
    ];

    const tagsList = tagsEl.querySelector("ul");
    const image = parseImage(imageEl);

    const [heading, itemText, colorVariation] = [
      headingEl,
      textEl,
      colorVariationEl,
    ].map(getTextValue);

    const parsedItemButton = parseButton(itemLinkEl);
    const link = parsedItemButton?.link ?? parseLink(parsedItemButton);
    const linkLabel = parsedItemButton?.label;

    return {
      tags: tagsList,
      heading,
      text: itemText,
      image,
      link,
      linkLabel,
      color: colorVariation,
    };
  });

  let htmlContent = ``;
  let activeSlideIndex = 0;

  if (items && items.length > 0) {
    htmlContent += `<div class="image-teaser__slider f-carousel ${items.length === 1 ? "single-item" : ""}" aria-label="carousel">`;

    items.forEach((item, index) => {
      const { link, linkLabel } = item;
      htmlContent += `
          <div class="image-teaser__slide f-carousel__slide" 
               ${index === 0 ? `` : `inert`} 
               role="group"
               aria-label="slide ${index + 1} of ${items.length}">
          `;

      if (item.tags) {
        htmlContent += `<ul class="teaser-tags">${item.tags.innerHTML}</ul>`;
      }

      if (item.image) {
        const optimizedPicture = createOptimizedPicture(
          item.image.url,
          item.image.heading,
          false,
          [{ media: "(min-width: 750px)", width: "1088" }, { width: "750" }],
        );

        optimizedPicture.classList.add("teaser-image");
        htmlContent += optimizedPicture.outerHTML;
      }

      htmlContent += `<div class="teaser-content teaser-content--${item.color}">`;

      if (item.heading) {
        htmlContent += `<h3 class="teaser-heading h6-bold">${item.heading}</h3>`;
      }

      if (item.text) {
        htmlContent += `<p class="teaser-text">${item.text}</p>`;
      }

      if (link && linkLabel) {
        htmlContent += `<a class="teaser-link button button--small ${items.length > 2 ? "" : "tertiary"}" href="${link}">${linkLabel}</a>`;
      }

      htmlContent += `</div></div>`;
    });

    htmlContent += `</div>`;
  }

  if (parsedButton) {
    htmlContent += `
        <div class="image-teaser-cta">
          <a class="button" href="${parsedButton.link}">${parsedButton.label}</a>
        </div>
      `;
  }

  block.innerText = "";
  block.innerHTML = htmlContent;

  // https://fancyapps.com/carousel/getting-started/#initialize
  // eslint-disable-next-line no-new
  new Carousel(block.querySelector(".image-teaser__slider"), {
    infinite: false,
    Navigation: {
      nextTpl: `
          <svg aria-hidden="true" class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.9697 2.96967C12.2626 2.67678 12.7374 2.67678 13.0303 2.96967L21.5303 11.4697C21.8232 11.7626 21.8232 12.2374 21.5303 12.5303L13.0303 21.0303C12.7374 21.3232 12.2626 21.3232 11.9697 21.0303C11.6768 20.7374 11.6768 20.2626 11.9697 19.9697L19.1893 12.75H3C2.58579 12.75 2.25 12.4142 2.25 12C2.25 11.5858 2.58579 11.25 3 11.25H19.1893L11.9697 4.03033C11.6768 3.73744 11.6768 3.26256 11.9697 2.96967Z" fill="#06242D"/>
          </svg>
        `,
      prevTpl: `
          <svg aria-hidden="true" class="arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.0303 2.96967C12.3232 3.26256 12.3232 3.73744 12.0303 4.03033L4.81066 11.25H21C21.4142 11.25 21.75 11.5858 21.75 12C21.75 12.4142 21.4142 12.75 21 12.75H4.81066L12.0303 19.9697C12.3232 20.2626 12.3232 20.7374 12.0303 21.0303C11.7374 21.3232 11.2626 21.3232 10.9697 21.0303L2.46967 12.5303C2.17678 12.2374 2.17678 11.7626 2.46967 11.4697L10.9697 2.96967C11.2626 2.67678 11.7374 2.67678 12.0303 2.96967Z" fill="#06242D"/>
          </svg>
        `,
    },
    on: {
      change: (instance) => {
        activeSlideIndex = instance.page;
        const slides = block.querySelectorAll(".image-teaser__slide");
        slides.forEach((slide) => {
          slide.setAttribute("inert", "");
        });
        slides[activeSlideIndex].removeAttribute("inert");
      },
    },
  });

  try {
    tryMoveInstrumentation(linkEl, block.querySelector(".image-teaser-cta"));
    const createdSlides = block.querySelectorAll(".image-teaser__slide");

    itemEls.forEach((item, index) => {
      const createdSlide = createdSlides[index];
      moveInstrumentation(item, createdSlide);

      const [tagsEl, imageEl, headingEl, textEl, itemLinkEl] = [
        ...item.children,
      ];
      tryMoveInstrumentation(
        tagsEl,
        createdSlide.querySelector(".teaser-tags"),
      );
      tryMoveInstrumentation(
        imageEl,
        createdSlide.querySelector(".teaser-image"),
      );
      tryMoveInstrumentation(
        headingEl,
        createdSlide.querySelector(".teaser-heading"),
      );
      tryMoveInstrumentation(
        textEl,
        createdSlide.querySelector(".teaser-text"),
      );
      tryMoveInstrumentation(
        itemLinkEl,
        createdSlide.querySelector(".teaser-link"),
      );
    });
  } catch (e) {
    console.error("error initializing instrumentation", e);
  }
}
