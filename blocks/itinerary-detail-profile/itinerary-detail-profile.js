import {
  getLinkValue,
  getRichTextContent,
  getTextValue,
  isLocalEnvironment,
  tryMoveInstrumentation,
} from "../../scripts/custom.js";
import { loadDataFromPersistedQuery } from "../../scripts/content-fragments.js";
import {
  renderOverline,
  renderPortsLine,
} from "../../scripts/business-logic/itinerary.js";
import { createOptimizedPicture } from "../../scripts/aem.js";
import {
  getTranslation,
  initTranslations,
  replaceTranslationPlaceholders,
  replaceTranslationPlaceholdersCount,
} from "../../scripts/translation.js";
import { loadFragment } from "../fragment/fragment.js";
import { installDialogListeners, renderDialog } from "../../scripts/dialog.js";

function createFacts(contentFragment) {
  const facts = [];
  const { ship, itinerarySteps, seasonTimerange } = contentFragment;
  if (ship) {
    facts.push({
      icon: "cruiseship_midnight.svg",
      text: ship,
    });
  }

  const location = itinerarySteps?.[0]?.location;
  if (location) {
    const { country: countryKey, title: port } = location;

    const line = [port, getTranslation(countryKey) ?? countryKey]
      .filter(Boolean)
      .join(", ");

    facts.push({
      icon: "map-pin_midnight.svg",
      text: line,
    });
  }

  if (seasonTimerange) {
    facts.push({
      icon: "sun_midnight.svg",
      text: seasonTimerange,
    });
  }

  return facts;
}

async function renderContentFragment(block, contentFragmentRef) {
  if (!contentFragmentRef) {
    console.error("content fragment ref not specified");
    return undefined;
  }

  await initTranslations();

  const loaded = await loadDataFromPersistedQuery(
    "ItineraryByPath",
    contentFragmentRef,
    { skipCache: isLocalEnvironment() },
  );

  const fromPrice = "$ TODO / person";
  const {
    title,
    description,
    shortDescription,
    tag,
    image,
    alternativeStartPorts,
    combinableItinerary,
  } = loaded;
  const overline = renderOverline(loaded);
  const portsText = renderPortsLine(loaded);
  const alternativeStartPortsAvailable =
    (alternativeStartPorts ?? []).length > 0;
  const combinableWithOtherItinerary = !!combinableItinerary;

  const facts = createFacts(loaded);

  let htmlContent = ``;

  htmlContent += `<div class="stage">`;
  if (image) {
    const optimizedPicture = createOptimizedPicture(
      // eslint-disable-next-line no-underscore-dangle
      image._path,
      // TODO image alt
      "",
      // used on stage, top of the page
      true,
      [
        { media: "(min-width: 1400px)", width: "2000" },
        { media: "(min-width: 1024px)", width: "1300" },
        { media: "(min-width: 800px)", width: "950" },
        { media: "(min-width: 550px)", width: "768" },
        { width: "500" },
      ],
    );
    optimizedPicture.classList.add("image");
    htmlContent += optimizedPicture.outerHTML;
  }
  if (tag) {
    htmlContent += `<div class="tag copy-small-bold mobile-only">${tag}</div>`;
  }
  htmlContent += `</div>`;
  htmlContent += `<div class="content container">`;
  if (tag) {
    htmlContent += `<div class="tag copy-small-bold desktop-only">${tag}</div>`;
  }
  htmlContent += `<div class="top">`;
  if (overline) {
    htmlContent += `<p class="overline copy-small-regular">${overline}</p>`;
  }
  if (title) {
    htmlContent += `<h1 class="heading h4-black">${title}</h1>`;
  }

  // top closing
  htmlContent += `</div>`;
  htmlContent += `<div class="center">`;

  htmlContent += `<div class="center-left">`;

  if (facts.length > 0) {
    htmlContent += `<ul class="copy-small-bold facts">`;
    facts.forEach((fact) => {
      htmlContent += `<li style="background-image: url('${window.hlx.codeBasePath}/icons/${fact.icon}')">${fact.text}</li>`;
    });
    htmlContent += `</ul>`;
  }
  if (portsText) {
    htmlContent += `<p class="ports-text copy-standard-bold">${portsText}</p>`;
  }
  if (fromPrice) {
    htmlContent += `<div class="price copy-large-regular">from <span class="h7-bold highlighted-price">${fromPrice}</span></div>`;
  }

  // center-left closing
  htmlContent += `</div>`;
  htmlContent += `<div class="center-middle">`;

  if (shortDescription) {
    htmlContent += `<div class="short-description rich-text">${shortDescription.html}</div>`;
  }

  if (alternativeStartPortsAvailable || combinableWithOtherItinerary) {
    htmlContent += `<div class="buttons">`;
    if (alternativeStartPortsAvailable) {
      htmlContent += `
      <div class="button-wrapper">
        <img src="${window.hlx.codeBasePath}/icons/info_midnight.svg" alt="Info Icon">
        <button class="button alternative-start-ports-dialog-trigger">Other start points</button>
      </div>`;
    }
    if (combinableWithOtherItinerary) {
      htmlContent += `
      <div class="button-wrapper">
        <img src="${window.hlx.codeBasePath}/icons/info_midnight.svg" alt="Info Icon">
        <button class="button combinable-itineraries-dialog-trigger">Combinable with another cruise</button>
      </div>`;
    }
    htmlContent += `</div>`;
  }

  // center-middle closing
  htmlContent += `</div>`;
  htmlContent += `<div class="center-right">`;

  if (description) {
    htmlContent += `<div class="description rich-text">${description.html}</div>`;
  }

  // center-right closing
  htmlContent += `</div>`;

  // center closing
  htmlContent += `</div>`;

  htmlContent += `<div class="bottom button-bar"><a class="button primary" href="#">View available dates & book</a></div>`;

  htmlContent += `</div>`;

  block.innerText = "";
  block.innerHTML = htmlContent;

  return loaded;
}

/**
 * injects the dialog markup at the end of the block
 *
 * @param {HTMLElement} block
 * @param {Object} dialogComponentParams parameters passed to the component from the universal editor
 * @param {string} dialogComponentParams.otherStartPortsHeading
 * @param {HTMLElement} dialogComponentParams.otherStartPortsRichtextMulti
 * @param {HTMLElement} dialogComponentParams.otherStartPortsRichtextSingle
 * @param {string} dialogComponentParams.combineItineraryHeading
 * @param {HTMLElement} dialogComponentParams.combineItineraryRichtext
 * @param {string} dialogComponentParams.popupContentRef defined where the popup content gets injected from (most probably link to contact-page)
 * @param {Object} contentFragment content fragment loaded by the parent component
 * @returns {Promise<void>}
 */
async function renderDialogs(block, dialogComponentParams, contentFragment) {
  let htmlContent = ``;

  const { alternativeStartPorts, combinableItinerary } = contentFragment;
  const {
    otherStartPortsHeading,
    otherStartPortsRichtextMulti,
    otherStartPortsRichtextSingle,
    combineItineraryHeading,
    combineItineraryRichtext,
    popupContentRef,
  } = dialogComponentParams;

  const fragment = await loadFragment(popupContentRef);

  // dialogs
  const alternativeStartingPortTitles = (alternativeStartPorts ?? []).map(
    (asp) => asp.title,
  );
  if (alternativeStartingPortTitles.length > 0) {
    let dialogMarkup = `<div class="top-content">`;
    if (otherStartPortsHeading) {
      dialogMarkup += `<h2 class="h5-black">${otherStartPortsHeading}</h2>`;
    }

    const otherPortsRichText =
      alternativeStartingPortTitles.length > 1
        ? otherStartPortsRichtextMulti.innerHTML
        : otherStartPortsRichtextSingle.innerHTML;
    dialogMarkup += `
      <div class="rich-text">
          ${replaceTranslationPlaceholdersCount(otherPortsRichText, alternativeStartingPortTitles)}
      </div>
    `;

    dialogMarkup += `
          </div>
        <div>${fragment.innerHTML}</div>`;
    htmlContent += renderDialog(dialogMarkup, "alternative-start-ports-dialog");
  }
  if (combinableItinerary) {
    let dialogMarkup = `<div class="top-content">`;
    if (combineItineraryHeading) {
      dialogMarkup += `<h2 class="h5-black">${replaceTranslationPlaceholders(combineItineraryHeading, [combinableItinerary.title])}</h2>`;
    }

    if (combineItineraryRichtext) {
      dialogMarkup += `<div>${replaceTranslationPlaceholders(combineItineraryRichtext.innerHTML, [combinableItinerary.title])}</div>`;
    }

    dialogMarkup += `
          </div>
        <div class="rich-text">${fragment.innerHTML}</div>`;
    htmlContent += renderDialog(dialogMarkup, "combinable-itineraries-dialog");
  }

  block.insertAdjacentHTML("beforeend", htmlContent);

  if (alternativeStartingPortTitles.length > 0) {
    const dialog = block.querySelector(".alternative-start-ports-dialog");
    const trigger = block.querySelector(
      ".alternative-start-ports-dialog-trigger",
    );
    installDialogListeners(dialog, trigger);
  }

  if (combinableItinerary) {
    const dialog = block.querySelector(".combinable-itineraries-dialog");
    const trigger = block.querySelector(
      ".combinable-itineraries-dialog-trigger",
    );
    installDialogListeners(dialog, trigger);
  }
}

export default async function decorate(block) {
  console.log("itinerary detail profile", block);

  // render server supplied data
  const [
    headingEl,
    descriptionEl,
    contentFragmentRefEl,
    popupContentRefEl,
    otherStartPortsHeadingEl,
    otherStartPortsRichtextSingleEl,
    otherStartPortsRichtextMultiEl,
    combineItineraryHeadingEl,
    combineItineraryRichtextEl,
  ] = [...block.children];
  const [
    heading,
    contentFragmentRef,
    otherStartPortsHeading,
    combineItineraryHeading,
  ] = [
    headingEl,
    contentFragmentRefEl,
    otherStartPortsHeadingEl,
    combineItineraryHeadingEl,
  ].map(getTextValue);
  const [
    description,
    otherStartPortsRichtextSingle,
    otherStartPortsRichtextMulti,
    combineItineraryRichtext,
  ] = [
    descriptionEl,
    otherStartPortsRichtextSingleEl,
    otherStartPortsRichtextMultiEl,
    combineItineraryRichtextEl,
  ].map(getRichTextContent);
  const popupContentRef = getLinkValue(popupContentRefEl);

  let htmlContent = `
    <div class="stage"></div>
    <div class="content container">
  `;
  if (heading) {
    htmlContent += `<h1 class="heading h4-black">${heading}</h1>`;
  }
  if (description) {
    htmlContent += `<div class="description">${description.innerHTML}</div>`;
  }

  htmlContent += `</div>`;

  block.innerText = "";
  block.innerHTML = htmlContent;

  // missing await intentional
  renderContentFragment(block, contentFragmentRef).then((cf) => {
    renderDialogs(
      block,
      {
        popupContentRef,
        otherStartPortsHeading,
        combineItineraryHeading,
        otherStartPortsRichtextSingle,
        otherStartPortsRichtextMulti,
        combineItineraryRichtext,
      },
      cf,
    );
  });

  try {
    tryMoveInstrumentation(headingEl, block.querySelector(".heading"));
  } catch (e) {
    console.error("error instrumenting component", e);
  }
}
