/* Shared Chromium/CDP harness for the browser tests. Node built-ins only. */
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { existsSync, readFileSync } from 'node:fs'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const candidates = [
  process.env.CHROMIUM_PATH,
  '/usr/bin/chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium'
]
export const chromium = candidates.find(file => file && existsSync(file))

// CI sets RAZORBOX_REQUIRE_BROWSER=1 so a missing or broken browser fails the
// run instead of silently skipping every browser test.
const browserRequired = Boolean(process.env.RAZORBOX_REQUIRE_BROWSER)
if (browserRequired && !chromium) throw new Error('RAZORBOX_REQUIRE_BROWSER is set, but no Chromium binary was found. Set CHROMIUM_PATH.')

function skipOrFail (t, reason) {
  if (browserRequired) throw new Error(reason)
  t.skip(reason)
}

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
export async function waitUntil (predicate, timeoutMs = 7000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    try {
      const value = await predicate()
      if (value) return value
    } catch { /* wait */ }
    await sleep(80)
  }
  throw new Error('Timed out waiting for browser readiness.')
}

const contentTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json', '.mp4': 'video/mp4', '.pdf': 'application/pdf' }

async function startServer () {
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
      const file = path.resolve(projectRoot, `.${pathname}`)
      if (!file.startsWith(`${projectRoot}${path.sep}`)) { res.writeHead(403).end(); return }
      const data = await readFile(file)
      res.writeHead(200, { 'content-type': contentTypes[path.extname(file)] ?? 'application/octet-stream' })
      res.end(data)
    } catch {
      res.writeHead(404).end('Not found')
    }
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  return { server, port: server.address().port }
}

async function loadInlineFixture (browser) {
  // Browser integration fallback for environments whose Chrome policy blocks
  // even localhost navigation. Test fixture styles are authored into the page
  // before the library starts, never injected by razorbox itself.
  let html = await readFile(path.join(projectRoot, 'demo.html'), 'utf8')
  // Inline every local media file the page links to as a data: URL.
  const mime = { '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4' }
  for (const ref of new Set(html.match(/\.\/demo\/assets\/[\w./-]+\.(?:jpg|svg|mp4)/g) || [])) {
    const data = await readFile(path.join(projectRoot, ref))
    html = html.replaceAll(ref, `data:${mime[path.extname(ref)]};base64,${data.toString('base64')}`)
  }
  const body = html.split('<body>')[1].split('</body>')[0]
  const demoCss = await readFile(path.join(projectRoot, 'demo/demo.css'), 'utf8')
  const libraryCss = await readFile(path.join(projectRoot, 'dist/razorbox.css'), 'utf8')
  // The source is split into ES modules, so inline the self-contained bundle.
  const source = (await readFile(path.join(projectRoot, 'dist/razorbox.js'), 'utf8'))
    .replace(/^export \{[\s\S]*?\};?$/m, '')
  const demoScript = (await readFile(path.join(projectRoot, 'demo/main.js'), 'utf8'))
    .replace(/^import razorbox from '\.\.\/src\/razorbox\.js'\n/m, '')
  await browser.eval(`(function () { document.head.innerHTML = ${JSON.stringify(`<meta name="viewport" content="width=device-width,initial-scale=1"><base href="https://razorbox.invalid/"><style>${demoCss}</style><style>${libraryCss}</style>`)}; document.body.innerHTML = ${JSON.stringify(body)}; return true; })()`)
  await browser.eval(`(function () { ${source}\n${demoScript}\nreturn true; })()`)
}

async function connectCdp (url) {
  const socket = new WebSocket(url)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  let id = 0
  const pending = new Map()
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (!message.id) return
    const current = pending.get(message.id)
    if (!current) return
    pending.delete(message.id)
    if (message.error) current.reject(new Error(message.error.message))
    else current.resolve(message.result)
  })
  return {
    close () { socket.close() },
    call (method, params = {}) {
      const next = ++id
      return new Promise((resolve, reject) => {
        pending.set(next, { resolve, reject })
        socket.send(JSON.stringify({ id: next, method, params }))
      })
    },
    async eval (expression) {
      const result = await this.call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
      return result.result.value
    }
  }
}

// Starts headless Chromium on demo.html and passes the CDP client to run().
// Skips the test when the environment cannot run a debuggable browser.
export async function withDemo (t, run) {
  const { server, port } = await startServer()
  const profile = await mkdtemp(path.join(os.tmpdir(), 'razorbox-cdp-'))
  const processHandle = spawn(chromium, [
    '--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--autoplay-policy=no-user-gesture-required',
    '--disable-extensions', '--no-first-run', '--disable-background-networking',
    '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    'about:blank'
  ], { stdio: 'ignore' })
  let browser
  try {
    let debuggerPort
    try {
      debuggerPort = await waitUntil(async () => {
        const file = path.join(profile, 'DevToolsActivePort')
        return existsSync(file) ? Number(readFileSync(file, 'utf8').split('\n')[0]) : null
      }, 12000)
    } catch {
      skipOrFail(t, 'Chromium did not start a debugging session in this environment.')
      return
    }

    const target = await waitUntil(async () => {
      const response = await fetch(`http://127.0.0.1:${debuggerPort}/json/list`)
      const pages = await response.json()
      return pages.find(page => page.type === 'page') || null
    })
    browser = await connectCdp(target.webSocketDebuggerUrl)
    await browser.call('Runtime.enable')
    await browser.call('Page.enable')
    await browser.call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false })
    const navResult = await browser.call('Page.navigate', { url: `http://127.0.0.1:${port}/demo.html` })
    if (navResult.errorText?.includes('ERR_BLOCKED_BY_ADMINISTRATOR')) {
      const blank = await browser.call('Page.navigate', { url: 'about:blank' })
      if (blank.errorText) {
        skipOrFail(t, 'This Chromium installation blocks test pages and about:blank.')
        return
      }
      await loadInlineFixture(browser)
    }
    if (navResult.errorText && !navResult.errorText.includes('ERR_BLOCKED_BY_ADMINISTRATOR')) throw new Error(`Browser navigation failed: ${navResult.errorText}`)
    await waitUntil(() => browser.eval('Boolean(window.razorboxDemo && document.querySelectorAll(".gallery-card").length === 6)'))
    await run(browser)
  } finally {
    browser?.close()
    server.close()
    if (processHandle.exitCode === null) {
      const exited = once(processHandle, 'exit')
      processHandle.kill('SIGKILL')
      await Promise.race([exited, sleep(1800)])
    }
    await rm(profile, { recursive: true, force: true, maxRetries: 20, retryDelay: 150 })
  }
}
