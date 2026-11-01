/**
 * Vite middleware that mounts the demo's MCP/AI endpoints (`/api/ai/*`,
 * `/api/mcp/*`) during `pnpm dev:demo`, and also serves them from `dist` builds
 * launched by the desktop shell.
 *
 * It reuses the exact handler the packaged Electron app runs
 * (`apps/desktop/server/api.ts`), so the browser preview and the .exe cannot
 * drift apart. Register this BEFORE `demoApiPlugin`: that plugin answers the
 * rest of the `/api` surface and would otherwise shadow these paths.
 */
import type { Plugin, Connect } from "vite"

import { handleApi } from "../apps/desktop/server/api"
import { configureStore } from "../apps/desktop/server/store"

const SETTINGS_PATH =
  process.env.ADMINHUB_SETTINGS_PATH ??
  new URL("../.cache/desktop-demo/settings.json", import.meta.url).pathname

let configured = false

export function mcpApiPlugin(): Plugin {
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const url = req.url ?? "/"
    const pathname = url.split("?")[0] ?? "/"

    // `/ai` (no trailing path) is the assistant page, not an API route.
    const isApi = /^\/api\/(ai|mcp|desktop)(\/|$)/.test(pathname)
    if (!isApi) return next()

    if (!configured) {
      configureStore({ path: SETTINGS_PATH })
      configured = true
    }

    void (async () => {
      try {
        const handled = await handleApi(
          req as never,
          res as never,
          new URL(url, "http://localhost"),
        )
        if (!handled) next()
      } catch (error) {
        console.error("[mcp-api] request failed", error)
        if (!res.headersSent) {
          res.statusCode = 500
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify({ error: "MCP API failure" }))
        }
      }
    })()
  }

  return {
    name: "adminhub-mcp-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}
