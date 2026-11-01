#!/usr/bin/env node
/**
 * LayerCloud trial smoke test — read-only proof that the key works.
 *
 *   node scripts/layercloud-smoke.mjs                 # 3 cheapest free models
 *   node scripts/layercloud-smoke.mjs --all           # every allowed free model
 *   node scripts/layercloud-smoke.mjs --model=zai/glm-5.2
 *   node scripts/layercloud-smoke.mjs --redaction     # also prove the PII filter
 *
 * Key resolution order: $LAYERCLOUD_API_KEY, then apps/api/.env, then ./.env.
 * Nothing is written to disk and no prompt content is logged beyond the tiny
 * test instruction below.
 *
 * The model list mirrors config('services.layercloud.free_models'): models that
 * carried a "Free" badge on https://ai.layercloud.org/pricing on 2026-11-01.
 * "Free" means no top-up required — every call is still charged to the credit.
 */

import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const BASE_URL = process.env.LAYERCLOUD_BASE_URL ?? "https://ai.layercloud.org/v1"

/** Free-badge text models with their live per-1M prices [in, out]. */
const FREE_MODELS = {
  "deepseek/deepseek-v4-flash-0731": [0.0163, 0.045],
  "zai/glm-5.3-flash": [0.0187, 0.0625],
  "openai/gpt-oss": [0.02, 0.08],
  "deepseek/deepseek-v4.1-flash": [0.0375, 0.15],
  "openai/gpt-5.6-luna": [0.05, 0.3],
  "minimax/minimax-m3": [0.075, 0.3],
  "alibaba/qwen3.7-pro": [0.08, 0.32],
  "moonshotai/kimi-k2.7-code": [0.165, 0.85],
  "google/gemini-3.6-flash": [0.1875, 0.9375],
  "zai/glm-5.2": [0.2415, 0.759],
  "zai/glm-5.1": [0.2415, 0.759],
  "deepseek/deepseek-v4-pro-0813": [0.2802, 0.8405],
  "zai/glm-5.3": [0.35, 1.1],
  "openai/gpt-5.3": [0.4375, 3.5],
  "alibaba/qwen3.8-max": [0.5, 1.5],
  "openai/gpt-4o": [0.625, 2.5],
  "moonshotai/kimi-k3": [0.75, 3.75],
}

const CHEAPEST = Object.entries(FREE_MODELS)
  .sort((a, b) => a[1][0] + a[1][1] - (b[1][0] + b[1][1]))
  .slice(0, 3)
  .map(([model]) => model)

function readEnvFile(path) {
  try {
    return Object.fromEntries(
      readFileSync(path, "utf8")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const index = line.indexOf("=")
          return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^["']|["']$/g, "")]
        }),
    )
  } catch {
    return {}
  }
}

function resolveKey() {
  if (process.env.LAYERCLOUD_API_KEY) return process.env.LAYERCLOUD_API_KEY

  for (const candidate of ["apps/api/.env", ".env"]) {
    const value = readEnvFile(resolve(ROOT, candidate)).LAYERCLOUD_API_KEY
    if (value) return value
  }

  return null
}

/** Same identifiers the PHP PromptRedactor strips; kept here to prove parity. */
function redact(text) {
  const D = "[\\d\\u06F0-\\u06F9\\u0660-\\u0669]"
  const open = "(?<![\\p{L}\\p{N}])"
  const close = "(?![\\p{N}])"
  const patterns = [
    [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/gu, "[redacted:email]"],
    [new RegExp(`(?<![\\p{L}\\p{N}])IR${D}{24}${close}`, "giu"), "[redacted:iban]"],
    [new RegExp(`${open}${D}{4}(?:[ \\-]?${D}{4}){3}${close}`, "gu"), "[redacted:card]"],
    [new RegExp(`${open}(?:\\+|00)?(?:98|0)?9${D}{9}${close}`, "gu"), "[redacted:phone]"],
    [new RegExp(`${open}${D}{10}${close}`, "gu"), "[redacted:national_id]"],
  ]

  let count = 0
  let output = text
  for (const [pattern, replacement] of patterns) {
    output = output.replace(pattern, () => {
      count += 1
      return replacement
    })
  }
  return { output, count }
}

async function callModel(key, model, prompt) {
  const started = Date.now()

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are a connectivity probe. Answer in as few tokens as possible." },
        { role: "user", content: prompt },
      ],
      max_tokens: 24,
      stream: false,
    }),
    signal: AbortSignal.timeout(60_000),
  })

  const latency = Date.now() - started
  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    return {
      ok: false,
      latency,
      status: response.status,
      detail: body?.error?.message ?? body?.message ?? JSON.stringify(body).slice(0, 200),
    }
  }

  const usage = body.usage ?? {}
  const promptTokens = usage.prompt_tokens ?? usage.input_tokens ?? 0
  const completionTokens = usage.completion_tokens ?? usage.output_tokens ?? 0
  const price = FREE_MODELS[model]

  return {
    ok: true,
    latency,
    status: response.status,
    model: body.model ?? model,
    content: (body.choices?.[0]?.message?.content ?? "").trim().replace(/\s+/g, " ").slice(0, 80),
    promptTokens,
    completionTokens,
    costUsd: price ? (promptTokens * price[0] + completionTokens * price[1]) / 1_000_000 : null,
  }
}

async function main() {
  const key = resolveKey()

  if (!key) {
    console.error("✖ No LAYERCLOUD_API_KEY found in the environment, apps/api/.env or .env")
    process.exit(1)
  }

  const args = process.argv.slice(2)
  const flag = (name) => args.find((arg) => arg === `--${name}` || arg.startsWith(`--${name}=`))
  const modelArg = flag("model")?.split("=")[1]

  const models = modelArg ? [modelArg] : flag("all") ? Object.keys(FREE_MODELS) : CHEAPEST

  console.log(`LayerCloud trial smoke test`)
  console.log(`  endpoint : ${BASE_URL}`)
  console.log(`  key      : ${key.slice(0, 6)}…${key.slice(-4)} (${key.length} chars)`)
  console.log(`  models   : ${models.length}\n`)

  let totalCost = 0
  let failures = 0

  for (const model of models) {
    if (!(model in FREE_MODELS)) {
      console.log(`✖ ${model}\n   not on the free-tier allow-list; skipping.`)
      failures += 1
      continue
    }

    try {
      const result = await callModel(key, model, "Reply with the single word: ok")

      if (!result.ok) {
        failures += 1
        console.log(`✖ ${model}\n   HTTP ${result.status} · ${result.latency}ms · ${result.detail}`)
        continue
      }

      totalCost += result.costUsd ?? 0
      const cost = result.costUsd === null ? "cost n/a" : `$${result.costUsd.toFixed(8)}`

      console.log(
        `✔ ${model}\n` +
          `   HTTP ${result.status} · ${result.latency}ms · tokens ${result.promptTokens}/${result.completionTokens} · ${cost}\n` +
          `   "${result.content}"`,
      )
    } catch (error) {
      failures += 1
      // `fetch failed` on its own says nothing; the cause carries the reason
      // (ENOTFOUND, ECONNRESET, certificate errors, sandbox egress blocks…).
      const cause = error instanceof Error ? (error.cause ?? null) : null
      const detail =
        cause && typeof cause === "object" && "code" in cause
          ? `${cause.code}${"message" in cause ? ` · ${cause.message}` : ""}`
          : error instanceof Error
            ? error.message
            : String(error)

      console.log(`✖ ${model}\n   ${detail}`)
      console.log(
        "   hint: if this is a network block rather than a key error, run the script from a machine that can reach " +
          `${new URL(BASE_URL).host}, or from inside the api container.`,
      )
    }
  }

  if (flag("redaction")) {
    const sample = "کاربر با ایمیل saeid@example.com و شماره 09121234567 و کد ملی ۰۰۱۳۵۴۶۹۸۷ پیام داد."
    const { output, count } = redact(sample)
    console.log(`\nRedaction parity (${count} spans):\n   ${output}`)
  }

  console.log(`\nTotal measured spend: $${totalCost.toFixed(8)}`)
  console.log(
    failures === 0
      ? "✔ Trial route is reachable and the key is valid."
      : `✖ ${failures} failure(s) — check the key, the model id, or the account balance.`,
  )

  process.exit(failures === 0 ? 0 : 1)
}

await main()
