import razorbox from '../src/razorbox.js';

let lightbox;

function attachLightbox() {
  lightbox?.destroy();
  lightbox = razorbox.bind('[data-razorbox]', {
    thumbnails: document.getElementById('option-thumbnails').checked,
    loop: document.getElementById('option-loop').checked,
    slideshow: document.getElementById('option-slideshow').checked,
    wheelZoom: document.getElementById('option-wheel').checked,
    transition: document.getElementById('option-transition').value,
    transitionDuration: 330,
    videoAutoplay: true,
    videoMuted: document.getElementById('option-video-muted').checked,
    videoPrivacy: true,
    theme: document.getElementById('option-theme').value,
    locale: document.getElementById('option-locale').value,
    fullscreen: true,
    zoom: true,
    slideshowInterval: 3200,
    thumbsOpen: true
  });
  window.razorboxDemo = lightbox;
}

attachLightbox();

for (const input of document.querySelectorAll('.option-switch input, .option-select select')) {
  input.addEventListener('change', attachLightbox);
}

document.getElementById('launch-demo').addEventListener('click', () => {
  document.querySelector('.gallery-card[data-razorbox="atlas"]').click();
});

document.getElementById('open-hero-gallery').addEventListener('click', event => {
  event.preventDefault();
  document.querySelector('.gallery-card[data-razorbox="atlas"]').click();
});

// The snippets are real text in demo.html, not injected by the lightbox.
for (const tab of document.querySelectorAll('[data-example-tab]')) {
  tab.addEventListener('click', () => {
    const selected = tab.dataset.exampleTab;
    for (const button of document.querySelectorAll('[data-example-tab]')) {
      const active = button === tab;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
    }
    for (const panel of document.querySelectorAll('[data-example-panel]')) {
      panel.hidden = panel.dataset.examplePanel !== selected;
    }
  });
}

async function copySnippet(button, source) {
  try {
    await navigator.clipboard.writeText(source);
    button.textContent = 'Copied!';
  } catch {
    button.textContent = 'Clipboard unavailable';
  }
  setTimeout(() => { button.textContent = button.dataset.label || 'Copy code'; }, 1400);
}

for (const button of document.querySelectorAll('[data-example-copy]')) {
  button.dataset.label = button.textContent;
  button.addEventListener('click', () => {
    const code = button.closest('[data-example-panel]')?.querySelector('code')?.textContent || '';
    void copySnippet(button, code);
  });
}

document.getElementById('copy-code').addEventListener('click', event => {
  const code = document.querySelector('#documentation .code-panel code')?.textContent || '';
  const button = event.currentTarget;
  button.dataset.label = 'Copy code';
  void copySnippet(button, code);
});
