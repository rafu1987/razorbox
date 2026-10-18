import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { parseSubject, buildSection, hasSection, insertSection } from '../../scripts/changelog.mjs'

describe('parseSubject', () => {
  test('groups by prefix and strips it', () => {
    assert.deepEqual(parseSubject('[BUGFIX] Fix CI on Node 22'), { group: 'BUGFIX', text: 'Fix CI on Node 22' })
    assert.deepEqual(parseSubject('[TASK] Add unit tests'), { group: 'TASK', text: 'Add unit tests' })
    assert.deepEqual(parseSubject('[feature] Lowercase prefix'), { group: 'FEATURE', text: 'Lowercase prefix' })
  })

  test('marks [!!!] as breaking regardless of the second prefix', () => {
    assert.deepEqual(parseSubject('[!!!][FEATURE] Rename option'), { group: '!!!', text: 'Rename option' })
    assert.deepEqual(parseSubject('[!!!] [TASK] Drop Node 18'), { group: '!!!', text: 'Drop Node 18' })
  })

  test('unknown or missing prefixes go to Other', () => {
    assert.deepEqual(parseSubject('[WIP] Something'), { group: '', text: 'Something' })
    assert.deepEqual(parseSubject('Plain subject'), { group: '', text: 'Plain subject' })
  })
})

describe('buildSection', () => {
  test('orders groups and skips release and merge commits', () => {
    const section = buildSection('1.2.0', '2026-10-18', [
      '[TASK] Add tests',
      'Release v1.1.0',
      '[BUGFIX] Fix focus',
      'Merge branch main',
      '[!!!][FEATURE] Rename open()',
      '[FEATURE] Add zoom'
    ])
    assert.equal(section, [
      '## 1.2.0 - 2026-10-18',
      '',
      '### Breaking changes',
      '',
      '- Rename open()',
      '',
      '### Features',
      '',
      '- Add zoom',
      '',
      '### Bug fixes',
      '',
      '- Fix focus',
      '',
      '### Tasks',
      '',
      '- Add tests',
      ''
    ].join('\n'))
  })

  test('notes an empty release', () => {
    assert.equal(buildSection('1.0.1', '2026-10-18', ['Release v1.0.0']), '## 1.0.1 - 2026-10-18\n\n- No notable changes.\n')
  })
})

describe('hasSection and insertSection', () => {
  const changelog = '# Changelog\n\n## 1.0.0 - 2026-01-01\n\n- First\n'

  test('finds existing sections with or without a date', () => {
    assert.equal(hasSection(changelog, '1.0.0'), true)
    assert.equal(hasSection('## 0.7.0-alpha.7\n', '0.7.0-alpha.7'), true)
    assert.equal(hasSection(changelog, '1.0'), false)
  })

  test('inserts above the newest section and keeps any intro', () => {
    assert.equal(insertSection(changelog, '## 1.1.0 - 2026-02-01\n\n- Second\n'),
      '# Changelog\n\n## 1.1.0 - 2026-02-01\n\n- Second\n\n## 1.0.0 - 2026-01-01\n\n- First\n')
  })

  test('works on an empty changelog', () => {
    assert.equal(insertSection('', '## 1.0.0 - 2026-01-01\n'), '## 1.0.0 - 2026-01-01\n')
  })
})
