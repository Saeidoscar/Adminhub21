import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { t, type Lang } from "../i18n"
import { Icon } from "../components/layout/Icon"
import { Badge } from "../components/ui/Badge"
import { ListSkeleton } from "../components/ui/Skeleton"
import { useMarketplace } from "../hooks/useMarketplace"
import { formatAdminPrice } from "../domain/profile"

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  torob: "Torob",
  digikala: "Digikala",
  linkedin: "LinkedIn",
}

interface MarketplaceProps {
  lang: Lang
  tr: typeof t["en"] & typeof t["fa"]
}

export default function Marketplace({ lang, tr }: MarketplaceProps) {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [platform, setPlatform] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const isFa = lang === "fa"

  const filters = useMemo(
    () => ({
      search,
      platform,
      sortBy,
      verifiedOnly,
      lang: lang as "en" | "fa",
    }),
    [search, platform, sortBy, verifiedOnly, lang],
  )

  const { admins, filtered, loading, favorites, favLoading, toggleFavorite, isFavorite } = useMarketplace(filters)

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">{tr.market.title}</h1>
        <p className="text-[#64748b] mt-1">{tr.market.sub}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="flex-1 min-w-48 relative">
          <div className="absolute start-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
            <Icon name="search" size={16} />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tr.market.search}
            className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1e3a5f] transition-all"
          />
        </div>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] focus:border-[#1e3a5f] transition-all"
        >
          <option value="all">{tr.market.allPlatforms}</option>
          {[
            "instagram",
            "telegram",
            "whatsapp",
            "torob",
            "digikala",
            "linkedin",
          ].map((p) => (
            <option key={p} value={p}>
              {PLATFORM_LABELS[p]}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] focus:border-[#1e3a5f] transition-all"
        >
          <option value="rating">{tr.market.sortRating}</option>
          <option value="price">{tr.market.sortPrice}</option>
        </select>
        <button
          onClick={() => setVerifiedOnly(!verifiedOnly)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all btn-press ${
            verifiedOnly
              ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
              : "border-[#e2e8f0] text-[#64748b] hover:border-[#1e3a5f]/40"
          }`}
        >
          <Icon name="check" size={14} />
          {tr.market.verified}
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <ListSkeleton count={6} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((admin) => {
            const isFav = isFavorite(admin.id)
            return (
              <div
                key={admin.id}
                className="bg-white rounded-2xl border border-[#e2e8f0] p-5 card-hover"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <img
                    src={`https://images.unsplash.com/${admin.photo}?w=64&h=64&fit=crop&auto=format`}
                    alt={admin.nameEn}
                    className="w-14 h-14 rounded-2xl object-cover bg-[#f2f5fa] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-sm text-[#0f172a] truncate">
                        {isFa ? admin.nameFa : admin.nameEn}
                      </span>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => toggleFavorite(admin.id)}
                          disabled={favLoading[admin.id]}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            isFav
                              ? "bg-rose-100 text-rose-500"
                              : "bg-[#f2f5fa] text-[#94a3b8] hover:text-rose-500"
                          }`}
                          title={isFav ? tr.dash.removeFromFavorites : tr.dash.addToFavorites}
                        >
                          <Icon
                            name="heart"
                            size={14}
                            className={isFav ? "fill-current" : ""}
                          />
                        </button>
                        {admin.verified && (
                          <div
                            className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center verified-glow"
                            title="Verified"
                          >
                            <Icon
                              name="check"
                              size={11}
                              className="text-emerald-600"
                            />
                          </div>
                        )}
                        {admin.insured && (
                          <div
                            className="w-5 h-5 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center"
                            title="Insured"
                          >
                            <Icon
                              name="shield"
                              size={11}
                              className="text-[#1e3a5f]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Stars rating={admin.rating} />
                      <span className="text-xs font-bold text-[#0f172a]">
                        {admin.rating}
                      </span>
                      <span className="text-xs text-[#94a3b8]">
                        ({admin.reviews} {tr.market.reviews})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-[#64748b] leading-relaxed mb-4 line-clamp-2">
                  {isFa ? admin.bioFa : admin.bioEn}
                </p>

                {/* Platforms */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {admin.platforms.map((p) => (
                    <Badge key={p} platform={p}>
                      {PLATFORM_LABELS[p]}
                    </Badge>
                  ))}
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {(isFa ? admin.skillsFa : admin.skillsEn)
                    .slice(0, 3)
                    .map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-full bg-[#f2f5fa] text-[#64748b] text-xs"
                      >
                        {s}
                      </span>
                    ))}
                </div>

                {/* Price & CTA */}
                <div className="border-t border-[#f2f5fa] pt-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#64748b]">
                      {tr.market.starting}
                    </div>
                    <div className="text-base font-bold text-[#1e3a5f]">
                      {formatAdminPrice(admin, lang)}
                      <span className="text-xs font-normal text-[#94a3b8]">
                        {tr.market.perMonth}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/${admin.id}`)}
                    className="px-4 py-2 rounded-xl bg-[#1e3a5f] text-white text-xs font-bold hover:bg-[#122435] transition-colors btn-press"
                  >
                    {tr.market.viewProfile}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-[#64748b]">
          <div className="text-4xl mb-3">🔍</div>
          <div className="font-semibold">
            {lang === "fa" ? "نتیجه‌ای یافت نشد" : "No results found"}
          </div>
          <div className="text-sm mt-1">
            {lang === "fa"
              ? "فیلترها را تغییر دهید"
              : "Try adjusting your filters"}
          </div>
        </div>
      )}
    </div>
  )
}