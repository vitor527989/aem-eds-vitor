import { createOptimizedPicture } from './aem.js';
import { moveInstrumentation } from './scripts.js';

export function getTextValue(el) {
  return el?.querySelector('p')?.textContent;
}

export function getTextValues(...elements) {
  return elements.map(getTextValue);
}

export function getRichTextContent(el) {
  return el?.querySelector('div');
}

export function getLinkValue(el) {
  const link = el.querySelector('a');
  return link ? link.getAttribute('href') : el.textContent.trim();
}

export function parseButton(el) {
  const [linkEl, linkLabelEl, linkTypeEl] = [...el.children];
  if (!linkEl || !linkLabelEl) return null;
  const linkValue = linkEl.querySelector('a')?.getAttribute('href');
  const linkLabelValue = linkLabelEl?.textContent;
  const type = linkTypeEl?.textContent;
  return {
    link: linkValue,
    label: linkLabelValue,
    type,
  };
}

export function parseLink(el) {
  if (!el) return '';
  return el.querySelector('a')?.getAttribute('href');
}

/**
 * specify the required styleguide button and it will return the classes needed to render it appropriately
 * @param {('primary', 'secondary', 'tertiary')} styleGuideType
 * @param {boolean} inverted
 */
export function getButtonClasses(styleGuideType, inverted) {
  if (styleGuideType === 'tertiary') return 'tertiary';
  if (styleGuideType === 'primary') {
    return inverted ? 'secondary' : 'primary';
  }
  if (styleGuideType === 'secondary') {
    return inverted ? 'secondary-outlined' : 'primary-outlined';
  }
  return '';
}

export function parseImage(el) {
  const imgEl = el?.querySelector('img[src]');

  if (!imgEl) return null;

  const pEls = el?.querySelectorAll('p');
  const imgAlt = pEls.length > 1 ? pEls[1].textContent : undefined;

  let imgUrl = imgEl.getAttribute('src');

  if (imgUrl.includes('?')) {
    [imgUrl] = imgUrl.split('?');
  }
  return {
    url: imgUrl,
    ...(imgAlt ? { alt: imgAlt } : {}),
  };
}

export function tryMoveInstrumentation(from, to) {
  if (!from || !to) return;

  const foundInstrumentedEl = from.querySelector('[data-aue-prop]');
  if (!foundInstrumentedEl) return;

  moveInstrumentation(foundInstrumentedEl, to);
}

export function firstLetterLowercase(src) {
  const [first, ...rest] = src;
  return [first.toLowerCase(), ...rest].join('');
}

export function isLocalEnvironment() {
  return window.location.hostname === 'localhost';
}

export function renderOptimizedImage(
  src,
  width,
  height,
  alt,
  eager,
  breakpoints,
) {
  const image = createOptimizedPicture(src, alt, eager, breakpoints);
  const img = image.querySelector('img');
  if (width) {
    img.setAttribute('width', width);
  }
  if (height) {
    img.setAttribute('height', height);
  }

  return image;
}

export function localizeCount(count, singularTerm, pluralTerm) {
  if (count === 1) return `${count} ${singularTerm}`;

  if (pluralTerm) return `${count} ${pluralTerm}`;
  return `${count} ${singularTerm}s`;
}

export const isInAuthorMode = () => {
  const url = window.location.origin;
  return url.includes('author-');
};

export function retrieveCountryCode() {
  const url = window.location.pathname;
  const lang = url.substring(1, url.substring(1).indexOf('/') + 1);

  switch (lang) {
    case 'au':
      return 'au';
    case 'US' || 'us':
      return 'us';
    case 'fr':
      return 'fr';
    case 'es':
      return 'es';
    case 'es-ar':
      return 'es-ar';
    case 'ir':
      return 'ir';
    case 'el':
      return 'el';
    case 'en-cy':
      return 'en-cy';
    case 'gb':
      return 'gb';
    case 'en':
      return 'en';
    default:
      return '';
  }
}

export function retrieveLanguageCode() {
  const url = window.location.pathname;
  let language = '';

  const mappingLanguage = {
    en: ['au', 'us', 'ir', 'cy', 'gb'],
    fr: ['fr'],
    es: ['es', 'ar'],
    el: ['el'],
  };

  const languageKeys = Object.keys(mappingLanguage);
  // eslint-disable-next-line no-restricted-syntax
  for (const lang of languageKeys) {
    const maps = mappingLanguage[lang];
    const isIncluded = maps.some((code) => url.includes(`/${code}/`));
    if (isIncluded) {
      language = lang;
      break;
    }
  }

  return language;
}

export function getLanguagePrefix() {
  return retrieveCountryCode() ? `/${retrieveCountryCode()}` : '';
}
