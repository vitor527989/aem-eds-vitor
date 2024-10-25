import { getTextValue, tryMoveInstrumentation } from "../../scripts/custom.js";
import { loadDataFromPersistedQuery } from "../../scripts/content-fragments.js";
import { getTranslation, initTranslations } from "../../scripts/translation.js";
import { initTaxonomy, getTitle } from "../../scripts/taxonomy.js";

function createPartySizeFact(partySizeMin, partySizeMax) {
  if (!partySizeMin && !partySizeMax) {
    return null;
  }

  let partyLabel;
  if (partySizeMin && partySizeMax) {
    partyLabel =
      getTranslation("excursion.partySizeLabelMinMax", [
        partySizeMin,
        partySizeMax,
      ]) ?? `between ${partySizeMin} and ${partySizeMax} people`;
  } else if (partySizeMin) {
    partyLabel =
      getTranslation("excursion.partySizeLabelMin", [partySizeMin]) ??
      `at least ${partySizeMin} people`;
  } else if (partySizeMax) {
    partyLabel =
      getTranslation("excursion.partySizeLabelMax", [partySizeMax]) ??
      `up to ${partySizeMax} people`;
  }

  return {
    icon: "community",
    key: getTranslation("excursion.partySize") ?? "Party size",
    value: partyLabel,
  };
}

async function loadContentFragment(block, heading, contentFragmentRef) {
  if (!contentFragmentRef) {
    console.error("content fragment ref not specified");
    return;
  }

  const loaded = await loadDataFromPersistedQuery(
    "ExcursionByPath",
    contentFragmentRef,
    { skipCache: true },
  );

  await initTranslations();
  await initTaxonomy();

  const facts = [];
  const tags = [];

  // eslint-disable-next-line no-underscore-dangle
  const { duration, difficulty, bundleOffer } = loaded._extendedInfo;

  if (duration) {
    facts.push({
      icon: "clock",
      key: getTranslation("excursion.duration") ?? "Duration",
      value: getTranslation(duration.key) ?? duration.label,
    });
  }
  if (difficulty) {
    facts.push({
      icon: "walking",
      key: getTranslation("excursion.difficulty") ?? "Difficulty",
      value: getTranslation(difficulty.key) ?? difficulty.label,
    });
  }

  const { partySizeMin, partySizeMax } = loaded;
  const partyFact = createPartySizeFact(partySizeMin, partySizeMax);
  if (partyFact) {
    facts.push(partyFact);
  }

  if ((bundleOffer ?? []).length > 0) {
    const bundleOfferItem = bundleOffer[0];
    tags.push(getTranslation(bundleOfferItem.key) ?? bundleOfferItem.label);
  }
  const { activityType, category } = loaded;

  for (const enumValue of [activityType, category]) {
    if ((enumValue ?? []).length > 0) {
      tags.push(getTitle(enumValue[0]) ?? enumValue[0]);
    }
  }

  // render mock data
  let htmlContent = ``;
  const { tourCode, title } = loaded;
  if (tourCode) {
    htmlContent += `<p class="overline">${getTranslation("excursion.tourCode") ?? "Tour Code"} ${tourCode}</p>`;
  }
  if (title ?? heading) {
    htmlContent += `<h1 class="heading h4-black">${title ?? heading}</h1>`;
  }
  if ((tags ?? []).length > 0) {
    htmlContent += `<ul class="tags">`;
    tags.forEach((tag) => {
      htmlContent += `<li class="copy-small-bold">${tag}</li>`;
    });
    htmlContent += `</ul>`;
  }
  if ((facts ?? []).length > 0) {
    htmlContent += `<ul class="facts copy-small-regular">`;
    facts.forEach((fact) => {
      htmlContent += `<li style="background-image: url('${window.hlx.codeBasePath}/icons/${fact.icon}.svg')">${fact.key}: ${fact.value}</li>`;
    });
    htmlContent += `</ul>`;
  }

  block.innerText = "";
  block.innerHTML = htmlContent;
}

export default async function decorate(block) {
  // render server supplied data
  const [headingEl, contentFragmentRefEl] = [...block.children];
  const [heading, contentFragmentRef] = [headingEl, contentFragmentRefEl].map(
    getTextValue,
  );

  let htmlContent = ``;
  if (heading) {
    htmlContent += `<h1 class="heading h4-black">${heading}</h1>`;
  }

  block.innerText = "";
  block.innerHTML = htmlContent;

  loadContentFragment(block, heading, contentFragmentRef);

  try {
    tryMoveInstrumentation(headingEl, block.querySelector(".heading"));
  } catch (e) {
    console.error("error instrumenting component", e);
  }
}
