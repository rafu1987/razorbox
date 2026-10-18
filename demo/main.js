import razorbox from '../src/razorbox.js'

let lightbox

function attachLightbox () {
  lightbox?.destroy()
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
  })
  window.razorboxDemo = lightbox
}

attachLightbox()

// Vite fills in the version (demo/version-plugin.js). When the page is served
// as plain files, e.g. by the browser tests, read it from package.json instead.
if (document.body.innerHTML.includes('__RAZORBOX_VERSION__')) {
  fetch(new URL('../package.json', import.meta.url))
    .then(response => response.json())
    .then(({ version }) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      while (walker.nextNode()) {
        const node = walker.currentNode
        if (node.nodeValue.includes('__RAZORBOX_VERSION__')) node.nodeValue = node.nodeValue.replaceAll('__RAZORBOX_VERSION__', version)
      }
    })
    .catch(() => {})
}

for (const input of document.querySelectorAll('.option-switch input, .option-select select')) {
  input.addEventListener('change', attachLightbox)
}

const openGallery = () => document.querySelector('.gallery-card[data-razorbox="atlas"]').click()

document.getElementById('launch-demo').addEventListener('click', openGallery)

for (const button of document.querySelectorAll('[data-open-gallery]')) {
  button.addEventListener('click', openGallery)
}

document.getElementById('open-hero-gallery').addEventListener('click', event => {
  event.preventDefault()
  openGallery()
})

// The snippets are real text in demo.html, not injected by the lightbox.
for (const tab of document.querySelectorAll('[data-example-tab]')) {
  tab.addEventListener('click', () => {
    const selected = tab.dataset.exampleTab
    for (const button of document.querySelectorAll('[data-example-tab]')) {
      const active = button === tab
      button.classList.toggle('is-selected', active)
      button.setAttribute('aria-pressed', String(active))
    }
    for (const panel of document.querySelectorAll('[data-example-panel]')) {
      panel.hidden = panel.dataset.examplePanel !== selected
    }
  })
}

// Install pills keep their markup and only swap the small [data-copy-label].
async function copySnippet (button, source) {
  const label = button.querySelector('[data-copy-label]') || button
  const original = button.dataset.label || label.textContent
  let message
  try {
    await navigator.clipboard.writeText(source)
    message = 'Copied!'
  } catch {
    message = 'Clipboard unavailable'
  }
  label.textContent = message
  button.classList.add('is-copied')
  setTimeout(() => {
    label.textContent = original
    button.classList.remove('is-copied')
  }, 1400)
}

for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', () => copySnippet(button, button.dataset.copy))
}

for (const button of document.querySelectorAll('[data-example-copy]')) {
  button.dataset.label = button.textContent
  button.addEventListener('click', () => {
    const code = button.closest('[data-example-panel]')?.querySelector('code')?.textContent || ''
    copySnippet(button, code)
  })
}

document.getElementById('copy-code').addEventListener('click', event => {
  const code = document.querySelector('#documentation .code-panel code')?.textContent || ''
  const button = event.currentTarget
  button.dataset.label = 'Copy code'
  copySnippet(button, code)
})
