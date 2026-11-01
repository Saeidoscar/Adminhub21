/**
 * Minimal OpenAI-dialect client for the demo.
 *
 * The desktop demo talks to the same LayerCloud gateway the Laravel API does
 * (`https://ai.layercloud.org/v1`), using `fetch` + server-sent events. It is
 * deliberately small: streaming deltas, tool calls, usage accounting and a
 * timeout. No SDK, so the packaged app has no extra runtime dependency.
 */

export type ChatRole = "system" | "user" | "assistant" | "tool"

export type ChatMessage = {
  role: ChatRole
  content: string
  tool_call_id?: string
  name?: string
  tool_calls?: ToolCall[]
}

export type ToolCall = {
  id: string
  type: "function"
  function: { name: string; arguments: string }
}

export type StreamEvent =
  | { type: "delta"; text: string }
  | { type: "tool_calls"; calls: ToolCall[] }
  | { type: "usage"; promptTokens: number; completionTokens: number }
  | { type: "done"; finishReason: string }

export const BASE_URL = (process.env.LAYERCLOUD_BASE_URL ?? "https://ai.layercloud.org/v1").replace(
  /\/+$/,
  "",
)

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly status = 502,
  ) {
    super(message)
    this.name = "ProviderError"
  }
}

type StreamArgs = {
  apiKey: string
  model: string
  messages: ChatMessage[]
  tools?: unknown[]
  temperature?: number
  maxTokens?: number
  signal?: AbortSignal
}

/** Cheap liveness check used by the "Test key" button. */
export async function probe(
  apiKey: string,
  model: string,
): Promise<{ ok: boolean; message: string; latencyMs: number }> {
  const started = Date.now()

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Reply with the single word: ok" }],
        max_tokens: 8,
        stream: false,
      }),
      signal: AbortSignal.timeout(30_000),
    })

    const latencyMs = Date.now() - started
    const body = (await response.json().catch(() => ({}))) as Record<string, any>

    if (!response.ok) {
      const detail = body?.error?.message ?? body?.message ?? `HTTP ${response.status}`
      return { ok: false, message: String(detail).slice(0, 300), latencyMs }
    }

    const content = body?.choices?.[0]?.message?.content ?? ""
    return {
      ok: true,
      message: `Model replied "${String(content).trim().slice(0, 40)}"`,
      latencyMs,
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : String(error),
      latencyMs: Date.now() - started,
    }
  }
}

/**
 * Streams one completion. Yields deltas as they arrive; tool calls are
 * accumulated across chunks and emitted once, when the stream finishes.
 */
export async function* streamChat(args: StreamArgs): AsyncGenerator<StreamEvent> {
  const { apiKey, model, messages, tools, temperature = 0.3, maxTokens = 700, signal } = args

  let response: Response

  try {
    response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        stream_options: { include_usage: true },
        temperature,
        max_tokens: maxTokens,
        ...(tools && tools.length > 0 ? { tools, tool_choice: "auto" } : {}),
      }),
      signal: signal ?? AbortSignal.timeout(90_000),
    })
  } catch (error) {
    throw new ProviderError(
      `Could not reach the gateway: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  if (!response.ok) {
    const raw = await response.text().catch(() => "")
    let detail = raw

    try {
      const parsed = JSON.parse(raw) as Record<string, any>
      detail = parsed?.error?.message ?? parsed?.message ?? raw
    } catch {
      // keep the raw body
    }

    throw new ProviderError(
      `Gateway returned HTTP ${response.status}: ${String(detail).slice(0, 300)}`,
      response.status,
    )
  }

  if (!response.body) throw new ProviderError("Gateway returned an empty response body.")

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let finishReason = "stop"
  let usage: { promptTokens: number; completionTokens: number } | null = null
  const calls = new Map<number, ToolCall>()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith("data:")) continue

        const payload = trimmed.slice(5).trim()
        if (payload === "[DONE]") continue

        let chunk: Record<string, any>
        try {
          chunk = JSON.parse(payload)
        } catch {
          continue
        }

        if (chunk.usage) {
          usage = {
            promptTokens: Number(chunk.usage.prompt_tokens ?? chunk.usage.input_tokens ?? 0),
            completionTokens: Number(
              chunk.usage.completion_tokens ?? chunk.usage.output_tokens ?? 0,
            ),
          }
        }

        const choice = chunk.choices?.[0]
        if (!choice) continue

        if (choice.finish_reason) finishReason = String(choice.finish_reason)

        const delta = choice.delta ?? {}
        const text = typeof delta.content === "string" ? delta.content : ""

        if (text) yield { type: "delta", text }

        for (const partial of delta.tool_calls ?? []) {
          const index = Number(partial.index ?? 0)
          const existing = calls.get(index) ?? {
            id: partial.id ?? `call_${index}`,
            type: "function" as const,
            function: { name: "", arguments: "" },
          }

          if (partial.id) existing.id = partial.id
          if (partial.function?.name) existing.function.name += partial.function.name
          if (partial.function?.arguments) existing.function.arguments += partial.function.arguments

          calls.set(index, existing)
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  if (calls.size > 0) {
    yield { type: "tool_calls", calls: [...calls.values()] }
  }

  if (usage) yield { type: "usage", ...usage }

  yield { type: "done", finishReason }
}
