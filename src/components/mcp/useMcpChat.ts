/**
 * Transport + state for the MCP chat bar.
 *
 * Speaks SSE to `/api/mcp/chat` (served by the desktop shell or the Vite demo
 * plugin), folds the events into turns, and keeps the thread in localStorage so
 * closing the panel does not lose context.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import type { Lang } from "../../i18n"
import type { AgentEvent, McpStatus, ToolRun, Turn } from "./types"

const THREAD_KEY = "adminhub.mcp.thread.v1"
const MODEL_KEY = "adminhub.mcp.model.v1"
const MAX_TURNS = 40

type Role = "employer" | "admin" | "super_admin"

function readThread(): Turn[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(THREAD_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Turn[]
    return Array.isArray(parsed) ? parsed.slice(-MAX_TURNS) : []
  } catch {
    return []
  }
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

export type SendOptions = { text: string }

export function useMcpChat(lang: Lang, role: Role) {
  const [turns, setTurns] = useState<Turn[]>(() => readThread())
  const [busy, setBusy] = useState(false)
  const [statusText, setStatusText] = useState<string | null>(null)
  const [status, setStatus] = useState<McpStatus | null>(null)
  const [model, setModelState] = useState<string>(() => {
    if (typeof window === "undefined") return ""
    return window.localStorage.getItem(MODEL_KEY) ?? ""
  })

  const abortRef = useRef<AbortController | null>(null)
  const activeIdRef = useRef<string | null>(null)

  // Persist the thread; `busy` turns are dropped so a reload never shows a
  // half-streamed answer as if it were complete.
  useEffect(() => {
    if (typeof window === "undefined") return
    const settled = turns.filter((turn) => turn.status !== "streaming" && turn.status !== "pending")
    window.localStorage.setItem(THREAD_KEY, JSON.stringify(settled.slice(-MAX_TURNS)))
  }, [turns])

  const refreshStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/ai/status", { headers: { Accept: "application/json" } })
      if (!response.ok) return
      const data = (await response.json()) as McpStatus
      setStatus(data)
      setModelState((current) => current || data.model)
    } catch {
      // The web demo without the Vite plugin has no status endpoint; the chat
      // bar still works through the mock path in that case.
    }
  }, [])

  useEffect(() => {
    void refreshStatus()
  }, [refreshStatus])

  const setModel = useCallback((next: string) => {
    setModelState(next)
    window.localStorage.setItem(MODEL_KEY, next)
    void fetch("/api/ai/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: next }),
    }).catch(() => undefined)
  }, [])

  const patchTurn = useCallback((id: string, patch: (turn: Turn) => Turn) => {
    setTurns((current) => current.map((turn) => (turn.id === id ? patch(turn) : turn)))
  }, [])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null

    if (activeIdRef.current) {
      const id = activeIdRef.current
      patchTurn(id, (turn) => ({
        ...turn,
        status: turn.text ? "done" : "error",
        error: turn.text ? undefined : "Stopped",
      }))
    }

    setBusy(false)
    setStatusText(null)
  }, [patchTurn])

  const clear = useCallback(() => {
    stop()
    setTurns([])
    window.localStorage.removeItem(THREAD_KEY)
  }, [stop])

  const send = useCallback(
    async ({ text }: SendOptions) => {
      const prompt = text.trim()
      if (!prompt || busy) return

      const userTurn: Turn = {
        id: newId("user"),
        role: "user",
        text: prompt,
        tools: [],
        status: "done",
        meta: {},
        createdAt: Date.now(),
      }

      const assistantId = newId("assistant")
      const assistantTurn: Turn = {
        id: assistantId,
        role: "assistant",
        text: "",
        tools: [],
        status: "pending",
        meta: {},
        createdAt: Date.now(),
      }

      const history = turns
        .filter((turn) => turn.status === "done" && turn.text.trim().length > 0)
        .slice(-8)
        .map((turn) => ({ role: turn.role, content: turn.text }))

      setTurns((current) => [...current, userTurn, assistantTurn])
      setBusy(true)
      setStatusText(null)
      activeIdRef.current = assistantId

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const response = await fetch("/api/mcp/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
          body: JSON.stringify({
            message: prompt,
            lang,
            role,
            model: model || undefined,
            history,
          }),
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          throw new Error(`The assistant endpoint returned HTTP ${response.status}.`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const blocks = buffer.split("\n\n")
          buffer = blocks.pop() ?? ""

          for (const block of blocks) {
            const line = block.split("\n").find((entry) => entry.startsWith("data:"))
            if (!line) continue

            const payload = line.slice(5).trim()
            if (!payload || payload === "[DONE]") continue

            let event: AgentEvent
            try {
              event = JSON.parse(payload) as AgentEvent
            } catch {
              continue
            }

            applyEvent(assistantId, event)
          }
        }

        patchTurn(assistantId, (turn) => ({
          ...turn,
          status: turn.status === "error" ? "error" : "done",
        }))
      } catch (error) {
        if (controller.signal.aborted) return

        const message = error instanceof Error ? error.message : String(error)
        patchTurn(assistantId, (turn) => ({ ...turn, status: "error", error: message }))
      } finally {
        abortRef.current = null
        activeIdRef.current = null
        setBusy(false)
        setStatusText(null)
        void refreshStatus()
      }

      function applyEvent(id: string, event: AgentEvent) {
        switch (event.type) {
          case "status":
            setStatusText(event.text)
            break

          case "meta":
            patchTurn(id, (turn) => ({
              ...turn,
              status: "streaming",
              meta: {
                ...turn.meta,
                source: event.source,
                model: event.model,
                modelName: event.modelName,
              },
            }))
            break

          case "tool_start":
            patchTurn(id, (turn) => ({
              ...turn,
              tools: [
                ...turn.tools,
                {
                  id: event.id,
                  name: event.name,
                  label: event.label,
                  input: event.input,
                  status: "running",
                } satisfies ToolRun,
              ],
            }))
            break

          case "tool_end":
            patchTurn(id, (turn) => ({
              ...turn,
              tools: turn.tools.map((tool) =>
                tool.id === event.id
                  ? {
                      ...tool,
                      status: event.ok ? "done" : "error",
                      durationMs: event.durationMs,
                      text: event.text,
                      link: event.link,
                      structured: event.structured,
                    }
                  : tool,
              ),
            }))
            break

          case "delta":
            setStatusText(null)
            patchTurn(id, (turn) => ({
              ...turn,
              status: "streaming",
              text: turn.text + event.text,
            }))
            break

          case "usage":
            patchTurn(id, (turn) => ({
              ...turn,
              meta: {
                ...turn.meta,
                promptTokens: event.promptTokens,
                completionTokens: event.completionTokens,
                costUsd: event.costUsd,
              },
            }))
            break

          case "done":
            patchTurn(id, (turn) => ({
              ...turn,
              status: "done",
              meta: {
                ...turn.meta,
                source: event.source,
                latencyMs: event.latencyMs,
                redactions: event.redactions,
              },
            }))
            break

          case "error":
            patchTurn(id, (turn) => ({
              ...turn,
              status: "error",
              error: event.message,
            }))
            break
        }
      }
    },
    [busy, lang, model, patchTurn, refreshStatus, role, turns],
  )

  const canSend = useMemo(() => !busy, [busy])

  return {
    turns,
    send,
    stop,
    clear,
    busy,
    statusText,
    status,
    model,
    setModel,
    refreshStatus,
    canSend,
  }
}
