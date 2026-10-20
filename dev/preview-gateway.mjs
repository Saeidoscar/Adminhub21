/**
 * Demo API server for the desktop build and local previews.
 *
 * Serves `/api/v1/*` in the Laravel contract (see `dev/demo-contract.ts`), so
 * both the Next.js public site and the authenticated workspace run on the
 * seeded dataset with no database. Also answers a few legacy `/api/*` paths so
 * the Vite workspace can point at it during development.
 *
 * Usage:
 *   node --experimental-strip-types dev/preview-gateway.mjs
 *   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8090 pnpm dev:web
 */
import { createServer } from "node:http"

import { routeContract } from "./demo-contract.ts"

const PORT = Number(process.env.PREVIEW_GATEWAY_PORT ?? 8090)
const HOST = process.env.PREVIEW_GATEWAY_HOST ?? "127.0.0.1"

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
    req.on("error", reject)
  })
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://demo.local")
  const method = (req.method ?? "GET").toUpperCase()
  const raw = method === "GET" || method === "HEAD" ? "" : await readBody(req)

  let body = {}
  try {
    body = raw ? JSON.parse(raw) : {}
  } catch {
    body = {}
  }

  try {
    const result = await routeContract(method, url.pathname, url.searchParams, body)

    if (!result) {
      res.statusCode = 404
      res.setHeader("Content-Type", "application/json; charset=utf-8")
      res.end(JSON.stringify({ message: `No demo route for ${method} ${url.pathname}` }))
      return
    }

    res.statusCode = result.status
    res.setHeader("Content-Type", result.contentType ?? "application/json; charset=utf-8")
    res.setHeader("Cache-Control", "no-store")
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

    if (result.status === 204 || result.body == null) {
      res.end()
      return
    }

    res.end(Buffer.isBuffer(result.body) ? result.body : JSON.stringify(result.body))
  } catch (error) {
    res.statusCode = 500
    res.setHeader("Content-Type", "application/json; charset=utf-8")
    res.end(JSON.stringify({ message: String(error) }))
  }
}).listen(PORT, HOST, () => {
  console.log(`[demo-api] ${HOST}:${PORT} · ${methodList()}`)
})

function methodList() {
  return "marketplace · contracts · wallet · tickets · auth"
}
