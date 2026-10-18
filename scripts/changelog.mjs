// Adds a "## <version> - <date>" section to CHANGELOG.md, built from the commit
// subjects since the previous tag and grouped by their [PREFIX]. Runs in the npm
// "version" lifecycle (yarn release), so npm_package_version is the new version.
// A section that already exists for the version is left untouched.
import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'

export const GROUPS = [
  ['!!!', 'Breaking changes'],
  ['SECURITY', 'Security'],
  ['FEATURE', 'Features'],
  ['BUGFIX', 'Bug fixes'],
  ['TASK', 'Tasks'],
  ['DOCS', 'Documentation'],
  ['', 'Other']
]

// Release commits and merge commits carry no information for readers.
const IGNORED = /^(Release v\d|Merge (branch|pull request) )/

// "[BUGFIX] Fix x" -> BUGFIX; "[!!!][FEATURE] Change y" -> breaking change.
export function parseSubject (subject) {
  const match = subject.match(/^((?:\[[^\]]+\]\s*)+)(.+)$/)
  if (!match) return { group: '', text: subject.trim() }
  const tags = [...match[1].matchAll(/\[([^\]]+)\]/g)].map(([, tag]) => tag.trim().toUpperCase())
  const prefix = tags.find(tag => tag !== '!!!') ?? ''
  const group = tags.includes('!!!') ? '!!!' : GROUPS.some(([key]) => key === prefix) ? prefix : ''
  return { group, text: match[2].trim() }
}

export function buildSection (version, date, subjects) {
  const entries = subjects.filter(subject => subject && !IGNORED.test(subject)).map(parseSubject)
  let section = `## ${version} - ${date}\n`
  if (!entries.length) return `${section}\n- No notable changes.\n`
  for (const [key, title] of GROUPS) {
    const items = entries.filter(entry => entry.group === key)
    if (!items.length) continue
    section += `\n### ${title}\n\n${items.map(entry => `- ${entry.text}`).join('\n')}\n`
  }
  return section
}

export function hasSection (changelog, version) {
  return changelog.split('\n').some(line => line.startsWith('## ') && line.slice(3).split(/\s/)[0] === version)
}

export function insertSection (changelog, section) {
  const firstSection = changelog.search(/^## /m)
  if (firstSection === -1) return `${changelog.trimEnd()}\n\n${section}`.trimStart()
  return `${changelog.slice(0, firstSection)}${section}\n${changelog.slice(firstSection)}`
}

function git (...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

async function main () {
  const version = process.env.npm_package_version
  if (!version) throw new Error('npm_package_version is not set. Run this through "yarn release" or "npm version".')
  const file = fileURLToPath(new URL('../CHANGELOG.md', import.meta.url))
  const changelog = await readFile(file, 'utf8')
  if (hasSection(changelog, version)) {
    console.log(`CHANGELOG.md already has a section for ${version}; leaving it as is.`)
    return
  }
  let range = 'HEAD'
  try { range = `${git('describe', '--tags', '--abbrev=0', '--match', 'v*')}..HEAD` } catch { /* first release */ }
  const subjects = git('log', range, '--no-merges', '--format=%s').split('\n').reverse()
  const date = new Date().toISOString().slice(0, 10)
  await writeFile(file, insertSection(changelog, buildSection(version, date, subjects)))
  console.log(`CHANGELOG.md: added ${version} from ${range}.`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main()
