import { fetchPlaceholders, getMetadata } from '../../scripts/aem.js';

async function getHomepageURL() {
  const crumbs = [];
  const originUrl = window.location.origin;
  const relativePathUrls = window.location.pathname.split('/');
  let link = originUrl;
  const fragment = await fetch('/test/test123.html');
  const response = await fragment.text();
  console.log(response);
  relativePathUrls.forEach((pathElement) => {
    if (pathElement !== '') {
      link = link.concat('/', pathElement);
      let linkToUse = link;
      linkToUse = pathElement.includes('.html') ? link : link.concat('.html');
      crumbs.unshift({ title: getMetadata('og:title'), url: linkToUse });
      crumbs.push({ title: pathElement, url: linkToUse });
    }
  });
  return crumbs;
}

async function buildBreadcrumbsFromNavTree(nav, currentUrl) {
  const crumbs = getHomepageURL();

  const homeUrl = window.location.origin;
  /*
    let menuItem = Array.from(nav.querySelectorAll('a')).find((a) => a.href === currentUrl);
    if (menuItem) {
      do {
        const link = menuItem.querySelector(':scope > a');
        crumbs.unshift({ title: getDirectTextContent(menuItem), url: link ? link.href : null });
        menuItem = menuItem.closest('ul')?.closest('li');
      } while (menuItem);
    } else if (currentUrl !== homeUrl) {
      crumbs.unshift({ title: getMetadata('og:title'), url: currentUrl });
    }
    */
  const placeholders = await fetchPlaceholders();
  const homePlaceholder = placeholders.breadcrumbsHomeLabel || 'Home';

  crumbs.unshift({ title: homePlaceholder, url: homeUrl });

  // last link is current page and should not be linked
  if (crumbs.length > 1) {
    crumbs[crumbs.length - 1].url = null;
  }
  crumbs[crumbs.length - 1]['aria-current'] = 'page';
  return crumbs;
}

export default async function decorate(block) {
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  block.append(navWrapper);

  const breadcrumbs = document.createElement('nav');
  breadcrumbs.className = 'breadcrumbs';

  const crumbs = await buildBreadcrumbsFromNavTree(document.querySelector('.nav-sections'), document.location.href);

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
  return breadcrumbs;
}
