/**
 * Electron shell for the AdminHub21 desktop demo.
 *
 * Two local servers start before the window opens, both from the bundled app:
 *   1. the demo API (seeded data, Laravel-compatible contract) on 127.0.0.1:41731
 *   2. the standalone Next.js server on 127.0.0.1:41730
 *
 * Nothing here reaches the network: `NEXT_PUBLIC_API_BASE_URL` is baked to
 * 127.0.0.1:41731 at build time, so every screen — public pages and the
 * authenticated workspace — runs on the in-memory dataset.
 */
const { app, BrowserWindow, Menu, dialog, shell } = require("electron")
const { fork } = require("node:child_process")
const http = require("node:http")
const path = require("node:path")

const WEB_PORT = Number(process.env.ADMINHUB_WEB_PORT ?? 41730)
const API_PORT = Number(process.env.ADMINHUB_API_PORT ?? 41731)
const WEB_URL = `http://127.0.0.1:${WEB_PORT}`

const ROOT = __dirname
const APP_DIR = path.join(ROOT, "app")
const NEXT_SERVER = path.join(APP_DIR, "apps", "web", "server.js")
const DEMO_API = path.join(ROOT, "build", "demo-api.cjs")

/** @type {import('node:child_process').ChildProcess[]} */
const children = []
let window = null
let shuttingDown = false

function log(...args) {
  console.log("[desktop]", ...args)
}

function startServer(label, script, env) {
  const child = fork(script, [], {
    cwd: path.dirname(script),
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      NEXT_TELEMETRY_DISABLED: "1",
      ...env,
    },
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  })

  child.stdout?.on("data", (chunk) => log(`[${label}]`, chunk.toString().trim()))
  child.stderr?.on("data", (chunk) => log(`[${label}]`, chunk.toString().trim()))
  child.on("exit", (code) => {
    log(`[${label}] exited with`, code)
    if (!shuttingDown && code !== 0) {
      dialog.showErrorBox("AdminHub21", `سرویس ${label} متوقف شد (کد ${code}). برنامه بسته می‌شود.`)
      app.quit()
    }
  })

  children.push(child)
  return child
}

function waitFor(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const request = http.get(url, (response) => {
        response.resume()
        if (response.statusCode && response.statusCode < 500) return resolve()
        retry()
      })

      request.on("error", retry)
      request.setTimeout(2000, () => request.destroy())
    }

    const retry = () => {
      if (Date.now() > deadline) return reject(new Error(`timeout waiting for ${url}`))
      setTimeout(attempt, 300)
    }

    attempt()
  })
}

function createWindow() {
  window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: "#f2f5fa",
    show: false,
    autoHideMenuBar: true,
    title: "AdminHub21",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  window.once("ready-to-show", () => window?.show())
  window.on("closed", () => {
    window = null
  })

  // Links to the outside world open in the user's browser, never in the shell.
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(WEB_URL)) shell.openExternal(url)
    return { action: "deny" }
  })

  window.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(WEB_URL)) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  window.loadURL(WEB_URL)
}

async function boot() {
  try {
    startServer("demo-api", DEMO_API, {
      PREVIEW_GATEWAY_PORT: String(API_PORT),
      PREVIEW_GATEWAY_HOST: "127.0.0.1",
    })

    startServer("next", NEXT_SERVER, {
      PORT: String(WEB_PORT),
      HOSTNAME: "127.0.0.1",
    })

    await waitFor(`http://127.0.0.1:${API_PORT}/api/v1/health`)
    await waitFor(`${WEB_URL}/`)

    log("ready", WEB_URL)
    createWindow()
  } catch (error) {
    dialog.showErrorBox(
      "AdminHub21",
      `راه‌اندازی برنامه ممکن نشد.\n\n${String(error)}\n\n` +
        `بررسی کنید که پورت‌های ${WEB_PORT} و ${API_PORT} آزاد باشند.`,
    )
    app.quit()
  }
}

// A second launch focuses the open window instead of starting another pair of
// servers on the same ports.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on("second-instance", () => {
    if (!window) return
    if (window.isMinimized()) window.restore()
    window.focus()
  })

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null)
    boot()
  })
}

app.on("window-all-closed", () => app.quit())

app.on("before-quit", () => {
  shuttingDown = true
  for (const child of children) {
    try {
      child.kill()
    } catch {
      // the process may already be gone
    }
  }
})
