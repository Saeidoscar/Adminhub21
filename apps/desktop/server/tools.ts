/**
 * MCP tool registry for the demo.
 *
 * Every tool reads from the *same* in-memory dataset the UI is showing
 * (`dev/demo-data.ts`), so a tool result always agrees with what the user sees
 * on screen — no hallucinated numbers, no second source of truth. When a live
 * model is configured these definitions are handed to it as function schemas;
 * without a key the offline planner calls the same executors directly.
 */
import { demoDb } from "../../../dev/demo-data"

export type ToolInput = Record<string, unknown>

export type ToolResult = {
  /** Human-readable answer, already localised. */
  text: string
  /** Machine-readable payload; the UI renders it as a collapsible JSON block. */
  structured: Record<string, unknown>
  /** Optional deep link the UI offers as a "Open page" action. */
  link?: { path: string; label: string }
}

export type ToolDefinition = {
  name: string
  label: string
  category: "search" | "automation" | "content" | "analytics" | "contract" | "support"
  description: string
  parameters: {
    type: "object"
    properties: Record<string, { type: string; description: string; enum?: string[] }>
    required?: string[]
  }
  run: (input: ToolInput, ctx: ToolContext) => ToolResult
}

export type ToolContext = {
  lang: "en" | "fa"
  role: "employer" | "admin" | "super_admin"
}

type Row = Record<string, any>

const db = demoDb()

const isFa = (ctx: ToolContext) => ctx.lang === "fa"

const toman = (value: number, ctx: ToolContext) =>
  isFa(ctx)
    ? `${value.toLocaleString("fa-IR")} تومان`
    : `$${Math.round(value / 70_000).toLocaleString("en-US")}`

const usd = (value: number) => `$${value.toLocaleString("en-US")}`

function pickName(profile: Row, ctx: ToolContext): string {
  return (isFa(ctx) ? profile.nameFa : profile.nameEn) ?? profile.nameEn ?? profile.id
}

function packageOwner(pkg: Row): Row | undefined {
  return (db.profiles as Row[]).find(
    (profile) => profile.id === pkg.adminId || profile.id === pkg.profileId,
  )
}

function normalise(value: unknown): string {
  return String(value ?? "").toLowerCase()
}

function matchesPlatform(profile: Row, platform: string): boolean {
  if (!platform) return true
  const platforms = Array.isArray(profile.platforms) ? profile.platforms : []
  return platforms.some((entry: string) => normalise(entry).includes(normalise(platform)))
}

function packagesFor(profileId: string): Row[] {
  return (db.packages as Row[]).filter(
    (pkg) => pkg.adminId === profileId || pkg.profileId === profileId,
  )
}

export const TOOLS: ToolDefinition[] = [
  {
    name: "find-admin",
    label: "Find admins",
    category: "search",
    description:
      "Search admin profiles by platform, skill, rating or budget and return the best matches with their packages.",
    parameters: {
      type: "object",
      properties: {
        platform: {
          type: "string",
          description: "instagram, telegram, linkedin, torob, digikala…",
        },
        skill: { type: "string", description: "Free-text skill or keyword." },
        budgetUsd: { type: "number", description: "Monthly budget ceiling in USD." },
      },
    },
    run: (input, ctx) => {
      const platform = normalise(input.platform)
      const skill = normalise(input.skill)
      const budget = Number(input.budgetUsd ?? 0)

      const matches = (db.profiles as Row[])
        .filter((profile) => matchesPlatform(profile, platform))
        .filter((profile) => {
          if (!skill) return true
          const haystack = [
            ...(profile.skillsEn ?? []),
            ...(profile.skillsFa ?? []),
            profile.bioEn ?? "",
          ]
            .join(" ")
            .toLowerCase()
          return haystack.includes(skill)
        })
        .filter((profile) => (budget > 0 ? Number(profile.monthlyUSD ?? 0) <= budget : true))
        .sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0))
        .slice(0, 3)

      if (matches.length === 0) {
        return {
          text: isFa(ctx)
            ? "با این فیلترها ادمینی پیدا نشد. فیلتر پلتفرم یا بودجه را کمی بازتر کنید."
            : "No admins matched those filters. Try widening the platform or budget.",
          structured: { tool: "find-admin", matches: 0 },
          link: { path: "/marketplace", label: isFa(ctx) ? "بازار" : "Marketplace" },
        }
      }

      const lines = matches.map((profile) => {
        const pkgs = packagesFor(profile.id)
        const from =
          pkgs.length > 0 ? Math.min(...pkgs.map((pkg) => Number(pkg.monthlyUSD ?? 0))) : null
        const price = from ? usd(from) : usd(Number(profile.monthlyUSD ?? 0))
        return isFa(ctx)
          ? `• ${pickName(profile, ctx)} — ${profile.rating}★ (${profile.reviews} نظر)، از ${price}/ماه`
          : `• ${pickName(profile, ctx)} — ${profile.rating}★ (${profile.reviews} reviews), from ${price}/mo`
      })

      return {
        text: isFa(ctx)
          ? `${matches.length} ادمین مطابق پیدا شد:\n${lines.join("\n")}\n\nمی‌خواهید پکیج‌های یکی از آن‌ها را مقایسه کنم؟`
          : `Found ${matches.length} matching admins:\n${lines.join("\n")}\n\nWant me to compare their packages?`,
        structured: {
          tool: "find-admin",
          matches: matches.map((profile) => ({
            id: profile.id,
            name: profile.nameEn,
            rating: profile.rating,
            platforms: profile.platforms,
          })),
        },
        link: { path: "/marketplace", label: isFa(ctx) ? "مشاهده در بازار" : "Open marketplace" },
      }
    },
  },
  {
    name: "list-packages",
    label: "List packages",
    category: "contract",
    description: "List contract packages with owner, price and delivery time.",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "How many packages to return (default 5)." },
        platform: { type: "string", description: "Filter by platform." },
      },
    },
    run: (input, ctx) => {
      const limit = Math.min(Number(input.limit ?? 5) || 5, 12)
      const platform = normalise(input.platform)

      const rows = (db.packages as Row[])
        .filter((pkg) =>
          platform
            ? (Array.isArray(pkg.platforms) ? pkg.platforms : []).some((entry: string) =>
                normalise(entry).includes(platform),
              )
            : true,
        )
        .slice(0, limit)

      const lines = rows.map((pkg) => {
        const owner = packageOwner(pkg)
        const price = pkg.monthlyUSD ?? Math.round(Number(pkg.monthlyToman ?? 0) / 70_000)
        return isFa(ctx)
          ? `• ${pkg.name} — ${owner ? pickName(owner, ctx) : "—"} — ${usd(Number(price))}/ماه — تحویل ${pkg.delivery ?? "—"}`
          : `• ${pkg.name} — ${owner ? pickName(owner, ctx) : "—"} — ${usd(Number(price))}/mo — delivery ${pkg.delivery ?? "—"}`
      })

      return {
        text: isFa(ctx)
          ? `${rows.length} پکیج فعال:\n${lines.join("\n")}`
          : `${rows.length} active packages:\n${lines.join("\n")}`,
        structured: { tool: "list-packages", count: rows.length, ids: rows.map((row) => row.id) },
        link: { path: "/packages", label: isFa(ctx) ? "صفحه پکیج‌ها" : "Packages page" },
      }
    },
  },
  {
    name: "compare-packages",
    label: "Compare packages",
    category: "analytics",
    description: "Compare packages side by side on price, delivery time and what is included.",
    parameters: {
      type: "object",
      properties: {
        platform: { type: "string", description: "Restrict the comparison to one platform." },
        limit: { type: "number", description: "How many packages to compare (default 3)." },
      },
    },
    run: (input, ctx) => {
      const limit = Math.min(Number(input.limit ?? 3) || 3, 5)
      const platform = normalise(input.platform)
      const rows = (db.packages as Row[])
        .filter((pkg) =>
          platform
            ? (Array.isArray(pkg.platforms) ? pkg.platforms : []).some((entry: string) =>
                normalise(entry).includes(platform),
              )
            : true,
        )
        .slice(0, limit)

      if (rows.length === 0) {
        return {
          text: isFa(ctx) ? "پکیجی برای مقایسه پیدا نشد." : "No packages to compare.",
          structured: {},
        }
      }

      const cheapest = rows.reduce((best, pkg) =>
        Number(pkg.monthlyUSD ?? 0) < Number(best.monthlyUSD ?? 0) ? pkg : best,
      )
      const fastest = rows.reduce((best, pkg) =>
        String(pkg.delivery ?? "99h") < String(best.delivery ?? "99h") ? pkg : best,
      )

      const lines = rows.map((pkg) => {
        const owner = packageOwner(pkg)
        const price = Number(pkg.monthlyUSD ?? Math.round(Number(pkg.monthlyToman ?? 0) / 70_000))
        return isFa(ctx)
          ? `• ${pkg.name} (${owner ? pickName(owner, ctx) : "—"}) — ${usd(price)}/ماه — تحویل ${pkg.delivery}`
          : `• ${pkg.name} (${owner ? pickName(owner, ctx) : "—"}) — ${usd(price)}/mo — ${pkg.delivery} delivery`
      })

      return {
        text: isFa(ctx)
          ? `${lines.join("\n")}\n\nارزان‌ترین: ${cheapest.name} — سریع‌ترین تحویل: ${fastest.name}.`
          : `${lines.join("\n")}\n\nCheapest: ${cheapest.name} — fastest delivery: ${fastest.name}.`,
        structured: {
          tool: "compare-packages",
          compared: rows.map((row) => ({ id: row.id, name: row.name, usd: row.monthlyUSD })),
        },
        link: { path: "/compare", label: isFa(ctx) ? "مقایسه کامل" : "Full comparison" },
      }
    },
  },
  {
    name: "suggest-pricing",
    label: "Suggest pricing",
    category: "analytics",
    description:
      "Suggest a price band for a service, derived from real packages in the marketplace.",
    parameters: {
      type: "object",
      properties: {
        platform: { type: "string", description: "Platform to price for." },
      },
    },
    run: (input, ctx) => {
      const platform = normalise(input.platform) || "instagram"
      const rows = (db.packages as Row[]).filter((pkg) =>
        (Array.isArray(pkg.platforms) ? pkg.platforms : []).some((entry: string) =>
          normalise(entry).includes(platform),
        ),
      )
      const prices = rows.map((pkg) =>
        Number(pkg.monthlyUSD ?? Math.round(Number(pkg.monthlyToman ?? 0) / 70_000)),
      )
      const list = prices.length > 0 ? prices : [250, 450, 700]
      const min = Math.min(...list)
      const max = Math.max(...list)
      const median = list.sort((a, b) => a - b)[Math.floor(list.length / 2)]

      return {
        text: isFa(ctx)
          ? `بازه قیمت ${platform} بر اساس ${rows.length} پکیج واقعی: ${usd(min)} تا ${usd(max)} در ماه (میانه ${usd(median)}).\nپیشنهاد: پایه ${usd(min)}، حرفه‌ای ${usd(median)}، سازمانی ${usd(max)}.`
          : `${platform} price band from ${rows.length} live packages: ${usd(min)}–${usd(max)} per month (median ${usd(median)}).\nSuggested tiers: Basic ${usd(min)}, Pro ${usd(median)}, Enterprise ${usd(max)}.`,
        structured: { tool: "suggest-pricing", platform, min, median, max, sample: rows.length },
      }
    },
  },
  {
    name: "recommend-team",
    label: "Recommend a team",
    category: "search",
    description: "Compose a team that fits a monthly budget.",
    parameters: {
      type: "object",
      properties: {
        budgetUsd: { type: "number", description: "Monthly budget in USD." },
      },
    },
    run: (input, ctx) => {
      const budget = Number(input.budgetUsd ?? 400) || 400
      const profiles = (db.profiles as Row[]).sort(
        (a, b) => Number(a.monthlyUSD ?? 0) - Number(b.monthlyUSD ?? 0),
      )

      const chosen: Row[] = []
      let spent = 0

      for (const profile of profiles) {
        const cost = Number(profile.monthlyUSD ?? 0)
        if (cost > 0 && spent + cost <= budget && chosen.length < 3) {
          chosen.push(profile)
          spent += cost
        }
      }

      const lines = chosen.map(
        (profile) =>
          `• ${pickName(profile, ctx)} — ${usd(Number(profile.monthlyUSD ?? 0))}/mo — ${(profile.platforms ?? []).join(", ")}`,
      )

      return {
        text: isFa(ctx)
          ? `با بودجه ${usd(budget)} این ترکیب پیشنهاد می‌شود:\n${lines.join("\n")}\nمجموع: ${usd(spent)} (${usd(budget - spent)} باقی‌مانده برای ابزارها).`
          : `For ${usd(budget)}/mo I would combine:\n${lines.join("\n")}\nTotal ${usd(spent)}, leaving ${usd(budget - spent)} for tools.`,
        structured: { tool: "recommend-team", budget, spent, members: chosen.map((row) => row.id) },
      }
    },
  },
  {
    name: "build-brief",
    label: "Build a brief",
    category: "content",
    description: "Turn a short request into a structured project brief.",
    parameters: {
      type: "object",
      properties: {
        goal: { type: "string", description: "What the employer wants to achieve." },
        platform: { type: "string", description: "Primary platform." },
        budgetUsd: { type: "number", description: "Monthly budget." },
        months: { type: "number", description: "Engagement length in months." },
      },
    },
    run: (input, ctx) => {
      const goal = String(input.goal ?? (isFa(ctx) ? "رشد فروش" : "grow sales"))
      const platform = String(input.platform ?? "instagram")
      const budget = Number(input.budgetUsd ?? 400) || 400
      const months = Number(input.months ?? 3) || 3

      return {
        text: isFa(ctx)
          ? `طرح پروژه ساخته شد:\n• هدف: ${goal}\n• پلتفرم: ${platform}\n• دامنه: ۲۰ پست + ۸ ریل در ماه، گزارش هفتگی\n• بودجه: ${usd(budget)} در ماه\n• مدت: ${months} ماه\n• تحویل: بسته پکیج + قرارداد آماده امضا`
          : `Project brief drafted:\n• Goal: ${goal}\n• Platform: ${platform}\n• Scope: 20 posts + 8 reels per month, weekly reporting\n• Budget: ${usd(budget)}/mo\n• Term: ${months} months\n• Hand-off: package selection + signable contract`,
        structured: { tool: "build-brief", goal, platform, budget, months },
        link: { path: "/contracts", label: isFa(ctx) ? "ساخت قرارداد" : "Create contract" },
      }
    },
  },
  {
    name: "content-calendar",
    label: "Content calendar",
    category: "content",
    description: "Draft a posting calendar for the next N days.",
    parameters: {
      type: "object",
      properties: { days: { type: "number", description: "Number of days (default 7)." } },
    },
    run: (input, ctx) => {
      const days = Math.min(Number(input.days ?? 7) || 7, 14)
      const en = [
        "Product showcase",
        "Customer story",
        "Behind the scenes",
        "Educational tip",
        "Reel",
        "Community post",
        "Weekly recap",
      ]
      const fa = [
        "معرفی محصول",
        "روایت مشتری",
        "پشت صحنه",
        "نکته آموزشی",
        "ریل",
        "پست جامعه",
        "جمع‌بندی هفته",
      ]

      const lines = Array.from({ length: days }, (_, index) => {
        const label = isFa(ctx) ? fa[index % fa.length] : en[index % en.length]
        return isFa(ctx) ? `روز ${index + 1}: ${label}` : `Day ${index + 1}: ${label}`
      })

      return {
        text: (isFa(ctx) ? `تقویم ${days} روزه:\n` : `${days}-day calendar:\n`) + lines.join("\n"),
        structured: { tool: "content-calendar", days },
      }
    },
  },
  {
    name: "analyze-engagement",
    label: "Analyse engagement",
    category: "analytics",
    description: "Give a quick engagement read-out with three concrete improvements.",
    parameters: {
      type: "object",
      properties: { handle: { type: "string", description: "Account handle, optional." } },
    },
    run: (input, ctx) => {
      const handle = String(input.handle ?? "@brand")
      return {
        text: isFa(ctx)
          ? `${handle}: نرخ تعامل ۴.۲٪ (میانگین دسته ۳.۱٪).\n۱) سه ریل در هفته اضافه کنید.\n۲) کامنت‌ها را زیر ۲ ساعت پاسخ دهید.\n۳) با ۲ میکرو اینفلوئنسر همکاری کنید.`
          : `${handle}: 4.2% engagement (category average 3.1%).\n1) Add three reels per week.\n2) Reply to comments within two hours.\n3) Run two micro-influencer collaborations.`,
        structured: { tool: "analyze-engagement", handle, rate: 0.042 },
      }
    },
  },
  {
    name: "search-marketplace",
    label: "Search marketplace",
    category: "search",
    description: "Full-text search across profiles, packages and tools.",
    parameters: {
      type: "object",
      properties: { query: { type: "string", description: "What to look for." } },
      required: ["query"],
    },
    run: (input, ctx) => {
      const query = normalise(input.query)
      if (!query) {
        return {
          text: isFa(ctx) ? "عبارت جستجو خالی است." : "Search query is empty.",
          structured: {},
        }
      }

      const profiles = (db.profiles as Row[]).filter((profile) =>
        [...(profile.skillsEn ?? []), profile.bioEn ?? "", profile.nameEn ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
      const packages = (db.packages as Row[]).filter((pkg) =>
        [pkg.name, pkg.description].join(" ").toLowerCase().includes(query),
      )

      return {
        text: isFa(ctx)
          ? `«${input.query}»: ${profiles.length} ادمین و ${packages.length} پکیج.\n${profiles
              .slice(0, 3)
              .map((profile) => `• ${pickName(profile, ctx)} (${profile.rating}★)`)
              .join("\n")}`
          : `"${input.query}": ${profiles.length} admins, ${packages.length} packages.\n${profiles
              .slice(0, 3)
              .map((profile) => `• ${pickName(profile, ctx)} (${profile.rating}★)`)
              .join("\n")}`,
        structured: {
          tool: "search-marketplace",
          profiles: profiles.length,
          packages: packages.length,
        },
        link: {
          path: "/marketplace",
          label: isFa(ctx) ? "نتایج در بازار" : "Results in marketplace",
        },
      }
    },
  },
  {
    name: "open-tickets",
    label: "Open tickets",
    category: "support",
    description: "Summarise support tickets that need attention.",
    parameters: { type: "object", properties: {} },
    run: (_input, ctx) => {
      const rows = (db.tickets as Row[]).filter((ticket) => ticket.status !== "closed")
      const high = rows.filter((ticket) => ticket.priority === "high")

      return {
        text: isFa(ctx)
          ? `${rows.length} تیکت باز، ${high.length} مورد اولویت بالا:\n${rows
              .slice(0, 4)
              .map((ticket) => `• ${ticket.subject} — ${ticket.status} (${ticket.priority})`)
              .join("\n")}`
          : `${rows.length} open tickets, ${high.length} high priority:\n${rows
              .slice(0, 4)
              .map((ticket) => `• ${ticket.subject} — ${ticket.status} (${ticket.priority})`)
              .join("\n")}`,
        structured: { tool: "open-tickets", open: rows.length, high: high.length },
        link: { path: "/admin-tickets", label: isFa(ctx) ? "صندوق تیکت" : "Ticket inbox" },
      }
    },
  },
  {
    name: "wallet-summary",
    label: "Wallet summary",
    category: "analytics",
    description: "Show wallet balance and the most recent transactions.",
    parameters: { type: "object", properties: {} },
    run: (_input, ctx) => {
      const wallet = (db.wallets as Row[])[0] ?? {}
      const txns = (db.transactions as Row[]).slice(0, 3)

      return {
        text: isFa(ctx)
          ? `موجودی: ${toman(Number(wallet.balanceToman ?? 0), ctx)} (${usd(Number(wallet.balanceUSD ?? 0))}).\nآخرین تراکنش‌ها:\n${txns
              .map(
                (txn) => `• ${txn.title ?? txn.type} — ${toman(Number(txn.amountToman ?? 0), ctx)}`,
              )
              .join("\n")}`
          : `Balance: ${usd(Number(wallet.balanceUSD ?? 0))}.\nRecent transactions:\n${txns
              .map((txn) => `• ${txn.title ?? txn.type} — ${usd(Number(txn.amountUSD ?? 0))}`)
              .join("\n")}`,
        structured: { tool: "wallet-summary", balanceUSD: wallet.balanceUSD },
        link: { path: "/profile", label: isFa(ctx) ? "کیف پول" : "Wallet" },
      }
    },
  },
  {
    name: "navigate",
    label: "Navigate",
    category: "automation",
    description: "Suggest where in the app to go for a given task.",
    parameters: {
      type: "object",
      properties: {
        page: {
          type: "string",
          description: "Target screen",
          enum: ["marketplace", "packages", "contracts", "compare", "admin-tickets", "profile"],
        },
      },
    },
    run: (input, ctx) => {
      const page = String(input.page ?? "marketplace")
      return {
        text: isFa(ctx) ? `صفحه «${page}» را باز کردم.` : `Opening the ${page} screen.`,
        structured: { tool: "navigate", page },
        link: { path: `/${page}`, label: isFa(ctx) ? "باز کردن" : "Open" },
      }
    },
  },
]

export function findTool(name: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.name === name)
}

/** OpenAI-style function schemas for the live model. */
export function toolSchemas() {
  return TOOLS.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }))
}
