import {
  getTextValue,
  tryMoveInstrumentation,
  parseImage,
} from "../../scripts/custom.js";
import {
  renderVideo,
  renderVideoPlayButton,
  videoPlayButtonEventListener,
} from "../../scripts/video-utils.js";

export default function decorate(block) {
  const [
    typePropEl,
    imagePropEl,
    videoUrlEl,
    videoThumbnailEl,
    videoAutoplayEl,
    titlePropEl,
  ] = [...block.children];

  let titles = "";

  const type = getTextValue(typePropEl);
  const [title] = titlePropEl.querySelectorAll("p");

  if (type) {
    if (type === "image") {
      videoUrlEl.remove();
      videoThumbnailEl.remove();
      videoAutoplayEl.remove();
    } else {
      imagePropEl.remove();
      const videoURL = getTextValue(videoUrlEl);
      const videoThumbnail = parseImage(videoThumbnailEl);
      const videoAutoplay = getTextValue(videoAutoplayEl) === "true";

      titles += `
          <div class="stage-video-wrapper">
              ${renderVideoPlayButton(videoAutoplay)}
              ${renderVideo(videoURL, videoThumbnail?.url, videoAutoplay, true, true)}
          </div>`;
      tryMoveInstrumentation(videoUrlEl, block.querySelector(".video"));

      videoUrlEl.remove();
      videoThumbnailEl.remove();
      videoAutoplayEl.remove();
    }
  }

  titles += `
    <div class="stage-text-wrapper">
      <div class="container">
        <h1 class="stage-title h1-black">${title.innerHTML}</h1>
      </div>
    </div>`;

  // remove all elements that are not relevant for the component
  typePropEl.remove();
  titlePropEl.remove();
  block.innerHTML += titles;

  if (type && type === "video") {
    videoPlayButtonEventListener(block);
  }

  tryMoveInstrumentation(titlePropEl, block.querySelector(".stage-title"));
}
