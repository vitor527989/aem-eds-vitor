import { loadScript, loadCSS } from "../../scripts/aem.js";
import {
  getTextValue,
  getTextValues,
  tryMoveInstrumentation,
  parseImage,
} from "../../scripts/custom.js";
import {
  renderVideo,
  renderYoutube,
  renderVideoPlayButton,
  videoPlayButtonEventListener,
} from "../../scripts/video-utils.js";

await loadScript(
  "https://cdn.jsdelivr.net/npm/lite-youtube-embed@0.3.3/src/lite-yt-embed.min.js",
);
await loadCSS(
  "https://cdn.jsdelivr.net/npm/lite-youtube-embed@0.3.3/src/lite-yt-embed.min.css",
);

export default function decorate(block) {
  const [
    videoTypePropEl,
    videoUrlEl,
    videoThumbnailEl,
    youtubeEl,
    videoCaptionEl,
  ] = [...block.children];

  const [videoType, videoCaption] = getTextValues(
    videoTypePropEl,
    videoCaptionEl,
  );
  let markup = "";

  if (videoType === "internal") {
    const videoURL = getTextValue(videoUrlEl);
    const videoThumbnail = parseImage(videoThumbnailEl);

    markup = `
          <div class="video-tag-wrapper">
              ${renderVideoPlayButton()}
              ${renderVideo(videoURL, videoThumbnail?.url)}
          </div>`;
  }

  if (videoType === "youtube") {
    const youtubeKey = getTextValue(youtubeEl);

    markup = `
        <div class="video-tag-wrapper">
            ${renderYoutube(youtubeKey)}
        </div>`;
  }

  if (videoCaption) {
    markup += `<p class="video-caption copy-standard-regular">${videoCaption}</p>`;
  }

  block.innerHTML = markup;

  if (videoType === "internal") {
    tryMoveInstrumentation(videoUrlEl, block.querySelector(".video-default"));
    videoPlayButtonEventListener(block);
  } else {
    tryMoveInstrumentation(youtubeEl, block.querySelector(".youtube"));
  }
  tryMoveInstrumentation(videoCaptionEl, block.querySelector(".video-caption"));
}
