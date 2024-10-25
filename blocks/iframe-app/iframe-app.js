export default function decorate(block) {
  const iframe = document.createElement("iframe");
  iframe.src =
    "https://publish-p139364-e1423304.adobeaemcloud.com/content/celestyal-asset-share/us/en/light.html";
  iframe.width = "100%";
  iframe.height = "500px";
  iframe.style.border = "3px solid black";
  block.textContent = "";
  block.append(iframe);
}
