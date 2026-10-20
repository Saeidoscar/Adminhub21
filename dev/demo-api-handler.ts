/**
 * In-memory demo API used by the Vite dev server when running in demo mode.
 *
 * It implements the subset of the AdminHub21 HTTP API that the web client
 * consumes, so the whole UI can be explored without Postgres or an AI key.
 * State is kept in memory and resets whenever the dev server restarts.
 */
import { demoDb } from "./demo-data.ts"

type Json = Record<string, unknown>
type Result = { status: number; body?: Json | null }

const db = demoDb()

const now = () => new Date().toISOString()
let sequence = 1000
const nextId = (prefix: string) => `${prefix}-${++sequence}`

const asArray = (value: unknown): any[] => (Array.isArray(value) ? value : [])
const asRecord = (value: unknown): Json =>
  value && typeof value === "object" ? (value as Json) : {}

function ok(body: Json): Result {
  return { status: 200, body }
}

function created(body: Json): Result {
  return { status: 201, body }
}

function notFound(message = "Not found"): Result {
  return { status: 404, body: { error: message } }
}

function badRequest(message: string): Result {
  return { status: 400, body: { error: message } }
}

function withDates<T extends Json>(row: T): T {
  return row
}

function byId(rows: any[], id: string) {
  return rows.find((row) => row.id === id)
}

function matchesSearch(row: Json, query: string, fields: string[]) {
  if (!query) return true
  const needle = query.toLowerCase()
  return fields.some((field) =>
    String(row[field] ?? "")
      .toLowerCase()
      .includes(needle),
  )
}

function filterByParam(rows: any[], params: URLSearchParams, param: string, field: string) {
  const value = params.get(param)
  if (!value) return rows
  return rows.filter((row) => String(row[field]) === value)
}

function currentUser() {
  return db.users.find((user) => user.role === "employer") ?? db.users[0]
}

function replyText(message: string): string {
  const text = message.toLowerCase()

  if (text.includes("price") || text.includes("budget") || text.includes("cost")) {
    return [
      "Here is how I would frame the budget for this hire:",
      "",
      "- **Retainer range** — for a focused Instagram retainer in 2026, plan between **15M and 28M toman** per month.",
      "- **Launch months** — reserve an extra **15–25%** for paid promotion while you test creative.",
      "- **One-off production** — a studio shoot or brand refresh is usually a separate 15–20M toman line item.",
      "",
      "Two packages currently stand out: **Instagram Premium Studio** (28M toman) for a reels-led push and **Instagram Growth Basic** (15M toman) for a steady baseline.",
    ].join("\n")
  }

  if (text.includes("contract") || text.includes("clause") || text.includes("legal")) {
    return [
      "For the contract, I would tighten three clauses before signing:",
      "",
      "1. **Deliverables** — list post and reel counts with a monthly reset date.",
      "2. **Substitution** — name a backup specialist and require a 24-hour handover.",
      "3. **Termination** — give both parties 14 days' notice after the first month.",
      "",
      "You can draft all three in the **Contract Generator** and export the styled PDF from the review step.",
    ].join("\n")
  }

  if (text.includes("instagram") || text.includes("telegram") || text.includes("market")) {
    return [
      "A quick way to narrow the shortlist:",
      "",
      "1. **Match the channel mix** — make sure the specialist covers every platform you sell on.",
      "2. **Check the launch record** — ask for two launches from the last 12 months with numbers.",
      "3. **Confirm production capacity** — reels require shooting time, not only editing time.",
      "4. **Agree the reporting rhythm** — weekly reporting beats a monthly deck during a launch.",
      "",
      "**Sarah Johnson** (4.9, 128 reviews) is the strongest fit for an Instagram-led launch. **Niloofar Rahimi** (4.9, 174 reviews) is better if marketplaces are part of the plan.",
    ].join("\n")
  }

  if (text.includes("hello") || text.includes("hi") || text.includes("سلام")) {
    return "Hello! I am the AdminHub21 hiring assistant. Ask me about specialists, package pricing, contract clauses or launch planning — I can compare profiles and suggest a shortlist."
  }

  return [
    "Here is a practical next step based on what you shared:",
    "",
    "- Browse the **Marketplace** and shortlist two or three specialists that match your platform mix.",
    "- Use **Compare** to line up their packages side by side on price and delivery time.",
    "- When you are ready, open a **contract** and review the scope, payment schedule and substitution terms.",
    "",
    "If you tell me your platform, monthly budget and launch date, I can narrow this down further.",
  ].join("\n")
}

export async function handleDemoRequest(
  rawMethod: string,
  rawUrl: string,
  rawBody: string,
): Promise<Result> {
  const method = (rawMethod || "GET").toUpperCase()
  const url = new URL(rawUrl || "/", "http://demo.local")
  const path = url.pathname.replace(/\/+$/, "") || "/"
  const params = url.searchParams
  const body = rawBody
    ? (() => {
        try {
          return asRecord(JSON.parse(rawBody))
        } catch {
          return {}
        }
      })()
    : {}
  const segments = path.split("/").filter(Boolean)

  // ── Auth ────────────────────────────────────────────────────────────────
  if (path === "/api/auth/me" && method === "GET") {
    return ok({ user: currentUser() })
  }

  if (
    method === "POST" &&
    (path === "/api/auth/login" || path === "/api/auth/register" || path === "/api/auth/otp/verify")
  ) {
    const role = body.role === "admin" ? "admin" : "employer"
    const user = role === "admin" ? db.users.find((u) => u.role === "admin") : currentUser()
    return ok({ user, accessToken: "demo-access-token" })
  }

  if (method === "POST" && path === "/api/auth/otp/request") {
    return ok({ message: "Demo code sent", phone: body.phone ?? "+98 912 345 6789" })
  }

  if (method === "POST" && path === "/api/auth/logout") {
    return { status: 204 }
  }

  // ── Profiles ────────────────────────────────────────────────────────────
  if (path === "/api/profiles" && method === "GET") {
    let rows = db.profiles
    const platforms = params.get("platforms")
    if (platforms) {
      const wanted = platforms.split(",").filter(Boolean)
      rows = rows.filter((profile) =>
        wanted.some((platform) => asArray(profile.platforms).includes(platform)),
      )
    }
    if (params.get("verified") === "true") {
      rows = rows.filter((profile) => profile.verified === true)
    }
    const search = params.get("search") ?? ""
    rows = rows.filter((profile) =>
      matchesSearch(profile, search, ["nameEn", "nameFa", "bioEn", "bioFa"]),
    )
    return ok({ profiles: rows })
  }

  if (segments[0] === "api" && segments[1] === "profiles" && segments.length === 3) {
    const profile = byId(db.profiles, segments[2])
    if (method === "GET") return profile ? ok({ profile }) : notFound("Profile not found")
  }

  if (path === "/api/profile/me" && (method === "PUT" || method === "PATCH")) {
    const profile = byId(db.profiles, "ap-sarah") ?? db.profiles[0]
    const updated = withDates({ ...profile, ...body, updatedAt: now() })
    db.profiles = db.profiles.map((row) => (row.id === profile.id ? updated : row))
    return ok({ profile: updated })
  }

  // ── Packages & offers ───────────────────────────────────────────────────
  if (path === "/api/packages" && method === "GET") {
    let rows = db.packages
    const platformFilter = params.get("platforms")
    if (platformFilter) {
      const wanted = platformFilter.split(",").filter(Boolean)
      rows = rows.filter((pkgRow) =>
        wanted.some((platform) => asArray(pkgRow.platforms).includes(platform)),
      )
    }
    const type = params.get("type")
    if (type) rows = rows.filter((pkgRow) => pkgRow.type === type)
    const billingCycle = params.get("billingCycle")
    if (billingCycle) rows = rows.filter((pkgRow) => pkgRow.billingCycle === billingCycle)
    if (params.get("featured") === "true") {
      rows = rows.filter((pkgRow) => pkgRow.featured === true)
    }
    const search = params.get("search") ?? ""
    rows = rows.filter((pkgRow) => matchesSearch(pkgRow, search, ["name", "description"]))
    return ok({ packages: rows })
  }

  if (path === "/api/packages" && method === "POST") {
    const timestamp = now()
    const packageRow = withDates({
      id: nextId("pkg"),
      adminId: "ap-sarah",
      active: true,
      featured: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...body,
    })
    db.packages = [packageRow, ...db.packages]
    return created({ package: packageRow })
  }

  if (segments[0] === "api" && segments[1] === "packages" && segments.length === 3) {
    const packageRow = byId(db.packages, segments[2])
    if (!packageRow) return notFound("Package not found")
    if (method === "GET") return ok({ package: packageRow })
    if (method === "PUT" || method === "PATCH") {
      const updated = withDates({ ...packageRow, ...body, updatedAt: now() })
      db.packages = db.packages.map((row) => (row.id === packageRow.id ? updated : row))
      return ok({ package: updated })
    }
    if (method === "DELETE") {
      db.packages = db.packages.filter((row) => row.id !== packageRow.id)
      return ok({ success: true })
    }
  }

  if (path === "/api/offers" && method === "GET") {
    return ok({ offers: [...db.offers].reverse() })
  }

  if (path === "/api/offers" && method === "POST") {
    const offer = withDates({
      id: nextId("offer"),
      createdAt: now(),
      employerId: "user-employer-1",
      employerName: "Ali Rezaei",
      ...body,
    })
    db.offers = [offer, ...db.offers]
    return created({ offer })
  }

  // ── Contracts ───────────────────────────────────────────────────────────
  if (path === "/api/contracts" && method === "GET") {
    let rows = db.contracts
    rows = filterByParam(rows, params, "status", "status")
    rows = filterByParam(rows, params, "platform", "platform")
    return ok({ contracts: rows })
  }

  if (path === "/api/contracts" && method === "POST") {
    const profile = byId(db.profiles, body.adminId as string) ?? db.profiles[0]
    const timestamp = now()
    const contract = withDates({
      id: nextId("contract"),
      code: `CNT-2026-${String(sequence).slice(-3)}`,
      adminId: profile.id,
      adminNameEn: profile.nameEn,
      adminNameFa: profile.nameFa,
      adminPhoto: `https://images.unsplash.com/${profile.photo}?w=64&h=64&fit=crop&auto=format`,
      employerId: "user-employer-1",
      employerName: "Ali Rezaei",
      status: "pending",
      hasInsurance: false,
      hasSubstitute: false,
      termClause: null,
      substituteClause: null,
      startDate: null,
      endDate: null,
      signedByEmployerAt: null,
      signedByAdminAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...body,
    })
    db.contracts = [contract, ...db.contracts]
    return created({ contract })
  }

  if (segments[0] === "api" && segments[1] === "contracts" && segments.length === 3) {
    const contract = byId(db.contracts, segments[2])
    if (!contract) return notFound("Contract not found")
    if (method === "GET") return ok({ contract })
    if (method === "PUT" || method === "PATCH") {
      const updated = withDates({ ...contract, ...body, updatedAt: now() })
      db.contracts = db.contracts.map((row) => (row.id === contract.id ? updated : row))
      return ok({ contract: updated })
    }
  }

  // ── Favorites ───────────────────────────────────────────────────────────
  if (path === "/api/favorites" && method === "GET") {
    return ok({ favorites: db.favorites })
  }

  if (segments[0] === "api" && segments[1] === "favorites" && segments.length === 3) {
    const adminId = segments[2]
    if (method === "POST") {
      const existing = db.favorites.find((favorite) => favorite.adminId === adminId)
      if (existing) return ok({ favorite: existing })
      const favorite = {
        id: nextId("fav"),
        userId: "user-employer-1",
        adminId,
        createdAt: now(),
      }
      db.favorites = [...db.favorites, favorite]
      return created({ favorite })
    }
    if (method === "DELETE") {
      db.favorites = db.favorites.filter((favorite) => favorite.adminId !== adminId)
      return ok({ success: true })
    }
  }

  // ── Reviews ─────────────────────────────────────────────────────────────
  if (path === "/api/reviews" && method === "GET") {
    let rows = db.reviews
    const targetId = params.get("targetId")
    if (targetId) rows = rows.filter((review) => review.adminId === targetId)
    return ok({ reviews: rows })
  }

  if (path === "/api/reviews" && method === "POST") {
    const profile = byId(db.profiles, body.adminId as string) ?? db.profiles[0]
    const review = {
      id: nextId("review"),
      adminId: profile.id,
      adminNameEn: profile.nameEn,
      adminNameFa: profile.nameFa,
      employerId: "user-employer-1",
      employerName: "Ali Rezaei",
      contractId: body.contractId ?? null,
      rating: Number(body.rating ?? 5),
      comment: body.comment ?? null,
      createdAt: now(),
    }
    db.reviews = [review, ...db.reviews]
    return created({ review })
  }

  // ── Wallet ──────────────────────────────────────────────────────────────
  if (path === "/api/wallet/balance" && method === "GET") {
    return ok({ wallet: db.wallets[0] })
  }

  if (path === "/api/wallet/transactions" && method === "GET") {
    let rows = db.transactions
    rows = filterByParam(rows, params, "type", "type")
    rows = filterByParam(rows, params, "status", "status")
    return ok({ transactions: rows })
  }

  if (path === "/api/wallets/me/transactions" && method === "POST") {
    const type = String(body.type ?? "deposit")
    const amountToman = Number(body.amountToman ?? 0)
    const wallet = db.wallets[0]
    const transaction = {
      id: nextId("txn"),
      walletId: wallet.id,
      type,
      amountToman,
      amountUSD: Number(body.amountUSD ?? 0),
      currency: String(body.currency ?? "IRR"),
      status: "pending",
      referenceId: null,
      note: body.note ?? null,
      createdAt: now(),
    }
    db.transactions = [transaction, ...db.transactions]
    if (type === "deposit") {
      wallet.balanceToman = Number(wallet.balanceToman) + amountToman
    }
    if (type === "withdraw") {
      wallet.balanceToman = Number(wallet.balanceToman) - amountToman
    }
    return created({ transaction })
  }

  // ── Catalog ─────────────────────────────────────────────────────────────
  if (path === "/api/catalog/tools" && method === "GET") {
    let rows = db.tools
    rows = filterByParam(rows, params, "category", "category")
    if (params.get("popular") === "true") rows = rows.filter((tool) => tool.popular === true)
    const minRating = Number(params.get("minRating") ?? 0)
    if (minRating) rows = rows.filter((tool) => Number(tool.rating) >= minRating)
    const search = params.get("search") ?? ""
    rows = rows.filter((tool) => matchesSearch(tool, search, ["name", "descEn", "descFa"]))
    return ok({ tools: rows })
  }

  if (path === "/api/catalog/editors" && method === "GET") {
    let rows = db.editors
    const specialty = params.get("specialty")
    if (specialty) rows = rows.filter((editor) => editor.specialty === specialty)
    const minRating = Number(params.get("minRating") ?? 0)
    if (minRating) rows = rows.filter((editor) => Number(editor.rating) >= minRating)
    const search = params.get("search") ?? ""
    rows = rows.filter((editor) =>
      matchesSearch(editor, search, ["nameEn", "nameFa", "bioEn", "bioFa"]),
    )
    return ok({ editors: rows })
  }

  if (path === "/api/catalog/vibe-coders" && method === "GET") {
    let rows = db.vibeCoders
    const stack = params.get("stack")
    if (stack) rows = rows.filter((coder) => String(coder.stack).includes(stack))
    const search = params.get("search") ?? ""
    rows = rows.filter((coder) =>
      matchesSearch(coder, search, ["nameEn", "nameFa", "stack", "bioEn", "bioFa"]),
    )
    return ok({ "vibe-coders": rows })
  }

  // ── Tickets ─────────────────────────────────────────────────────────────
  if (path === "/api/tickets" && method === "GET") {
    return ok({ tickets: db.tickets })
  }

  if (path === "/api/tickets" && method === "POST") {
    const timestamp = now()
    const ticket = {
      id: nextId("ticket"),
      userId: "user-employer-1",
      userName: "Ali Rezaei",
      userEmail: "employer@adminhub.ir",
      subject: body.subject ?? "Untitled ticket",
      category: body.category ?? "other",
      priority: body.priority ?? "medium",
      status: "open",
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    db.tickets = [ticket, ...db.tickets]
    return created({ ticket })
  }

  if (segments[0] === "api" && segments[1] === "tickets" && segments.length >= 3) {
    const ticket = byId(db.tickets, segments[2])
    if (!ticket) return notFound("Ticket not found")
    if (segments.length === 4 && segments[3] === "messages") {
      if (method === "GET") {
        return ok({
          messages: db.ticketMessages.filter((message) => message.ticketId === ticket.id),
        })
      }
      if (method === "POST") {
        const message = {
          id: nextId("tm"),
          ticketId: ticket.id,
          senderId: "user-employer-1",
          senderName: "Ali Rezaei",
          body: body.body ?? "",
          createdAt: now(),
        }
        db.ticketMessages = [...db.ticketMessages, message]
        ticket.updatedAt = message.createdAt
        return created({ message })
      }
    }
    if (method === "GET") return ok({ ticket })
    if (method === "PATCH" || method === "PUT") {
      const updated = { ...ticket, ...body, updatedAt: now() }
      db.tickets = db.tickets.map((row) => (row.id === ticket.id ? updated : row))
      return ok({ ticket: updated })
    }
  }

  // ── Cases / tasks / events / time logs ──────────────────────────────────
  if (path === "/api/cases" && method === "GET") {
    let rows = db.cases
    rows = filterByParam(rows, params, "status", "status")
    rows = filterByParam(rows, params, "priority", "priority")
    const search = params.get("search") ?? ""
    rows = rows.filter((caseRow) => matchesSearch(caseRow, search, ["title", "description"]))
    return ok({ cases: rows })
  }

  if (path === "/api/cases" && method === "POST") {
    const timestamp = now()
    const employerId = String(body.employerId ?? "user-employer-1")
    const employer = db.users.find((user) => user.id === employerId)
    const caseRow = {
      id: nextId("case"),
      employerId,
      employerName: employer
        ? String(employer.nameEn ?? employer.nameFa ?? employerId)
        : employerId,
      title: body.title ?? "Untitled case",
      description: body.description ?? "",
      priority: body.priority ?? "medium",
      status: "open",
      tags: asArray(body.tags),
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    db.cases = [caseRow, ...db.cases]
    return created({ case: caseRow })
  }

  if (segments[0] === "api" && segments[1] === "cases" && segments.length === 3) {
    const caseRow = byId(db.cases, segments[2])
    if (!caseRow) return notFound("Case not found")
    if (method === "GET") return ok({ case: caseRow })
    if (method === "PATCH" || method === "PUT") {
      const updated = { ...caseRow, ...body, updatedAt: now() }
      db.cases = db.cases.map((row) => (row.id === caseRow.id ? updated : row))
      return ok({ case: updated })
    }
  }

  if (path === "/api/schedule/tasks" && method === "GET") {
    const caseId = params.get("caseId")
    const rows = caseId ? db.tasks.filter((task) => task.caseId === caseId) : db.tasks
    return ok({ tasks: rows })
  }

  if (path === "/api/schedule/tasks" && method === "POST") {
    const timestamp = now()
    const task = {
      id: nextId("task"),
      caseId: body.caseId ?? "",
      title: body.title ?? "Untitled task",
      description: body.description ?? "",
      assignedTo: body.assignedTo ?? null,
      status: body.status ?? "todo",
      priority: body.priority ?? "medium",
      dueDate: body.dueDate ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    db.tasks = [task, ...db.tasks]
    return created({ task })
  }

  if (
    segments[0] === "api" &&
    segments[1] === "schedule" &&
    segments[2] === "tasks" &&
    segments.length === 4
  ) {
    const task = byId(db.tasks, segments[3])
    if (!task) return notFound("Task not found")
    if (method === "GET") return ok({ task })
    if (method === "PATCH" || method === "PUT") {
      const updated = { ...task, ...body, updatedAt: now() }
      db.tasks = db.tasks.map((row) => (row.id === task.id ? updated : row))
      return ok({ task: updated })
    }
  }

  if (path === "/api/schedule/events" && method === "GET") {
    const from = params.get("from")
    const to = params.get("to")
    let rows = db.events
    if (from) rows = rows.filter((event) => String(event.startAt) >= from)
    if (to) rows = rows.filter((event) => String(event.startAt) <= to)
    return ok({ events: rows })
  }

  if (path === "/api/schedule/events" && method === "POST") {
    const timestamp = now()
    const event = {
      id: nextId("event"),
      title: body.title ?? "Untitled event",
      description: body.description ?? "",
      startAt: body.startAt ?? timestamp,
      endAt: body.endAt ?? timestamp,
      allDay: Boolean(body.allDay),
      color: body.color ?? "#1e3a5f",
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    db.events = [...db.events, event]
    return created({ event })
  }

  if (
    segments[0] === "api" &&
    segments[1] === "schedule" &&
    segments[2] === "events" &&
    segments.length === 4
  ) {
    const event = byId(db.events, segments[3])
    if (!event) return notFound("Event not found")
    if (method === "GET") return ok({ event })
    if (method === "PATCH" || method === "PUT") {
      const updated = { ...event, ...body, updatedAt: now() }
      db.events = db.events.map((row) => (row.id === event.id ? updated : row))
      return ok({ event: updated })
    }
    if (method === "DELETE") {
      db.events = db.events.filter((row) => row.id !== event.id)
      return ok({ success: true })
    }
  }

  if (path === "/api/schedule/timelogs" && method === "GET") {
    let rows = db.timeLogs
    rows = filterByParam(rows, params, "caseId", "caseId")
    rows = filterByParam(rows, params, "taskId", "taskId")
    return ok({ timeLogs: rows })
  }

  if (path === "/api/schedule/timelogs" && method === "POST") {
    const startedAt = String(body.startedAt ?? now())
    const endedAt = String(body.endedAt ?? now())
    const durationMinutes = Math.max(
      0,
      Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000),
    )
    const log = {
      id: nextId("log"),
      userId: "user-admin-1",
      userName: "Sarah Johnson",
      caseId: body.caseId ?? null,
      taskId: body.taskId ?? null,
      description: body.description ?? "",
      startedAt,
      endedAt,
      durationMinutes,
      createdAt: now(),
    }
    db.timeLogs = [log, ...db.timeLogs]
    return created({ timeLog: log })
  }

  if (
    segments[0] === "api" &&
    segments[1] === "schedule" &&
    segments[2] === "timelogs" &&
    segments.length === 4 &&
    method === "GET"
  ) {
    const log = byId(db.timeLogs, segments[3])
    return log ? ok({ timeLog: log }) : notFound("Time log not found")
  }

  // ── Portfolio ───────────────────────────────────────────────────────────
  if (segments[0] === "api" && segments[1] === "portfolio") {
    if (segments[2] === "item" && segments.length === 4 && method === "GET") {
      const item = byId(db.portfolio, segments[3])
      return item ? ok({ portfolio: item }) : notFound("Portfolio item not found")
    }
    if (segments.length === 3 && method === "GET") {
      const adminId = segments[2]
      return ok({ portfolio: db.portfolio.filter((item) => item.adminId === adminId) })
    }
    if (segments.length === 3 && (method === "PATCH" || method === "PUT")) {
      const item = byId(db.portfolio, segments[2])
      if (!item) return notFound("Portfolio item not found")
      const updated = { ...item, ...body, updatedAt: now() }
      db.portfolio = db.portfolio.map((row) => (row.id === item.id ? updated : row))
      return ok({ portfolio: updated })
    }
    if (segments.length === 3 && method === "DELETE") {
      db.portfolio = db.portfolio.filter((row) => row.id !== segments[2])
      return ok({ success: true })
    }
    if (segments.length === 2 && method === "POST") {
      const item = {
        id: nextId("portfolio"),
        adminId: "ap-sarah",
        adminNameEn: "Sarah Johnson",
        adminNameFa: "سارا جانسون",
        title: body.title ?? "Untitled project",
        description: body.description ?? "",
        mediaUrl: body.mediaUrl ?? "",
        mediaType: body.mediaType ?? "image",
        tags: asArray(body.tags),
        createdAt: now(),
        updatedAt: now(),
      }
      db.portfolio = [item, ...db.portfolio]
      return created({ portfolio: item })
    }
  }

  // ── Content: stories, blogs, comments ───────────────────────────────────
  if (path === "/api/stories" && method === "GET") {
    let rows = db.stories
    rows = filterByParam(rows, params, "status", "status")
    return ok({ stories: rows })
  }

  if (path === "/api/blogs" && method === "GET") {
    let rows = db.blogs
    rows = filterByParam(rows, params, "status", "status")
    return ok({ blogs: rows })
  }

  if (path === "/api/comments" && method === "GET") {
    let rows = db.comments
    rows = filterByParam(rows, params, "postType", "postType")
    return ok({ comments: rows })
  }

  if (
    segments[0] === "api" &&
    segments[1] === "comments" &&
    segments.length === 3 &&
    method === "DELETE"
  ) {
    db.comments = db.comments.filter((comment) => comment.id !== segments[2])
    return ok({ success: true })
  }

  if (segments[0] === "api" && segments[1] === "stories" && segments.length === 3) {
    const story = byId(db.stories, segments[2])
    if (!story) return notFound("Story not found")
    if (method === "GET") return ok({ story })
    if (method === "PUT" || method === "PATCH") {
      const updated = { ...story, ...body, updatedAt: now() }
      db.stories = db.stories.map((row) => (row.id === story.id ? updated : row))
      return ok({ story: updated })
    }
    if (method === "DELETE") {
      db.stories = db.stories.filter((row) => row.id !== story.id)
      return ok({ success: true })
    }
  }

  if (segments[0] === "api" && segments[1] === "blogs" && segments.length === 3) {
    const blog = byId(db.blogs, segments[2])
    if (!blog) return notFound("Blog not found")
    if (method === "GET") return ok({ blog })
    if (method === "PUT" || method === "PATCH") {
      const updated = { ...blog, ...body, updatedAt: now() }
      db.blogs = db.blogs.map((row) => (row.id === blog.id ? updated : row))
      return ok({ blog: updated })
    }
    if (method === "DELETE") {
      db.blogs = db.blogs.filter((row) => row.id !== blog.id)
      return ok({ success: true })
    }
  }

  // ── Admin: users ────────────────────────────────────────────────────────
  if (path === "/api/admin/users" && method === "GET") {
    let rows = db.users
    rows = filterByParam(rows, params, "role", "role")
    const search = params.get("search") ?? ""
    rows = rows.filter((user) => matchesSearch(user, search, ["nameEn", "nameFa", "email"]))
    return ok({ users: rows })
  }

  if (
    segments[0] === "api" &&
    segments[1] === "admin" &&
    segments[2] === "users" &&
    segments.length === 4
  ) {
    const user = byId(db.users, segments[3])
    if (!user) return notFound("User not found")
    if (method === "GET") return ok({ user })
    if (method === "PATCH" || method === "PUT") {
      const updated = { ...user, ...body }
      db.users = db.users.map((row) => (row.id === user.id ? updated : row))
      return ok({ user: updated })
    }
    if (method === "DELETE") {
      db.users = db.users.filter((row) => row.id !== user.id)
      return ok({ success: true })
    }
  }

  // ── Admin: dashboard ────────────────────────────────────────────────────
  if (path === "/api/admin/dashboard/stats" && method === "GET") {
    return ok({ stats: db.dashboardStats })
  }

  // ── Admin: tickets ──────────────────────────────────────────────────────
  if (path === "/api/admin/tickets" && method === "GET") {
    let rows = db.tickets
    rows = filterByParam(rows, params, "status", "status")
    rows = filterByParam(rows, params, "category", "category")
    rows = filterByParam(rows, params, "priority", "priority")
    return ok({ tickets: rows })
  }

  if (
    segments[0] === "api" &&
    segments[1] === "admin" &&
    segments[2] === "tickets" &&
    segments.length === 4
  ) {
    const ticket = byId(db.tickets, segments[3])
    if (!ticket) return notFound("Ticket not found")
    if (method === "GET") return ok({ ticket })
    if (method === "PATCH" || method === "PUT") {
      const updated = { ...ticket, ...body, updatedAt: now() }
      db.tickets = db.tickets.map((row) => (row.id === ticket.id ? updated : row))
      return ok({ ticket: updated })
    }
  }

  // ── Admin: content moderation ───────────────────────────────────────────
  if (path === "/api/admin/content/stories" && method === "GET") {
    let rows = db.stories
    rows = filterByParam(rows, params, "status", "status")
    const search = params.get("search") ?? ""
    rows = rows.filter((story) => matchesSearch(story, search, ["title", "content"]))
    return ok({ stories: rows })
  }

  if (path === "/api/admin/content/blogs" && method === "GET") {
    let rows = db.blogs
    rows = filterByParam(rows, params, "status", "status")
    const search = params.get("search") ?? ""
    rows = rows.filter((blog) => matchesSearch(blog, search, ["title", "content"]))
    return ok({ blogs: rows })
  }

  if (path === "/api/admin/content/comments" && method === "GET") {
    let rows = db.comments
    rows = filterByParam(rows, params, "postType", "postType")
    return ok({ comments: rows })
  }

  if (
    segments[0] === "api" &&
    segments[1] === "admin" &&
    segments[2] === "content" &&
    segments.length === 5 &&
    method === "PATCH"
  ) {
    const kind = segments[3] === "blogs" ? "blogs" : "stories"
    const rows = kind === "blogs" ? db.blogs : db.stories
    const item = byId(rows, segments[4])
    if (!item) return notFound("Content not found")
    const action = body.action
    const status =
      action === "approve" ? "published" : action === "reject" ? "rejected" : "archived"
    const updated = { ...item, status, updatedAt: now() }
    if (kind === "blogs") {
      db.blogs = db.blogs.map((row) => (row.id === item.id ? updated : row))
      return ok({ blog: updated })
    }
    db.stories = db.stories.map((row) => (row.id === item.id ? updated : row))
    return ok({ story: updated })
  }

  if (
    segments[0] === "api" &&
    segments[1] === "admin" &&
    segments[2] === "content" &&
    segments[3] === "comments" &&
    segments.length === 5 &&
    method === "DELETE"
  ) {
    db.comments = db.comments.filter((comment) => comment.id !== segments[4])
    return ok({ success: true })
  }

  // ── AI assistant ────────────────────────────────────────────────────────
  if (path === "/ai/models" && method === "GET") {
    return ok({ models: db.aiModels })
  }

  if (path === "/ai/conversations" && method === "GET") {
    return ok({ conversations: [...db.aiConversations].reverse() })
  }

  if (path === "/ai/conversations" && method === "POST") {
    const timestamp = now()
    const conversation = {
      id: nextId("conv"),
      userId: "user-employer-1",
      title: body.title ?? "New Conversation",
      modelId: body.modelId ?? db.aiModels[0]?.id ?? "model-claude",
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    db.aiConversations = [...db.aiConversations, conversation]
    return created({ conversation })
  }

  if (segments[0] === "ai" && segments[1] === "conversations" && segments.length >= 3) {
    const conversation = byId(db.aiConversations, segments[2])
    if (!conversation) return notFound("Conversation not found")

    if (segments.length === 4 && segments[3] === "messages") {
      if (method === "GET") {
        return ok({
          messages: db.aiMessages.filter((message) => message.conversationId === conversation.id),
        })
      }
      if (method === "POST") {
        const userMessage = {
          id: nextId("aim"),
          conversationId: conversation.id,
          role: "user",
          content: body.content ?? "",
          createdAt: now(),
        }
        const assistantMessage = {
          id: nextId("aim"),
          conversationId: conversation.id,
          role: "assistant",
          content: replyText(String(body.content ?? "")),
          provider: "anthropic",
          modelCode: "claude-sonnet-4",
          promptTokens: 48,
          completionTokens: 164,
          totalTokens: 212,
          totalCost: 0.0028,
          responseTimeMs: 1200,
          createdAt: now(),
        }
        db.aiMessages = [...db.aiMessages, userMessage, assistantMessage]
        conversation.updatedAt = assistantMessage.createdAt
        return created({ message: assistantMessage })
      }
    }

    if (segments.length === 4 && segments[3] === "model" && method === "PATCH") {
      const updated = { ...conversation, modelId: body.modelId ?? conversation.modelId }
      db.aiConversations = db.aiConversations.map((row) =>
        row.id === conversation.id ? updated : row,
      )
      return ok({ conversation: updated })
    }

    if (segments.length === 3 && method === "GET") {
      return ok({ conversation })
    }

    if (segments.length === 3 && (method === "PATCH" || method === "PUT")) {
      const updated = { ...conversation, ...body, updatedAt: now() }
      db.aiConversations = db.aiConversations.map((row) =>
        row.id === conversation.id ? updated : row,
      )
      return ok({ conversation: updated })
    }

    if (segments.length === 3 && method === "DELETE") {
      db.aiConversations = db.aiConversations.filter((row) => row.id !== conversation.id)
      db.aiMessages = db.aiMessages.filter((message) => message.conversationId !== conversation.id)
      return ok({ success: true })
    }
  }

  // ── Health ──────────────────────────────────────────────────────────────
  if ((path === "/api/health" || path === "/api") && method === "GET") {
    return ok({ status: "ok", demo: true })
  }

  if (method === "OPTIONS") {
    return { status: 204 }
  }

  return notFound(`No demo handler for ${method} ${path}`)
}
