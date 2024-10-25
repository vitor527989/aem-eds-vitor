import { loadCSS, loadScript } from "../../scripts/aem.js";
import { loadDataFromPersistedQuery } from "../../scripts/content-fragments.js";
import { getTextValue } from "../../scripts/custom.js";
import { renderExcursionTeaser } from "../../scripts/reusable-markup.js";
import { initTaxonomy } from "../../scripts/taxonomy.js";
import { initTranslations } from "../../scripts/translation.js";

await loadScript(
  "https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/carousel/carousel.umd.js",
);
await loadCSS(
  "https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/carousel/carousel.css",
);

const renderExcursion = (excursion) =>
  renderExcursionTeaser(excursion, ["f-carousel__slide"]);

export default async function decorate(block) {
  const [__, tagEl] = [...block.children]; // eslint-disable-line no-unused-vars

  const tagValue = getTextValue(tagEl) || "";
  const checkPath = tagValue
    ? tagValue.substring(tagValue.indexOf(":") + 1, tagValue.indexOf("/"))
    : "";

  const loaded = await loadDataFromPersistedQuery(
    checkPath === "destinations"
      ? "getExcursionsByDestintion"
      : "getExcursionsByPort",
    tagValue,
  );

  await initTranslations();
  await initTaxonomy();

  const data = loaded.excursionList;

  let excursionTeaserItem =
    "<div class='excursion-carousel-wrapper f-carousel'>";

  if ("items" in data) {
    data.items.forEach((excursion) => {
      excursionTeaserItem += renderExcursion(excursion);
    });
  }

  excursionTeaserItem += "</div>";

  block.innerHTML = excursionTeaserItem;

  const carouselWrapper = block.querySelector(".excursion-carousel-wrapper");

  /* eslint-disable */
  new Carousel(carouselWrapper, {
    Navigation: {
      nextTpl: `
      <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M11.9697 2.96967C12.2626 2.67678 12.7374 2.67678 13.0303 2.96967L21.5303 11.4697C21.8232 11.7626 21.8232 12.2374 21.5303 12.5303L13.0303 21.0303C12.7374 21.3232 12.2626 21.3232 11.9697 21.0303C11.6768 20.7374 11.6768 20.2626 11.9697 19.9697L19.1893 12.75H3C2.58579 12.75 2.25 12.4142 2.25 12C2.25 11.5858 2.58579 11.25 3 11.25H19.1893L11.9697 4.03033C11.6768 3.73744 11.6768 3.26256 11.9697 2.96967Z" fill="currentColor"/>
      </svg>
    `,
      prevTpl: `
      <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12.0303 2.96967C12.3232 3.26256 12.3232 3.73744 12.0303 4.03033L4.81066 11.25H21C21.4142 11.25 21.75 11.5858 21.75 12C21.75 12.4142 21.4142 12.75 21 12.75H4.81066L12.0303 19.9697C12.3232 20.2626 12.3232 20.7374 12.0303 21.0303C11.7374 21.3232 11.2626 21.3232 10.9697 21.0303L2.46967 12.5303C2.17678 12.2374 2.17678 11.7626 2.46967 11.4697L10.9697 2.96967C11.2626 2.67678 11.7374 2.67678 12.0303 2.96967Z" fill="currentColor"/>
      </svg>`,
    },
    Dots: true,
    infinite: false,
    center: false,
  });
  /* eslint-enable */
}
