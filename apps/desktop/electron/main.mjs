/**
 * Electron main process for the AdminHub21 desktop demo.
 *
 * Boot order: start the local demo server on an ephemeral loopback port, then
 * point the window at it. The renderer therefore uses relative URLs exactly
 * like it does against Laravel — nothing about the API origin is baked into the
 * Vite bundle.
 *
 * Security posture (this app is shipped to end users, so all of it matters):
 *   - contextIsolation on, nodeIntegration off, sandboxed renderer
 *   - every permission request denied; no camera/mic/geolocation from a demo
 *   - navigation to any origin other than the loopback server is blocked
 *   - `window.open` / target=_blank is handed to the OS browser instead
 *   - the API key never reaches the renderer: it is encrypted with the OS
 *     keychain via safeStorage and only ever read inside the main process
 */
import { app, BrowserWindow, Menu, dialog, ipcMain, safeStorage, session, shell } from "electron"
import { createRequire } from "node:module"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

const isDev = !app.isPackaged
const PRODUCT = "AdminHub21 Demo"

/** Renderer assets: bundled next to the app, or the workspace `dist/` in dev. */
const rendererDir = app.isPackaged
  ? join(process.resourcesPath, "renderer")
  : join(__dirname, "..", "renderer")

const settingsPath = join(app.getPath("userData"), "settings.json")

process.env.ADMINHUB_DESKTOP = "1"
process.env.ADMINHUB_RENDERER_DIR = rendererDir
process.env.ADMINHUB_SETTINGS_PATH = settingsPath
process.env.ADMINHUB_VERSION = app.getVersion()

const cryptoBridge = {
  encrypt: (value) => {
    try {
      if (!safeStorage.isEncryptionAvailable()) return null
      return safeStorage.encryptString(value).toString("base64")
    } catch {
      return null
    }
  },
  decrypt: (value) => {
    try {
      if (!safeStorage.isEncryptionAvailable()) return null
      return safeStorage.decryptString(Buffer.from(value, "base64"))
    } catch {
      return null
    }
  },
}

let mainWindow = null
let demoServer = null

function buildMenu(win) {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Settings…",
          accelerator: "CmdOrCtrl+,",
          click: () => win.webContents.send("adminhub:command", "settings"),
        },
        { type: "separator" },
        {
          label: "Open data folder",
          click: () => shell.openPath(app.getPath("userData")),
        },
        { type: "separator" },
        { role: "quit", label: "Quit" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Go",
      submenu: [
        {
          label: "Dashboard",
          accelerator: "CmdOrCtrl+1",
          click: () => win.webContents.send("adminhub:command", "go:/"),
        },
        {
          label: "Marketplace",
          accelerator: "CmdOrCtrl+2",
          click: () => win.webContents.send("adminhub:command", "go:/marketplace"),
        },
        {
          label: "Packages",
          accelerator: "CmdOrCtrl+3",
          click: () => win.webContents.send("adminhub:command", "go:/packages"),
        },
        {
          label: "AI assistant",
          accelerator: "CmdOrCtrl+4",
          click: () => win.webContents.send("adminhub:command", "go:/ai"),
        },
        { type: "separator" },
        {
          label: "MCP chat bar",
          accelerator: "CmdOrCtrl+K",
          click: () => win.webContents.send("adminhub:command", "chat"),
        },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Keyboard shortcuts",
          click: () =>
            dialog.showMessageBox(win, {
              type: "info",
              title: "Keyboard shortcuts",
              message:
                "Ctrl+K — MCP chat bar\nCtrl+, — Settings\nCtrl+1…4 — Jump to a screen\nCtrl+R — Reload\nF11 — Full screen",
              buttons: ["Close"],
            }),
        },
        {
          label: "About AdminHub21 Demo",
          click: () =>
            dialog.showMessageBox(win, {
              type: "info",
              title: "About",
              message: `${PRODUCT} ${app.getVersion()}`,
              detail:
                "Offline walkthrough of the AdminHub21 marketplace, wired to the MCP assistant. " +
                "Chat runs against free-tier models when an API key is configured, and against the " +
                "bundled demo dataset otherwise.",
              buttons: ["Close"],
            }),
        },
      ],
    },
  ]

  if (process.platform === "darwin") {
    template.unshift({ role: "appMenu" })
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1040,
    minHeight: 700,
    show: false,
    title: PRODUCT,
    backgroundColor: "#f2f5fa",
    autoHideMenuBar: false,
    icon: app.isPackaged ? undefined : join(__dirname, "..", "assets", "icon.png"),
    webPreferences: {
      // `.cjs` because the package is ESM and sandboxed preloads must be CJS.
      preload: join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      devTools: true,
    },
  })

  mainWindow.once("ready-to-show", () => mainWindow?.show())

  const { startServer } = require("../build/server.cjs")
  demoServer = await startServer({ settingsPath, crypto: cryptoBridge })

  // Hard-deny device permissions: a marketplace demo needs none of them.
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) =>
    callback(false),
  )

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) void shell.openExternal(url)
    return { action: "deny" }
  })

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(`http://127.0.0.1:${demoServer.port}`)) {
      event.preventDefault()
      if (/^https?:\/\//.test(url)) void shell.openExternal(url)
    }
  })

  buildMenu(mainWindow)

  await mainWindow.loadURL(demoServer.url)

  if (isDev && process.env.ADMINHUB_OPEN_DEVTOOLS === "1") {
    mainWindow.webContents.openDevTools({ mode: "detach" })
  }

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

ipcMain.handle("adminhub:info", () => ({
  desktop: true,
  platform: process.platform,
  version: app.getVersion(),
  serverUrl: demoServer?.url ?? null,
  settingsPath,
  encryptionAvailable: (() => {
    try {
      return safeStorage.isEncryptionAvailable()
    } catch {
      return false
    }
  })(),
}))

ipcMain.handle("adminhub:open-external", (_event, url) => {
  if (typeof url === "string" && /^https?:\/\//.test(url)) return shell.openExternal(url)
  return false
})

ipcMain.handle("adminhub:open-settings-file", () => shell.showItemInFolder(settingsPath))

ipcMain.handle("adminhub:reload", () => mainWindow?.reload())

const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(async () => {
    app.setAppUserModelId("ir.adminhub21.demo")
    await createWindow()

    app.on("activate", async () => {
      if (BrowserWindow.getAllWindows().length === 0) await createWindow()
    })
  })

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
  })

  app.on("before-quit", () => {
    void demoServer?.close()
  })
}
