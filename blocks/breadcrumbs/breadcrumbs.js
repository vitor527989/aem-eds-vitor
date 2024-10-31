import { getMetadata } from '../../scripts/aem.js';
import { isInAuthorMode } from '../../scripts/custom.js';

export function parseLink(el) {
  if (!el) return '';
  return el.querySelector('a')?.getAttribute('href');
}

async function getParentPageTitle(link) {
  const response = await fetch(link);
  const html = await response.text();
  const parser = new DOMParser();
  const pageDoc = parser.parseFromString(html, 'text/html');
  return ({ title: getMetadata('og:title', pageDoc), pageResponse: response.status });
}

async function buildBreadcrumbsLinks(rootLink) {
  const crumbs = [];
  const originUrl = window.location.origin;
  const relativePathUrls = window.location.pathname.split('/');
  let link = originUrl;
  let rootReached = false;
  // eslint-disable-next-line no-restricted-syntax
  for (const pathElement of relativePathUrls) {
    if (pathElement !== '') {
      let parentPageTitleAndStatus = '';
      link = link.concat('/', pathElement);
      let linkToUse = link;
      if (isInAuthorMode()) {
        linkToUse = pathElement.includes('.html') ? link : link.concat('.html');
      }
      if (linkToUse === originUrl + rootLink && !rootReached) {
        rootReached = true;
      }
      if (rootReached) {
        // eslint-disable-next-line no-await-in-loop
        parentPageTitleAndStatus = await getParentPageTitle(linkToUse);
        let disabled = false;
        if (parentPageTitleAndStatus.pageResponse !== 200) {
          disabled = true;
        } else {
          crumbs.push({ title: parentPageTitleAndStatus.title, url: linkToUse, disabled });
        }
      }
    }
  }
  return crumbs;
}

async function buildBreadcrumbsFromPageLink(currentUrl, rootLink) {
  const crumbs = await buildBreadcrumbsLinks(rootLink);
  // last link is current page and should not be linked
  if (crumbs.length === 0) {
    return crumbs;
  }
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

  const rootLink = parseLink(block);
  const crumbs = await buildBreadcrumbsFromPageLink(
    document.location.href,
    rootLink,
  );

  let htmlContent = `
          <nav class="breadcrumbs">
            <ul class="breadcrumbs-list">
        `;
  crumbs.forEach((crumb) => {
    if (crumb['aria-current']) {
      htmlContent += `
          <li class="breadcrumbs-item" aria-current=${crumb['aria-current']}>
            <svg class="arrow-left" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M15.5303 5.46967C15.8232 5.76256 15.8232 6.23744 15.5303 6.53033L10.0607 12L15.5303 17.4697C15.8232 17.7626 15.8232 18.2374 15.5303 18.5303C15.2374 18.8232 14.7626 18.8232 14.4697 18.5303L8.46967 12.5303C8.17678 12.2374 8.17678 11.7626 8.46967 11.4697L14.4697 5.46967C14.7626 5.17678 15.2374 5.17678 15.5303 5.46967Z" fill="currentColor"/>
            </svg>
            ${crumb.title}
          </li>
        `;
    } else {
      htmlContent += `
          <li class="breadcrumbs-item">
            <a href="${crumb.url}">
              <svg class="arrow-left" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M15.5303 5.46967C15.8232 5.76256 15.8232 6.23744 15.5303 6.53033L10.0607 12L15.5303 17.4697C15.8232 17.7626 15.8232 18.2374 15.5303 18.5303C15.2374 18.8232 14.7626 18.8232 14.4697 18.5303L8.46967 12.5303C8.17678 12.2374 8.17678 11.7626 8.46967 11.4697L14.4697 5.46967C14.7626 5.17678 15.2374 5.17678 15.5303 5.46967Z" fill="currentColor"/>
              </svg>
              ${crumb.title}
            </a>
          </li>
        `;
    }
  });
  htmlContent += '</ul>';

  block.innerText = '';
  block.innerHTML = htmlContent;
}
