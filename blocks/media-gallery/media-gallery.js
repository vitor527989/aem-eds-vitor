import { loadScript, loadCSS } from "../../scripts/aem.js";
import { moveInstrumentation } from "../../scripts/scripts.js";
import { getTextValue, parseImage } from "../../scripts/custom.js";

await loadScript(
  "https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.umd.js",
);
await loadScript(
  "https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/carousel/carousel.umd.js",
);
await loadCSS(
  "https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.css",
);
await loadCSS(
  "https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/carousel/carousel.css",
);
/* global Fancybox, Carousel */

// counter to group gallery items to the respective gallery
let galleryCounter = 0;

export default function decorate(block) {
  galleryCounter += 1;

  const [variantEl, ...slideEls] = [...block.children];
  const variant = getTextValue(variantEl);

  if (variant) {
    console.error(`variant ${variant} is not supported yet.`);
    block.textContent =
      `Media Gallery: variant '${variant}' not supported`.return;
  }

  const slides = [...slideEls].map((galleryItem) => {
    const slideElement = document.createElement("div");
    moveInstrumentation(galleryItem, slideElement);

    const [mediaTypeEl, captionEl, localAssetEl, assetYoutubeEl] = [
      ...galleryItem.children,
    ];

    const [mediaType, caption, youtubeId] = [
      mediaTypeEl,
      captionEl,
      assetYoutubeEl,
    ].map(getTextValue);
    const localImageUrl = parseImage(localAssetEl);

    let fullscreenSrc;
    let thumbnailSrc;
    if (mediaType === "local-asset") {
      // TODO: video
      fullscreenSrc = localImageUrl?.url;
      thumbnailSrc = localImageUrl?.url;
    } else if (mediaType === "youtube-video") {
      fullscreenSrc = `https://www.youtube.com/watch?v=${youtubeId}`;
      thumbnailSrc = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    }

    const img = document.createElement("img");

    slideElement.classList.add("f-carousel__slide");

    slideElement.setAttribute("data-src", fullscreenSrc);
    slideElement.setAttribute("data-fancybox", `gallery-${galleryCounter}`);
    slideElement.setAttribute("data-caption", caption);

    img.setAttribute("src", thumbnailSrc);

    slideElement.append(img);

    return slideElement;
  });

  block.textContent = "";
  slides.forEach((slide) => {
    block.append(slide);
  });

  block.classList.add("f-carousel");

  Fancybox.bind(block);

  // https://fancyapps.com/carousel/getting-started/#initialize
  // eslint-disable-next-line no-new
  new Carousel(block, {});
}
