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
        }
        crumbs.push({ title: parentPageTitleAndStatus.title, url: linkToUse, disabled });
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
            <ol class="breadcrumbs-list">
        `;

  crumbs.forEach((crumb) => {
    if (crumb['aria-current']) {
      htmlContent += `
          <svg class="arrow-left" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.0303 2.96967C12.3232 3.26256 12.3232 3.73744 12.0303 4.03033L4.81066 11.25H21C21.4142 11.25 21.75 11.5858 21.75 12C21.75 12.4142 21.4142 12.75 21 12.75H4.81066L12.0303 19.9697C12.3232 20.2626 12.3232 20.7374 12.0303 21.0303C11.7374 21.3232 11.2626 21.3232 10.9697 21.0303L2.46967 12.5303C2.17678 12.2374 2.17678 11.7626 2.46967 11.4697L10.9697 2.96967C11.2626 2.67678 11.7374 2.67678 12.0303 2.96967Z" fill="#06242D"/>
          </svg>
          <li class="breadcrumbs-item" aria-current=${crumb['aria-current']}>${crumb.title}</li>
        `;
    } else {
      htmlContent += `
          <svg class="arrow-left" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.0303 2.96967C12.3232 3.26256 12.3232 3.73744 12.0303 4.03033L4.81066 11.25H21C21.4142 11.25 21.75 11.5858 21.75 12C21.75 12.4142 21.4142 12.75 21 12.75H4.81066L12.0303 19.9697C12.3232 20.2626 12.3232 20.7374 12.0303 21.0303C11.7374 21.3232 11.2626 21.3232 10.9697 21.0303L2.46967 12.5303C2.17678 12.2374 2.17678 11.7626 2.46967 11.4697L10.9697 2.96967C11.2626 2.67678 11.7374 2.67678 12.0303 2.96967Z" fill="#6A7C81"/>
          </svg>
          <li class="breadcrumbs-item"><a href="${crumb.url}">${crumb.title}</a></li>
        `;
    }
  });
  htmlContent += '</ol>';

  block.innerText = '';
  block.innerHTML = htmlContent;
}
