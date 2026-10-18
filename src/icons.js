export const ICONS = {
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  next: '<path d="m9 5 7 7-7 7"/>',
  prev: '<path d="m15 5-7 7 7 7"/>',
  play: '<path d="m8 5 11 7-11 7z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  zoomIn: '<circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 5 5M7.7 10.7h6M10.7 7.7v6"/>',
  zoomOut: '<circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 5 5M7.7 10.7h6"/>',
  fullscreen: '<path d="M9 4H4v5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
  fullscreenExit: '<path d="M4 9h5V4M20 9h-5V4M15 20v-5h5M4 15h5v5"/>',
  thumbs: '<rect x="2.5" y="3.5" width="19" height="14" rx="1.4"/><path d="M6 21h1M11.5 21h1M17 21h1"/>',
  html: '<path d="m8 7-4 5 4 5M16 7l4 5-4 5M14 5l-4 14"/>',
  unmute: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6M21 9l-5 6"/>',
  iframe: '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 9h18M6 6.5h.1M9 6.5h.1"/>'
}

export function icon (name) {
  return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`
}

export function button (action, label, content, extra = '') {
  return `<button type="button" class="razorbox__button" data-rb-action="${action}" aria-label="${label}" title="${label}" ${extra}>${content}</button>`
}
