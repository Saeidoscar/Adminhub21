/**
 * Bridge to the Electron shell. Everything is optional: the same bundle runs in
 * the browser (web demo), where `window.adminhubDesktop` is undefined and the
 * UI simply hides desktop-only affordances.
 */

export type DesktopInfo = {
  desktop: boolean
  platform: string
  version: string
  serverUrl: string | null
  settingsPath: string
  encryptionAvailable: boolean
}

export type DesktopBridge = {
  isDesktop: true
  getInfo: () => Promise<DesktopInfo>
  openExternal: (url: string) => Promise<unknown>
  openSettingsFile: () => Promise<unknown>
  reload: () => Promise<unknown>
  onCommand: (callback: (command: string) => void) => () => void
}

declare global {
  interface Window {
    adminhubDesktop?: DesktopBridge
  }
}

export function desktopBridge(): DesktopBridge | null {
  if (typeof window === "undefined") return null
  return window.adminhubDesktop ?? null
}

export const isDesktop = (): boolean => Boolean(desktopBridge()?.isDesktop)
