/**
 * Preload bridge. With `sandbox: true` this runs in an isolated world and may
 * only use CommonJS + contextBridge/ipcRenderer — which is exactly all the
 * renderer needs: app metadata, an external-link opener, and menu commands.
 *
 * It is `.cjs` on purpose: the workspace is `"type": "module"`, and sandboxed
 * preload scripts must be CommonJS.
 *
 * The API key deliberately does NOT cross this bridge. Settings are written and
 * read by the local server process, and the key is only ever echoed back to the
 * UI as a masked preview.
 */
const { contextBridge, ipcRenderer } = require("electron")

const listeners = new Set()

ipcRenderer.on("adminhub:command", (_event, command) => {
  for (const listener of listeners) listener(command)
})

contextBridge.exposeInMainWorld("adminhubDesktop", {
  isDesktop: true,
  getInfo: () => ipcRenderer.invoke("adminhub:info"),
  openExternal: (url) => ipcRenderer.invoke("adminhub:open-external", url),
  openSettingsFile: () => ipcRenderer.invoke("adminhub:open-settings-file"),
  reload: () => ipcRenderer.invoke("adminhub:reload"),
  onCommand: (callback) => {
    listeners.add(callback)
    return () => listeners.delete(callback)
  },
})
