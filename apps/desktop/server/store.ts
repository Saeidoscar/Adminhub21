/**
 * Settings store for the desktop demo.
 *
 * Lives in `%APPDATA%/AdminHub21 Demo/settings.json` on Windows (the path is
 * handed over by the Electron main process). Contains the gateway API key, the
 * chosen model and the rolling daily token counter.
 *
 * The key is encrypted by Electron's `safeStorage` before it is written, so the
 * file on disk holds an opaque base64 blob rather than a usable credential.
 * When `safeStorage` is unavailable (rare: no OS keychain), we fall back to
 * plain storage but flag it so the UI can warn the user.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

import { DAILY_TOKEN_BUDGET, DEFAULT_MODEL } from "./config"

export type StoredSettings = {
  apiKey?: string
  keyEncrypted?: boolean
  model?: string
  budgetDay?: string
  tokensToday?: number
  lastProbe?: { at: string; ok: boolean; message: string }
}

export type Decryptor = (value: string) => string | null
export type Encryptor = (value: string) => string | null

let settingsPath: string | null = null
let encrypt: Encryptor = () => null
let decrypt: Decryptor = () => null

let cache: StoredSettings | null = null

export function configureStore(options: {
  path: string | null
  encrypt?: Encryptor
  decrypt?: Decryptor
}): void {
  settingsPath = options.path
  if (options.encrypt) encrypt = options.encrypt
  if (options.decrypt) decrypt = options.decrypt
  cache = null
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function read(): StoredSettings {
  if (cache) return cache

  if (!settingsPath || !existsSync(settingsPath)) {
    cache = {}
    return cache
  }

  try {
    cache = JSON.parse(readFileSync(settingsPath, "utf8")) as StoredSettings
  } catch {
    cache = {}
  }

  return cache
}

function write(next: StoredSettings): void {
  cache = next

  if (!settingsPath) return

  try {
    mkdirSync(dirname(settingsPath), { recursive: true })
    writeFileSync(settingsPath, JSON.stringify(next, null, 2), "utf8")
  } catch (error) {
    console.error("[settings] write failed", error)
  }
}

export function readSettings(): StoredSettings {
  return read()
}

/** The plaintext key, or null. Prefers the env var so CI / power users can skip the UI. */
export function resolveApiKey(): string | null {
  const fromEnv = process.env.LAYERCLOUD_API_KEY?.trim()
  if (fromEnv) return fromEnv

  const stored = read()

  if (!stored.apiKey) return null
  if (!stored.keyEncrypted) return stored.apiKey

  const plain = decrypt(stored.apiKey)
  return plain && plain.length > 0 ? plain : null
}

export function saveApiKey(key: string): { encrypted: boolean } {
  const current = read()
  const trimmed = key.trim()

  if (!trimmed) {
    const { apiKey: _drop, keyEncrypted: _flag, ...rest } = current
    write({ ...rest })
    return { encrypted: false }
  }

  const cipher = encrypt(trimmed)

  if (cipher) {
    write({ ...current, apiKey: cipher, keyEncrypted: true })
    return { encrypted: true }
  }

  write({ ...current, apiKey: trimmed, keyEncrypted: false })
  return { encrypted: false }
}

export function currentModel(): string {
  return read().model ?? process.env.LAYERCLOUD_DEFAULT_MODEL ?? DEFAULT_MODEL
}

export function saveModel(model: string): void {
  write({ ...read(), model })
}

export function budgetSnapshot(): { used: number; limit: number; remaining: number } {
  const stored = read()
  const used = stored.budgetDay === today() ? (stored.tokensToday ?? 0) : 0

  return {
    used,
    limit: DAILY_TOKEN_BUDGET,
    remaining: Math.max(0, DAILY_TOKEN_BUDGET - used),
  }
}

export function recordTokens(tokens: number): void {
  if (tokens <= 0) return

  const stored = read()
  const used = stored.budgetDay === today() ? (stored.tokensToday ?? 0) : 0

  write({ ...stored, budgetDay: today(), tokensToday: used + tokens })
}

export function resetBudget(): void {
  write({ ...read(), budgetDay: today(), tokensToday: 0 })
}

export function recordProbe(ok: boolean, message: string): void {
  write({
    ...read(),
    lastProbe: { at: new Date().toISOString(), ok, message: message.slice(0, 300) },
  })
}
