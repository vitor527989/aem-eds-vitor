import { fetchPlaceholders, getMetadata } from '../../scripts/aem.js';

async function getParentPageTitle(link) {
  const response = await fetch(link);
  const html = await response.text();
  const parser = new DOMParser();
  const pageDoc = parser.parseFromString(html, 'text/html');
  return getMetadata('og:title', pageDoc);
}

async function buildBreadcrumbsLinks(rootLink) {
  const crumbs = [];
  const originUrl = window.location.origin;
  const relativePathUrls = window.location.pathname.split('/');
  let link = originUrl;
  let rootReached = false;
  for (const pathElement of relativePathUrls) {
    if (pathElement !== '') {
      let parentPageTitle = '';
      link = link.concat('/', pathElement);
      let linkToUse = link;
      linkToUse = pathElement.includes('.html') ? link : link.concat('.html');
      if (linkToUse === originUrl + rootLink && !rootReached) {
        rootReached = true;
      }
      if (rootReached) {
        parentPageTitle = await getParentPageTitle(linkToUse);
        crumbs.push({title: parentPageTitle, url: linkToUse});
      }
    }
  }
  return crumbs;
}

async function buildBreadcrumbsFromPageLink(currentUrl, rootLink) {
  const crumbs = await buildBreadcrumbsLinks(rootLink);
  // last link is current page and should not be linked
  if (crumbs.length > 1) {
    crumbs[crumbs.length - 1].url = null;
  }
  crumbs[crumbs.length - 1]['aria-current'] = 'page';
  return crumbs;
}

export function parseLink(el) {
  if (!el) return '';
  return el.querySelector('a')?.getAttribute('href');
}

export default async function decorate(block) {
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  block.append(navWrapper);

  const breadcrumbs = document.createElement('nav');
  breadcrumbs.className = 'breadcrumbs';

  const rootLink = parseLink(block);
  const crumbs = await buildBreadcrumbsFromPageLink(document.location.href, rootLink);


  const ol = document.createElement('ol');
  ol.append(...crumbs.map((item) => {
    const li = document.createElement('li');
    if (item['aria-current']) li.setAttribute('aria-current', item['aria-current']);
    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.title;
      li.append(a);
    } else {
      li.textContent = item.title;
    }
    return li;
  }));
  
  breadcrumbs.append(ol);
  block.innerText = '';
  block.innerHTML = breadcrumbs;
}
