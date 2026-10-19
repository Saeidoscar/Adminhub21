/**
 * Vite plugin that serves the in-memory demo API.
 *
 * Enabled only for `vite --mode demo` (see `.env.demo`). Requests to `/api/*`
 * and `/ai/*` are answered locally so the UI has data without a backend.
 */
import type { Plugin } from "vite"
import { handleDemoRequest } from "./demo-api-handler"

function readBody(stream: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
    stream.on("error", reject)
  })
}

export function demoApiPlugin(): Plugin {
  return {
    name: "adminhub-demo-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? ""
        // `/ai` with no sub-path is the SPA's assistant page, not an API route.
        const isSpaRoute = /^\/ai\/?(\?.*)?$/.test(url)
        if (isSpaRoute || !/^\/(api|ai)([/?]|$)/.test(url)) return next()

        try {
          const body = req.method === "GET" || req.method === "HEAD" ? "" : await readBody(req)
          const result = await handleDemoRequest(req.method ?? "GET", url, body)

          res.statusCode = result.status
          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.setHeader("Cache-Control", "no-store")
          res.setHeader("Access-Control-Allow-Origin", "*")
          res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
          res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

          if (!result.body || result.status === 204) {
            res.end()
            return
          }

          res.end(JSON.stringify(result.body))
        } catch (error) {
          console.error("[demo-api] request failed", error)
          res.statusCode = 500
          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify({ error: "Demo API failure" }))
        }
      })
    },
  }
}
