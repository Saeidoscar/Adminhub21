import assert from "node:assert/strict"
import { afterEach, beforeEach, test } from "node:test"
import { webcrypto } from "node:crypto"
import worker, { testing } from "../src/index.mjs"

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto
}

const originalFetch = globalThis.fetch
const originalNow = Date.now
const env = {
  TELEGRAM_BOT_TOKEN: "123456:telegram-secret-token",
  DADLINE_RELAY_SECRET: "relay-shared-secret",
  TELEGRAM_API_BASE_URL: "https://api.telegram.org",
}

beforeEach(() => {
  Date.now = () => 1_786_000_000_000
})

afterEach(() => {
  globalThis.fetch = originalFetch
  Date.now = originalNow
})

test("forwards an authenticated sendMessage request to Telegram", async () => {
  const body = JSON.stringify({
    chat_id: "@dadlinenet",
    text: "Dadline test",
    parse_mode: "HTML",
    forbidden_field: "must-not-pass",
  })
  const timestamp = String(Math.floor(Date.now() / 1000))
  const signature = await testing.hmacSha256Hex(
    env.DADLINE_RELAY_SECRET,
    `${timestamp}.${body}`,
  )
  let forwardedUrl = null
  let forwardedPayload = null
  let forwardedOptions = null

  globalThis.fetch = async (url, options) => {
    forwardedUrl = url
    forwardedPayload = JSON.parse(options.body)
    forwardedOptions = options

    return new Response(
      JSON.stringify({
        ok: true,
        result: { message_id: 71, chat: { id: -100123 } },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  const response = await worker.fetch(
    new Request("https://relay.test/v1/telegram/sendMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Dadline-Relay-Timestamp": timestamp,
        "X-Dadline-Relay-Signature": `sha256=${signature}`,
        "X-Dadline-Request-Id": "request-71",
      },
      body,
    }),
    env,
  )

  assert.equal(response.status, 200)
  assert.equal(
    forwardedUrl,
    "https://api.telegram.org/bot123456:telegram-secret-token/sendMessage",
  )
  assert.equal(forwardedOptions.redirect, "manual")
  assert.deepEqual(forwardedPayload, {
    chat_id: "@dadlinenet",
    text: "Dadline test",
    parse_mode: "HTML",
  })
  assert.equal(response.headers.get("x-dadline-relay-request-id"), "request-71")
})

test("rejects an invalid signature without calling Telegram", async () => {
  let telegramCalled = false
  globalThis.fetch = async () => {
    telegramCalled = true
    return new Response("{}")
  }

  const response = await worker.fetch(
    new Request("https://relay.test/v1/telegram/sendMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Dadline-Relay-Timestamp": String(Math.floor(Date.now() / 1000)),
        "X-Dadline-Relay-Signature": `sha256=${"0".repeat(64)}`,
      },
      body: JSON.stringify({ chat_id: "1", text: "test" }),
    }),
    env,
  )

  assert.equal(response.status, 401)
  assert.equal(telegramCalled, false)
})

test("rejects expired signed requests", async () => {
  const body = JSON.stringify({ chat_id: "1", text: "test" })
  const timestamp = String(Math.floor(Date.now() / 1000) - 301)
  const signature = await testing.hmacSha256Hex(
    env.DADLINE_RELAY_SECRET,
    `${timestamp}.${body}`,
  )

  const response = await worker.fetch(
    new Request("https://relay.test/v1/telegram/sendMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Dadline-Relay-Timestamp": timestamp,
        "X-Dadline-Relay-Signature": `sha256=${signature}`,
      },
      body,
    }),
    env,
  )

  assert.equal(response.status, 401)
})

test("rejects unexpected Telegram redirects without following them", async () => {
  const body = JSON.stringify({
    chat_id: "@dadlinenet",
    text: "Dadline redirect test",
  })
  const timestamp = String(Math.floor(Date.now() / 1000))
  const signature = await testing.hmacSha256Hex(
    env.DADLINE_RELAY_SECRET,
    `${timestamp}.${body}`,
  )

  globalThis.fetch = async (_url, options) => {
    assert.equal(options.redirect, "manual")

    return new Response(null, {
      status: 302,
      headers: { Location: "https://example.test/unexpected" },
    })
  }

  const response = await worker.fetch(
    new Request("https://relay.test/v1/telegram/sendMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Dadline-Relay-Timestamp": timestamp,
        "X-Dadline-Relay-Signature": `sha256=${signature}`,
        "X-Dadline-Request-Id": "request-redirect",
      },
      body,
    }),
    env,
  )

  assert.equal(response.status, 502)
  assert.deepEqual(await response.json(), {
    ok: false,
    error_code: 502,
    description: "Telegram upstream returned an unexpected redirect.",
  })
})
