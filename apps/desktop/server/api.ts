/**
 * HTTP API for the demo: model catalogue, key management, MCP tool listing and
 * the streaming chat endpoint.
 *
 * Exported separately from the server so the Vite dev server can mount the very
 * same handler (`dev/mcp-api-plugin.ts`). The browser demo and the packaged
 * desktop app therefore share one implementation — what you see in the preview
 * is exactly what ships in the .exe.
 */
import type { IncomingMessage, ServerResponse } from "node:http"

import { DAILY_TOKEN_BUDGET, MODELS, isAllowedModel, redact } from "./config"
import { runAgent, type AgentEvent } from "./agent"
import { probe } from "./ai"
import {
  budgetSnapshot,
  currentModel,
  readSettings,
  recordProbe,
  resetBudget,
  resolveApiKey,
  saveApiKey,
  saveModel,
} from "./store"
import { TOOLS } from "./tools"

export const APP_VERSION = process.env.ADMINHUB_VERSION ?? "1.0.0"

export function json(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(payload),
  })
  res.end(payload)
}

export function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolveBody, reject) => {
    const chunks: Buffer[] = []
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
    req.on("end", () => resolveBody(Buffer.concat(chunks).toString("utf8")))
    req.on("error", reject)
  })
}

function parseJson(raw: string): Record<string, unknown> {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

export function aiStatus() {
  const key = resolveApiKey()
  return {
    provider: "layercloud",
    baseUrl: process.env.LAYERCLOUD_BASE_URL ?? "https://ai.layercloud.org/v1",
    configured: Boolean(key),
    keyPreview: key ? `${key.slice(0, 6)}…${key.slice(-4)}` : null,
    keyEncrypted: readSettings().keyEncrypted ?? false,
    model: currentModel(),
    models: MODELS,
    budget: { ...budgetSnapshot(), limit: DAILY_TOKEN_BUDGET },
    lastProbe: readSettings().lastProbe ?? null,
    // The desktop shell injects these so the UI can be honest about its mode.
    desktop: Boolean(process.env.ADMINHUB_DESKTOP),
    version: APP_VERSION,
  }
}

export async function handleApi(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
): Promise<boolean> {
  const { pathname } = url
  const method = (req.method ?? "GET").toUpperCase()

  if (pathname === "/api/desktop/health" && method === "GET") {
    json(res, 200, {
      ok: true,
      app: "AdminHub21 Demo",
      version: APP_VERSION,
      desktop: Boolean(process.env.ADMINHUB_DESKTOP),
      renderer: process.env.ADMINHUB_RENDERER_DIR ?? null,
      tools: TOOLS.length,
    })
    return true
  }

  if (pathname === "/api/ai/status" && method === "GET") {
    json(res, 200, aiStatus())
    return true
  }

  if (pathname === "/api/ai/settings" && method === "POST") {
    const body = parseJson(await readBody(req))

    if (typeof body.apiKey === "string") {
      const { encrypted } = saveApiKey(body.apiKey)
      json(res, 200, { saved: true, encrypted, status: aiStatus() })
      return true
    }

    if (typeof body.model === "string") {
      if (!isAllowedModel(body.model)) {
        json(res, 422, { error: `Model "${body.model}" is not on the free-tier allow-list.` })
        return true
      }
      saveModel(body.model)
      json(res, 200, { saved: true, status: aiStatus() })
      return true
    }

    json(res, 400, { error: "Provide apiKey or model." })
    return true
  }

  if (pathname === "/api/ai/probe" && method === "POST") {
    const key = resolveApiKey()

    if (!key) {
      json(res, 400, { ok: false, message: "No API key configured yet." })
      return true
    }

    const result = await probe(key, currentModel())
    recordProbe(result.ok, result.message)
    json(res, 200, result)
    return true
  }

  if (pathname === "/api/ai/budget/reset" && method === "POST") {
    resetBudget()
    json(res, 200, { ok: true, budget: budgetSnapshot() })
    return true
  }

  if (pathname === "/api/mcp/tools" && method === "GET") {
    json(
      res,
      200,
      TOOLS.map((tool) => ({
        name: tool.name,
        description: tool.description,
        category: tool.category,
        label: tool.label,
        inputSchema: tool.parameters,
      })),
    )
    return true
  }

  if (pathname === "/api/mcp/chat" && method === "POST") {
    const body = parseJson(await readBody(req))
    const text = String(body.message ?? body.text ?? "").trim()

    if (!text) {
      json(res, 400, { error: "message is required" })
      return true
    }

    const controller = new AbortController()
    req.on("close", () => controller.abort())

    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    })

    const send = (event: AgentEvent) => {
      if (res.writableEnded) return
      res.write(`data: ${JSON.stringify(event)}\n\n`)
    }

    res.write(": stream opened\n\n")

    try {
      await runAgent({
        text,
        lang: body.lang === "fa" ? "fa" : "en",
        role: body.role === "admin" || body.role === "super_admin" ? body.role : "employer",
        history: Array.isArray(body.history)
          ? (body.history as { role: "user" | "assistant"; content: string }[]).slice(-8)
          : [],
        model: typeof body.model === "string" ? body.model : undefined,
        signal: controller.signal,
        emit: send,
      })
    } catch (error) {
      send({
        type: "error",
        code: "agent_failure",
        message: error instanceof Error ? error.message : String(error),
        recoverable: true,
      })
    }

    if (!res.writableEnded) {
      res.write("data: [DONE]\n\n")
      res.end()
    }

    return true
  }

  if (pathname === "/api/mcp/converse" && method === "POST") {
    const body = parseJson(await readBody(req))
    const text = String(body.text ?? body.message ?? "").trim()

    if (!text) {
      json(res, 400, { error: "text is required" })
      return true
    }

    let answer = ""
    let structured: Record<string, unknown> | undefined

    await runAgent({
      text,
      lang: body.lang === "fa" ? "fa" : "en",
      role: "employer",
      emit: (event) => {
        if (event.type === "delta") answer += event.text
        if (event.type === "tool_end") structured = event.structured
      },
    })

    json(res, 200, {
      text: answer.trim(),
      structured,
      confidence: 0.9,
      session: body.session ?? null,
    })
    return true
  }

  if (pathname === "/api/ai/redact-check" && method === "POST") {
    const body = parseJson(await readBody(req))
    json(res, 200, redact(String(body.text ?? "")))
    return true
  }

  return false
}
