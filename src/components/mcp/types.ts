/** Wire types shared by the MCP chat bar and the local demo server. */

export type McpSource = "live" | "demo"

export type McpModel = {
  id: string
  name: string
  inUsd: number
  outUsd: number
  context: number
  blurb: string
}

export type McpStatus = {
  provider: string
  baseUrl: string
  configured: boolean
  keyPreview: string | null
  keyEncrypted: boolean
  model: string
  models: McpModel[]
  budget: { used: number; limit: number; remaining: number }
  lastProbe: { at: string; ok: boolean; message: string } | null
  desktop: boolean
  version: string
}

export type ToolRun = {
  id: string
  name: string
  label: string
  input: Record<string, unknown>
  status: "running" | "done" | "error"
  durationMs?: number
  text?: string
  link?: { path: string; label: string }
  structured?: Record<string, unknown>
}

export type TurnMeta = {
  source?: McpSource
  model?: string
  modelName?: string
  promptTokens?: number
  completionTokens?: number
  costUsd?: number | null
  latencyMs?: number
  redactions?: number
}

export type Turn = {
  id: string
  role: "user" | "assistant"
  text: string
  tools: ToolRun[]
  status: "pending" | "streaming" | "done" | "error"
  error?: string
  meta: TurnMeta
  createdAt: number
}

/** Server → client events on `/api/mcp/chat`. */
export type AgentEvent =
  | { type: "status"; text: string }
  | { type: "meta"; source: McpSource; model: string; modelName: string }
  | { type: "tool_start"; id: string; name: string; label: string; input: Record<string, unknown> }
  | {
      type: "tool_end"
      id: string
      name: string
      ok: boolean
      durationMs: number
      text: string
      link?: { path: string; label: string }
      structured?: Record<string, unknown>
    }
  | { type: "delta"; text: string }
  | { type: "usage"; promptTokens: number; completionTokens: number; costUsd: number | null }
  | {
      type: "done"
      source: McpSource
      budget: { used: number; limit: number; remaining: number }
      redactions: number
      latencyMs: number
    }
  | { type: "error"; code: string; message: string; recoverable: boolean }
