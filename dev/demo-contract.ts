/**
 * Demo data, reshaped to the API contract the Next.js app speaks.
 *
 * The seeded dataset in `dev/demo-data.ts` was written for the older Vite SPA
 * (`/api/packages`, `{ packages: [...] }`). The Next app talks to the Laravel
 * API instead (`/api/v1/marketplace/*`, paginated `{ data, current_page, … }`,
 * snake_case rows). This module is the single translation layer between them so
 * the desktop build can run the *whole* product on mock data.
 *
 * It is demo tooling: nothing here ships to production.
 */
import { handleDemoRequest } from "./demo-api-handler.ts"

type Json = Record<string, any>

const API = "/api/v1"

// ── helpers ────────────────────────────────────────────────────────────────

const fa = (value: unknown) => Number(value ?? 0).toLocaleString("fa-IR")

async function demo(method: string, path: string, body: Json | null = null): Promise<any> {
  const result = await handleDemoRequest(method, path, body ? JSON.stringify(body) : "")
  return result.status >= 400 ? null : (result.body ?? null)
}

function page<T>(rows: T[], search: URLSearchParams): Json {
  const current = Math.max(1, Number(search.get("page") ?? 1))
  const perPage = Math.min(50, Math.max(1, Number(search.get("per_page") ?? 20)))
  const start = (current - 1) * perPage

  return {
    data: rows.slice(start, start + perPage),
    current_page: current,
    last_page: Math.max(1, Math.ceil(rows.length / perPage)),
    total: rows.length,
    per_page: perPage,
  }
}

/** Demo strings ("contract-1") → stable numbers the typed client expects. */
const numeric = (id: unknown) => {
  const match = String(id ?? "").match(/(\d+)$/)
  return match ? Number(match[1]) : 0
}

/** …and back: numeric ids from the client address `contract-1` in the demo. */
const demoId = (prefix: string, id: unknown) =>
  /^\d+$/.test(String(id)) ? `${prefix}-${id}` : String(id)

// ── identity ───────────────────────────────────────────────────────────────

const DEMO_USER = {
  id: 2,
  name: "علی رضایی",
  email: "demo@adminhub21.test",
  role: "user",
  phone: "+98 912 345 6789",
  is_verified: true,
  created_at: "2026-07-01T08:00:00.000Z",
}

/** Every specialist is a counterparty the contract form can resolve by email. */
const SPECIALISTS: Record<string, { id: number; name: string; email: string }> = {
  "ap-sarah": { id: 11, name: "سارا جانسون", email: "sara@adminhub21.test" },
  "ap-mina": { id: 12, name: "مینا رستمی", email: "mina@adminhub21.test" },
  "ap-reza": { id: 13, name: "رضا کاظمی", email: "reza@adminhub21.test" },
  "ap-parvin": { id: 14, name: "پروین احمدی", email: "parvin@adminhub21.test" },
  "ap-kian": { id: 15, name: "کیان مرادی", email: "kian@adminhub21.test" },
  "ap-sara": { id: 16, name: "سارا موسوی", email: "saram@adminhub21.test" },
  "ap-amir": { id: 17, name: "امیر توکلی", email: "amir@adminhub21.test" },
  "ap-niloofar": { id: 18, name: "نیلوفر صادقی", email: "niloofar@adminhub21.test" },
}

function specialistFor(adminId: string) {
  return SPECIALISTS[adminId] ?? { id: 11, name: "متخصص تأییدشده", email: "expert@adminhub21.test" }
}

// ── packages / marketplace ─────────────────────────────────────────────────

const PLATFORM_LABELS: Record<string, string> = {
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

function featuresFor(row: Json): string[] {
  const config = Array.isArray(row.platformConfigs) ? row.platformConfigs[0]?.settings : null
  const features: string[] = []

  if (config?.postsPerMonth) features.push(`${fa(config.postsPerMonth)} پست در ماه`)
  if (config?.reelsPerMonth) features.push(`${fa(config.reelsPerMonth)} ریلز در ماه`)
  if (config?.storiesPerMonth) features.push(`${fa(config.storiesPerMonth)} استوری در ماه`)
  if (row.deliveryTime) features.push(`زمان تحویل: ${row.deliveryTime}`)
  if (row.billingCycle === "monthly") features.push("قابل تمدید ماهانه")

  return features.length ? features : ["پشتیبانی در تیکت", "گزارش تحویل"]
}

function toPackage(row: Json): Json {
  const platform = Array.isArray(row.platforms) ? row.platforms[0] : undefined
  const seller = specialistFor(row.adminId)

  return {
    id: numeric(row.id),
    user_id: seller.id,
    title: row.name ?? "بسته‌ی بدون عنوان",
    slug: row.id,
    description: row.description ?? null,
    price: row.priceToman ?? 0,
    currency: "تومان",
    features: featuresFor(row),
    media: null,
    status: row.active === false ? "draft" : "published",
    views: row.views ?? 0,
    sales: row.sales ?? 0,
    user: { id: seller.id, name: seller.name, avatar: null },
    platform_configs: platform ? [{ platform }] : [],
    category: platform ? (PLATFORM_LABELS[platform] ?? platform) : "خدمات",
  }
}

// ── contracts ──────────────────────────────────────────────────────────────

const CONTRACT_STATUS: Record<string, string> = {
  draft: "draft",
  pending: "pending",
  active: "active",
  completed: "completed",
  cancelled: "cancelled",
  expired: "cancelled",
}

function toContract(row: Json): Json {
  const expert = specialistFor(row.adminId)
  const signed = Boolean(row.signedByEmployerAt && row.signedByAdminAt)

  const clauses = [
    row.termClause && { id: 1, type: "term", title: "شرایط پرداخت", content: row.termClause },
    row.substituteClause && {
      id: 2,
      type: "substitute",
      title: "جانشین",
      content: row.substituteClause,
    },
    {
      id: 3,
      type: "insurance",
      title: "بیمه",
      content: row.hasInsurance
        ? "این قرارداد تحت پوشش بیمه‌ی فعالیت پلتفرم است."
        : "این قرارداد بیمه‌ی تکمیلی ندارد.",
    },
  ]
    .filter(Boolean)
    .map((clause: Json) => ({
      contract_id: numeric(row.id),
      is_accepted: signed,
      accepted_at: signed ? row.signedByEmployerAt : null,
      ...clause,
    }))

  return {
    id: numeric(row.id),
    user_id: DEMO_USER.id,
    client_id: expert.id,
    package_id: null,
    title: `قرارداد ${expert.name} — ${row.code ?? ""}`.trim(),
    description: row.termClause ?? null,
    amount: row.amountToman ?? 0,
    currency: "IRR",
    status: CONTRACT_STATUS[row.status] ?? "draft",
    signatures: [
      row.status !== "draft" &&
        row.signedByEmployerAt && {
          name: DEMO_USER.name,
          signed_at: row.signedByEmployerAt,
          ip_address: "127.0.0.1",
        },
      row.status !== "draft" &&
        row.signedByAdminAt && {
          name: expert.name,
          signed_at: row.signedByAdminAt,
          ip_address: "127.0.0.1",
        },
    ].filter(Boolean),
    signed_at: row.signedByAdminAt ?? row.signedByEmployerAt ?? null,
    clauses_accepted_at: signed ? row.signedByEmployerAt : null,
    starts_at: row.startDate ? `${row.startDate}T00:00:00.000Z` : null,
    ends_at: row.endDate ? `${row.endDate}T00:00:00.000Z` : null,
    created_at: row.createdAt ?? new Date().toISOString(),
    updated_at: row.updatedAt ?? row.createdAt ?? new Date().toISOString(),
    user: { id: DEMO_USER.id, name: DEMO_USER.name, avatar: null },
    client: { id: expert.id, name: expert.name, avatar: null },
    clauses: row.clauses ?? clauses,
    code: row.code ?? null,
  }
}

async function contracts(search: URLSearchParams, status?: string): Promise<Json> {
  const { contracts: rows = [] } = (await demo("GET", `/api/contracts?${search}`)) ?? {}
  const mapped = rows.map(toContract)
  const filtered = status ? mapped.filter((row: Json) => row.status === status) : mapped
  return page(filtered, search)
}

// ── wallet ─────────────────────────────────────────────────────────────────

const TXN_TYPE: Record<string, string> = {
  deposit: "online_charge",
  withdraw: "withdrawal",
  withdrawal: "withdrawal",
  payment: "contract_payment",
  transfer: "transfer",
  refund: "refund",
  fee: "platform_fee",
}

const TXN_STATUS: Record<string, string> = {
  completed: "completed",
  pending: "pending",
  processing: "processing",
  failed: "failed",
  cancelled: "cancelled",
}

function toTransaction(row: Json): Json {
  const type = TXN_TYPE[row.type] ?? row.type ?? "online_charge"

  return {
    id: numeric(row.id),
    user_id: DEMO_USER.id,
    amount: Math.abs(Number(row.amountToman ?? 0)),
    direction: type === "withdrawal" || type === "contract_payment" ? "withdrawal" : "deposit",
    type,
    status: TXN_STATUS[row.status] ?? "completed",
    payload: row.referenceId ? { reference: row.referenceId, note: row.note ?? null } : null,
    created_at: row.createdAt ?? new Date().toISOString(),
  }
}

async function walletBalance(): Promise<Json> {
  const { wallet } = (await demo("GET", "/api/wallet/balance")) ?? {}
  const total = Number(wallet?.balanceToman ?? 0)

  return {
    balance: total,
    withdrawable_balance: Math.floor(total * 0.8),
    blocked_balance: Math.ceil(total * 0.2),
  }
}

async function walletTransactions(search: URLSearchParams): Promise<Json> {
  const { transactions = [] } = (await demo("GET", "/api/wallet/transactions")) ?? {}
  return page(transactions.map(toTransaction), search)
}

// ── tickets ────────────────────────────────────────────────────────────────

const TICKET_STATUS: Record<string, string> = {
  open: "open",
  in_progress: "in_progress",
  resolved: "resolved",
  closed: "closed",
}

function toMessage(row: Json): Json {
  const staff =
    String(row.senderId ?? "").startsWith("user-root") ||
    String(row.senderName ?? "")
      .toLowerCase()
      .includes("support")

  return {
    id: numeric(row.id),
    ticket_id: numeric(row.ticketId),
    user_id: staff ? 1 : DEMO_USER.id,
    body: row.body ?? "",
    is_internal: row.isInternal === true,
    created_at: row.createdAt ?? new Date().toISOString(),
    user: { id: staff ? 1 : DEMO_USER.id, name: row.senderName ?? "پشتیبانی" },
  }
}

function toTicket(row: Json, messages: Json[] = []): Json {
  return {
    id: numeric(row.id),
    user_id: DEMO_USER.id,
    assigned_to: null,
    subject: row.subject ?? "بدون موضوع",
    description: messages[0]?.body ?? row.subject ?? "",
    priority: ["low", "medium", "high", "urgent"].includes(row.priority) ? row.priority : "medium",
    status: TICKET_STATUS[row.status] ?? "open",
    resolved_at: row.resolvedAt ?? null,
    last_message_at: row.updatedAt ?? row.createdAt ?? null,
    created_at: row.createdAt ?? new Date().toISOString(),
    updated_at: row.updatedAt ?? row.createdAt ?? new Date().toISOString(),
    user: { id: DEMO_USER.id, name: DEMO_USER.name },
    assignee: null,
    messages,
  }
}

async function tickets(search: URLSearchParams): Promise<Json> {
  const { tickets: rows = [] } = (await demo("GET", "/api/tickets")) ?? {}
  const status = search.get("status")

  const mapped = await Promise.all(
    rows
      .filter((row: Json) => !status || row.status === status)
      .map(async (row: Json) => {
        const { messages = [] } = (await demo("GET", `/api/tickets/${row.id}/messages`)) ?? {}
        return toTicket(row, messages.map(toMessage))
      }),
  )

  return page(mapped, search)
}

// ── a minimal, valid, single-page PDF for the contract download ────────────

function demoPdf(contract: Json): Buffer {
  const lines = [
    `AdminHub21 - contract ${contract.code ?? contract.id}`,
    `Title: ${String(contract.title).replace(/[^\x20-\x7E]/g, "")}`,
    `Amount: ${Number(contract.amount).toLocaleString("en-US")} IRR`,
    `Status: ${contract.status}`,
    `Created: ${contract.created_at.slice(0, 10)}`,
    "Generated locally from demo data. Not a legal document.",
  ]

  const text = lines
    .map(
      (line, index) =>
        `BT /F1 12 Tf 56 ${760 - index * 22} Td (${line.replace(/[()\\]/g, "")}) Tj ET`,
    )
    .join("\n")

  const body = `1 0 0 1 0 0 cm\n${text}`

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${body.length} >>\nstream\n${body}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ]

  let pdf = "%PDF-1.4\n"
  const offsets: number[] = []

  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })

  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const offset of offsets) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`

  return Buffer.from(pdf, "latin1")
}

// ── router ─────────────────────────────────────────────────────────────────

export type ContractResult = { status: number; body?: unknown; contentType?: string } | null

/**
 * Answers `/api/v1/*` in the shape the Next app expects, or returns null when
 * the path is not part of the demo surface.
 */
export async function routeContract(
  method: string,
  path: string,
  search: URLSearchParams,
  body: Json,
): Promise<ContractResult> {
  if (!path.startsWith(API)) return null
  const rest = path.slice(API.length) || "/"
  const parts = rest.split("/").filter(Boolean)

  // health ────────────────────────────────────────────────────────────────
  if (rest === "/health") {
    return { status: 200, body: { status: "ok", mode: "demo", time: new Date().toISOString() } }
  }

  // auth ──────────────────────────────────────────────────────────────────
  if (rest === "/auth/login" && method === "POST") {
    return { status: 200, body: { token: "demo-token", user: DEMO_USER } }
  }

  if (rest === "/auth/me" && method === "GET") {
    return { status: 200, body: DEMO_USER }
  }

  if (rest === "/auth/logout" && method === "POST") {
    return { status: 204 }
  }

  // marketplace ───────────────────────────────────────────────────────────
  if (rest === "/marketplace/search" || rest === "/marketplace/packages") {
    const { packages = [] } = (await demo("GET", `/api/packages?${search}`)) ?? {}
    return { status: 200, body: page(packages.map(toPackage), search) }
  }

  if (parts[0] === "marketplace" && parts[1] === "packages" && parts.length === 3) {
    const row = (await demo("GET", `/api/packages/${parts[2]}`))?.package
    return row
      ? { status: 200, body: toPackage(row) }
      : { status: 404, body: { message: "بسته پیدا نشد." } }
  }

  if (rest === "/marketplace/categories") {
    const { packages = [] } = (await demo("GET", "/api/packages")) ?? {}
    const seen = new Map<string, Json>()

    for (const row of packages) {
      const platform = Array.isArray(row.platforms) ? row.platforms[0] : null
      if (!platform || seen.has(platform)) continue
      seen.set(platform, {
        id: seen.size + 1,
        name: PLATFORM_LABELS[platform] ?? platform,
        slug: platform,
      })
    }

    return { status: 200, body: [...seen.values()] }
  }

  // contracts ─────────────────────────────────────────────────────────────
  if (rest === "/contracts" && method === "GET") {
    return { status: 200, body: await contracts(search, search.get("status") ?? undefined) }
  }

  if (rest === "/contracts" && method === "POST") {
    const profile = Object.entries(SPECIALISTS).find(
      ([, value]) => value.id === Number(body.client_id),
    )
    const created = (
      await demo("POST", "/api/contracts", {
        adminId: profile?.[0] ?? "ap-sarah",
        amountToman: Number(body.amount ?? 0),
        termClause: body.description ?? null,
        status: "pending",
        signedByEmployerAt: new Date().toISOString(),
      })
    )?.contract

    return created
      ? { status: 201, body: toContract(created) }
      : { status: 422, body: { message: "ساخت قرارداد ممکن نشد." } }
  }

  if (parts[0] === "contracts" && parts.length >= 2) {
    const id = demoId("contract", parts[1])
    const row = (await demo("GET", `/api/contracts/${id}`))?.contract

    if (!row) return { status: 404, body: { message: "قرارداد پیدا نشد." } }

    if (parts.length === 2 && method === "GET") {
      return { status: 200, body: toContract(row) }
    }

    if (parts[2] === "pdf" && (method === "GET" || method === "POST")) {
      return {
        status: 200,
        body: demoPdf(toContract(row)),
        contentType: "application/pdf",
      }
    }

    if (parts[2] === "sign" && method === "POST") {
      const updated = {
        ...row,
        signedByEmployerAt: row.signedByEmployerAt ?? new Date().toISOString(),
        signedByAdminAt: new Date().toISOString(),
        status: row.status === "pending" ? "active" : row.status,
      }
      const saved = (await demo("PATCH", `/api/contracts/${id}`, updated))?.contract ?? updated
      return { status: 200, body: toContract(saved) }
    }

    if (["activate", "complete", "cancel"].includes(parts[2]) && method === "POST") {
      const status =
        parts[2] === "activate" ? "active" : parts[2] === "complete" ? "completed" : "cancelled"
      const saved =
        (await demo("PATCH", `/api/contracts/${id}`, { ...row, status }))?.contract ?? row
      return { status: 200, body: toContract(saved) }
    }

    if (parts.length === 2 && method === "GET") {
      return { status: 200, body: toContract(row) }
    }
  }

  // counterparty lookup ───────────────────────────────────────────────────
  if (rest === "/users/lookup" && method === "GET") {
    const email = (search.get("email") ?? "").trim().toLowerCase()
    const match = Object.values(SPECIALISTS).find((user) => user.email === email)

    if (match) return { status: 200, body: { id: match.id, name: match.name } }
    if (email === DEMO_USER.email)
      return { status: 200, body: { id: DEMO_USER.id, name: DEMO_USER.name } }

    return { status: 404, body: { message: "کاربری با این ایمیل پیدا نشد." } }
  }

  // wallet ────────────────────────────────────────────────────────────────
  if (rest === "/wallet/balance" && method === "GET") {
    return { status: 200, body: await walletBalance() }
  }

  if (rest === "/wallet/transactions" && method === "GET") {
    return { status: 200, body: await walletTransactions(search) }
  }

  if (rest === "/payments" && method === "GET") {
    return {
      status: 200,
      body: [
        { id: 1, code: "zibal", name: "زیبال", provider: "zibal" },
        { id: 2, code: "sep", name: "سپ", provider: "sep" },
      ],
    }
  }

  if (rest === "/wallet/deposit" && method === "POST") {
    const created = (
      await demo("POST", "/api/wallets/me/transactions", {
        type: "deposit",
        amountToman: Number(body.amount ?? 0),
      })
    )?.transaction

    return created ? { status: 201, body: toTransaction(created) } : { status: 422, body: {} }
  }

  if (rest === "/wallet/withdraw" && method === "POST") {
    const created = (
      await demo("POST", "/api/wallets/me/transactions", {
        type: "withdraw",
        amountToman: Number(body.amount ?? 0),
      })
    )?.transaction

    return created ? { status: 201, body: toTransaction(created) } : { status: 422, body: {} }
  }

  if (rest === "/wallet/transfer" && method === "POST") {
    const created = (
      await demo("POST", "/api/wallets/me/transactions", {
        type: "transfer",
        amountToman: Number(body.amount ?? 0),
        note: `انتقال به کاربر ${body.receiver_id ?? ""}`,
      })
    )?.transaction

    return created ? { status: 201, body: toTransaction(created) } : { status: 422, body: {} }
  }

  // tickets ───────────────────────────────────────────────────────────────
  if (rest === "/tickets" && method === "GET") {
    return { status: 200, body: await tickets(search) }
  }

  if (rest === "/tickets" && method === "POST") {
    const created = (
      await demo("POST", "/api/tickets", {
        subject: body.subject,
        priority: body.priority ?? "medium",
        category: "other",
      })
    )?.ticket

    if (!created) return { status: 422, body: { message: "ثبت تیکت ممکن نشد." } }

    await demo("POST", `/api/tickets/${created.id}/messages`, { body: body.description ?? "" })
    const { messages = [] } = (await demo("GET", `/api/tickets/${created.id}/messages`)) ?? {}

    return { status: 201, body: toTicket(created, messages.map(toMessage)) }
  }

  if (parts[0] === "tickets" && parts.length >= 2) {
    const id = demoId("ticket", parts[1])
    const row = (await demo("GET", `/api/tickets/${id}`))?.ticket

    if (!row) return { status: 404, body: { message: "تیکت پیدا نشد." } }

    if (parts.length === 2 && method === "GET") {
      const { messages = [] } = (await demo("GET", `/api/tickets/${id}/messages`)) ?? {}
      return { status: 200, body: toTicket(row, messages.map(toMessage)) }
    }

    if (parts[2] === "reply" && method === "POST") {
      const created = (
        await demo("POST", `/api/tickets/${id}/messages`, {
          body: body.body,
          isInternal: body.is_internal === true,
        })
      )?.message

      return created
        ? { status: 201, body: toMessage(created) }
        : { status: 422, body: { message: "ارسال پاسخ ممکن نشد." } }
    }

    if (parts.length === 2 && (method === "PATCH" || method === "PUT")) {
      const saved = (await demo("PATCH", `/api/tickets/${id}`, body))?.ticket ?? row
      const { messages = [] } = (await demo("GET", `/api/tickets/${id}/messages`)) ?? {}
      return { status: 200, body: toTicket(saved, messages.map(toMessage)) }
    }
  }

  return null
}

export { demoPdf }
