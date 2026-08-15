import { useState } from "react"
import { t, type Lang } from "../i18n"
import { Icon } from "../components/layout/Icon"
import { Stars } from "../components/platform/Stars"

type Category = "scheduling" | "design" | "analytics" | "automation" | "ecommerce"

interface Tool {
  name: string
  category: Category
  icon: string
  rating: number
  reviews: number
  popular: boolean
  priceToman: number
  priceUSD: number
  descEn: string
  descFa: string
}

const TOOLS: Tool[] = [
  {
    name: "ContentCal Pro",
    category: "scheduling",
    icon: "calendar",
    rating: 4.8,
    reviews: 213,
    popular: true,
    priceToman: 1200000,
    priceUSD: 29,
    descEn:
      "Plan, approve, and auto-publish content across Instagram, Telegram, and LinkedIn in one calendar.",
    descFa:
      "برنامه‌ریزی، تأیید و انتشار خودکار محتوا در اینستاگرام، تلگرام و لینکدین در یک تقویم واحد.",
  },
  {
    name: "Canva Studio",
    category: "design",
    icon: "edit",
    rating: 4.9,
    reviews: 512,
    popular: true,
    priceToman: 900000,
    priceUSD: 21,
    descEn:
      "Design reels covers, carousels, and brand templates with an AI-powered studio and team collaboration.",
    descFa:
      "طراحی کاور ریلز، کاروسل و تمپلیت برند با استودیو مبتنی بر هوش مصنوعی و همکاری تیمی.",
  },
  {
    name: "Insightly Analytics",
    category: "analytics",
    icon: "chart",
    rating: 4.7,
    reviews: 98,
    popular: false,
    priceToman: 1500000,
    priceUSD: 36,
    descEn:
      "Track engagement, follower growth, and ad performance across all platforms with automated reports.",
    descFa:
      "رصد تعامل، رشد فالوور و عملکرد تبلیغات در همه پلتفرم‌ها با گزارش‌های خودکار.",
  },
  {
    name: "AutoResponder Bot",
    category: "automation",
    icon: "bot",
    rating: 4.6,
    reviews: 156,
    popular: false,
    priceToman: 800000,
    priceUSD: 19,
    descEn:
      "Automate DM replies, comment responses, and FAQ handling 24/7 across your connected channels.",
    descFa:
      "پاسخ خودکار به DM، کامنت‌ها و سوالات پرتکرار به صورت ۲۴/۷ در تمام کانال‌های متصل.",
  },
  {
    name: "ShopSync",
    category: "ecommerce",
    icon: "layers",
    rating: 4.8,
    reviews: 121,
    popular: true,
    priceToman: 1800000,
    priceUSD: 43,
    descEn:
      "Synchronize inventory and pricing between your online store, Torob, and Digikala listings.",
    descFa:
      "همگام‌سازی موجودی و قیمت بین فروشگاه آنلاین شما و لیست‌های ترب و دیجی‌کالا.",
  },
  {
    name: "Reels Maker AI",
    category: "design",
    icon: "camera",
    rating: 4.7,
    reviews: 187,
    popular: false,
    priceToman: 1100000,
    priceUSD: 26,
    descEn:
      "Turn long videos into scroll-stopping reels with AI captions, cuts, and trend-based templates.",
    descFa:
      "تبدیل ویدئوهای طولانی به ریلز جذاب با زیرنویس، برش و تمپلیت‌های ترند مبتنی بر هوش مصنوعی.",
  },
  {
    name: "Engagement Plus",
    category: "analytics",
    icon: "chart",
    rating: 4.5,
    reviews: 74,
    popular: false,
    priceToman: 1300000,
    priceUSD: 31,
    descEn:
      "Identify your best-performing content, ideal posting times, and audience insights to grow faster.",
    descFa:
      "شناسایی بهترین محتواها، بهترین زمان انتشار و تحلیل مخاطب برای رشد سریع‌تر.",
  },
  {
    name: "Broadcast Manager",
    category: "automation",
    icon: "send",
    rating: 4.6,
    reviews: 143,
    popular: false,
    priceToman: 950000,
    priceUSD: 23,
    descEn:
      "Send targeted broadcasts and campaigns to WhatsApp and Telegram audiences with segmentation.",
    descFa:
      "ارسال برادکست و کمپین هدفمند به مخاطبان واتساپ و تلگرام با بخش‌بندی دقیق.",
  },
]

const CATEGORY_LABELS: Record<Category, { en: string fa: string }> = {
  scheduling: { en: "Scheduling", fa: "زمان‌بندی" },
  design: { en: "Design", fa: "طراحی" },
  analytics: { en: "Analytics", fa: "آنالیتیکس" },
  automation: { en: "Automation", fa: "اتوماسیون" },
  ecommerce: { en: "E-commerce", fa: "فروشگاه آنلاین" },
}

export default function ToolsRentalPage({
  tr,
  lang,
}: {
  tr: typeof t["en"]
  lang: Lang
}) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<Category | "all">("all")

  const isFa = lang === "fa"

  const filtered = TOOLS.filter((tool) => {
    const query = search.toLowerCase()
    const matchSearch =
      !query ||
      tool.name.toLowerCase().includes(query) ||
      (isFa ? tool.descFa : tool.descEn).toLowerCase().includes(query)
    const matchCategory = category === "all" || tool.category === category
    return matchSearch && matchCategory
  })

  const categoryKey = (key: Category) =>
    isFa ? CATEGORY_LABELS[key].fa : CATEGORY_LABELS[key].en

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">{tr.tools.title}</h1>
        <p className="text-[#64748b] mt-1">{tr.tools.sub}</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="flex-1 min-w-48 relative">
          <div className="absolute start-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
            <Icon name="search" size={16} />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tr.tools.search}
            className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1e3a5f] transition-all"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | "all")}
          className="px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] focus:border-[#1e3a5f] transition-all"
        >
          <option value="all">{tr.tools.allCategories}</option>
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
            <option key={c} value={c}>
              {categoryKey(c)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tool) => (
          <div
            key={tool.name}
            className="bg-white rounded-2xl border border-[#e2e8f0] p-5 card-hover"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0">
                <Icon name={tool.icon} size={22} className="text-[#1e3a5f]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-[#0f172a] truncate">
                    {tool.name}
                  </span>
                  {tool.popular && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold flex-shrink-0">
                      {tr.tools.popular}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Stars rating={tool.rating} />
                  <span className="text-xs font-bold text-[#0f172a]">
                    {tool.rating}
                  </span>
                  <span className="text-xs text-[#94a3b8]">
                    ({tool.reviews} {tr.tools.tools})
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#64748b] leading-relaxed mb-4 line-clamp-2">
              {isFa ? tool.descFa : tool.descEn}
            </p>

            <div className="mb-4">
              <span className="inline-flex px-2.5 py-1 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-semibold">
                {categoryKey(tool.category)}
              </span>
            </div>

            <div className="border-t border-[#f2f5fa] pt-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-[#64748b]">
                  {tr.tools.starting}
                </div>
                <div className="text-base font-bold text-[#1e3a5f]">
                  {isFa
                    ? `${(tool.priceToman / 1000000).toFixed(1)}M ${tr.common.toman}`
                    : `$${tool.priceUSD}`}
                  <span className="text-xs font-normal text-[#94a3b8]">
                    {tr.tools.perMonth}
                  </span>
                </div>
              </div>
              <button className="px-4 py-2 rounded-xl bg-[#1e3a5f] text-white text-xs font-bold hover:bg-[#122435] transition-colors btn-press">
                {tr.tools.rent}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[#64748b]">
          <div className="text-4xl mb-3">🧰</div>
          <div className="font-semibold">
            {isFa ? "نتیجه‌ای یافت نشد" : "No results found"}
          </div>
          <div className="text-sm mt-1">
            {isFa ? "فیلترها را تغییر دهید" : "Try adjusting your filters"}
          </div>
        </div>
      )}
    </div>
  )
}
