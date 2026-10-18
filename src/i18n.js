// Bundled translations avoid runtime language requests. The page's <html lang>
// takes precedence over the browser language (especially useful in TYPO3).
export const LOCALES = Object.freeze({
  en: {
    gallery: 'Media gallery',
    controls: 'Gallery controls',
    thumbnails: 'Gallery thumbnails',
    previous: 'Previous item',
    next: 'Next item',
    close: 'Close gallery',
    play: 'Play slideshow',
    pause: 'Pause slideshow',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    fullscreen: 'Enter fullscreen',
    fullscreenExit: 'Exit fullscreen',
    thumbsShow: 'Show thumbnails',
    thumbsHide: 'Hide thumbnails',
    goToItem: 'Go to item {number}',
    contentError: 'The content could not be loaded.',
    inlineNotFound: 'This content could not be found.',
    image: 'Image',
    content: 'Content',
    video: 'Video',
    map: 'Google Map',
    pdf: 'PDF document',
    embeddedPage: 'Embedded page',
    youtubeVideo: 'YouTube video',
    vimeoVideo: 'Vimeo video',
    status: '{type} {number} of {total}. {alt}',
    openMap: 'Open in Google Maps',
    openPdf: 'Open PDF in a new tab',
    mapUnavailable: 'The map preview is unavailable. You can open it in Google Maps.',
    unmute: 'Turn on sound'
  },
  de: {
    gallery: 'Mediengalerie',
    controls: 'Galerie-Steuerelemente',
    thumbnails: 'Galerie-Vorschaubilder',
    previous: 'Vorheriger Eintrag',
    next: 'Nächster Eintrag',
    close: 'Galerie schließen',
    play: 'Diashow starten',
    pause: 'Diashow pausieren',
    zoomIn: 'Vergrößern',
    zoomOut: 'Verkleinern',
    fullscreen: 'Vollbild aktivieren',
    fullscreenExit: 'Vollbild beenden',
    thumbsShow: 'Vorschaubilder anzeigen',
    thumbsHide: 'Vorschaubilder ausblenden',
    goToItem: 'Zu Eintrag {number} springen',
    contentError: 'Der Inhalt konnte nicht geladen werden.',
    inlineNotFound: 'Dieser Inhalt wurde nicht gefunden.',
    image: 'Bild',
    content: 'Inhalt',
    video: 'Video',
    map: 'Google-Karte',
    pdf: 'PDF-Dokument',
    embeddedPage: 'Eingebettete Seite',
    youtubeVideo: 'YouTube-Video',
    vimeoVideo: 'Vimeo-Video',
    status: '{type} {number} von {total}. {alt}',
    openMap: 'In Google Maps öffnen',
    openPdf: 'PDF in neuem Tab öffnen',
    mapUnavailable: 'Kartenvorschau nicht verfügbar. Karte in Google Maps öffnen.',
    unmute: 'Ton einschalten'
  },
  fr: {
    gallery: 'Galerie multimédia',
    controls: 'Commandes de la galerie',
    thumbnails: 'Miniatures de la galerie',
    previous: 'Élément précédent',
    next: 'Élément suivant',
    close: 'Fermer la galerie',
    play: 'Démarrer le diaporama',
    pause: 'Mettre le diaporama en pause',
    zoomIn: 'Agrandir',
    zoomOut: 'Réduire',
    fullscreen: 'Passer en plein écran',
    fullscreenExit: 'Quitter le plein écran',
    thumbsShow: 'Afficher les miniatures',
    thumbsHide: 'Masquer les miniatures',
    goToItem: 'Aller à l’élément {number}',
    contentError: 'Impossible de charger le contenu.',
    inlineNotFound: 'Ce contenu est introuvable.',
    image: 'Image',
    content: 'Contenu',
    video: 'Vidéo',
    map: 'Carte Google Maps',
    pdf: 'Document PDF',
    embeddedPage: 'Page intégrée',
    youtubeVideo: 'Vidéo YouTube',
    vimeoVideo: 'Vidéo Vimeo',
    status: '{type} {number} sur {total}. {alt}',
    openMap: 'Ouvrir dans Google Maps',
    openPdf: 'Ouvrir le PDF dans un nouvel onglet',
    mapUnavailable: 'Aperçu de la carte indisponible. Vous pouvez l’ouvrir dans Google Maps.',
    unmute: 'Activer le son'
  }
})

export function supportedLocale (value) {
  const code = String(value ?? '').trim().split(/[-_]/)[0].toLowerCase()
  return Object.hasOwn(LOCALES, code) ? code : ''
}

export function detectLocale (preferred = 'auto') {
  if (preferred && preferred !== 'auto') return supportedLocale(preferred) || 'en'
  const page = supportedLocale(document.documentElement.lang)
  if (page) return page
  const languages = [...(navigator.languages || []), navigator.language]
  return languages.map(supportedLocale).find(Boolean) || 'en'
}

// Replaces {name} placeholders; unknown placeholders are kept verbatim.
export function formatMessage (value, params = {}) {
  return String(value).replace(/\{(\w+)\}/g, (full, name) => params[name] === undefined ? full : String(params[name]))
}
