import { parseLink } from '../../scripts/custom.js';
import { getMetadata } from '../../scripts/aem.js';

async function getParentPageTitle(link) {
  const response = await fetch(link);
  const html = await response.text();
  const parser = new DOMParser();
  const pageDoc = parser.parseFromString(html, 'text/html');
  return ({ title: getMetadata('og:title', pageDoc), pageResponse: response.status });
}

export default async function decorate(block) {
  const rootLink = parseLink(block);
  getParentPageTitle(rootLink);
}
