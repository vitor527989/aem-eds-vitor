export default function decorate(block) {
  const link = block.querySelector('a');
  const appUrl = link ? link.getAttribute('href') : block.textContent.trim();
  const iframe = document.createElement('iframe');
  iframe.src = appUrl || '';
  iframe.width = '100%';
  iframe.height = '500px';
  iframe.style.border = '3px solid black';
  block.textContent = '';
  block.append(iframe);
}
