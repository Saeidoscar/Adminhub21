import type { Lang } from "../i18n"

export type McpTool = {
  name: string
  description: string
  inputSchema?: Record<string, unknown>
  category?: "search" | "automation" | "content" | "analytics" | "contract"
}

export type McpCallOptions = {
  language?: Lang
  role?: "employer" | "admin"
  contextId?: string
}

export type McpResult = {
  text: string
  structured?: Record<string, unknown>
  toolResults?: unknown[]
  confidence?: number
}

export type McpIntent = {
  intent: string
  entities: Record<string, unknown>
  confidence: number
}

export type McpSession = {
  id: string
  createdAt: string
  messages: {
    role: "user" | "assistant" | "tool"
    content: string
    toolName?: string
  }[]
}

export interface McpClientConfig {
  baseUrl?: string
  apiKey?: string
  onEvent?: (event: McpEvent) => void
}

export type McpEvent = {
  type: "tool_started"
  tool: string
  input: Record<string, unknown>
} | {
  type: "tool_result"
  tool: string
  result: unknown
} | {
  type: "error"
  message: string
} | {
  type: "session_updated"
  session: McpSession
}

let config: McpClientConfig = { baseUrl: "" }

export function initMcpClient(cfg: McpClientConfig) {
  config = { ...config, ...cfg }
}

export async function listTools(): Promise<McpTool[]> {
  if (!config.baseUrl) return mockTools
  try {
    const res = await fetch(`${config.baseUrl}/api/mcp/tools`, {
      headers: config.apiKey
        ? { Authorization: `Bearer ${config.apiKey}` }
        : {},
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as McpTool[]
  } catch {
    return mockTools
  }
}

export async function detectIntent(
  text: string,
  opts?: McpCallOptions,
): Promise<McpIntent> {
  if (!config.baseUrl) {
    return mockIntentDetection(text)
  }
  try {
    const res = await fetch(`${config.baseUrl}/api/mcp/intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        text,
        language: opts?.language ?? "en",
        role: opts?.role ?? "employer",
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as McpIntent
  } catch {
    return mockIntentDetection(text)
  }
}

export async function callTool(
  toolName: string,
  input: Record<string, unknown>,
  opts?: McpCallOptions,
): Promise<McpResult> {
  if (!config.baseUrl) {
    return mockToolCall(toolName, input, opts)
  }
  config.onEvent?.({ type: "tool_started", tool: toolName, input })
  try {
    const res = await fetch(`${config.baseUrl}/api/mcp/tools/${toolName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        input,
        language: opts?.language ?? "en",
        role: opts?.role ?? "employer",
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const result = (await res.json()) as McpResult
    config.onEvent?.({ type: "tool_result", tool: toolName, result })
    return result
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    config.onEvent?.({ type: "error", message })
    return { text: `Error calling tool "${toolName}": ${message}` }
  }
}

export async function converse(
  text: string,
  session?: McpSession,
  opts?: McpCallOptions,
): Promise<McpResult & { session: McpSession }> {
  if (!config.baseUrl) {
    const result = await mockConverse(text, session, opts)
    return result
  }
  try {
    const res = await fetch(`${config.baseUrl}/api/mcp/converse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        text,
        session,
        language: opts?.language ?? "en",
        role: opts?.role ?? "employer",
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as McpResult & { session: McpSession }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    config.onEvent?.({ type: "error", message })
    return mockConverse(text, session, opts)
  }
}

export function createSession(): McpSession {
  return {
    id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    messages: [],
  }
}

const mockTools: McpTool[] = [
  {
    name: "find-admin",
    description: "Find matching admins for a project",
    category: "search",
  },
  {
    name: "generate-contract",
    description: "Generate a service contract template",
    category: "contract",
  },
  {
    name: "suggest-pricing",
    description: "Suggest competitive pricing for services",
    category: "analytics",
  },
  {
    name: "build-brief",
    description: "Build a project brief from natural language",
    category: "content",
  },
  {
    name: "recommend-team",
    description: "Recommend a team composition for a budget",
    category: "search",
  },
  {
    name: "content-calendar",
    description: "Generate a content calendar for social platforms",
    category: "content",
  },
  {
    name: "create-thumbnail",
    description: "Generate thumbnail design suggestions",
    category: "content",
  },
  {
    name: "analyze-engagement",
    description: "Analyze engagement metrics and suggest improvements",
    category: "analytics",
  },
  {
    name: "list-packages",
    description: "List available contract packages for an admin or platform",
    category: "search",
  },
  {
    name: "create-package",
    description: "Create a new contract package for an admin profile",
    category: "contract",
  },
  {
    name: "send-custom-offer",
    description: "Send a customized package offer to an admin",
    category: "contract",
  },
  {
    name: "compare-packages",
    description: "Compare multiple packages side by side",
    category: "analytics",
  },
]

function mockIntentDetection(text: string): McpIntent {
  const lower = text.toLowerCase()
  if (
    lower.includes("instagram") ||
    lower.includes("hire") ||
    lower.includes("استخدام") ||
    lower.includes("اینستاگرام")
  ) {
    return {
      intent: "find_admin",
      entities: { platform: "instagram" },
      confidence: 0.92,
    }
  }
  if (lower.includes("contract") || lower.includes("قرارداد")) {
    return { intent: "generate_contract", entities: {}, confidence: 0.88 }
  }
  if (
    lower.includes("price") ||
    lower.includes("cost") ||
    lower.includes("قیمت") ||
    lower.includes("نرخ")
  ) {
    return { intent: "suggest_pricing", entities: {}, confidence: 0.85 }
  }
  if (
    lower.includes("budget") ||
    lower.includes("بودجه") ||
    lower.includes("team") ||
    lower.includes("تیم")
  ) {
    return { intent: "recommend_team", entities: {}, confidence: 0.8 }
  }
  if (
    lower.includes("package") ||
    lower.includes("پکیج") ||
    lower.includes("باندل")
  ) {
    return { intent: "list_packages", entities: {}, confidence: 0.9 }
  }
  if (lower.includes("compare") || lower.includes("مقایسه")) {
    return { intent: "compare_packages", entities: {}, confidence: 0.88 }
  }
  if (
    lower.includes("offer") ||
    lower.includes("پیشنهاد") ||
    lower.includes("custom")
  ) {
    return { intent: "send_custom_offer", entities: {}, confidence: 0.85 }
  }
  return { intent: "ask_general", entities: {}, confidence: 0.5 }
}

function mockToolCall(
  toolName: string,
  _input: Record<string, unknown>,
  opts?: McpCallOptions,
): McpResult {
  const isFa = opts?.language === "fa"
  const responses: Record<string, {
    en: string
    fa: string
  }> = {
    "find-admin": {
      en: "Looking for admins on Instagram with 4.5+ rating and engagement experience. Top matches: Arya Ahmadi (4.9★), Neda Farahani (5.0★). Estimated rate: $100-150/mo.",
      fa: "جستجو برای ادمین اینستاگرام با امتیاز ۴.۵+ و تجربه تعامل. بهترین مطابق‌ها: آریا احمدی (۴.۹★)، ندا فراهانی (۵.۰★). نرخ تخمینی: ۴۲-۶۳ میلیون تومان/ماه.",
    },
    "generate-contract": {
      en: "Generated a contract template for Instagram management (30 posts/month, weekly reporting, $108/mo, 3-month term, 24h replacement clause).",
      fa: "قرارداد فراتمپلیت برای مدیریت اینستاگرام (۳۰ پست/ماه، گزارش هفتگی، ۴۵۰۰۰۰۰ تومان/ماه، ۳ ماهه، بند جایگزینی ۲۴ ساعته).",
    },
    "suggest-pricing": {
      en: "Recommended pricing: Basic $25-45/mo, Premium $45-80/mo, Enterprise $80+/mo. Pricing should reflect follower count, content volume, and platform specialization.",
      fa: "قیمت‌گذاری پیشنهادی: پایه ۲۵-۴۵ میلیون تومان/ماه، ویژه ۴۵-۸۰ میلیون تومان/ماه، سازمانی ۸۰+ میلیون تومان/ماه.",
    },
    "build-brief": {
      en: "Project brief created: Goal — increase Instagram engagement by 25%; Scope — 30 posts/month, daily stories, weekly analytics; Timeline — 3 months; Budget — $100-150/mo.",
      fa: "طرح پروژه ساخته شد: هدف — افزایش تعامل اینستاگرام ۲۵ درصد؛ دامنه — ۳۰ پست/ماه، استوری روزانه، آنالیتیکس هفتگی؛ زمان‌بندی — ۳ ماه؛ بودجه — ۴۲-۶۳ میلیون تومان/ماه.",
    },
    "recommend-team": {
      en: "For your $20M budget: Instagram admin ($4.5M), Torob specialist ($5.2M), WhatsApp manager ($3.8M), Content creator ($3M), Total: $16.5M with 20% buffer for tools.",
      fa: "برای بودجه ۲۰ میلیون تومانی شما: ادمین اینستاگرام (۴.۵M)، متخصص ترب (۵.۲M)، مدیر واتساپ (۳.۸M)، خلاق محتوا (۳M)، مجموع: ۱۶.۵M با بافر ۲۰ درصدی برای ابزارها.",
    },
    "content-calendar": {
      en: "7-day content calendar created for Instagram: Day 1 — Product showcase, Day 2 — User testimonial, Day 3 — BTS, Day 4 — Educational tip, Day 5 — Reel, Day 6 — Community post, Day 7 — Weekly recap.",
      fa: "تقویم محتوا ۷ روزه برای اینستاگرام ساخته شد: روز ۱ — نمایش محصول، روز ۲ — شاهدی از کاربر، روز ۳ — پشت صحنه، روز ۴ — نکته آموزشی، روز ۵ — ریل، روز ۶ — پست جامعه، روز ۷ — جمع‌بندی هفته.",
    },
    "create-thumbnail": {
      en: "Thumbnail concept: Bold typography with gradient background, product-focused image on left, clear CTA text on right. Colors: #6366F1 to #EC4899 gradient.",
      fa: "مفهوم تصویر شاخص: تایپوگرافی ضخیم با پس‌زمینه گرادیانت، تصویر محصول در سمت چپ، متن CTA واضح در سمت راست. رنگ‌ها: گرادیانت #6366F1 تا #EC4899.",
    },
    "analyze-engagement": {
      en: "Engagement rate: 4.2%. Recommended: increase posting frequency to daily, add 3 Reels/week, engage with comments within 2 hours, collaborate with micro-influencers.",
      fa: "نرخ تعامل: ۴.۲ درصد. پیشنهادی: افزایش فرکانس پست‌گذاری به روزانه، افزودن ۳ ریل در هفته، تعامل با کامنت‌ها در عرض ۲ ساعت، همکاری با میکرو اینفلوئنسرها.",
    },
    "list-packages": {
      en: "Found 8 packages across 6 admins. Top picks: Social Commerce Pro (Neda Farahani, $227/mo), Instagram + LinkedIn Bundle (Mina Hosseini, $203/mo).",
      fa: "۸ پکیج در ۶ ادمین پیدا شد. بهترین‌ها: Social Commerce Pro (ندا فراهانی، ۲۲۷ دلار/ماه)، باندل اینستاگرام + لینکدین (مینا حسینی، ۲۰۳ دلار/ماه).",
    },
    "create-package": {
      en: "Package created successfully. It is now visible to employers in the marketplace.",
      fa: "پکیج با موفقیت ایجاد شد. اکنون برای کارفرمایان در بازار کار قابل مشاهده است.",
    },
    "send-custom-offer": {
      en: "Custom offer sent to the admin. You will be notified when they respond.",
      fa: "پیشنهاد سفارشی به ادمین ارسال شد. وقتی پاسخ دادند به شما اطلاع داده می‌شود.",
    },
    "compare-packages": {
      en: "Comparing 3 packages. Best value: Torob + Digikala E-commerce (Dariush Rezaei) at $124/mo with 100 listings per platform.",
      fa: "مقایسه ۳ پکیج. ارزشمندترین: باندل تجارت الکترونیک ترب + دیجی‌کالا (داریوش رضایی) با ۱۲۴ دلار/ماه و ۱۰۰ لیست در هر پلتفرم.",
    },
  }
  const key = Object.keys(responses).includes(toolName) ? toolName : ""
  const text = key
    ? isFa
      ? responses[key].fa
      : responses[key].en
    : `Tool "${toolName}" is not available in mock mode.`
  return { text, structured: { tool: toolName, mock: true } }
}

async function mockConverse(
  text: string,
  session?: McpSession,
  opts?: McpCallOptions,
): Promise<McpResult & { session: McpSession }> {
  const isFa = opts?.language === "fa"
  const intent = mockIntentDetection(text)
  const result = mockToolCall(intent.intent, { text }, opts)
  const updatedSession = session ?? createSession()
  updatedSession.messages.push({ role: "user", content: text })
  const aiResponse =
    result.text ??
    (isFa
      ? "متوفق نشدم کاملاً متوجه بشوم. می‌تونی جزئیات بیشتر بدی؟"
      : "I didn't quite catch that. Could you provide more details?")
  updatedSession.messages.push({ role: "assistant", content: aiResponse })
  return { ...result, text: aiResponse, session: updatedSession }
}
