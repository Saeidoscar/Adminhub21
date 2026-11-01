/**
 * Local server for the AdminHub21 desktop demo.
 *
 * Electron starts this on 127.0.0.1:<random port> and points the window at it.
 * Same-origin means the renderer talks to the demo API exactly like it talks to
 * the Laravel API in development — no CORS, no proxy config, no hard-coded
 * hostnames baked into the bundle.
 *
 * Routes:
 *   /api/desktop/*     app metadata
 *   /api/ai/*          model catalogue, key management, budget
 *   /api/mcp/tools     MCP tool list
 *   /api/mcp/chat      SSE stream (the chat bar)
 *   /api/mcp/converse  JSON compatibility endpoint
 *   everything else    static files from dist, SPA fallback to index.html
 *   /api, /ai (rest)   the in-memory demo dataset used by the web demo
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http"
import { createReadStream, existsSync, statSync } from "node:fs"
import { extname, join, normalize, resolve } from "node:path"

import { handleDemoRequest } from "../../../dev/demo-api-handler"
import { APP_VERSION, handleApi, json, readBody } from "./api"
import { configureStore, type Decryptor, type Encryptor } from "./store"

const HOST = "127.0.0.1"
const RENDERER_DIR = resolve(process.env.ADMINHUB_RENDERER_DIR ?? join(process.cwd(), "dist"))

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
}

function serveStatic(req: IncomingMessage, res: ServerResponse, pathname: string): void {
  const relative = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "")
  const candidates = [relative, ...(pathname === "/" ? [] : ["/index.html"])]
  const filePath = candidates
    .map((candidate) => join(RENDERER_DIR, candidate))
    .find((candidate) => existsSync(candidate) && statSync(candidate).isFile())

  // SPA fallback: unknown paths (/, /marketplace, /ai) render the app shell.
  const indexPath = join(RENDERER_DIR, "index.html")

  if (!filePath) {
    if (!existsSync(indexPath)) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" })
      res.end(
        "The renderer bundle is missing. Run `pnpm desktop:build` (which builds the SPA first) instead of launching the shell on its own.",
      )
      return
    }

    const html = createReadStream(indexPath)
    res.writeHead(200, {
      "Content-Type": MIME[".html"] ?? "text/html",
      "Cache-Control": "no-store",
    })
    html.pipe(res)
    return
  }

  const ext = extname(filePath).toLowerCase()
  const immutable = pathname.startsWith("/assets/")

  res.writeHead(200, {
    "Content-Type": MIME[ext] ?? "application/octet-stream",
    "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "no-store",
  })

  createReadStream(filePath).pipe(res)
}

export type DemoServer = {
  port: number
  url: string
  close: () => Promise<void>
}

export async function startServer(
  options: {
    port?: number
    settingsPath?: string | null
    crypto?: { encrypt: Encryptor; decrypt: Decryptor }
  } = {},
): Promise<DemoServer> {
  configureStore({
    path: options.settingsPath ?? process.env.ADMINHUB_SETTINGS_PATH ?? null,
    encrypt: options.crypto?.encrypt,
    decrypt: options.crypto?.decrypt,
  })

  const server = createServer((req, res) => {
    void (async () => {
      // DNS-rebinding guard: only answer on the loopback host we bound to.
      const host = (req.headers.host ?? "").split(":")[0]
      if (host && host !== "127.0.0.1" && host !== "localhost") {
        json(res, 403, { error: "Forbidden host" })
        return
      }

      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? `${HOST}`}`)

      try {
        if (await handleApi(req, res, url)) return

        // The demo dataset answers the rest of the app's API surface.
        if (/^\/(api|ai)([/?]|$)/.test(url.pathname) && url.pathname !== "/ai") {
          const body = req.method === "GET" || req.method === "HEAD" ? "" : await readBody(req)
          const result = await handleDemoRequest(req.method ?? "GET", req.url ?? "/", body)
          json(res, result.status, result.body ?? {})
          return
        }

        serveStatic(req, res, url.pathname)
      } catch (error) {
        console.error("[server] request failed", error)
        if (!res.headersSent) json(res, 500, { error: "Internal demo server error" })
        else res.end()
      }
    })()
  })

  await new Promise<void>((resolveListen, reject) => {
    server.once("error", reject)
    server.listen(options.port ?? 0, HOST, () => resolveListen())
  })

  const address = server.address()
  const port = typeof address === "object" && address ? address.port : 0

  return {
    port,
    url: `http://${HOST}:${port}`,
    close: () =>
      new Promise<void>((resolveClose) => {
        server.close(() => resolveClose())
      }),
  }
}

// Allow `node build/server.cjs` for a browser-based dry run of the same bundle.
if (process.argv.includes("--standalone")) {
  const port = Number(process.env.ADMINHUB_PORT ?? 4173)
  startServer({ port }).then((demo) => {
    console.log(`AdminHub21 demo server listening on ${demo.url}`)
    console.log(`Renderer directory: ${RENDERER_DIR}`)
  })
}
