// Pure media helpers: URL validation, provider detection and item normalization.
// Nothing here touches the DOM, apart from reading document.baseURI when present.

export const PROVIDER_TYPES = new Set(['youtube', 'vimeo'])
export const VIDEO_EXTENSIONS = /\.(?:mp4|webm|ogv|ogg|m4v)(?:[?#]|$)/i
export const PDF_EXTENSION = /\.pdf(?:[?#]|$)/i

// Connecting to the player host as soon as the user touches or hovers a
// trigger lets the player become ready sooner, which matters on iOS: its play
// command must arrive while the tap still counts. Only the player document
// request can reuse this connection; the player's own subresources live in a
// separate network partition.
export const PROVIDER_ORIGINS = {
  youtube: privacy => [privacy ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com'],
  vimeo: () => ['https://player.vimeo.com']
}

export function safeFrameUrl (src) {
  if (!src) return ''
  try {
    const base = typeof document !== 'undefined' ? document.baseURI : 'https://razorbox.invalid/'
    const url = new URL(src, base)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
  } catch { return '' }
}

// Only recognized YouTube and Vimeo URLs can receive video-provider embed parameters.
export function providerReference (src) {
  let url
  try { url = new URL(src, 'https://razorbox.invalid/') } catch { return null }
  if (!['http:', 'https:'].includes(url.protocol)) return null
  const host = url.hostname.toLowerCase()
  const segments = url.pathname.split('/').filter(Boolean)
  let id
  if (host === 'youtu.be') id = segments[0]
  else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
    if (segments[0] === 'watch') id = url.searchParams.get('v')
    else if (['embed', 'shorts', 'live', 'v'].includes(segments[0])) id = segments[1]
  }
  if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return { type: 'youtube', id }
  if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host)) {
    const videoPosition = segments[0] === 'video' ? 1 : 0
    id = segments[videoPosition]
    if (id && /^\d+$/.test(id)) {
      const hash = url.searchParams.get('h') || segments[videoPosition + 1] || ''
      return { type: 'vimeo', id, hash: /^[a-zA-Z0-9]+$/.test(hash) ? hash : '' }
    }
  }
  return null
}

export const MAP_HOSTS = new Set(['www.google.com', 'google.com', 'maps.google.com', 'www.google.de', 'google.de', 'maps.google.de', 'www.google.fr', 'google.fr', 'maps.google.fr'])

export function googleMapsUrl (src) {
  let url
  try { url = new URL(src, typeof document !== 'undefined' ? document.baseURI : 'https://razorbox.invalid/') } catch { return null }
  if (!['http:', 'https:'].includes(url.protocol)) return null
  const host = url.hostname.toLowerCase()
  if (!MAP_HOSTS.has(host)) return null
  return url.pathname.startsWith('/maps') || (host.startsWith('maps.google.') && url.searchParams.has('q')) ? url : null
}

export function mapQuery (url) {
  const params = url.searchParams
  const candidate = params.get('query') || params.get('q') || params.get('ll') || params.get('center')
  if (candidate) return candidate
  const path = url.pathname.match(/^\/maps\/(?:search|place)\/([^/]+)/)
  if (path) {
    try { return decodeURIComponent(path[1].replace(/\+/g, ' ')) } catch { return path[1] }
  }
  const coords = url.pathname.match(/^\/maps\/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  return coords ? `${coords[1]},${coords[2]}` : ''
}

export function normalizeItem (item) {
  if (typeof item === 'string') item = { src: item }
  if (!item || typeof item !== 'object') return null
  let src = typeof item.src === 'string' ? item.src.trim() : ''
  const html = typeof item.html === 'string' ? item.html : ''
  const declared = String(item.type ?? 'auto').toLowerCase()
  const provider = src ? providerReference(src) : null
  const isMap = Boolean(src && googleMapsUrl(src))
  if (PROVIDER_TYPES.has(declared) && provider?.type !== declared) return null
  let type = declared === 'auto'
    ? (provider?.type || (isMap ? 'map' : PDF_EXTENSION.test(src) ? 'pdf' : VIDEO_EXTENSIONS.test(src) ? 'video' : 'image'))
    : declared
  if (type === 'html5') type = 'video'
  // Do not let explicitly declared generic iframes bypass privacy mode for
  // recognized provider video URLs. They still use the provider player.
  if (type === 'iframe' && provider) type = provider.type
  if (type === 'iframe' && isMap) type = 'map'
  if (type === 'iframe' && PDF_EXTENSION.test(src)) type = 'pdf'
  if (!['image', 'video', 'youtube', 'vimeo', 'html', 'iframe', 'map', 'pdf'].includes(type)) return null
  if (type === 'html') {
    // Inline nodes are specified with #id; literal HTML requires an explicit type.
    if (!html && !(src.startsWith('#') && src.length > 1)) return null
  } else if (type === 'iframe' || type === 'pdf' || type === 'map') {
    src = safeFrameUrl(src)
    if (!src || (type === 'map' && !googleMapsUrl(src))) return null
  } else if (!src) return null
  const fallbackThumb = type === 'image'
    ? src
    : typeof item.poster === 'string' && item.poster
      ? item.poster
      : ''
  return {
    src,
    type,
    html,
    thumb: typeof item.thumb === 'string' && item.thumb ? item.thumb : fallbackThumb,
    poster: typeof item.poster === 'string' ? item.poster : '',
    embedSrc: typeof item.embedSrc === 'string' ? item.embedSrc : '',
    caption: String(item.caption ?? ''),
    alt: String(item.alt ?? '')
  }
}

// Provider players get their own parameters; playback itself is started through
// the player APIs by the class, never via autoplay=1 in the URL.
export function providerEmbedUrl (item, { privacy = true, muted = false } = {}) {
  const reference = providerReference(item.src)
  if (!reference || reference.type !== item.type) return ''

  const src = reference.type === 'youtube'
    ? new URL(`https://www.youtube${privacy ? '-nocookie' : ''}.com/embed/${reference.id}`)
    : new URL(`https://player.vimeo.com/video/${reference.id}`)

  if (reference.type === 'youtube') {
    // Keep the original watch URL's v parameter; YouTube accepts it on embed URLs.
    src.searchParams.set('v', reference.id)
    src.searchParams.set('controls', '1')
    src.searchParams.set('enablejsapi', '1')
    src.searchParams.set('nocookie', privacy ? '1' : '0')
    src.searchParams.set('rel', '0')
    src.searchParams.set('fs', '1')
    // Required on iOS for inline (and therefore muted) playback.
    src.searchParams.set('playsinline', '1')
    if (muted) src.searchParams.set('mute', '1')
    // Deliberately no origin= parameter: it can cause the YouTube IFrame API
    // to reject non-standard dev hosts.
  } else {
    if (reference.hash) src.searchParams.set('h', reference.hash)
    src.searchParams.set('byline', '1')
    src.searchParams.set('color', '00adef')
    src.searchParams.set('controls', '1')
    src.searchParams.set('dnt', privacy ? '1' : '0')
    src.searchParams.set('muted', muted ? '1' : '0')
  }

  return src.toString()
}

export function mapEmbedUrl (item, { apiKey = '', locale = 'en' } = {}) {
  const original = googleMapsUrl(item.src)
  if (!original) return ''
  const provided = googleMapsUrl(item.embedSrc)
  if (provided?.pathname.startsWith('/maps/embed')) return provided.href
  if (original.pathname.startsWith('/maps/embed')) return original.href
  const query = mapQuery(original)
  if (!query) return ''
  if (apiKey) {
    // Official Google Maps Embed API; a referrer-restricted API key is required.
    const embed = new URL('https://www.google.com/maps/embed/v1/place')
    embed.searchParams.set('key', String(apiKey))
    const placeId = original.searchParams.get('query_place_id')
    embed.searchParams.set('q', placeId ? `place_id:${placeId}` : query)
    embed.searchParams.set('language', locale)
    return embed.href
  }
  // Compatibility embed (no key). Not an official supported Maps Embed API;
  // the permanent, accessible 'Open in Google Maps' link is the fallback.
  const embed = new URL('https://maps.google.com/maps')
  embed.searchParams.set('q', query)
  embed.searchParams.set('output', 'embed')
  embed.searchParams.set('hl', locale)
  return embed.href
}
