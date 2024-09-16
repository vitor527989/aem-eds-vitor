import AEMHeadless from 'https://cdn.skypack.dev/@adobe/aem-headless-client-js@v3.4.1';
import { createOptimizedPicture } from '../../scripts/aem.js';

const AEM_HOST = 'https://author-p139364-e1423304.adobeaemcloud.com';
const AEM_PUBLISH_HOST = 'https://publish-p139364-e1423304.adobeaemcloud.com';
const AEM_GRAPHQL_ENDPOINT = 'testcfmodelvitor';
const aemHeadlessClient = new AEMHeadless({
  serviceURL: AEM_HOST,
});

async function loadData(path) {
  console.log('load data');
  const persistedQueryData = await aemHeadlessClient.runPersistedQuery(`${AEM_GRAPHQL_ENDPOINT}/TestQuery`, { path });
  console.log('persistedQueryData', persistedQueryData);
  return persistedQueryData.data.testcfvitorByPath.item;
}

function fixAEMHost(host, element) {
  [...element.children].forEach((el) => {
    const srcSetAttribute = el.getAttribute('srcset');
    if (srcSetAttribute) {
      el.setAttribute('srcset', `${host}${srcSetAttribute}`);
    }
    const srcAttribute = el.getAttribute('src');
    if (srcAttribute) {
      el.setAttribute('src', `${host}${srcAttribute}`);
    }
  });
}
export default async function renderContentFragments(block) {
  console.log('hello-world-fragment decorate', block);
  console.log('hello-world-fragment before', JSON.stringify(block));

  const anchorElement = block.querySelector('a');
  const contentFragmentPath = anchorElement.textContent;

  try {
    const result = await loadData(contentFragmentPath);
    console.log('retrieved result', result);
    const {
      testLabel,
      testcontent,
    } = result;
    // eslint-disable-next-line no-underscore-dangle
    const imageURL = `${AEM_PUBLISH_HOST}${testcontent._dynamicUrl}`;
    console.log('suggested URL', imageURL);

    const pElement = document.createElement('p');
    pElement.textContent = testLabel;
    const pictureElement = createOptimizedPicture(imageURL, '', false, [{ width: '750' }]);
    fixAEMHost(AEM_PUBLISH_HOST, pictureElement);

    block.textContent = '';
    block.append(pElement);
    block.append(pictureElement);
  } catch (e) {
    console.error('error persisted query', e);
  }
}
