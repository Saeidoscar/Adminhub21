import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { t, type Lang } from "../../i18n"
import { Icon } from "../../components/layout/Icon"
import { Badge } from "../../components/ui/Badge"
import {
  listContracts,
  getWallet,
  listFavorites,
  type ContractRow,
  type WalletRow,
} from "../../lib/api"
import { useAuth } from "../../contexts/AuthContext"

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  torob: "Torob",
  digikala: "Digikala",
  linkedin: "LinkedIn",
}

interface EmployerDashboardProps {
  lang: Lang
  tr: typeof t["en"] & typeof t["fa"]
  role: "employer" | "admin"
}

export default function EmployerDashboard({
  lang,
  tr,
}: EmployerDashboardProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [contracts, setContracts] = useState<ContractRow[]>([])
  const [wallet, setWallet] = useState<WalletRow | null>(null)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [showSubModal, setShowSubModal] = useState(false)

  const fmt = (toman: number, usd: number) =>
    lang === "fa"
      ? `${(toman / 1000000).toFixed(1)}M ${tr.common.toman}`
      : `$${usd}`

  const userName = lang === "fa" ? (user?.nameFa || "علی") : (user?.nameEn || "Ali")

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [contractsData, walletData, favoritesData] = await Promise.all([
          listContracts(),
          getWallet().catch(() => null),
          listFavorites().catch(() => []),
        ])

        if (cancelled) return

        setContracts(contractsData)
        setWallet(walletData)
        setFavoritesCount(favoritesData.length)
      } catch {
        if (!cancelled) {
          setContracts([])
          setWallet(null)
          setFavoritesCount(0)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const activeContracts = contracts.filter((c) => c.status === "active").length
  const totalSpentToman = contracts
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + c.amountToman, 0)
  const totalSpentUSD = contracts
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + c.amountUSD, 0)

  const stats = [
    {
      label: tr.dash.activeContracts,
      value: String(activeContracts),
      icon: "contracts",
      color: "text-[#1e3a5f]",
      bg: "bg-[#1e3a5f]/10",
    },
    {
      label: tr.dash.savedAdmins,
      value: String(favoritesCount),
      icon: "profile",
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      label: tr.dash.insurance,
      value: tr.dash.active,
      icon: "shield",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: tr.dash.totalSpent,
      value: fmt(totalSpentToman, totalSpentUSD),
      icon: "marketplace",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {tr.dash.hello}, {userName} 👋
        </h1>
        <p className="text-[#64748b] mt-1">{tr.dash.overviewTitle}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-5 border border-[#e2e8f0] card-hover"
          >
            <div
              className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}
            >
              <Icon name={s.icon} size={20} className={s.color} />
            </div>
            <div className={`text-xl font-bold ${s.color} mb-0.5`}>
              {s.value}
            </div>
            <div className="text-xs text-[#64748b]">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#64748b]">{tr.common.loading}</div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Contracts */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <h2 className="font-bold text-[#0f172a]">
                {tr.dash.recentContracts}
              </h2>
              <button className="text-xs text-[#1e3a5f] font-semibold hover:underline">
                {tr.dash.viewAll}
              </button>
            </div>
            {contracts.length === 0 ? (
              <div className="p-12 text-center text-[#64748b] text-sm">
                {lang === "fa" ? "هنوز قراردادی ندارید" : "No contracts yet"}
              </div>
            ) : (
              <div className="divide-y divide-[#e2e8f0]">
                {contracts.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-[#f8fafc] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-[#0f172a] truncate">
                          {lang === "fa" ? c.adminNameFa : c.adminNameEn}
                        </span>
                        <Badge platform={c.platform}>
                          {PLATFORM_LABELS[c.platform] || c.platform}
                        </Badge>
                        {c.hasSubstitute && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                            <Icon name="warning" size={10} />
                            {lang === "fa" ? "جایگزین فعال" : "Sub Active"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#64748b]">
                        <span className="font-mono">{c.code}</span>
                        <span>
                          {fmt(c.amountToman, c.amountUSD)}/
                          {lang === "fa" ? "ماه" : "mo"}
                        </span>
                        {c.hasInsurance && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <Icon name="shield" size={11} />
                            {lang === "fa" ? "بیمه" : "Insured"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          c.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : c.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : c.status === "completed"
                                ? "bg-gray-100 text-gray-600"
                                : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tr.dash.status[(c.status as keyof typeof tr.dash.status)]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Insurance card */}
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="shield" size={20} className="text-amber-400" />
                <span className="font-bold text-sm">{tr.dash.insTitle}</span>
              </div>
              <p className="text-blue-200 text-xs leading-relaxed mb-4">
                {tr.dash.insDesc}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 text-xs font-semibold">
                  {tr.dash.insActive}
                </span>
              </div>
            </div>

            {/* Request substitute */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
              <h3 className="font-bold text-sm text-[#0f172a] mb-3">
                {tr.dash.subStatus}
              </h3>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
                <div className="flex items-start gap-2">
                  <Icon
                    name="warning"
                    size={14}
                    className="text-orange-500 mt-0.5 flex-shrink-0"
                  />
                  <p className="text-xs text-orange-700 leading-relaxed">
                    {tr.dash.subActive}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSubModal(true)}
                className="w-full py-2.5 rounded-xl bg-[#1e3a5f] text-white text-xs font-bold hover:bg-[#122435] transition-colors btn-press"
              >
                {tr.dash.requestSub}
              </button>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
              <h3 className="font-bold text-sm text-[#0f172a] mb-3">
                {tr.dash.quickActions}
              </h3>
              <div className="space-y-2">
                {[
                  { label: tr.dash.findAdmin, icon: "search", action: () => navigate("/marketplace") },
                  { label: tr.dash.newContract, icon: "contracts", action: () => navigate("/contracts") },
                  { label: tr.dash.manageInsurance, icon: "shield", action: () => {} },
                ].map((a) => (
                  <button
                    key={a.label}
                    onClick={a.action}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#1e3a5f] hover:bg-[#f2f5fa] transition-colors text-start font-medium"
                  >
                    <Icon
                      name={a.icon}
                      size={16}
                      className="text-[#1e3a5f] flex-shrink-0"
                    />
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Substitute Modal */}
      {showSubModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Icon name="warning" size={20} className="text-orange-500" />
              </div>
              <h3 className="font-bold text-[#0f172a]">{tr.dash.requestSub}</h3>
            </div>
            <p className="text-sm text-[#64748b] mb-6 leading-relaxed">
              {tr.dash.subRequest}
            </p>
            <div className="bg-[#f2f5fa] rounded-xl p-4 mb-6">
              <div className="text-sm font-semibold text-[#0f172a] mb-2">
                {lang === "fa" ? "قرارداد مورد نظر:" : "Contract:"}{" "}
                {contracts[0]?.code || "N/A"}
              </div>
              <div className="text-xs text-[#64748b]">
                {contracts[0]
                  ? lang === "fa"
                    ? contracts[0].adminNameFa
                    : contracts[0].adminNameEn
                  : ""}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-sm font-semibold text-[#64748b] hover:bg-[#f2f5fa] transition-colors"
              >
                {tr.common.cancel}
              </button>
              <button
                onClick={() => setShowSubModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#1e3a5f] text-white text-sm font-bold hover:bg-[#122435] transition-colors"
              >
                {lang === "fa" ? "تأیید درخواست" : "Confirm Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
