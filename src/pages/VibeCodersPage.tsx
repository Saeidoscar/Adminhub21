import { useState, useEffect } from "react"
import { t, type Lang } from "../i18n"
import { Icon } from "../components/layout/Icon"
import { Stars } from "../components/platform/Stars"
import { listVibeCoders, type VibeCoder } from "../lib/api"
import { ListSkeleton } from "../components/ui/Skeleton"

type Stack = "webApp" | "automation" | "bots" | "landing" | "frontend"

const STACK_LABELS: Record<Stack, { en: string fa: string }> = {
  webApp: { en: "Web Apps", fa: "وب‌اپلیکیشن" },
  automation: { en: "Automation", fa: "اتوماسیون" },
  bots: { en: "Bots & Integrations", fa: "بات و اتصالات" },
  landing: { en: "Landing Pages", fa: "لندینگ پیج" },
  frontend: { en: "Frontend", fa: "فرانت‌اند" },
}

export default function VibeCodersPage({
  tr,
  lang,
}: {
  tr: typeof t["en"]
  lang: Lang
}) {
  const [coders, setCoders] = useState<VibeCoder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [stack, setStack] = useState<Stack | "all">("all")

  const isFa = lang === "fa"

  const loadCoders = async () => {
    setLoading(true)
    try {
      const data = await listVibeCoders({
        stack: stack === "all" ? undefined : stack,
        search: search || undefined,
      })
      setCoders(data)
    } catch {
      setCoders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadCoders, 300)
    return () => clearTimeout(timer)
  }, [search, stack])

  const filtered = coders.filter((coder) => {
    const name = isFa ? coder.nameFa : coder.nameEn
    const query = search.toLowerCase()
    const matchSearch =
      !query ||
      name.toLowerCase().includes(query) ||
      (isFa ? coder.bioFa : coder.bioEn).toLowerCase().includes(query)
    const matchStack = stack === "all" || coder.stack === stack
    return matchSearch && matchStack
  })

  const stackKey = (key: Stack) =>
    isFa ? STACK_LABELS[key].fa : STACK_LABELS[key].en

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {tr.vibeCoders.title}
        </h1>
        <p className="text-[#64748b] mt-1">{tr.vibeCoders.sub}</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="flex-1 min-w-48 relative">
          <div className="absolute start-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
            <Icon name="search" size={16} />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tr.vibeCoders.search}
            className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1e3a5f] transition-all"
          />
        </div>
        <select
          value={stack}
          onChange={(e) => setStack(e.target.value as Stack | "all")}
          className="px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] focus:border-[#1e3a5f] transition-all"
        >
          <option value="all">{tr.vibeCoders.allStacks}</option>
          {(Object.keys(STACK_LABELS) as Stack[]).map((s) => (
            <option key={s} value={s}>
              {stackKey(s)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <ListSkeleton count={4} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((coder) => (
            <div
              key={coder.id}
              className="bg-white rounded-2xl border border-[#e2e8f0] p-5 card-hover"
            >
              <div className="flex items-start gap-3 mb-4">
                <img
                  src={`https://images.unsplash.com/${coder.photo}?w=64&h=64&fit=crop&auto=format`}
                  alt={isFa ? coder.nameFa : coder.nameEn}
                  className="w-14 h-14 rounded-2xl object-cover bg-[#f2f5fa] flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-sm text-[#0f172a] block truncate">
                    {isFa ? coder.nameFa : coder.nameEn}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Stars rating={coder.rating} />
                    <span className="text-xs font-bold text-[#0f172a]">
                      {coder.rating}
                    </span>
                    <span className="text-xs text-[#94a3b8]">
                      ({coder.reviews})
                    </span>
                  </div>
                  <span className="inline-flex mt-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                    {stackKey(coder.stack)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#64748b] leading-relaxed mb-4 line-clamp-2">
                {isFa ? coder.bioFa : coder.bioEn}
              </p>

              <div className="flex items-center gap-4 text-xs text-[#64748b] mb-4">
                <span className="flex items-center gap-1">
                  <Icon name="check" size={12} className="text-emerald-600" />
                  {coder.projects} {tr.vibeCoders.projects}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="calendar" size={12} />
                  {coder.delivery}
                </span>
              </div>

              <div className="border-t border-[#f2f5fa] pt-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#64748b]">
                    {tr.vibeCoders.starting}
                  </div>
                  <div className="text-base font-bold text-[#1e3a5f]">
                    {isFa
                      ? `${(coder.rateToman / 1000000).toFixed(1)}M ${tr.common.toman}`
                      : `$${coder.rateUSD}`}
                    <span className="text-xs font-normal text-[#94a3b8]">
                      /{isFa ? "پروژه" : "project"}
                    </span>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-[#1e3a5f] text-white text-xs font-bold hover:bg-[#122435] transition-colors btn-press">
                  {tr.vibeCoders.hire}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-[#64748b]">
          <div className="text-4xl mb-3">⚡</div>
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
