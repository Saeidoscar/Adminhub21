const RELAY_PATH = "/v1/telegram/sendMessage"
const MAX_BODY_BYTES = 64 * 1024
const MAX_MESSAGE_LENGTH = 4096
const MAX_CLOCK_SKEW_SECONDS = 300

const ALLOWED_FIELDS = new Set([
  "chat_id",
  "text",
  "message_thread_id",
  "direct_messages_topic_id",
  "parse_mode",
  "link_preview_options",
  "disable_notification",
  "protect_content",
  "reply_parameters",
  "reply_markup",
])

export default {
  async fetch(request, env) {
    const requestId =
      request.headers.get("x-dadline-request-id") || crypto.randomUUID()
    const url = new URL(request.url)

    if (request.method === "GET" && url.pathname === "/health") {
      return jsonResponse(
        { ok: true, service: "dadline-telegram-relay" },
        200,
        requestId,
      )
    }

    if (url.pathname !== RELAY_PATH) {
      return jsonResponse(
        { ok: false, error_code: 404, description: "Route not found." },
        404,
        requestId,
      )
    }

    if (request.method !== "POST") {
      return jsonResponse(
        { ok: false, error_code: 405, description: "Method not allowed." },
        405,
        requestId,
        { Allow: "POST" },
      )
    }

    if (!env.TELEGRAM_BOT_TOKEN || !env.DADLINE_RELAY_SECRET) {
      return jsonResponse(
        {
          ok: false,
          error_code: 500,
          description: "Relay secrets are not configured.",
        },
        500,
        requestId,
      )
    }

    const contentLength = Number(request.headers.get("content-length") || 0)

    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return jsonResponse(
        { ok: false, error_code: 413, description: "Payload is too large." },
        413,
        requestId,
      )
    }

    const contentType = request.headers.get("content-type") || ""

    if (!contentType.toLowerCase().includes("application/json")) {
      return jsonResponse(
        {
          ok: false,
          error_code: 415,
          description: "Content-Type must be application/json.",
        },
        415,
        requestId,
      )
    }

    const rawBody = await request.text()

    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return jsonResponse(
        { ok: false, error_code: 413, description: "Payload is too large." },
        413,
        requestId,
      )
    }

    const authenticationError = await validateSignature(
      request,
      rawBody,
      env.DADLINE_RELAY_SECRET,
    )

    if (authenticationError) {
      return jsonResponse(
        { ok: false, error_code: 401, description: authenticationError },
        401,
        requestId,
      )
    }

    let input

    try {
      input = JSON.parse(rawBody)
    } catch {
      return jsonResponse(
        { ok: false, error_code: 400, description: "Invalid JSON body." },
        400,
        requestId,
      )
    }

    const validationError = validatePayload(input)

    if (validationError) {
      return jsonResponse(
        { ok: false, error_code: 400, description: validationError },
        400,
        requestId,
      )
    }

    const telegramPayload = pickAllowedFields(input)
    const apiBaseUrl = String(
      env.TELEGRAM_API_BASE_URL || "https://api.telegram.org",
    )
      .trim()
      .replace(/\/+$/, "")
    const botToken = String(env.TELEGRAM_BOT_TOKEN || "").trim()

    if (!botToken.includes(":") || /\s/.test(botToken)) {
      console.error("Telegram relay configuration error", {
        request_id: requestId,
        reason: "invalid_bot_token_format",
      })

      return jsonResponse(
        {
          ok: false,
          error_code: 500,
          description: "Telegram bot token format is invalid.",
        },
        500,
        requestId,
      )
    }

    const telegramUrl = `${apiBaseUrl}/bot${botToken}/sendMessage`

    try {
      const telegramResponse = await fetch(telegramUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "DadlineTelegramRelay/1.0",
        },
        body: JSON.stringify(telegramPayload),
        cache: "no-store",
        redirect: "manual",
      })

      if (telegramResponse.status >= 300 && telegramResponse.status < 400) {
        console.error("Telegram upstream returned an unexpected redirect", {
          request_id: requestId,
          upstream_host: new URL(apiBaseUrl).hostname,
          upstream_status: telegramResponse.status,
        })

        return jsonResponse(
          {
            ok: false,
            error_code: 502,
            description: "Telegram upstream returned an unexpected redirect.",
          },
          502,
          requestId,
        )
      }

      const responseBody = await telegramResponse.arrayBuffer()
      const headers = responseHeaders(requestId, {
        "Content-Type":
          telegramResponse.headers.get("content-type") ||
          "application/json; charset=utf-8",
      })
      const retryAfter = telegramResponse.headers.get("retry-after")

      if (retryAfter) {
        headers.set("Retry-After", retryAfter)
      }

      return new Response(responseBody, {
        status: telegramResponse.status,
        headers,
      })
    } catch (error) {
      console.error("Telegram upstream fetch failed", {
        request_id: requestId,
        upstream_host: new URL(apiBaseUrl).hostname,
        error_name: error instanceof Error ? error.name : "UnknownError",
        error_message: error instanceof Error ? error.message : String(error),
        error_cause:
          error instanceof Error && error.cause ? String(error.cause) : null,
      })

      return jsonResponse(
        {
          ok: false,
          error_code: 502,
          description: "Telegram upstream is unavailable.",
        },
        502,
        requestId,
      )
    }
  },
}

async function validateSignature(request, rawBody, secret) {
  const timestamp = request.headers.get("x-dadline-relay-timestamp") || ""
  const suppliedSignature =
    request.headers.get("x-dadline-relay-signature") || ""

  if (!/^\d{10}$/.test(timestamp)) {
    return "Missing or invalid relay timestamp."
  }

  if (!/^sha256=[a-f0-9]{64}$/i.test(suppliedSignature)) {
    return "Missing or invalid relay signature."
  }

  const requestTime = Number(timestamp)
  const now = Math.floor(Date.now() / 1000)

  if (Math.abs(now - requestTime) > MAX_CLOCK_SKEW_SECONDS) {
    return "Relay request timestamp is expired."
  }

  const expectedSignature = `sha256=${await hmacSha256Hex(secret, `${timestamp}.${rawBody}`)}`

  return constantTimeEqual(
    expectedSignature.toLowerCase(),
    suppliedSignature.toLowerCase(),
  )
    ? null
    : "Relay signature is invalid."
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "Request body must be a JSON object."
  }

  if (
    !["string", "number"].includes(typeof payload.chat_id) ||
    String(payload.chat_id).trim() === ""
  ) {
    return "chat_id is required."
  }

  if (typeof payload.text !== "string") {
    return "text is required."
  }

  const messageLength = Array.from(payload.text).length

  if (messageLength < 1 || messageLength > MAX_MESSAGE_LENGTH) {
    return "text must contain between 1 and 4096 characters."
  }

  return null
}

function pickAllowedFields(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => ALLOWED_FIELDS.has(key)),
  )
}

async function hmacSha256Hex(secret, value) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value))

  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) {
    return false
  }

  let difference = 0

  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }

  return difference === 0
}

function jsonResponse(payload, status, requestId, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: responseHeaders(requestId, {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    }),
  })
}

function responseHeaders(requestId, extraHeaders = {}) {
  return new Headers({
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Dadline-Relay-Request-Id": requestId,
    ...extraHeaders,
  })
}

export const testing = {
  hmacSha256Hex,
  pickAllowedFields,
  validatePayload,
}
