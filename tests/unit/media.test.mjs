import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  safeFrameUrl,
  providerReference,
  googleMapsUrl,
  mapQuery,
  normalizeItem,
  providerEmbedUrl,
  mapEmbedUrl
} from '../../src/media.js'

describe('safeFrameUrl', () => {
  test('accepts http(s) and resolves relative URLs', () => {
    assert.equal(safeFrameUrl('https://example.com/page'), 'https://example.com/page')
    assert.equal(safeFrameUrl('http://example.com/'), 'http://example.com/')
    assert.equal(safeFrameUrl('/embedded.html'), 'https://razorbox.invalid/embedded.html')
  })

  test('rejects script, data and empty URLs', () => {
    assert.equal(safeFrameUrl('javascript:alert(1)'), '')
    assert.equal(safeFrameUrl('data:text/html,hello'), '')
    assert.equal(safeFrameUrl('JaVaScRiPt:alert(1)'), '')
    assert.equal(safeFrameUrl(''), '')
    assert.equal(safeFrameUrl(undefined), '')
  })
})

describe('providerReference', () => {
  const id = 'lPYHfdapsEY'

  test('recognizes YouTube URL variants', () => {
    for (const src of [
      `https://www.youtube.com/watch?v=${id}`,
      `https://youtu.be/${id}`,
      `https://m.youtube.com/watch?v=${id}&t=10`,
      `https://www.youtube.com/embed/${id}?autoplay=0`,
      `https://www.youtube.com/shorts/${id}`,
      `https://www.youtube.com/live/${id}`,
      `https://www.youtube-nocookie.com/embed/${id}`,
      `https://music.youtube.com/watch?v=${id}`
    ]) {
      assert.deepEqual(providerReference(src), { type: 'youtube', id }, src)
    }
  })

  test('rejects malformed YouTube IDs and lookalike hosts', () => {
    assert.equal(providerReference('https://www.youtube.com/watch?v=short'), null)
    assert.equal(providerReference(`https://www.youtube.com/watch?v=${id}x`), null)
    assert.equal(providerReference(`https://youtube.com.evil.test/watch?v=${id}`), null)
    assert.equal(providerReference(`https://notyoutube.com/watch?v=${id}`), null)
  })

  test('recognizes Vimeo URLs and keeps unlisted hashes', () => {
    assert.deepEqual(providerReference('https://vimeo.com/253905163'), { type: 'vimeo', id: '253905163', hash: '' })
    assert.deepEqual(providerReference('https://player.vimeo.com/video/253905163'), { type: 'vimeo', id: '253905163', hash: '' })
    assert.deepEqual(providerReference('https://vimeo.com/253905163?h=abcdef12'), { type: 'vimeo', id: '253905163', hash: 'abcdef12' })
    assert.deepEqual(providerReference('https://vimeo.com/253905163/abcdef12'), { type: 'vimeo', id: '253905163', hash: 'abcdef12' })
  })

  test('drops unsafe Vimeo hashes and non-numeric IDs', () => {
    assert.deepEqual(providerReference('https://vimeo.com/253905163?h=a%22b'), { type: 'vimeo', id: '253905163', hash: '' })
    assert.equal(providerReference('https://vimeo.com/channels'), null)
  })

  test('ignores non-http protocols and unrelated URLs', () => {
    assert.equal(providerReference(`javascript://youtube.com/watch?v=${id}`), null)
    assert.equal(providerReference('https://example.com/video.mp4'), null)
  })
})

describe('googleMapsUrl and mapQuery', () => {
  test('accepts Google Maps hosts and paths', () => {
    assert.ok(googleMapsUrl('https://www.google.com/maps/search/?api=1&query=Berlin'))
    assert.ok(googleMapsUrl('https://maps.google.de/?q=Berlin'))
    assert.ok(googleMapsUrl('https://www.google.fr/maps/place/Paris'))
  })

  test('rejects other hosts, paths and protocols', () => {
    assert.equal(googleMapsUrl('https://www.google.com/search?q=Berlin'), null)
    assert.equal(googleMapsUrl('https://maps.example.com/maps?q=Berlin'), null)
    assert.equal(googleMapsUrl('https://www.google.co.uk/maps?q=Berlin'), null)
    assert.equal(googleMapsUrl('ftp://www.google.com/maps'), null)
  })

  test('extracts the query from parameters, place paths and coordinates', () => {
    assert.equal(mapQuery(new URL('https://www.google.com/maps/search/?api=1&query=Empire+State+Building')), 'Empire State Building')
    assert.equal(mapQuery(new URL('https://maps.google.com/?q=Berlin')), 'Berlin')
    assert.equal(mapQuery(new URL('https://www.google.com/maps/place/Brandenburger+Tor')), 'Brandenburger Tor')
    assert.equal(mapQuery(new URL('https://www.google.com/maps/@52.5163,13.3777,17z')), '52.5163,13.3777')
    assert.equal(mapQuery(new URL('https://www.google.com/maps')), '')
  })

  test('keeps a malformed percent-encoded place name instead of throwing', () => {
    assert.equal(mapQuery(new URL('https://www.google.com/maps/place/100%')), '100%')
  })
})

describe('normalizeItem', () => {
  test('detects types automatically', () => {
    assert.equal(normalizeItem('/images/a.jpg').type, 'image')
    assert.equal(normalizeItem('/media/clip.mp4').type, 'video')
    assert.equal(normalizeItem('/media/clip.webm?v=2').type, 'video')
    assert.equal(normalizeItem('/files/doc.pdf#page=2').type, 'pdf')
    assert.equal(normalizeItem('https://youtu.be/lPYHfdapsEY').type, 'youtube')
    assert.equal(normalizeItem('https://vimeo.com/253905163').type, 'vimeo')
    assert.equal(normalizeItem('https://www.google.com/maps/search/?api=1&query=Berlin').type, 'map')
  })

  test('maps html5 to video and upgrades iframes of known providers', () => {
    assert.equal(normalizeItem({ src: '/clip.mp4', type: 'html5' }).type, 'video')
    assert.equal(normalizeItem({ src: 'https://www.youtube.com/embed/lPYHfdapsEY', type: 'iframe' }).type, 'youtube')
    assert.equal(normalizeItem({ src: 'https://www.google.com/maps?q=Berlin', type: 'iframe' }).type, 'map')
    assert.equal(normalizeItem({ src: '/doc.pdf', type: 'iframe' }).type, 'pdf')
  })

  test('rejects invalid input', () => {
    assert.equal(normalizeItem(null), null)
    assert.equal(normalizeItem(42), null)
    assert.equal(normalizeItem({}), null)
    assert.equal(normalizeItem({ src: '/a.jpg', type: 'flash' }), null)
    assert.equal(normalizeItem({ src: 'https://example.com/', type: 'youtube' }), null)
    assert.equal(normalizeItem({ src: 'javascript:alert(1)', type: 'iframe' }), null)
    assert.equal(normalizeItem({ src: 'data:text/html,x', type: 'pdf' }), null)
  })

  test('html items need an #id or explicit markup', () => {
    assert.equal(normalizeItem({ type: 'html', src: '#content' }).src, '#content')
    assert.equal(normalizeItem({ type: 'html', html: '<p>Hi</p>' }).html, '<p>Hi</p>')
    assert.equal(normalizeItem({ type: 'html', src: '#' }), null)
    assert.equal(normalizeItem({ type: 'html', src: '<p>Hi</p>' }), null)
  })

  test('fills thumbnails and string fields', () => {
    const image = normalizeItem({ src: ' /a.jpg ', caption: 7 })
    assert.equal(image.src, '/a.jpg')
    assert.equal(image.thumb, '/a.jpg')
    assert.equal(image.caption, '7')
    assert.equal(image.alt, '')
    assert.equal(normalizeItem({ src: '/clip.mp4', poster: '/poster.jpg' }).thumb, '/poster.jpg')
    assert.equal(normalizeItem({ src: '/clip.mp4' }).thumb, '')
    assert.equal(normalizeItem({ src: '/a.jpg', thumb: '/t.jpg' }).thumb, '/t.jpg')
  })
})

describe('providerEmbedUrl', () => {
  const youtube = normalizeItem('https://www.youtube.com/watch?v=lPYHfdapsEY')
  const vimeo = normalizeItem('https://vimeo.com/253905163?h=abcdef12')

  test('uses the privacy domain for YouTube by default and never autoplay=1', () => {
    const url = new URL(providerEmbedUrl(youtube))
    assert.equal(url.hostname, 'www.youtube-nocookie.com')
    assert.equal(url.pathname, '/embed/lPYHfdapsEY')
    assert.equal(url.searchParams.get('enablejsapi'), '1')
    assert.equal(url.searchParams.get('playsinline'), '1')
    assert.equal(url.searchParams.has('autoplay'), false)
    assert.equal(url.searchParams.has('mute'), false)
    assert.equal(url.searchParams.has('origin'), false)
  })

  test('respects privacy and muted options', () => {
    assert.equal(new URL(providerEmbedUrl(youtube, { privacy: false })).hostname, 'www.youtube.com')
    assert.equal(new URL(providerEmbedUrl(youtube, { muted: true })).searchParams.get('mute'), '1')
    const url = new URL(providerEmbedUrl(vimeo, { privacy: false, muted: true }))
    assert.equal(url.searchParams.get('dnt'), '0')
    assert.equal(url.searchParams.get('muted'), '1')
  })

  test('keeps the Vimeo hash with dnt=1', () => {
    const url = new URL(providerEmbedUrl(vimeo))
    assert.equal(url.hostname, 'player.vimeo.com')
    assert.equal(url.searchParams.get('h'), 'abcdef12')
    assert.equal(url.searchParams.get('dnt'), '1')
  })

  test('returns an empty string when type and URL disagree', () => {
    assert.equal(providerEmbedUrl({ src: 'https://vimeo.com/253905163', type: 'youtube' }), '')
    assert.equal(providerEmbedUrl({ src: '/clip.mp4', type: 'video' }), '')
  })
})

describe('mapEmbedUrl', () => {
  const map = normalizeItem('https://www.google.com/maps/search/?api=1&query=Empire+State+Building&query_place_id=abc')

  test('builds a compatibility embed without an API key', () => {
    const url = new URL(mapEmbedUrl(map, { locale: 'de' }))
    assert.equal(url.href.startsWith('https://maps.google.com/maps?'), true)
    assert.equal(url.searchParams.get('q'), 'Empire State Building')
    assert.equal(url.searchParams.get('output'), 'embed')
    assert.equal(url.searchParams.get('hl'), 'de')
  })

  test('uses the official Embed API with a key and place ID', () => {
    const url = new URL(mapEmbedUrl(map, { apiKey: 'KEY', locale: 'fr' }))
    assert.equal(url.pathname, '/maps/embed/v1/place')
    assert.equal(url.searchParams.get('key'), 'KEY')
    assert.equal(url.searchParams.get('q'), 'place_id:abc')
    assert.equal(url.searchParams.get('language'), 'fr')
  })

  test('prefers explicit embed URLs', () => {
    const embedSrc = 'https://www.google.com/maps/embed?pb=xyz'
    assert.equal(mapEmbedUrl({ ...map, embedSrc }), embedSrc)
    assert.equal(mapEmbedUrl({ src: embedSrc, embedSrc: '' }), embedSrc)
  })

  test('returns an empty string without a usable query', () => {
    assert.equal(mapEmbedUrl({ src: 'https://www.google.com/maps', embedSrc: '' }), '')
    assert.equal(mapEmbedUrl({ src: 'https://example.com/', embedSrc: '' }), '')
  })
})
