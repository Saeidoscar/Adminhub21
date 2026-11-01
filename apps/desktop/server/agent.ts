/**
 * The MCP agent.
 *
 * Two modes, one event protocol:
 *
 *  - **live**  — an API key is configured: the model gets the tool schemas and
 *                drives a bounded tool loop, streaming tokens back.
 *  - **demo**  — no key (or the gateway is unreachable): a deterministic local
 *                planner picks the same tools and streams a grounded answer,
 *                so the demo never shows an empty screen. Every event carries
 *                `source` so the UI can label which mode produced it.
 */
import { DAILY_TOKEN_BUDGET, MAX_OUTPUT_TOKENS, estimateCost, findModel, redact } from "./config"
import { ProviderError, streamChat, type ChatMessage, type ToolCall } from "./ai"
import { TOOLS, findTool, toolSchemas, type ToolContext, type ToolResult } from "./tools"
import { budgetSnapshot, currentModel, recordTokens, resolveApiKey } from "./store"

export type AgentEvent =
  | { type: "status"; text: string }
  | { type: "meta"; source: "live" | "demo"; model: string; modelName: string }
  | {
      type: "tool_start"
      id: string
      name: string
      label: string
      input: Record<string, unknown>
    }
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
      source: "live" | "demo"
      budget: { used: number; limit: number; remaining: number }
      redactions: number
      latencyMs: number
    }
  | { type: "error"; code: string; message: string; recoverable: boolean }

export type AgentInput = {
  text: string
  lang: "en" | "fa"
  role: "employer" | "admin" | "super_admin"
  history?: { role: "user" | "assistant"; content: string }[]
  model?: string
  signal?: AbortSignal
  emit: (event: AgentEvent) => void
}

const SYSTEM_PROMPT = `You are the AdminHub21 MCP assistant, running inside a desktop demo of an Iranian marketplace for social-media admins.

Rules:
- Ground every number in a tool result. Never invent a price, rating or package that a tool did not return.
- Call at most one tool per turn unless the user explicitly asks for a comparison.
- Keep answers under 120 words. Use short markdown lines and bullets, no headings.
- Reply in the same language as the user (Persian users are addressed in Persian, right-to-left).
- If the user asks about contracts, identity documents, invoices or payments, tell them the demo keeps those on the real API and offer to open the relevant screen instead.
- You are a demo: never claim to have sent an email, charged a card or signed anything.`

let requestCounter = 0
const nextRequestId = () => `req_${++requestCounter}_${Date.now().toString(36)}`

export async function runAgent(input: AgentInput): Promise<void> {
  const started = Date.now()
  const model = input.model && findModel(input.model) ? input.model : currentModel()
  const modelInfo = findModel(model)
  const apiKey = resolveApiKey()
  const { text: safeText, count: redactions } = redact(input.text)

  const budget = budgetSnapshot()

  if (budget.used >= DAILY_TOKEN_BUDGET) {
    input.emit({
      type: "error",
      code: "budget_exhausted",
      message:
        input.lang === "fa"
          ? `سقف مصرف روزانه (${DAILY_TOKEN_BUDGET.toLocaleString("fa-IR")} توکن) پر شده است. فردا دوباره امتحان کنید.`
          : `The daily budget (${DAILY_TOKEN_BUDGET.toLocaleString("en-US")} tokens) is exhausted. Try again tomorrow.`,
      recoverable: false,
    })
    return
  }

  if (!apiKey) {
    await runDemo({
      ...input,
      text: safeText,
      model,
      modelName: modelInfo?.name ?? "Demo planner",
      started,
      redactions,
    })
    return
  }

  try {
    await runLive({ ...input, text: safeText, model, started, redactions })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    input.emit({
      type: "status",
      text:
        input.lang === "fa"
          ? "دسترسی به درگاه برقرار نشد — پاسخ از دادهٔ دمو ساخته می‌شود."
          : "Gateway unreachable — answering from demo data instead.",
    })

    if (error instanceof ProviderError && (error.status === 401 || error.status === 403)) {
      input.emit({
        type: "error",
        code: "invalid_key",
        message:
          input.lang === "fa"
            ? "کلید API رد شد. در تنظیمات یک کلید معتبر وارد کنید."
            : "The API key was rejected. Add a valid key in settings.",
        recoverable: true,
      })
    }

    await runDemo({
      ...input,
      text: input.text,
      model,
      modelName: `${modelInfo?.name ?? "Model"} · offline`,
      started,
      redactions,
      note: message,
    })
  }
}

// ── live mode ───────────────────────────────────────────────────────────────

async function runLive(
  input: AgentInput & { model: string; started: number; redactions: number },
): Promise<void> {
  const apiKey = resolveApiKey()
  if (!apiKey) throw new Error("missing key")

  const modelInfo = findModel(input.model)
  const ctx: ToolContext = { lang: input.lang, role: input.role }

  input.emit({
    type: "meta",
    source: "live",
    model: input.model,
    modelName: modelInfo?.name ?? input.model,
  })

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(input.history ?? [])
      .slice(-6)
      .map((entry) => ({ role: entry.role, content: entry.content }) as ChatMessage),
    { role: "user", content: input.text },
  ]

  let promptTokens = 0
  let completionTokens = 0
  let emittedText = false

  for (let round = 0; round < 2; round += 1) {
    let pendingCalls: ToolCall[] = []
    let roundText = ""

    for await (const event of streamChat({
      apiKey,
      model: input.model,
      messages,
      tools: toolSchemas(),
      maxTokens: MAX_OUTPUT_TOKENS,
      signal: input.signal,
    })) {
      if (event.type === "delta") {
        roundText += event.text
        emittedText = true
        input.emit({ type: "delta", text: event.text })
      }

      if (event.type === "tool_calls") pendingCalls = event.calls

      if (event.type === "usage") {
        promptTokens += event.promptTokens
        completionTokens += event.completionTokens
      }
    }

    if (pendingCalls.length === 0) break

    const toolMessages: ChatMessage[] = []
    const assistantTurn: ChatMessage = {
      role: "assistant",
      content: roundText,
      tool_calls: pendingCalls,
    }
    messages.push(assistantTurn)

    for (const call of pendingCalls) {
      const tool = findTool(call.function.name)
      const id = call.id || nextRequestId()

      let parsedInput: Record<string, unknown> = {}
      try {
        parsedInput = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>
      } catch {
        parsedInput = {}
      }

      input.emit({
        type: "tool_start",
        id,
        name: call.function.name,
        label: tool?.label ?? call.function.name,
        input: parsedInput,
      })

      const toolStartedAt = Date.now()
      const result: ToolResult = tool
        ? tool.run(parsedInput, ctx)
        : {
            text: `Unknown tool: ${call.function.name}`,
            structured: { error: "unknown_tool" },
          }

      input.emit({
        type: "tool_end",
        id,
        name: call.function.name,
        ok: Boolean(tool),
        durationMs: Date.now() - toolStartedAt,
        text: result.text,
        link: result.link,
        structured: result.structured,
      })

      toolMessages.push({
        role: "tool",
        tool_call_id: id,
        name: call.function.name,
        content: JSON.stringify({ text: result.text, data: result.structured }),
      })
    }

    messages.push(...toolMessages)
  }

  const cost = estimateCost(input.model, promptTokens, completionTokens)
  recordTokens(promptTokens + completionTokens)
  input.emit({ type: "usage", promptTokens, completionTokens, costUsd: cost })

  if (!emittedText) {
    input.emit({
      type: "delta",
      text:
        input.lang === "fa"
          ? "پاسخی از مدل دریافت نشد. دوباره تلاش کنید یا مدل دیگری انتخاب کنید."
          : "The model returned no text. Retry, or pick a different model.",
    })
  }

  input.emit({
    type: "done",
    source: "live",
    budget: budgetSnapshot(),
    redactions: input.redactions,
    latencyMs: Date.now() - input.started,
  })
}

// ── demo mode ───────────────────────────────────────────────────────────────

type DemoArgs = AgentInput & {
  model: string
  modelName: string
  started: number
  redactions: number
  note?: string
}

function detectTool(text: string): { name: string; input: Record<string, unknown> } {
  const lower = text.toLowerCase()

  const platform = ["instagram", "telegram", "linkedin", "torob", "digikala", "whatsapp"].find(
    (entry) => lower.includes(entry),
  )
  const budgetMatch =
    lower.match(/(\d{2,5})\s*(?:\$|usd|dollar)/) ?? lower.match(/(?:\$|usd)\s*(\d{2,5})/)
  const budgetUsd = budgetMatch ? Number(budgetMatch[1]) : undefined

  const has = (...words: string[]) => words.some((word) => lower.includes(word))

  if (has("compare", "مقایسه", "versus", "vs ")) {
    return { name: "compare-packages", input: { platform, limit: 3 } }
  }
  if (has("contract", "قرارداد", "brief", "طرح پروژه", "proposal")) {
    return { name: "build-brief", input: { goal: text.slice(0, 160), platform, budgetUsd } }
  }
  if (has("price", "pricing", "cost", "قیمت", "نرخ", "هزینه", "بودجه")) {
    return { name: "suggest-pricing", input: { platform: platform ?? "instagram" } }
  }
  if (has("team", "hire", "تیم", "استخدام", "budget")) {
    return { name: "recommend-team", input: { budgetUsd: budgetUsd ?? 400 } }
  }
  if (has("calendar", "content plan", "تقویم", "محتوا")) {
    return { name: "content-calendar", input: { days: 7 } }
  }
  if (has("engagement", "تحلیل", "analytics", "growth", "رشد")) {
    return { name: "analyze-engagement", input: {} }
  }
  if (has("ticket", "تیکت", "support", "پشتیبانی")) {
    return { name: "open-tickets", input: {} }
  }
  if (has("wallet", "balance", "کیف پول", "موجودی", "invoice", "فاکتور")) {
    return { name: "wallet-summary", input: {} }
  }
  if (has("package", "پکیج", "باندل", "bundle")) {
    return { name: "list-packages", input: { limit: 5, platform } }
  }
  if (has("find", "search", "admin", "ادمین", "اینستاگرام", "instagram")) {
    return { name: "find-admin", input: { platform, budgetUsd } }
  }

  return { name: "search-marketplace", input: { query: text.trim().slice(0, 80) } }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function runDemo(input: DemoArgs): Promise<void> {
  const ctx: ToolContext = { lang: input.lang, role: input.role }
  const isFa = input.lang === "fa"

  input.emit({ type: "meta", source: "demo", model: input.model, modelName: input.modelName })
  input.emit({ type: "status", text: isFa ? "در حال برنامه‌ریزی…" : "Planning…" })

  await sleep(240)

  const choice = detectTool(input.text)
  const tool = findTool(choice.name) ?? TOOLS[0]
  const callId = nextRequestId()

  input.emit({
    type: "tool_start",
    id: callId,
    name: tool.name,
    label: tool.label,
    input: choice.input,
  })

  await sleep(320)

  const started = Date.now()
  const result = tool.run(choice.input, ctx)

  input.emit({
    type: "tool_end",
    id: callId,
    name: tool.name,
    ok: true,
    durationMs: Date.now() - started + 120,
    text: result.text,
    link: result.link,
    structured: result.structured,
  })

  const intro = isFa
    ? `${result.text}\n\n_پاسخ از دادهٔ دمو ساخته شد — برای مدل زنده در تنظیمات کلید API را وارد کنید._`
    : `${result.text}\n\n_Demo reply built from local data — add an API key in settings for a live model._`

  for (const chunk of chunkForStreaming(intro)) {
    if (input.signal?.aborted) break
    input.emit({ type: "delta", text: chunk })
    await sleep(12)
  }

  const promptTokens = Math.max(24, Math.round(input.text.length / 3.6))
  const completionTokens = Math.max(16, Math.round(intro.length / 3.8))

  recordTokens(promptTokens + completionTokens)
  input.emit({
    type: "usage",
    promptTokens,
    completionTokens,
    costUsd: estimateCost(input.model, promptTokens, completionTokens),
  })

  input.emit({
    type: "done",
    source: "demo",
    budget: budgetSnapshot(),
    redactions: input.redactions,
    latencyMs: Date.now() - input.started,
  })

  if (input.note) {
    console.info("[agent] live call failed, fell back to demo:", input.note)
  }
}

/** Split into word-sized chunks so streaming looks like typing, not a paste. */
function chunkForStreaming(text: string): string[] {
  const parts = text.match(/(\s+|[^\s]+\s*)/g) ?? [text]
  return parts
}
