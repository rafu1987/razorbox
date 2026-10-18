import { test, describe, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { LOCALES, supportedLocale, detectLocale, formatMessage } from '../../src/i18n.js'

// detectLocale reads <html lang> and navigator languages; stub just those.
function stubBrowser ({ lang = '', languages = [], language = '' } = {}) {
  for (const [name, value] of Object.entries({
    document: { documentElement: { lang } },
    navigator: { languages, language }
  })) {
    Object.defineProperty(globalThis, name, { value, configurable: true, writable: true })
  }
}

const originals = {
  document: Object.getOwnPropertyDescriptor(globalThis, 'document'),
  navigator: Object.getOwnPropertyDescriptor(globalThis, 'navigator')
}

afterEach(() => {
  for (const [name, descriptor] of Object.entries(originals)) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor)
    else delete globalThis[name]
  }
})

describe('LOCALES', () => {
  test('every locale defines the same keys as English', () => {
    const keys = Object.keys(LOCALES.en).sort()
    for (const [code, strings] of Object.entries(LOCALES)) {
      assert.deepEqual(Object.keys(strings).sort(), keys, `${code} is missing or has extra keys`)
    }
  })

  test('placeholders match the English source', () => {
    const placeholders = value => (value.match(/\{\w+\}/g) || []).sort()
    for (const [code, strings] of Object.entries(LOCALES)) {
      for (const [key, value] of Object.entries(strings)) {
        assert.deepEqual(placeholders(value), placeholders(LOCALES.en[key]), `${code}.${key}`)
      }
    }
  })
})

describe('supportedLocale', () => {
  test('normalizes region and case', () => {
    assert.equal(supportedLocale('de-DE'), 'de')
    assert.equal(supportedLocale('FR_ca'), 'fr')
    assert.equal(supportedLocale(' en '), 'en')
  })

  test('returns an empty string for unsupported values', () => {
    assert.equal(supportedLocale('es'), '')
    assert.equal(supportedLocale(''), '')
    assert.equal(supportedLocale(undefined), '')
    assert.equal(supportedLocale('toString'), '')
  })
})

describe('detectLocale', () => {
  test('an explicit locale wins, falling back to English', () => {
    stubBrowser({ lang: 'fr' })
    assert.equal(detectLocale('de'), 'de')
    assert.equal(detectLocale('es'), 'en')
  })

  test('auto prefers <html lang> over browser languages', () => {
    stubBrowser({ lang: 'de-AT', languages: ['fr-FR'], language: 'fr-FR' })
    assert.equal(detectLocale('auto'), 'de')
  })

  test('auto falls back to the first supported browser language', () => {
    stubBrowser({ lang: 'es', languages: ['es-ES', 'fr-FR', 'de'], language: 'es-ES' })
    assert.equal(detectLocale(), 'fr')
  })

  test('auto ends at English', () => {
    stubBrowser({ lang: '', languages: ['es'], language: 'it' })
    assert.equal(detectLocale(), 'en')
  })
})

describe('formatMessage', () => {
  test('replaces known placeholders and keeps unknown ones', () => {
    assert.equal(formatMessage('Image {number} of {total}', { number: 2, total: 5 }), 'Image 2 of 5')
    assert.equal(formatMessage('Hello {name}', {}), 'Hello {name}')
    assert.equal(formatMessage('Zero {n}', { n: 0 }), 'Zero 0')
  })
})
