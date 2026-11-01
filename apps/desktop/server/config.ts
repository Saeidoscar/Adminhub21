/**
 * Model catalogue and guard rails for the desktop demo.
 *
 * The demo is wired to the same gateway the Laravel API uses (LayerCloud), but
 * it only ever touches models that carry their "Free" badge — i.e. no top-up
 * required. Mirrors `apps/api/config/services.php`; if the catalogue drifts,
 * update both.
 */

export type ModelInfo = {
  id: string
  name: string
  inUsd: number
  outUsd: number
  context: number
  blurb: string
}

export const MODELS: ModelInfo[] = [
  {
    id: "zai/glm-5.3-flash",
    name: "GLM 5.3 Flash",
    inUsd: 0.0187,
    outUsd: 0.0625,
    context: 1_300_000,
    blurb: "Default. Fast, cheap, good Persian.",
  },
  {
    id: "deepseek/deepseek-v4-flash-0731",
    name: "DeepSeek V4 Flash",
    inUsd: 0.0163,
    outUsd: 0.045,
    context: 1_300_000,
    blurb: "Cheapest on the list.",
  },
  {
    id: "alibaba/qwen3.7-pro",
    name: "Qwen 3.7 Pro",
    inUsd: 0.08,
    outUsd: 0.32,
    context: 1_000_000,
    blurb: "Strong Persian + reasoning.",
  },
  {
    id: "minimax/minimax-m3",
    name: "MiniMax M3",
    inUsd: 0.075,
    outUsd: 0.3,
    context: 1_000_000,
    blurb: "Balanced general chat.",
  },
  {
    id: "deepseek/deepseek-v4-pro-0813",
    name: "DeepSeek V4 Pro",
    inUsd: 0.2802,
    outUsd: 0.8405,
    context: 1_000_000,
    blurb: "Best cheap reasoner.",
  },
  {
    id: "google/gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    inUsd: 0.1875,
    outUsd: 0.9375,
    context: 1_000_000,
    blurb: "Multimodal (text/image/video).",
  },
  {
    id: "openai/gpt-5.3",
    name: "GPT-5.3-Codex",
    inUsd: 0.4375,
    outUsd: 3.5,
    context: 400_000,
    blurb: "Codex — priciest, best at code.",
  },
]

export const DEFAULT_MODEL = MODELS[0].id
export const DAILY_TOKEN_BUDGET = 200_000
export const MAX_OUTPUT_TOKENS = 900

export function findModel(id: string): ModelInfo | undefined {
  return MODELS.find((model) => model.id === id)
}

export function isAllowedModel(id: string): boolean {
  if (!id || /:(jailbreak|uncensored)/i.test(id)) return false
  return Boolean(findModel(id))
}

export function estimateCost(
  id: string,
  promptTokens: number,
  completionTokens: number,
): number | null {
  const model = findModel(id)
  if (!model) return null
  return (promptTokens * model.inUsd + completionTokens * model.outUsd) / 1_000_000
}

/**
 * Identifiers we strip before a prompt is allowed to leave the machine. Same
 * rules as `App\Services\Ai\Guardrails\PromptRedactor`. This is a backstop, not
 * a licence: the demo never sends contracts, IDs or payment data anywhere.
 */
export function redact(text: string): { text: string; count: number } {
  const D = "[\\d\\u06F0-\\u06F9\\u0660-\\u0669]"
  const open = "(?<![\\p{L}\\p{N}])"
  const close = "(?![\\p{N}])"

  const rules: Array<[RegExp, string]> = [
    [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/gu, "[redacted:email]"],
    [new RegExp(`(?<![\\p{L}\\p{N}])IR${D}{24}${close}`, "giu"), "[redacted:iban]"],
    [new RegExp(`${open}${D}{4}(?:[ \\-]?${D}{4}){3}${close}`, "gu"), "[redacted:card]"],
    [new RegExp(`${open}(?:\\+|00)?(?:98|0)?9${D}{9}${close}`, "gu"), "[redacted:phone]"],
    [new RegExp(`${open}${D}{10}${close}`, "gu"), "[redacted:national_id]"],
  ]

  let count = 0
  let output = text

  for (const [pattern, replacement] of rules) {
    output = output.replace(pattern, () => {
      count += 1
      return replacement
    })
  }

  return { text: output, count }
}
