// Renders README.md as a printable page in the demo's style and prints it to
// demo/assets/razorbox-readme.pdf with headless Chrome or Chromium. The PDF is
// generated, not committed: `yarn dev` and `yarn build:demo` run this script.
// CHROMIUM_PATH overrides the browser. With --optional, a missing browser only
// warns, so `yarn dev` still starts.
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { marked } from 'marked'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.join(root, 'demo/assets/razorbox-readme.pdf')
const repo = 'https://github.com/rafu1987/razorbox/blob/main/'

const browser = [
  process.env.CHROMIUM_PATH,
  '/usr/bin/chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium'
].find(file => file && existsSync(file))
if (!browser) {
  const message = 'No Chrome or Chromium found for the demo PDF. Set CHROMIUM_PATH.'
  if (!process.argv.includes('--optional')) throw new Error(message)
  console.warn(`${message} Skipping it.`)
  process.exit(0)
}

const { version } = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const markdown = (await readFile(path.join(root, 'README.md'), 'utf8'))
  // The cover replaces the title; badges load from external services.
  .replace(/^# .*\n/, '')
  .replace(/^\[!\[.*$\n?/gm, '')
  // Repository-relative links only work on GitHub.
  .replace(/\]\((?!https?:|#)([^)]+)\)/g, (_, target) => `](${repo}${target})`)
const body = marked.parse(markdown)
const fonts = pathToFileURL(path.join(root, 'demo/fonts/')).href
const date = new Date().toISOString().slice(0, 10)

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>razorbox ${version} README</title>
<style>
  @font-face { font-family: "Instrument Serif"; src: url("${fonts}instrument-serif-latin-400-normal.woff2"); }
  @font-face { font-family: "Instrument Serif"; font-style: italic; src: url("${fonts}instrument-serif-latin-400-italic.woff2"); }
  @font-face { font-family: Inter; font-weight: 100 900; src: url("${fonts}inter-latin-wght-normal.woff2"); }
  @font-face { font-family: "JetBrains Mono"; font-weight: 100 800; src: url("${fonts}jetbrains-mono-latin-wght-normal.woff2"); }
  @page { size: A4; margin: 20mm 18mm 22mm; }
  @page { @bottom-left { content: "razorbox ${version}"; font: 8pt "JetBrains Mono", monospace; color: #8a8174; } }
  @page { @bottom-right { content: counter(page) " / " counter(pages); font: 8pt "JetBrains Mono", monospace; color: #8a8174; } }
  :root { --ink: #1b1916; --muted: #6f675c; --line: #ddd4c6; --paper-dark: #efe8dc; --safelight: #d9431f; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 9.6pt/1.6 Inter, sans-serif; color: var(--ink); background: #fff; }
  .cover { padding: 0 0 14mm; margin-bottom: 10mm; border-bottom: 1.5pt solid var(--safelight); }
  .cover p { margin: 0; font: 8pt "JetBrains Mono", monospace; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
  .cover h1 { margin: 6mm 0 3mm; font: 400 54pt/0.9 "Instrument Serif", serif; letter-spacing: -.02em; }
  .cover h1 em { color: var(--safelight); }
  h2 { margin: 9mm 0 3mm; font: 400 22pt/1.1 "Instrument Serif", serif; break-after: avoid; }
  h3 { margin: 6mm 0 2mm; font: 600 10.5pt/1.3 Inter, sans-serif; break-after: avoid; }
  h2 + p, h3 + p { margin-top: 0; }
  p, ul, ol { margin: 0 0 3mm; }
  a { color: var(--safelight); text-decoration: none; }
  strong { font-weight: 650; }
  code { font: 8.4pt "JetBrains Mono", monospace; padding: 0 2px; background: var(--paper-dark); }
  pre { margin: 0 0 4mm; padding: 3.5mm 4mm; background: var(--paper-dark); border-left: 2pt solid var(--safelight); white-space: pre-wrap; break-inside: avoid; }
  pre code { padding: 0; background: none; font-size: 8pt; line-height: 1.55; }
  table { width: 100%; margin: 0 0 4mm; border-collapse: collapse; font-size: 8.4pt; }
  thead { display: table-header-group; }
  tr { break-inside: avoid; }
  th, td { padding: 1.6mm 2mm 1.6mm 0; text-align: left; vertical-align: top; border-bottom: .5pt solid var(--line); }
  th { font: 600 7.4pt "JetBrains Mono", monospace; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); border-bottom-color: var(--ink); }
  kbd { font: 8pt "JetBrains Mono", monospace; padding: 0 3px; border: .5pt solid var(--line); border-bottom-width: 1pt; }
</style>
</head>
<body>
  <header class="cover">
    <p>Vanilla JS lightbox · v${version} · ${date}</p>
    <h1>razor<em>box</em></h1>
    <p>README · github.com/rafu1987/razorbox</p>
  </header>
  ${body}
</body>
</html>`

const work = await mkdtemp(path.join(os.tmpdir(), 'razorbox-pdf-'))
try {
  const page = path.join(work, 'readme.html')
  await writeFile(page, html)
  execFileSync(browser, [
    '--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--user-data-dir=${path.join(work, 'profile')}`,
    '--virtual-time-budget=4000', '--allow-file-access-from-files',
    `--print-to-pdf=${output}`, pathToFileURL(page).href
  ], { stdio: 'ignore' })
} finally {
  await rm(work, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
}
console.log(`Wrote ${path.relative(root, output)}`)
