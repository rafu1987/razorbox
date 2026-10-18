var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const DEFAULT_OPTIONS = Object.freeze({
  loop: true,
  thumbnails: true,
  thumbsOpen: false,
  slideshow: true,
  autoplay: false,
  slideshowInterval: 3500,
  zoom: true,
  zoomFactor: 2,
  maxZoom: 8,
  wheelZoom: true,
  fullscreen: true,
  keyboard: true,
  closeOnBackdrop: true,
  captionHtml: false,
  preload: 1,
  transition: "fade",
  transitionDuration: 300,
  videoAutoplay: true,
  videoMuted: false,
  videoMutedFallback: true,
  videoPrivacy: true,
  theme: "dark",
  locale: "auto",
  l10n: null,
  mapApiKey: "",
  onOpen: null,
  onChange: null,
  onClose: null
});
const LOCALES = Object.freeze({
  en: {
    gallery: "Media gallery",
    controls: "Gallery controls",
    thumbnails: "Gallery thumbnails",
    previous: "Previous item",
    next: "Next item",
    close: "Close gallery",
    play: "Play slideshow",
    pause: "Pause slideshow",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    fullscreen: "Enter fullscreen",
    fullscreenExit: "Exit fullscreen",
    thumbsShow: "Show thumbnails",
    thumbsHide: "Hide thumbnails",
    goToItem: "Go to item {number}",
    contentError: "The content could not be loaded.",
    inlineNotFound: "This content could not be found.",
    image: "Image",
    content: "Content",
    video: "Video",
    map: "Google Map",
    pdf: "PDF document",
    embeddedPage: "Embedded page",
    youtubeVideo: "YouTube video",
    vimeoVideo: "Vimeo video",
    status: "{type} {number} of {total}. {alt}",
    openMap: "Open in Google Maps",
    openPdf: "Open PDF in a new tab",
    mapUnavailable: "The map preview is unavailable. You can open it in Google Maps.",
    unmute: "Turn on sound"
  },
  de: {
    gallery: "Mediengalerie",
    controls: "Galerie-Steuerelemente",
    thumbnails: "Galerie-Vorschaubilder",
    previous: "Vorheriger Eintrag",
    next: "Nächster Eintrag",
    close: "Galerie schließen",
    play: "Diashow starten",
    pause: "Diashow pausieren",
    zoomIn: "Vergrößern",
    zoomOut: "Verkleinern",
    fullscreen: "Vollbild aktivieren",
    fullscreenExit: "Vollbild beenden",
    thumbsShow: "Vorschaubilder anzeigen",
    thumbsHide: "Vorschaubilder ausblenden",
    goToItem: "Zu Eintrag {number} springen",
    contentError: "Der Inhalt konnte nicht geladen werden.",
    inlineNotFound: "Dieser Inhalt wurde nicht gefunden.",
    image: "Bild",
    content: "Inhalt",
    video: "Video",
    map: "Google-Karte",
    pdf: "PDF-Dokument",
    embeddedPage: "Eingebettete Seite",
    youtubeVideo: "YouTube-Video",
    vimeoVideo: "Vimeo-Video",
    status: "{type} {number} von {total}. {alt}",
    openMap: "In Google Maps öffnen",
    openPdf: "PDF in neuem Tab öffnen",
    mapUnavailable: "Kartenvorschau nicht verfügbar. Karte in Google Maps öffnen.",
    unmute: "Ton einschalten"
  },
  fr: {
    gallery: "Galerie multimédia",
    controls: "Commandes de la galerie",
    thumbnails: "Miniatures de la galerie",
    previous: "Élément précédent",
    next: "Élément suivant",
    close: "Fermer la galerie",
    play: "Démarrer le diaporama",
    pause: "Mettre le diaporama en pause",
    zoomIn: "Agrandir",
    zoomOut: "Réduire",
    fullscreen: "Passer en plein écran",
    fullscreenExit: "Quitter le plein écran",
    thumbsShow: "Afficher les miniatures",
    thumbsHide: "Masquer les miniatures",
    goToItem: "Aller à l’élément {number}",
    contentError: "Impossible de charger le contenu.",
    inlineNotFound: "Ce contenu est introuvable.",
    image: "Image",
    content: "Contenu",
    video: "Vidéo",
    map: "Carte Google Maps",
    pdf: "Document PDF",
    embeddedPage: "Page intégrée",
    youtubeVideo: "Vidéo YouTube",
    vimeoVideo: "Vidéo Vimeo",
    status: "{type} {number} sur {total}. {alt}",
    openMap: "Ouvrir dans Google Maps",
    openPdf: "Ouvrir le PDF dans un nouvel onglet",
    mapUnavailable: "Aperçu de la carte indisponible. Vous pouvez l’ouvrir dans Google Maps.",
    unmute: "Activer le son"
  }
});
function supportedLocale(value) {
  const code = String(value ?? "").trim().split(/[-_]/)[0].toLowerCase();
  return Object.hasOwn(LOCALES, code) ? code : "";
}
function detectLocale(preferred = "auto") {
  if (preferred && preferred !== "auto") return supportedLocale(preferred) || "en";
  const page = supportedLocale(document.documentElement.lang);
  if (page) return page;
  const languages = [...navigator.languages || [], navigator.language];
  return languages.map(supportedLocale).find(Boolean) || "en";
}
function formatMessage(value, params = {}) {
  return String(value).replace(/\{(\w+)\}/g, (full, name) => params[name] === void 0 ? full : String(params[name]));
}
const ICONS = {
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
};
function icon(name) {
  return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
}
function button(action, label, content, extra = "") {
  return `<button type="button" class="razorbox__button" data-rb-action="${action}" aria-label="${label}" title="${label}" ${extra}>${content}</button>`;
}
function numberInRange(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function contentDuration(value) {
  const ms = Number(value);
  return Number.isFinite(ms) ? numberInRange(ms, 0, 2e3) : 300;
}
const PROVIDER_TYPES = /* @__PURE__ */ new Set(["youtube", "vimeo"]);
const VIDEO_EXTENSIONS = /\.(?:mp4|webm|ogv|ogg|m4v)(?:[?#]|$)/i;
const PDF_EXTENSION = /\.pdf(?:[?#]|$)/i;
const PROVIDER_ORIGINS = {
  youtube: (privacy) => [privacy ? "https://www.youtube-nocookie.com" : "https://www.youtube.com"],
  vimeo: () => ["https://player.vimeo.com"]
};
function safeFrameUrl(src) {
  if (!src) return "";
  try {
    const base = typeof document !== "undefined" ? document.baseURI : "https://razorbox.invalid/";
    const url = new URL(src, base);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}
function providerReference(src) {
  let url;
  try {
    url = new URL(src, "https://razorbox.invalid/");
  } catch {
    return null;
  }
  if (!["http:", "https:"].includes(url.protocol)) return null;
  const host = url.hostname.toLowerCase();
  const segments = url.pathname.split("/").filter(Boolean);
  let id;
  if (host === "youtu.be") id = segments[0];
  else if (["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host)) {
    if (segments[0] === "watch") id = url.searchParams.get("v");
    else if (["embed", "shorts", "live", "v"].includes(segments[0])) id = segments[1];
  }
  if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return { type: "youtube", id };
  if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(host)) {
    const videoPosition = segments[0] === "video" ? 1 : 0;
    id = segments[videoPosition];
    if (id && /^\d+$/.test(id)) {
      const hash = url.searchParams.get("h") || segments[videoPosition + 1] || "";
      return { type: "vimeo", id, hash: /^[a-zA-Z0-9]+$/.test(hash) ? hash : "" };
    }
  }
  return null;
}
const MAP_HOSTS = /* @__PURE__ */ new Set(["www.google.com", "google.com", "maps.google.com", "www.google.de", "google.de", "maps.google.de", "www.google.fr", "google.fr", "maps.google.fr"]);
function googleMapsUrl(src) {
  let url;
  try {
    url = new URL(src, typeof document !== "undefined" ? document.baseURI : "https://razorbox.invalid/");
  } catch {
    return null;
  }
  if (!["http:", "https:"].includes(url.protocol)) return null;
  const host = url.hostname.toLowerCase();
  if (!MAP_HOSTS.has(host)) return null;
  return url.pathname.startsWith("/maps") || host.startsWith("maps.google.") && url.searchParams.has("q") ? url : null;
}
function mapQuery(url) {
  const params = url.searchParams;
  const candidate = params.get("query") || params.get("q") || params.get("ll") || params.get("center");
  if (candidate) return candidate;
  const path = url.pathname.match(/^\/maps\/(?:search|place)\/([^/]+)/);
  if (path) {
    try {
      return decodeURIComponent(path[1].replace(/\+/g, " "));
    } catch {
      return path[1];
    }
  }
  const coords = url.pathname.match(/^\/maps\/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  return coords ? `${coords[1]},${coords[2]}` : "";
}
function normalizeItem(item) {
  if (typeof item === "string") item = { src: item };
  if (!item || typeof item !== "object") return null;
  let src = typeof item.src === "string" ? item.src.trim() : "";
  const html = typeof item.html === "string" ? item.html : "";
  const declared = String(item.type ?? "auto").toLowerCase();
  const provider = src ? providerReference(src) : null;
  const isMap = Boolean(src && googleMapsUrl(src));
  if (PROVIDER_TYPES.has(declared) && provider?.type !== declared) return null;
  let type = declared === "auto" ? provider?.type || (isMap ? "map" : PDF_EXTENSION.test(src) ? "pdf" : VIDEO_EXTENSIONS.test(src) ? "video" : "image") : declared;
  if (type === "html5") type = "video";
  if (type === "iframe" && provider) type = provider.type;
  if (type === "iframe" && isMap) type = "map";
  if (type === "iframe" && PDF_EXTENSION.test(src)) type = "pdf";
  if (!["image", "video", "youtube", "vimeo", "html", "iframe", "map", "pdf"].includes(type)) return null;
  if (type === "html") {
    if (!html && !(src.startsWith("#") && src.length > 1)) return null;
  } else if (type === "iframe" || type === "pdf" || type === "map") {
    src = safeFrameUrl(src);
    if (!src || type === "map" && !googleMapsUrl(src)) return null;
  } else if (!src) return null;
  const fallbackThumb = type === "image" ? src : typeof item.poster === "string" && item.poster ? item.poster : "";
  return {
    src,
    type,
    html,
    thumb: typeof item.thumb === "string" && item.thumb ? item.thumb : fallbackThumb,
    poster: typeof item.poster === "string" ? item.poster : "",
    embedSrc: typeof item.embedSrc === "string" ? item.embedSrc : "",
    caption: String(item.caption ?? ""),
    alt: String(item.alt ?? "")
  };
}
function providerEmbedUrl(item, { privacy = true, muted = false } = {}) {
  const reference = providerReference(item.src);
  if (!reference || reference.type !== item.type) return "";
  const src = reference.type === "youtube" ? new URL(`https://www.youtube${privacy ? "-nocookie" : ""}.com/embed/${reference.id}`) : new URL(`https://player.vimeo.com/video/${reference.id}`);
  if (reference.type === "youtube") {
    src.searchParams.set("v", reference.id);
    src.searchParams.set("controls", "1");
    src.searchParams.set("enablejsapi", "1");
    src.searchParams.set("nocookie", privacy ? "1" : "0");
    src.searchParams.set("rel", "0");
    src.searchParams.set("fs", "1");
    src.searchParams.set("playsinline", "1");
    if (muted) src.searchParams.set("mute", "1");
  } else {
    if (reference.hash) src.searchParams.set("h", reference.hash);
    src.searchParams.set("byline", "1");
    src.searchParams.set("color", "00adef");
    src.searchParams.set("controls", "1");
    src.searchParams.set("dnt", privacy ? "1" : "0");
    src.searchParams.set("muted", muted ? "1" : "0");
  }
  return src.toString();
}
function mapEmbedUrl(item, { apiKey = "", locale = "en" } = {}) {
  const original = googleMapsUrl(item.src);
  if (!original) return "";
  const provided = googleMapsUrl(item.embedSrc);
  if (provided?.pathname.startsWith("/maps/embed")) return provided.href;
  if (original.pathname.startsWith("/maps/embed")) return original.href;
  const query = mapQuery(original);
  if (!query) return "";
  if (apiKey) {
    const embed2 = new URL("https://www.google.com/maps/embed/v1/place");
    embed2.searchParams.set("key", String(apiKey));
    const placeId = original.searchParams.get("query_place_id");
    embed2.searchParams.set("q", placeId ? `place_id:${placeId}` : query);
    embed2.searchParams.set("language", locale);
    return embed2.href;
  }
  const embed = new URL("https://maps.google.com/maps");
  embed.searchParams.set("q", query);
  embed.searchParams.set("output", "embed");
  embed.searchParams.set("hl", locale);
  return embed.href;
}
let instanceSequence = 0;
const preconnected = /* @__PURE__ */ new Set();
const _razorbox = class _razorbox {
  /**
   * Delegates clicks on matching links. Elements added later also work.
   * @param {string} selector
   * @param {object} options
   * @returns {razorbox}
   */
  static bind(selector = "[data-razorbox]", options = {}) {
    return new _razorbox(selector, options);
  }
  constructor(selector = "[data-razorbox]", options = {}) {
    if (typeof selector === "object" && selector !== null) {
      options = selector;
      selector = options.selector ?? "[data-razorbox]";
    }
    if (typeof document === "undefined") {
      throw new Error("razorbox must be initialized in a browser.");
    }
    if (typeof selector !== "string" || !selector) {
      throw new TypeError("razorbox selector must be a non-empty CSS selector.");
    }
    this.selector = selector;
    this._thumbPanelId = `razorbox-thumbnails-${++instanceSequence}`;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this._triggerRoot = this.options.root ?? document;
    this._items = [];
    this._index = 0;
    this._isOpen = false;
    this._playing = false;
    this._thumbsOpen = false;
    this._zoom = 1;
    this._panX = 0;
    this._panY = 0;
    this._pointers = /* @__PURE__ */ new Map();
    this._gesture = null;
    this._pinch = null;
    this._trackpadGesture = null;
    this._preloadCache = /* @__PURE__ */ new Map();
    this._ignoreStageClickUntil = 0;
    this._ignoreThumbClickUntil = 0;
    this._thumbDrag = null;
    this._scrollCompensation = null;
    this._scrollLocked = false;
    this._closeTimer = null;
    this._closeTransitionHandler = null;
    this._slideTimer = null;
    this._renderSequence = 0;
    this._visibleSlide = null;
    this._playTimer = null;
    this._resumeAfterVisibility = false;
    this._ui = null;
    this._locale = "en";
    this._strings = LOCALES.en;
    this._enterRaf = null;
    this._onTriggerClick = this._onTriggerClick.bind(this);
    this._onUiClick = this._onUiClick.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
    this._onVisibility = this._onVisibility.bind(this);
    this._onFullscreenChange = this._onFullscreenChange.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onGestureStart = this._onGestureStart.bind(this);
    this._onGestureChange = this._onGestureChange.bind(this);
    this._onGestureEnd = this._onGestureEnd.bind(this);
    this._onThumbPointerDown = this._onThumbPointerDown.bind(this);
    this._onThumbPointerMove = this._onThumbPointerMove.bind(this);
    this._onThumbPointerUp = this._onThumbPointerUp.bind(this);
    this._onThumbWheel = this._onThumbWheel.bind(this);
    this._onThumbClickCapture = this._onThumbClickCapture.bind(this);
    this._onTriggerIntent = this._onTriggerIntent.bind(this);
    this._triggerRoot.addEventListener("click", this._onTriggerClick);
    this._triggerRoot.addEventListener("pointerdown", this._onTriggerIntent, { passive: true });
    this._triggerRoot.addEventListener("mouseover", this._onTriggerIntent, { passive: true });
    this._triggerRoot.addEventListener("focusin", this._onTriggerIntent);
  }
  get isOpen() {
    return this._isOpen;
  }
  get index() {
    return this._index;
  }
  get items() {
    return [...this._items];
  }
  get isPlaying() {
    return this._playing;
  }
  get locale() {
    return this._locale;
  }
  _t(key, params = {}) {
    return formatMessage(this.options.l10n?.[key] ?? this._strings[key] ?? LOCALES.en[key] ?? key, params);
  }
  _setLabel(element, value) {
    if (!element) return;
    element.setAttribute("aria-label", value);
    element.title = value;
  }
  _translateUi() {
    this._locale = detectLocale(this.options.locale);
    this._strings = LOCALES[this._locale];
    this._ui.lang = this._locale;
    this._ui.setAttribute("aria-label", this._t("gallery"));
    this._ui.querySelector(".razorbox__toolbar").setAttribute("aria-label", this._t("controls"));
    this._thumbPanel.setAttribute("aria-label", this._t("thumbnails"));
    this._setLabel(this._buttons.close, this._t("close"));
    this._setLabel(this._buttons.prev, this._t("previous"));
    this._setLabel(this._buttons.next, this._t("next"));
    this._setLabel(this._buttons.play, this._t("play"));
    this._setLabel(this._buttons.zoom, this._t("zoomIn"));
    this._setLabel(this._buttons.fullscreen, this._t("fullscreen"));
    this._setLabel(this._buttons.thumbs, this._t("thumbsShow"));
  }
  _itemFromElement(element) {
    const src = element.getAttribute("data-src") || element.getAttribute("href");
    if (!src) return null;
    const preview = element.querySelector("img");
    return normalizeItem({
      src,
      thumb: element.getAttribute("data-thumb") || preview?.currentSrc || preview?.src || "",
      type: element.getAttribute("data-type") || "auto",
      poster: element.getAttribute("data-poster") || "",
      embedSrc: element.getAttribute("data-embed-src") || "",
      caption: element.getAttribute("data-caption") ?? "",
      alt: element.getAttribute("data-alt") ?? preview?.alt ?? ""
    });
  }
  _preconnect(item) {
    if (!PROVIDER_TYPES.has(item?.type) || !this.options.videoAutoplay) return;
    for (const origin of PROVIDER_ORIGINS[item.type](this.options.videoPrivacy !== false)) {
      if (preconnected.has(origin)) continue;
      preconnected.add(origin);
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = origin;
      document.head.append(link);
    }
  }
  _onTriggerIntent(event) {
    if (!(event.target instanceof Element)) return;
    const trigger = event.target.closest(this.selector);
    if (!trigger || !this._triggerRoot.contains(trigger)) return;
    const src = trigger.getAttribute("data-src") || trigger.getAttribute("href");
    if (src && providerReference(src)) this._preconnect(this._itemFromElement(trigger));
  }
  _onTriggerClick(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!(event.target instanceof Element)) return;
    const trigger = event.target.closest(this.selector);
    if (!trigger || !this._triggerRoot.contains(trigger) || trigger.hasAttribute("download")) return;
    const gallery = (trigger.getAttribute("data-razorbox") || "").trim();
    const elements = gallery ? [...this._triggerRoot.querySelectorAll(this.selector)].filter((el) => (el.getAttribute("data-razorbox") || "").trim() === gallery) : [trigger];
    const entries = elements.map((element) => ({ element, item: this._itemFromElement(element) })).filter((entry) => entry.item);
    const start = entries.findIndex((entry) => entry.element === trigger);
    if (start === -1) return;
    event.preventDefault();
    this.open(entries.map((entry) => entry.item), start);
  }
  _createUi() {
    if (this._ui) return;
    const root = document.createElement("div");
    root.className = "razorbox";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "Media gallery");
    root.setAttribute("tabindex", "-1");
    root.hidden = true;
    root.innerHTML = `
      <div class="razorbox__backdrop" aria-hidden="true"></div>
      <div class="razorbox__viewport">
        <div class="razorbox__stage" data-rb-stage></div>
        <div class="razorbox__header">
          <div class="razorbox__counter" data-rb-counter aria-live="off"></div>
          <div class="razorbox__toolbar" role="toolbar" aria-label="Gallery controls">
            ${button("zoom", "Zoom in", `<span class="razorbox__icon-zoom-in">${icon("zoomIn")}</span><span class="razorbox__icon-zoom-out">${icon("zoomOut")}</span>`, 'aria-pressed="false"')}
            ${button("play", "Play slideshow", `<span class="razorbox__icon-play">${icon("play")}</span><span class="razorbox__icon-pause">${icon("pause")}</span>`, 'aria-pressed="false"')}
            ${button("fullscreen", "Enter fullscreen", `<span class="razorbox__icon-fullscreen">${icon("fullscreen")}</span><span class="razorbox__icon-fullscreen-exit">${icon("fullscreenExit")}</span>`, 'aria-pressed="false"')}
            ${button("thumbs", "Show thumbnails", icon("thumbs"), `aria-pressed="false" aria-expanded="false" aria-controls="${this._thumbPanelId}"`)}
            ${button("close", "Close gallery", icon("close"))}
          </div>
        </div>
        <button class="razorbox__arrow razorbox__arrow--prev" type="button" data-rb-action="prev" aria-label="Previous image" title="Previous image">${icon("prev")}</button>
        <button class="razorbox__arrow razorbox__arrow--next" type="button" data-rb-action="next" aria-label="Next image" title="Next image">${icon("next")}</button>
      </div>
      <aside class="razorbox__thumbs" id="${this._thumbPanelId}" data-rb-thumbs aria-label="Gallery thumbnails" aria-hidden="true">
        <div class="razorbox__thumbs-scroller" data-rb-thumbs-scroller>
          <div class="razorbox__thumbs-track" data-rb-thumbs-track></div>
        </div>
      </aside>
      <div class="razorbox__sr-only" data-rb-status role="status" aria-live="polite" aria-atomic="true"></div>
    `;
    document.body.append(root);
    this._ui = root;
    this._stage = root.querySelector("[data-rb-stage]");
    this._counter = root.querySelector("[data-rb-counter]");
    this._thumbPanel = root.querySelector("[data-rb-thumbs]");
    this._thumbScroller = root.querySelector("[data-rb-thumbs-scroller]");
    this._thumbTrack = root.querySelector("[data-rb-thumbs-track]");
    this._status = root.querySelector("[data-rb-status]");
    this._buttons = Object.fromEntries([...root.querySelectorAll("[data-rb-action]")].map((el) => [el.dataset.rbAction, el]));
    root.addEventListener("click", this._onUiClick);
    this._stage.addEventListener("pointerdown", this._onPointerDown);
    this._stage.addEventListener("pointermove", this._onPointerMove);
    this._stage.addEventListener("pointerup", this._onPointerUp);
    this._stage.addEventListener("pointercancel", this._onPointerUp);
    this._stage.addEventListener("wheel", this._onWheel, { passive: false });
    this._stage.addEventListener("gesturestart", this._onGestureStart, { passive: false });
    this._stage.addEventListener("gesturechange", this._onGestureChange, { passive: false });
    this._stage.addEventListener("gestureend", this._onGestureEnd, { passive: false });
    this._thumbScroller.addEventListener("pointerdown", this._onThumbPointerDown);
    this._thumbScroller.addEventListener("pointermove", this._onThumbPointerMove);
    this._thumbScroller.addEventListener("pointerup", this._onThumbPointerUp);
    this._thumbScroller.addEventListener("pointercancel", this._onThumbPointerUp);
    this._thumbScroller.addEventListener("lostpointercapture", this._onThumbPointerUp);
    this._thumbScroller.addEventListener("wheel", this._onThumbWheel, { passive: false });
    this._thumbScroller.addEventListener("click", this._onThumbClickCapture, true);
  }
  _listenGlobal() {
    document.addEventListener("keydown", this._onKeydown);
    document.addEventListener("visibilitychange", this._onVisibility);
    document.addEventListener("fullscreenchange", this._onFullscreenChange);
    window.addEventListener("resize", this._onResize);
  }
  _unlistenGlobal() {
    document.removeEventListener("keydown", this._onKeydown);
    document.removeEventListener("visibilitychange", this._onVisibility);
    document.removeEventListener("fullscreenchange", this._onFullscreenChange);
    window.removeEventListener("resize", this._onResize);
  }
  _lockScroll() {
    if (this._scrollLocked) return;
    const html = document.documentElement;
    const body = document.body;
    const width = Math.max(0, window.innerWidth - html.clientWidth);
    this._scrollCompensation = body.style.marginRight;
    if (width > 0) {
      const originalMargin = parseFloat(getComputedStyle(body).marginRight) || 0;
      body.style.marginRight = `${originalMargin + width}px`;
    }
    html.style.setProperty("--rb-scrollbar-width", `${width}px`);
    html.classList.toggle("razorbox-had-scrollbar", width > 0);
    body.classList.add("razorbox-scroll-lock");
    this._scrollLocked = true;
  }
  _unlockScroll() {
    if (!this._scrollLocked) return;
    this._scrollLocked = false;
    const html = document.documentElement;
    document.body.classList.remove("razorbox-scroll-lock");
    html.classList.remove("razorbox-had-scrollbar");
    html.style.removeProperty("--rb-scrollbar-width");
    if (this._scrollCompensation !== null) {
      document.body.style.marginRight = this._scrollCompensation;
      this._scrollCompensation = null;
    }
  }
  /** Opens a programmatic gallery: [{ src, thumb?, caption?, alt? }, ...]. */
  open(items, startIndex = 0) {
    if (!Array.isArray(items)) throw new TypeError("razorbox.open expects an array of media items.");
    const valid = items.map(normalizeItem).filter(Boolean);
    if (!valid.length) return false;
    if (_razorbox.activeInstance && _razorbox.activeInstance !== this) _razorbox.activeInstance.close(true);
    if (this._isOpen) this.close(true);
    clearTimeout(this._closeTimer);
    this._closeTimer = null;
    if (this._closeTransitionHandler && this._ui) {
      this._ui.removeEventListener("transitionend", this._closeTransitionHandler);
      this._closeTransitionHandler = null;
    }
    this._createUi();
    this._items = valid;
    this._translateUi();
    this._index = numberInRange(Math.trunc(Number(startIndex) || 0), 0, valid.length - 1);
    this._isOpen = true;
    this._playing = false;
    this._resumeAfterVisibility = false;
    this._thumbsOpen = Boolean(this.options.thumbnails && this.options.thumbsOpen && valid.length > 1);
    this._preloadCache.clear();
    this._visibleSlide = null;
    this._slide = null;
    this._image = null;
    this._ui.dataset.theme = ["dark", "light", "auto"].includes(this.options.theme) ? this.options.theme : "dark";
    this._ui.classList.toggle("razorbox--slide", this.options.transition === "slide");
    this._ui.classList.toggle("razorbox--fade", this.options.transition !== "slide");
    this._ui.style.setProperty("--rb-content-duration", `${contentDuration(this.options.transitionDuration)}ms`);
    this._previousFocus = document.activeElement;
    this._ui.hidden = false;
    this._ui.classList.remove("is-closing");
    this._ui.classList.remove("is-entered");
    this._ui.classList.add("is-open");
    this._lockScroll();
    cancelAnimationFrame(this._enterRaf);
    this._enterRaf = requestAnimationFrame(() => {
      if (this._isOpen) this._ui.classList.add("is-entered");
      this._enterRaf = null;
    });
    _razorbox.activeInstance = this;
    this._listenGlobal();
    this._renderThumbnails();
    this._updateThumbs();
    this._renderSlide(0, true);
    this._buttons.close.focus({ preventScroll: true });
    this._emit("onOpen");
    if (this.options.slideshow && this.options.autoplay && valid.length > 1 && valid[this._index].type === "image") this.play();
    return true;
  }
  _renderThumbnails() {
    this._thumbTrack.replaceChildren();
    const available = Boolean(this.options.thumbnails && this._items.length > 1);
    this._thumbPanel.hidden = !available;
    if (!available) return;
    const fragment = document.createDocumentFragment();
    this._items.forEach((item, index) => {
      const thumb = document.createElement("button");
      thumb.type = "button";
      thumb.className = "razorbox__thumb";
      thumb.dataset.rbThumbIndex = String(index);
      thumb.setAttribute("aria-label", this._t("goToItem", { number: index + 1 }) + (item.type !== "image" ? ` (${this._t(item.type === "youtube" || item.type === "vimeo" || item.type === "video" ? "video" : item.type)})` : ""));
      if (item.thumb) {
        const image = document.createElement("img");
        image.src = item.thumb;
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";
        thumb.append(image);
      }
      if (item.type !== "image") {
        const playBadge = document.createElement("span");
        playBadge.className = "razorbox__thumb-play";
        playBadge.innerHTML = icon(item.type === "html" ? "html" : ["iframe", "pdf", "map"].includes(item.type) ? "iframe" : "play");
        thumb.append(playBadge);
      }
      fragment.append(thumb);
    });
    this._thumbTrack.append(fragment);
  }
  _updateThumbs() {
    const enabled = Boolean(this.options.thumbnails && this._items.length > 1);
    this._thumbsOpen = enabled && this._thumbsOpen;
    this._ui.classList.toggle("is-thumbs-open", this._thumbsOpen);
    this._thumbPanel.setAttribute("aria-hidden", String(!this._thumbsOpen));
    this._buttons.thumbs.hidden = !enabled;
    this._buttons.thumbs.setAttribute("aria-pressed", String(this._thumbsOpen));
    this._buttons.thumbs.setAttribute("aria-expanded", String(this._thumbsOpen));
    this._setLabel(this._buttons.thumbs, this._t(this._thumbsOpen ? "thumbsHide" : "thumbsShow"));
    [...this._thumbTrack.children].forEach((el, index) => {
      const current = index === this._index;
      el.classList.toggle("is-current", current);
      if (current) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
    });
    if (this._thumbsOpen) {
      requestAnimationFrame(() => {
        const current = this._thumbPanel.querySelector(".is-current");
        if (!this._isOpen || !this._thumbsOpen || !current) return;
        const scroller = this._thumbScroller;
        const left = current.offsetLeft + current.offsetWidth / 2 - scroller.clientWidth / 2;
        scroller.scrollTo({ left, behavior: "smooth" });
      });
    }
    this._clampPan();
  }
  toggleThumbnails() {
    if (!this._isOpen || !this.options.thumbnails || this._items.length < 2) return;
    this._thumbsOpen = !this._thumbsOpen;
    this._updateThumbs();
  }
  _onThumbPointerDown(event) {
    if (event.pointerType === "touch" || event.button !== 0) return;
    this._thumbDrag = { id: event.pointerId, x: event.clientX, left: this._thumbScroller.scrollLeft, moved: false };
  }
  _onThumbPointerMove(event) {
    const drag = this._thumbDrag;
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) <= 5) return;
    if (!drag.moved) {
      drag.moved = true;
      this._thumbScroller.classList.add("is-dragging");
      try {
        this._thumbScroller.setPointerCapture(event.pointerId);
      } catch {
      }
    }
    this._thumbScroller.scrollLeft = drag.left - dx;
    event.preventDefault();
  }
  _onThumbPointerUp(event) {
    const drag = this._thumbDrag;
    if (!drag || event.pointerId !== drag.id) return;
    if (drag.moved) this._ignoreThumbClickUntil = Date.now() + 350;
    this._thumbDrag = null;
    this._thumbScroller.classList.remove("is-dragging");
    if (this._thumbScroller.hasPointerCapture?.(event.pointerId)) {
      try {
        this._thumbScroller.releasePointerCapture(event.pointerId);
      } catch {
      }
    }
  }
  _onThumbClickCapture(event) {
    if (Date.now() >= this._ignoreThumbClickUntil) return;
    event.preventDefault();
    event.stopPropagation();
  }
  _onThumbWheel(event) {
    const scroller = this._thumbScroller;
    if (scroller.scrollWidth <= scroller.clientWidth || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
    event.preventDefault();
    scroller.scrollLeft += event.deltaY;
  }
  // Build embed URLs using the Fancybox 6.1.15 Carousel Video plugin's
  // player parameters. Playback is started through the player APIs, NOT via
  // autoplay=1 in the iframe URL. Separate CSS is still supplied by the app.
  _embedUrl(item) {
    return providerEmbedUrl(item, { privacy: this.options.videoPrivacy !== false, muted: Boolean(this.options.videoMuted) });
  }
  // Fancybox 6.1.15 Carousel Video protocol:
  // YouTube: iframe load -> listening -> onReady -> playVideo
  // Vimeo:   ready -> play
  //
  // The play command is deliberately sent from a 250ms timer chain that is
  // started synchronously inside the user's click/tap/key handler, never from
  // the player's message event. WebKit (all iOS browsers) forwards the user
  // gesture through short timers into postMessage, which is what allows the
  // provider player to start WITH sound on mobile. Sending play from the
  // message handler carries no gesture: Vimeo then falls back to muted
  // playback and YouTube does not start at all.
  _autoplayProvider(frame, slide) {
    const provider = frame.dataset.rbProvider;
    if (!PROVIDER_TYPES.has(provider) || !this.options.videoAutoplay) return;
    frame.id = `razorbox-${provider}-${++instanceSequence}`;
    let ready = false;
    let disposed = false;
    let pollingTimer = null;
    const active = () => !disposed && this._isOpen && this._slide === slide && frame.isConnected;
    const send = (message) => {
      if (!active()) return;
      frame.contentWindow?.postMessage(JSON.stringify(message), "*");
    };
    const cleanup = () => {
      disposed = true;
      clearTimeout(pollingTimer);
      clearTimeout(recheckTimer);
      unmuteButton?.remove();
      frame.removeEventListener("load", onLoad);
      window.removeEventListener("message", onMessage);
      if (slide._rbProviderCleanup === cleanup) slide._rbProviderCleanup = null;
    };
    const requestListening = () => {
      if (provider !== "youtube" || !active() || ready) return;
      send({ event: "listening", id: frame.id });
    };
    const verifySound = provider === "vimeo" && !this.options.videoMuted;
    const youtubeFallback = provider === "youtube" && !this.options.videoMuted && this.options.videoMutedFallback !== false;
    let youtubeState = null;
    let muted = null;
    let played = false;
    let checks = 0;
    let unmuteButton = null;
    let recheckTimer = null;
    const hideUnmute = () => {
      if (unmuteButton) unmuteButton.hidden = true;
    };
    const showUnmute = () => {
      if (!active()) return;
      if (!unmuteButton) {
        unmuteButton = document.createElement("button");
        unmuteButton.type = "button";
        unmuteButton.className = "razorbox__unmute";
        unmuteButton.innerHTML = `${icon("unmute")}<span>${this._t("unmute")}</span>`;
        unmuteButton.addEventListener("click", onUnmuteClick);
        frame.after(unmuteButton);
        if (provider === "vimeo") send({ method: "addEventListener", value: "volumechange" });
      }
      unmuteButton.hidden = false;
    };
    const onUnmuteClick = (event) => {
      event.stopPropagation();
      if (provider === "youtube") {
        send({ event: "command", func: "unMute", args: [] });
        send({ event: "command", func: "setVolume", args: [100] });
        send({ event: "command", func: "playVideo", args: [] });
      } else {
        send({ method: "setMuted", value: false });
        send({ method: "setVolume", value: 1 });
        send({ method: "play", value: "true" });
      }
      hideUnmute();
      frame.focus({ preventScroll: true });
      clearTimeout(recheckTimer);
      muted = null;
      recheckTimer = setTimeout(() => {
        if (provider === "vimeo") send({ method: "getMuted" });
        recheckTimer = setTimeout(() => {
          if (provider === "youtube" && youtubeState === 2) {
            send({ event: "command", func: "mute", args: [] });
            send({ event: "command", func: "playVideo", args: [] });
            muted = true;
          }
          if (muted === true) showUnmute();
        }, 400);
      }, 600);
    };
    let stable = 0;
    let paused = null;
    const verifyVimeo = () => {
      const state = { paused, muted };
      paused = null;
      muted = null;
      if (state.paused === false && state.muted === false) {
        if (++stable >= 4) return true;
      } else if (state.paused !== null || state.muted !== null) {
        stable = 0;
      }
      if (state.paused === false && state.muted === true) {
        muted = true;
        showUnmute();
        return true;
      }
      send({ method: "getPaused" });
      send({ method: "getMuted" });
      return ++checks > 40;
    };
    const verifyYoutube = () => {
      if (youtubeState === 1 || youtubeState === 3) return true;
      if (++checks < 6) return false;
      send({ event: "command", func: "mute", args: [] });
      send({ event: "command", func: "playVideo", args: [] });
      muted = true;
      showUnmute();
      return true;
    };
    const poll = () => {
      pollingTimer = null;
      if (!active()) return;
      if (ready && !played) {
        played = true;
        frame.dataset.rbReady = "true";
        send(provider === "youtube" ? { event: "command", func: "playVideo" } : { method: "play", value: "true" });
        if (!verifySound && !youtubeFallback) return;
      } else if (played) {
        if (provider === "youtube" ? verifyYoutube() : verifyVimeo()) return;
      } else {
        requestListening();
      }
      pollingTimer = setTimeout(poll, 250);
    };
    const onMessage = (event) => {
      if (!active()) return;
      if (provider === "youtube") {
        if (!/^https:\/\/(?:www\.)?youtube(?:-nocookie)?\.com$/.test(event.origin)) return;
      } else if (event.origin !== "https://player.vimeo.com") {
        return;
      }
      let data;
      try {
        data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (!data || typeof data !== "object") return;
      const fromFrame = event.source === frame.contentWindow || provider === "youtube" && data.id === frame.id;
      if (!fromFrame) return;
      if (provider === "youtube" && data.event === "onReady" || provider === "vimeo" && data.event === "ready") {
        ready = true;
      } else if (provider === "youtube" && data.event === "infoDelivery" && data.info && typeof data.info === "object") {
        if (typeof data.info.playerState === "number") youtubeState = data.info.playerState;
        if (typeof data.info.muted === "boolean") muted = data.info.muted;
      } else if (provider === "youtube" && data.event === "onStateChange" && typeof data.info === "number") {
        youtubeState = data.info;
      } else if (provider === "vimeo" && data.method === "getPaused") {
        paused = Boolean(data.value);
      } else if (provider === "vimeo" && data.method === "getMuted") {
        muted = Boolean(data.value);
      } else if (provider === "vimeo" && data.event === "volumechange") {
        send({ method: "getMuted" });
      }
      if (muted === false) hideUnmute();
    };
    const onLoad = () => requestListening();
    window.addEventListener("message", onMessage);
    frame.addEventListener("load", onLoad);
    slide._rbProviderCleanup = cleanup;
    pollingTimer = setTimeout(poll, 250);
  }
  _mapEmbedUrl(item) {
    return mapEmbedUrl(item, { apiKey: this.options.mapApiKey, locale: this._locale });
  }
  _externalLink(href, label) {
    const link = document.createElement("a");
    link.className = "razorbox__external-link";
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = label;
    return link;
  }
  _pauseSlideMedia(slide) {
    slide?._rbProviderCleanup?.();
    const media = slide?.querySelector(".razorbox__video, .razorbox__iframe");
    if (!media) return;
    if (media.tagName === "VIDEO") {
      media.pause();
    } else if (media.hasAttribute("src")) {
      try {
        const provider = media.dataset.rbProvider;
        if (!PROVIDER_TYPES.has(provider)) return;
        const message = provider === "youtube" ? JSON.stringify({ event: "command", func: "pauseVideo", args: [] }) : JSON.stringify({ method: "pause" });
        media.contentWindow?.postMessage(message, new URL(media.src).origin);
      } catch {
      }
    }
  }
  _restoreInline(slide) {
    const info = slide?._rbInline;
    if (!info) return;
    info.placeholder.replaceWith(info.element);
    info.element.hidden = info.hidden;
    if (info.style === null) info.element.removeAttribute("style");
    else info.element.setAttribute("style", info.style);
    slide._rbInline = null;
  }
  _removeSlide(slide) {
    if (!slide) return;
    this._pauseSlideMedia(slide);
    this._restoreInline(slide);
    const video = slide.querySelector(".razorbox__video");
    if (video) {
      video.removeAttribute("autoplay");
      video.removeAttribute("src");
      video.load();
    }
    const frame = slide.querySelector(".razorbox__iframe");
    frame?.remove();
    slide.remove();
  }
  _activateSlide(slide, outgoing, sequence, initial) {
    if (sequence !== this._renderSequence || !this._isOpen || !slide.isConnected) return;
    const frame = slide.querySelector(".razorbox__iframe");
    if (frame) {
      if (PROVIDER_TYPES.has(frame.dataset.rbProvider)) this._autoplayProvider(frame, slide);
      frame.src = frame.dataset.rbEmbedSrc;
    }
    const activate = () => {
      if (sequence !== this._renderSequence || !this._isOpen || !slide.isConnected) return;
      this._visibleSlide = slide;
      slide.classList.add("is-active");
      slide.classList.remove("is-pending");
      if (outgoing && outgoing !== slide) {
        outgoing.classList.remove("is-active");
        outgoing.classList.add("is-leaving", slide.dataset.direction === "left" ? "to-right" : "to-left");
        const duration = contentDuration(this.options.transitionDuration);
        this._slideTimer = setTimeout(() => this._removeSlide(outgoing), duration + 60);
      }
      if (!frame && slide.querySelector(".razorbox__video") && this.options.videoAutoplay) {
        const video = slide.querySelector(".razorbox__video");
        video.play().catch(() => {
        });
      }
    };
    if (initial) activate();
    else requestAnimationFrame(activate);
  }
  _renderSlide(direction = 0, initial = false) {
    const sequence = ++this._renderSequence;
    clearTimeout(this._slideTimer);
    const outgoing = this._visibleSlide;
    for (const slide2 of [...this._stage.querySelectorAll(".razorbox__slide")]) {
      if (slide2 !== outgoing) this._removeSlide(slide2);
    }
    if (outgoing) {
      this._pauseSlideMedia(outgoing);
      this._restoreInline(outgoing);
      outgoing.classList.remove("is-leaving", "to-left", "to-right");
      outgoing.classList.add("is-active");
    }
    const item = this._items[this._index];
    const slide = document.createElement("div");
    slide.className = `razorbox__slide is-pending ${direction < 0 ? "from-left" : direction > 0 ? "from-right" : ""}`;
    slide.dataset.direction = direction < 0 ? "left" : "right";
    slide.dataset.rbType = item.type;
    this._ui.classList.toggle("is-interactive-content", item.type !== "image");
    this._stage.append(slide);
    this._slide = slide;
    this._image = null;
    this._zoom = 1;
    this._panX = 0;
    this._panY = 0;
    this._pointers.clear();
    this._gesture = null;
    this._pinch = null;
    this._trackpadGesture = null;
    this._applyTransform();
    if (item.type === "image") {
      const loader = document.createElement("div");
      loader.className = "razorbox__loader";
      loader.setAttribute("aria-hidden", "true");
      const image = document.createElement("img");
      image.className = "razorbox__image";
      image.alt = item.alt;
      image.draggable = false;
      image.decoding = "async";
      const error = document.createElement("div");
      error.className = "razorbox__error";
      error.textContent = this._t("contentError");
      error.hidden = true;
      slide.append(loader, image, error);
      this._image = image;
      this._applyTransform();
      let completed = false;
      const loaded = () => {
        if (completed) return;
        completed = true;
        const decoded = typeof image.decode === "function" ? image.decode().catch(() => {
        }) : Promise.resolve();
        decoded.then(() => {
          if (sequence !== this._renderSequence || !this._isOpen) return;
          slide.classList.add("is-loaded");
          loader.hidden = true;
          this._buttons.zoom.disabled = !this.options.zoom;
          this._activateSlide(slide, outgoing, sequence, initial);
        });
      };
      const failed = () => {
        if (completed) return;
        completed = true;
        if (sequence !== this._renderSequence || !this._isOpen) return;
        slide.classList.add("is-error");
        loader.hidden = true;
        error.hidden = false;
        this._buttons.zoom.disabled = true;
        this._activateSlide(slide, outgoing, sequence, initial);
      };
      image.addEventListener("load", loaded, { once: true });
      image.addEventListener("error", failed, { once: true });
      image.src = item.src;
      if (image.complete) queueMicrotask(() => image.naturalWidth ? loaded() : failed());
    } else {
      const wrapper = document.createElement("div");
      wrapper.className = "razorbox__media";
      if (item.type === "html") {
        wrapper.classList.add("razorbox__media--html");
        const host = document.createElement("div");
        host.className = "razorbox__html";
        if (item.html) {
          host.innerHTML = item.html;
        } else {
          const source = document.getElementById(item.src.slice(1));
          if (source && !source.closest(".razorbox")) {
            const placeholder = document.createComment("razorbox inline content");
            source.before(placeholder);
            slide._rbInline = { element: source, placeholder, hidden: source.hidden, style: source.getAttribute("style") };
            source.hidden = false;
            source.style.display = "";
            host.append(source);
          } else {
            host.textContent = this._t("inlineNotFound");
          }
        }
        wrapper.append(host);
      } else if (item.type === "video") {
        const video = document.createElement("video");
        video.className = "razorbox__video";
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.defaultMuted = Boolean(this.options.videoMuted);
        video.muted = Boolean(this.options.videoMuted);
        video.autoplay = Boolean(this.options.videoAutoplay);
        if (item.poster) video.poster = item.poster;
        video.src = item.src;
        const error = document.createElement("div");
        error.className = "razorbox__error razorbox__error--video";
        error.textContent = this._t("contentError");
        error.hidden = true;
        video.addEventListener("error", () => {
          error.hidden = false;
          video.hidden = true;
          slide.classList.add("is-error");
        });
        wrapper.append(video, error);
      } else {
        const isPdf = item.type === "pdf";
        const isMap = item.type === "map";
        if (isPdf) wrapper.classList.add("razorbox__media--pdf");
        if (isMap) wrapper.classList.add("razorbox__media--map");
        const embedSrc = isMap ? this._mapEmbedUrl(item) : isPdf || item.type === "iframe" ? item.src : this._embedUrl(item);
        if (embedSrc) {
          const frame = document.createElement("iframe");
          frame.className = "razorbox__iframe";
          frame.title = item.alt || this._t(isPdf ? "pdf" : isMap ? "map" : item.type === "iframe" ? "embeddedPage" : item.type === "youtube" ? "youtubeVideo" : "vimeoVideo");
          frame.allow = item.type === "youtube" ? "accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share" : "autoplay; fullscreen; encrypted-media; picture-in-picture";
          frame.allowFullscreen = true;
          frame.referrerPolicy = "strict-origin-when-cross-origin";
          if (PROVIDER_TYPES.has(item.type)) {
            frame.setAttribute("credentialless", "");
            frame.setAttribute("scrolling", "no");
          }
          frame.dataset.rbProvider = item.type;
          frame.dataset.rbEmbedSrc = embedSrc;
          wrapper.append(frame);
        } else if (isMap) {
          const fallback = document.createElement("p");
          fallback.className = "razorbox__media-fallback";
          fallback.textContent = this._t("mapUnavailable");
          wrapper.append(fallback);
        }
        if (isMap || isPdf) {
          const actions = document.createElement("div");
          actions.className = "razorbox__attachment-actions";
          actions.append(this._externalLink(item.src, this._t(isMap ? "openMap" : "openPdf")));
          wrapper.append(actions);
        }
      }
      slide.append(wrapper);
      slide.classList.add("is-loaded");
      this._activateSlide(slide, outgoing, sequence, initial);
    }
    if (item.caption) {
      const caption = document.createElement("div");
      caption.className = "razorbox__caption";
      if (this.options.captionHtml) caption.innerHTML = item.caption;
      else caption.textContent = item.caption;
      slide.append(caption);
    }
    this._counter.textContent = `${this._index + 1} / ${this._items.length}`;
    const typeLabel = this._t(item.type === "youtube" || item.type === "vimeo" || item.type === "video" ? "video" : item.type === "html" ? "content" : item.type === "iframe" ? "embeddedPage" : item.type);
    this._status.textContent = this._t("status", { type: typeLabel, number: this._index + 1, total: this._items.length, alt: item.alt });
    this._buttons.prev.hidden = this._items.length < 2;
    this._buttons.next.hidden = this._items.length < 2;
    this._buttons.prev.disabled = !this.options.loop && this._index === 0;
    this._buttons.next.disabled = !this.options.loop && this._index === this._items.length - 1;
    this._buttons.play.hidden = !this.options.slideshow || this._items.length < 2 || item.type !== "image";
    this._buttons.zoom.hidden = !this.options.zoom || item.type !== "image";
    this._buttons.zoom.disabled = !slide.classList.contains("is-loaded");
    this._buttons.fullscreen.hidden = !this.options.fullscreen || !document.fullscreenEnabled || !this._ui.requestFullscreen;
    this._updateThumbs();
    this._preloadNeighbors();
  }
  _preloadNeighbors() {
    const count = Math.max(0, Math.trunc(Number(this.options.preload) || 0));
    for (let step = 1; step <= Math.min(count, this._items.length - 1); step++) {
      for (const direction of [-1, 1]) {
        const rawIndex = this._index + step * direction;
        if (!this.options.loop && (rawIndex < 0 || rawIndex >= this._items.length)) continue;
        const index = (rawIndex + this._items.length) % this._items.length;
        const item = this._items[index];
        if (item.type !== "image" || this._preloadCache.has(item.src)) continue;
        const image = new Image();
        image.decoding = "async";
        image.src = item.src;
        this._preloadCache.set(item.src, image);
      }
    }
  }
  goTo(index) {
    if (!this._isOpen || this._items.length === 0) return;
    const length = this._items.length;
    const requested = Math.trunc(Number(index));
    if (!Number.isFinite(requested)) return;
    const next = this.options.loop ? (requested % length + length) % length : numberInRange(requested, 0, length - 1);
    if (next === this._index) return;
    const direction = requested < this._index ? -1 : 1;
    this._index = next;
    if (this._items[next].type !== "image") this.pause();
    this._renderSlide(direction);
    this._emit("onChange");
    if (this._playing) this._scheduleNext();
  }
  next() {
    if (this._isOpen) this.goTo(this._index + 1);
  }
  prev() {
    if (this._isOpen) this.goTo(this._index - 1);
  }
  play() {
    if (!this._isOpen || !this.options.slideshow || this._items.length < 2 || this._items[this._index].type !== "image") return;
    this._playing = true;
    this._ui.classList.add("is-playing");
    this._buttons.play.setAttribute("aria-pressed", "true");
    this._setLabel(this._buttons.play, this._t("pause"));
    this._scheduleNext();
  }
  pause() {
    this._playing = false;
    clearTimeout(this._playTimer);
    this._playTimer = null;
    if (!this._ui) return;
    this._ui.classList.remove("is-playing");
    this._buttons.play.setAttribute("aria-pressed", "false");
    this._setLabel(this._buttons.play, this._t("play"));
  }
  togglePlay() {
    this._playing ? this.pause() : this.play();
  }
  _scheduleNext() {
    clearTimeout(this._playTimer);
    if (!this._isOpen || !this._playing) return;
    const delay = Math.max(800, Number(this.options.slideshowInterval) || 3500);
    this._playTimer = setTimeout(() => {
      if (!this.options.loop && this._index === this._items.length - 1) this.pause();
      else this.next();
    }, delay);
  }
  _applyTransform(animate = true) {
    if (this._image) {
      this._image.style.setProperty("--rb-zoom", String(this._zoom));
      this._image.style.setProperty("--rb-x", `${this._panX}px`);
      this._image.style.setProperty("--rb-y", `${this._panY}px`);
      this._image.classList.toggle("is-dragging", !animate);
    }
    if (!this._ui) return;
    this._ui.classList.toggle("is-zoomed", this._zoom > 1.005);
    this._buttons.zoom.setAttribute("aria-pressed", String(this._zoom > 1.005));
    this._setLabel(this._buttons.zoom, this._t(this._zoom > 1.005 ? "zoomOut" : "zoomIn"));
  }
  _clampPan(animate = true) {
    if (!this._image || !this._slide || !this._isOpen) return;
    const style = getComputedStyle(this._slide);
    const availableW = this._slide.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const captionHeight = this._slide.querySelector(".razorbox__caption")?.offsetHeight || 0;
    const availableH = this._slide.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - captionHeight;
    const maxX = Math.max(0, (this._image.offsetWidth * this._zoom - availableW) / 2);
    const maxY = Math.max(0, (this._image.offsetHeight * this._zoom - availableH) / 2);
    this._panX = numberInRange(this._panX, -maxX, maxX);
    this._panY = numberInRange(this._panY, -maxY, maxY);
    this._applyTransform(animate);
  }
  _setZoom(level, animate = true) {
    if (!this._isOpen || !this.options.zoom || !this._image || !this._slide?.classList.contains("is-loaded")) return;
    this._zoom = numberInRange(level, 1, Math.max(1, Number(this.options.maxZoom) || 8));
    if (this._zoom <= 1.005) {
      this._zoom = 1;
      this._panX = 0;
      this._panY = 0;
    }
    this._clampPan(animate);
  }
  // Zoom toward the actual pointer/finger position, not the image center.
  // CSS transforms are translate(...) scale(...), so moving the offset by
  // (1 - ratio) * (anchor - current center) keeps the pixel under the cursor
  // stationary while the image scales. Pan clamping still applies at the edges.
  _setZoomAt(level, clientX, clientY) {
    if (!this._isOpen || !this.options.zoom || !this._image || !this._slide?.classList.contains("is-loaded")) return;
    const next = numberInRange(level, 1, Math.max(1, Number(this.options.maxZoom) || 8));
    if (!Number.isFinite(next) || Math.abs(next - this._zoom) < 1e-5) return;
    if (next <= 1.005) {
      this._setZoom(1, false);
      return;
    }
    this._image.classList.add("is-dragging");
    const rect = this._image.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const anchorX = Number.isFinite(clientX) ? clientX : centerX;
    const anchorY = Number.isFinite(clientY) ? clientY : centerY;
    const ratio = next / this._zoom;
    this._panX += (1 - ratio) * (anchorX - centerX);
    this._panY += (1 - ratio) * (anchorY - centerY);
    this._setZoom(next, false);
  }
  toggleZoom() {
    if (!this._isOpen || !this.options.zoom || !this._image) return;
    clearTimeout(this._wheelSettledTimer);
    this._trackpadGesture = null;
    const target = this._zoom > 1.005 ? 1 : Number(this.options.zoomFactor) || 2;
    this._setZoom(target);
  }
  async toggleFullscreen() {
    if (!this._isOpen || !this.options.fullscreen || !this._ui.requestFullscreen) return;
    try {
      if (document.fullscreenElement === this._ui) await document.exitFullscreen();
      else await this._ui.requestFullscreen();
    } catch {
    }
  }
  _onFullscreenChange() {
    if (!this._ui) return;
    const active = document.fullscreenElement === this._ui;
    this._ui.classList.toggle("is-fullscreen", active);
    this._buttons.fullscreen.setAttribute("aria-pressed", String(active));
    this._setLabel(this._buttons.fullscreen, this._t(active ? "fullscreenExit" : "fullscreen"));
    this._clampPan();
  }
  _onUiClick(event) {
    if (!this._isOpen) return;
    const thumb = event.target.closest("[data-rb-thumb-index]");
    if (thumb) {
      this.goTo(Number(thumb.dataset.rbThumbIndex));
      return;
    }
    const action = event.target.closest("[data-rb-action]")?.dataset.rbAction;
    switch (action) {
      case "close":
        this.close();
        return;
      case "prev":
        this.prev();
        return;
      case "next":
        this.next();
        return;
      case "play":
        this.togglePlay();
        return;
      case "zoom":
        this.toggleZoom();
        return;
      case "fullscreen":
        this.toggleFullscreen();
        return;
      case "thumbs":
        this.toggleThumbnails();
        return;
    }
    if (Date.now() < this._ignoreStageClickUntil) return;
    if (event.target.classList?.contains("razorbox__image")) {
      this.toggleZoom();
    } else if (this.options.closeOnBackdrop && (event.target === this._stage || event.target.classList?.contains("razorbox__slide"))) {
      this.close();
    }
  }
  _onKeydown(event) {
    if (!this._isOpen || !this.options.keyboard) return;
    if (event.key === "Tab") {
      const elements = [...this._ui.querySelectorAll('button:not([disabled]):not([hidden]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), video[controls], iframe')].filter((el) => getComputedStyle(el).visibility !== "hidden" && el.getClientRects().length);
      if (!elements.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || !this._ui.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !this._ui.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const targetTag = document.activeElement?.tagName;
    if ((["INPUT", "TEXTAREA", "SELECT", "VIDEO", "IFRAME"].includes(targetTag) || document.activeElement?.isContentEditable) && event.key !== "Escape") return;
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        this.close();
        break;
      case "ArrowRight":
        event.preventDefault();
        this.next();
        break;
      case "ArrowLeft":
        event.preventDefault();
        this.prev();
        break;
      case " ":
      case "Spacebar":
        if (document.activeElement?.tagName === "BUTTON") break;
        event.preventDefault();
        this.togglePlay();
        break;
      case "t":
      case "T":
        event.preventDefault();
        this.toggleThumbnails();
        break;
      case "f":
      case "F":
        event.preventDefault();
        this.toggleFullscreen();
        break;
      case "z":
      case "Z":
        event.preventDefault();
        this.toggleZoom();
        break;
    }
  }
  _onVisibility() {
    if (!this._isOpen) return;
    if (document.hidden) {
      this._resumeAfterVisibility = this._playing;
      if (this._playing) this.pause();
    } else if (this._resumeAfterVisibility) {
      this._resumeAfterVisibility = false;
      this.play();
    }
  }
  _onResize() {
    this._clampPan();
  }
  _onPointerDown(event) {
    if (!this._isOpen || !this._slide?.classList.contains("is-loaded") || this._items[this._index].type !== "image") return;
    if (event.pointerType === "mouse" && (event.button !== 0 || this._zoom <= 1)) return;
    if (event.button !== 0 && event.pointerType !== "touch") return;
    this._pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (event.pointerType === "touch" || this._zoom > 1) {
      try {
        this._stage.setPointerCapture(event.pointerId);
      } catch {
      }
    }
    if (this._pointers.size === 1) {
      this._gesture = {
        x: event.clientX,
        y: event.clientY,
        panX: this._panX,
        panY: this._panY,
        moved: false,
        onImage: event.target === this._image,
        pointerType: event.pointerType
      };
    } else if (this._pointers.size === 2 && this.options.zoom) {
      const [a, b] = [...this._pointers.values()];
      this._pinch = {
        distance: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        zoom: this._zoom,
        centerX: (a.x + b.x) / 2,
        centerY: (a.y + b.y) / 2
      };
      this._gesture.moved = true;
    }
  }
  _onPointerMove(event) {
    if (!this._pointers.has(event.pointerId)) return;
    this._pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this._pointers.size === 2 && this._pinch && this.options.zoom) {
      const [a, b] = [...this._pointers.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const centerX = (a.x + b.x) / 2;
      const centerY = (a.y + b.y) / 2;
      this._panX += centerX - this._pinch.centerX;
      this._panY += centerY - this._pinch.centerY;
      this._pinch.centerX = centerX;
      this._pinch.centerY = centerY;
      this._setZoomAt(this._pinch.zoom * distance / this._pinch.distance, centerX, centerY);
      this._clampPan(false);
      this._gesture.moved = true;
      return;
    }
    if (!this._gesture) return;
    const dx = event.clientX - this._gesture.x;
    const dy = event.clientY - this._gesture.y;
    if (Math.hypot(dx, dy) > 8) this._gesture.moved = true;
    if (this._zoom > 1 && this._gesture.onImage) {
      this._panX = this._gesture.panX + dx;
      this._panY = this._gesture.panY + dy;
      const style = getComputedStyle(this._slide);
      const width = this._slide.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const height = this._slide.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      const limitX = Math.max(0, (this._image.offsetWidth * this._zoom - width) / 2);
      const limitY = Math.max(0, (this._image.offsetHeight * this._zoom - height) / 2);
      this._panX = numberInRange(this._panX, -limitX, limitX);
      this._panY = numberInRange(this._panY, -limitY, limitY);
      this._applyTransform(false);
    }
  }
  _onPointerUp(event) {
    if (!this._pointers.has(event.pointerId)) return;
    this._pointers.delete(event.pointerId);
    if (this._pinch) {
      this._ignoreStageClickUntil = Date.now() + 400;
      if (this._pointers.size < 2) this._pinch = null;
      if (this._pointers.size === 1) {
        const remaining = [...this._pointers.values()][0];
        this._gesture = { x: remaining.x, y: remaining.y, panX: this._panX, panY: this._panY, moved: true, onImage: true, pointerType: "touch" };
      }
    } else if (this._gesture && this._pointers.size === 0) {
      const dx = event.clientX - this._gesture.x;
      const dy = event.clientY - this._gesture.y;
      if (this._gesture.pointerType === "touch" && this._zoom <= 1 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.25) {
        this._ignoreStageClickUntil = Date.now() + 400;
        if (dx < 0) this.next();
        else this.prev();
      } else if (this._gesture.moved) {
        this._ignoreStageClickUntil = Date.now() + 400;
      } else if (this._gesture.pointerType === "touch" && this._gesture.onImage) {
        this._ignoreStageClickUntil = Date.now() + 400;
        this.toggleZoom();
      }
    }
    if (this._pointers.size === 0) {
      this._gesture = null;
      this._pinch = null;
      this._applyTransform(true);
    }
  }
  _onWheel(event) {
    if (!this._isOpen || !this.options.zoom || !this.options.wheelZoom || !this._image || !this._slide?.classList.contains("is-loaded")) return;
    if (this._trackpadGesture || event.target !== this._image && !this._image.contains(event.target)) {
      if (this._trackpadGesture && event.cancelable) event.preventDefault();
      return;
    }
    event.preventDefault();
    const deltaUnit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? this._stage.clientHeight : 1;
    const delta = numberInRange(event.deltaY * deltaUnit, -160, 160);
    if (!Number.isFinite(delta) || delta === 0) return;
    const speed = event.ctrlKey ? 0.012 : 25e-4;
    this._setZoomAt(this._zoom * Math.exp(-delta * speed), event.clientX, event.clientY);
    clearTimeout(this._wheelSettledTimer);
    this._wheelSettledTimer = setTimeout(() => this._applyTransform(true), 140);
  }
  // Safari's native gesture events are not PointerEvents or WheelEvents.
  // Cancel the page gesture only while zooming a loaded lightbox image.
  _onGestureStart(event) {
    if (!this._isOpen || !this.options.zoom || !this.options.wheelZoom || !this._image || !this._slide?.classList.contains("is-loaded")) return;
    if (event.target !== this._image && !this._image.contains(event.target)) return;
    if (event.cancelable) event.preventDefault();
    clearTimeout(this._wheelSettledTimer);
    this._trackpadGesture = { zoom: this._zoom };
  }
  _onGestureChange(event) {
    if (!this._trackpadGesture) return;
    if (event.cancelable) event.preventDefault();
    const scale = Number(event.scale);
    if (!Number.isFinite(scale) || scale <= 0) return;
    const rect = this._image.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;
    this._setZoomAt(this._trackpadGesture.zoom * scale, x, y);
  }
  _onGestureEnd(event) {
    if (!this._trackpadGesture) return;
    if (event.cancelable) event.preventDefault();
    this._trackpadGesture = null;
    this._ignoreStageClickUntil = Date.now() + 400;
    this._applyTransform(true);
  }
  _emit(name) {
    const callback = this.options[name];
    if (typeof callback === "function") {
      callback({ instance: this, index: this._index, item: this._items[this._index], length: this._items.length });
    }
  }
  /** Set immediate=true to skip the closing transition. */
  close(immediate = false) {
    if (!this._isOpen) return;
    this._isOpen = false;
    cancelAnimationFrame(this._enterRaf);
    this._enterRaf = null;
    this.pause();
    clearTimeout(this._slideTimer);
    clearTimeout(this._wheelSettledTimer);
    ++this._renderSequence;
    for (const slide of [...this._stage.querySelectorAll(".razorbox__slide")]) {
      this._pauseSlideMedia(slide);
      slide.querySelector(".razorbox__iframe")?.remove();
    }
    this._visibleSlide = null;
    this._pointers.clear();
    this._gesture = null;
    this._pinch = null;
    this._trackpadGesture = null;
    this._unlistenGlobal();
    if (document.fullscreenElement === this._ui) document.exitFullscreen().catch(() => {
    });
    if (_razorbox.activeInstance === this) _razorbox.activeInstance = null;
    const previousFocus = this._previousFocus;
    const finish = () => {
      if (this._isOpen) return;
      clearTimeout(this._closeTimer);
      this._closeTimer = null;
      if (this._closeTransitionHandler) {
        this._ui.removeEventListener("transitionend", this._closeTransitionHandler);
        this._closeTransitionHandler = null;
      }
      this._unlockScroll();
      this._ui.hidden = true;
      this._ui.classList.remove("is-open", "is-entered", "is-closing");
      for (const slide of [...this._stage.querySelectorAll(".razorbox__slide")]) this._removeSlide(slide);
      this._stage.replaceChildren();
      this._slide = null;
      this._image = null;
      if (previousFocus?.isConnected && typeof previousFocus.focus === "function") previousFocus.focus({ preventScroll: true });
      this._emit("onClose");
    };
    clearTimeout(this._closeTimer);
    this._closeTimer = null;
    if (immediate) {
      finish();
    } else {
      this._ui.classList.add("is-closing");
      this._closeTransitionHandler = (event) => {
        if (event.target === this._ui && event.propertyName === "opacity") finish();
      };
      this._ui.addEventListener("transitionend", this._closeTransitionHandler);
      const computed = getComputedStyle(this._ui);
      const toMs = (value) => value.trim().endsWith("ms") ? parseFloat(value) : parseFloat(value) * 1e3;
      const durations = computed.transitionDuration.split(",");
      const delays = computed.transitionDelay.split(",");
      const timeout = Math.max(0, ...durations.map((duration, index) => (toMs(duration) || 0) + (toMs(delays[index % delays.length]) || 0)));
      this._closeTimer = setTimeout(finish, timeout + 60);
    }
  }
  /** Detach listeners and remove the reusable dialog node. */
  destroy() {
    this.close(true);
    if (this._closeTransitionHandler && this._ui) {
      this._ui.removeEventListener("transitionend", this._closeTransitionHandler);
      this._closeTransitionHandler = null;
    }
    if (this._scrollLocked) this._unlockScroll();
    clearTimeout(this._closeTimer);
    clearTimeout(this._playTimer);
    clearTimeout(this._slideTimer);
    clearTimeout(this._wheelSettledTimer);
    this._triggerRoot.removeEventListener("click", this._onTriggerClick);
    this._triggerRoot.removeEventListener("pointerdown", this._onTriggerIntent);
    this._triggerRoot.removeEventListener("mouseover", this._onTriggerIntent);
    this._triggerRoot.removeEventListener("focusin", this._onTriggerIntent);
    this._ui?.remove();
    this._ui = null;
    this._preloadCache.clear();
  }
};
__publicField(_razorbox, "activeInstance", null);
let razorbox = _razorbox;
export {
  razorbox as default,
  razorbox
};
//# sourceMappingURL=razorbox.js.map
