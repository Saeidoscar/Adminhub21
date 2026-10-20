/**
 * Preview gateway: serves the Next.js public site against the in-memory demo
 * dataset, so a presentation build has real packages instead of an empty
 * marketplace.
 *
 * The Next app speaks the Laravel API contract (`/api/v1/marketplace/*`), while
 * the demo handler (`dev/demo-api-handler.ts`) speaks the Vite SPA's older
 * `/api/*` shapes. This file is the adapter between the two — it is preview
 * tooling, not part of the product, and never runs in production.
 *
 * Usage:
 *   node dev/preview-gateway.mjs            # serves on 127.0.0.1:8090
 *   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8090 pnpm --filter @adminhub/web dev
 */
import { createServer } from "node:http"

import { handleDemoRequest } from "./demo-api-handler.ts"

const PORT = Number(process.env.PREVIEW_GATEWAY_PORT ?? 8090)
const HOST = process.env.PREVIEW_GATEWAY_HOST ?? "127.0.0.1"

const PLATFORM_LABELS = {
  instagram: "اینستاگرام",
  telegram: "تلگرام",
  youtube: "یوتیوب",
  tiktok: "تیک‌تاک",
  linkedin: "لینکدین",
  twitter: "توییتر",
  website: "وب‌سایت",
  whatsapp: "واتساپ",
  digikala: "دیجی‌کالا",
  torob: "ترب",
  google: "گوگل",
  snapchat: "اسنپ‌چت",
}

/** Specialist names used by the public marketplace cards. */
const SPECIALISTS = {
  "ap-sarah": "سارا جانسون",
  "ap-mina": "مینا رستمی",
  "ap-reza": "رضا کاظمی",
  "ap-parvin": "پروین احمدی",
  "ap-kian": "کیان مرادی",
  "ap-sara": "سارا موسوی",
  "ap-amir": "امیر توکلی",
  "ap-niloofar": "نیلوفر صادقی",
}

/** Demo package → Laravel `MarketplacePackage`. */
function toMarketplacePackage(row = {}) {
  const platform = Array.isArray(row.platforms) ? row.platforms[0] : undefined
  return {
    id: row.id,
    user_id: row.adminId ?? "ap-sarah",
    title: row.name ?? "بسته‌ی بدون عنوان",
    slug: row.id,
    description: row.description ?? null,
    price: row.priceToman ?? 0,
    currency: "تومان",
    features: row.features ?? featuresFor(row),
    media: null,
    status: row.active === false ? "draft" : "published",
    views: row.views ?? 0,
    sales: row.sales ?? 0,
    user: {
      id: row.adminId ?? "ap-sarah",
      name: SPECIALISTS[row.adminId] ?? "متخصص تأییدشده",
      avatar: null,
    },
    platform_configs: platform ? [{ platform }] : [],
    category: platform ? (PLATFORM_LABELS[platform] ?? platform) : "خدمات",
  }
}

const fa = (value) => Number(value).toLocaleString("fa-IR")

/** The demo seed has no feature list; derive a readable one from its config. */
function featuresFor(row) {
  const config = Array.isArray(row.platformConfigs) ? row.platformConfigs[0]?.settings : null
  const features = []
  if (config?.postsPerMonth) features.push(`${fa(config.postsPerMonth)} پست در ماه`)
  if (config?.reelsPerMonth) features.push(`${fa(config.reelsPerMonth)} ریلز در ماه`)
  if (config?.storiesPerMonth) features.push(`${fa(config.storiesPerMonth)} استوری در ماه`)
  if (row.deliveryTime) features.push(`زمان تحویل: ${row.deliveryTime}`)
  if (row.billingCycle === "monthly") features.push("قابل تمدید ماهانه")
  return features.length ? features : ["پشتیبانی در تیکت", "گزارش تحویل"]
}

function toCategories(rows) {
  const seen = new Map()
  for (const row of rows) {
    const platform = Array.isArray(row.platforms) ? row.platforms[0] : undefined
    if (!platform || seen.has(platform)) continue
    seen.set(platform, {
      id: seen.size + 1,
      name: PLATFORM_LABELS[platform] ?? platform,
      slug: platform,
    })
  }
  return [...seen.values()]
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
    req.on("error", reject)
  })
}

async function demo(method, path, body = "") {
  const result = await handleDemoRequest(method, path, body)
  return result.body ?? null
}

/**
 * `/api/v1/marketplace/*` → demo handler, reshaped to the contract the Next
 * app reads. Everything else under `/api/v1` falls through to the demo handler
 * with `/api/v1` stripped, which is enough for health checks.
 */
async function route(method, path, search, body) {
  if (path === "/api/v1/marketplace/search" || path === "/api/v1/marketplace/packages") {
    const { packages = [] } = (await demo("GET", `/api/packages?${search.toString()}`)) ?? {}
    const rows = packages.map(toMarketplacePackage)
    const page = Number(search.get("page") ?? 1)
    const perPage = Number(search.get("per_page") ?? 24)
    const start = (page - 1) * perPage

    return {
      data: rows.slice(start, start + perPage),
      current_page: page,
      last_page: Math.max(1, Math.ceil(rows.length / perPage)),
      total: rows.length,
      per_page: perPage,
    }
  }

  const packageMatch = path.match(/^\/api\/v1\/marketplace\/packages\/([^/]+)$/)
  if (packageMatch) {
    const ref = decodeURIComponent(packageMatch[1])
    const bodyValue = await demo("GET", `/api/packages/${ref}`)
    const row = bodyValue?.package
    return row ? toMarketplacePackage(row) : null
  }

  if (path === "/api/v1/marketplace/categories") {
    const { packages = [] } = (await demo("GET", "/api/packages")) ?? {}
    return toCategories(packages)
  }

  const stripped = path.replace(/^\/api\/v1/, "/api")
  return demo(method, `${stripped}${search.toString() ? `?${search}` : ""}`, body)
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://preview.local")
  const method = (req.method ?? "GET").toUpperCase()
  const body = method === "GET" || method === "HEAD" ? "" : await readBody(req)

  try {
    const payload = await route(method, url.pathname, url.searchParams, body)
    res.statusCode = payload == null ? 404 : 200
    res.setHeader("Content-Type", "application/json; charset=utf-8")
    res.setHeader("Cache-Control", "no-store")
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.end(payload == null ? JSON.stringify({ error: "not found" }) : JSON.stringify(payload))
  } catch (error) {
    res.statusCode = 500
    res.setHeader("Content-Type", "application/json; charset=utf-8")
    res.end(JSON.stringify({ error: String(error) }))
  }
}).listen(PORT, HOST, () => {
  console.log(`[preview-gateway] demo API on http://${HOST}:${PORT}`)
})
