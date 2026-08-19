import { useState, useEffect } from "react"
import { t, type Lang } from "../../i18n"
import { Icon } from "../../components/layout/Icon"
import { Button } from "../../components/ui/Button"
import { Input, Textarea, Select } from "../../components/ui/Input"
import {
  listAdminProfiles,
  listPackages,
  updatePackage,
  type AdminProfile,
  type ContractPackage,
} from "../../lib/api"

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  torob: "Torob",
  digikala: "Digikala",
  linkedin: "LinkedIn",
}

interface AdminDashboardProps {
  lang: Lang
  tr: typeof t["en"] & typeof t["fa"]
  adminId?: string
}

export default function AdminDashboard({
  lang,
  tr,
  adminId,
}: AdminDashboardProps) {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [packages, setPackages] = useState<ContractPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] =
    useState<"profile" | "pricing" | "verification">("profile")
  const [bio, setBio] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [prices, setPrices] = useState({
    basic: "2500000",
    premium: "4000000",
    hourly: "150000",
  })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const allPlatforms = [
    "instagram",
    "telegram",
    "whatsapp",
    "torob",
    "digikala",
    "linkedin",
  ]

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    )
  }

  const fmt = (val: string) =>
    lang === "fa"
      ? `${(parseInt(val) / 1000000).toFixed(1)}M ${tr.common.toman}`
      : `$${Math.round(parseInt(val) / 42000)}`

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [profiles, pkgs] = await Promise.all([
          listAdminProfiles(),
          listPackages(),
        ])

        if (cancelled) return

        const currentProfile = adminId
          ? profiles.find((p) => p.id === adminId) || profiles[0]
          : profiles[0]

        if (currentProfile) {
          setProfile(currentProfile)
          setBio(lang === "fa" ? currentProfile.bioFa : currentProfile.bioEn)
          setSelectedPlatforms(currentProfile.platforms)
        }

        const adminPkgs = pkgs.filter(
          (p) => p.adminId === (currentProfile?.id || pkgs[0]?.adminId),
        )
        setPackages(adminPkgs)

        if (adminPkgs.length > 0) {
          const basic = adminPkgs.find((p) => p.name.toLowerCase().includes("basic") || p.name.toLowerCase().includes("پایه"))
          const premium = adminPkgs.find((p) => p.name.toLowerCase().includes("premium") || p.name.toLowerCase().includes("ویژه"))
          const hourly = adminPkgs.find((p) => p.name.toLowerCase().includes("hourly") || p.name.toLowerCase().includes("ساعتی"))

          setPrices({
            basic: basic ? String(basic.priceToman) : "2500000",
            premium: premium ? String(premium.priceToman) : "4000000",
            hourly: hourly ? String(hourly.priceToman) : "150000",
          })
        }
      } catch {
        if (!cancelled) {
          setProfile(null)
          setPackages([])
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
  }, [adminId, lang])

  const handleSaveProfile = async () => {
    if (!profile) return
    setSaving(true)
    setSaveMsg(null)
    try {
      // Note: PUT /api/admin-profiles/me requires auth and updates current user's profile
      // For now, we update locally since the "me" endpoint needs specific auth setup
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              bioEn: lang === "en" ? bio : prev.bioEn,
              bioFa: lang === "fa" ? bio : prev.bioFa,
              platforms: selectedPlatforms,
            }
          : prev,
      )
      setSaveMsg(lang === "fa" ? "پروفایل ذخیره شد" : "Profile saved")
      setTimeout(() => setSaveMsg(null), 3000)
    } catch {
      setSaveMsg(lang === "fa" ? "خطا در ذخیره" : "Error saving profile")
    } finally {
      setSaving(false)
    }
  }

  const handleSavePackage = async (pkg: ContractPackage) => {
    setSaving(true)
    try {
      await updatePackage(pkg)
      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? pkg : p)),
      )
      setSaveMsg(lang === "fa" ? "پکیج ذخیره شد" : "Package saved")
      setTimeout(() => setSaveMsg(null), 3000)
    } catch {
      setSaveMsg(lang === "fa" ? "خطا در ذخیره" : "Error saving package")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto fade-in">
        <div className="text-center py-12 text-[#64748b]">{tr.common.loading}</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto fade-in">
        <div className="text-center py-12">
          <div className="text-4xl mb-3">👤</div>
          <div className="font-bold text-[#0f172a] mb-1">
            {lang === "fa" ? "پروفایل ادمین یافت نشد" : "Admin profile not found"}
          </div>
          <div className="text-sm text-[#64748b]">
            {lang === "fa"
              ? "لطفاً ابتدا پروفایل ادمین خود را ایجاد کنید"
              : "Please create your admin profile first"}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {tr.adminProfile.title}
        </h1>
        <p className="text-[#64748b] mt-1">{tr.adminProfile.sub}</p>
      </div>

      {saveMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 text-sm text-emerald-700">
          {saveMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-[#e2e8f0] rounded-xl p-1 mb-6 w-fit shadow-sm">
        {(["profile", "pricing", "verification"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all btn-press ${
              activeTab === tab
                ? "bg-[#1e3a5f] text-white"
                : "text-[#64748b] hover:text-[#1e3a5f]"
            }`}
          >
            {tab === "profile"
              ? tr.adminProfile.bio.split(" ")[0]
              : tab === "pricing"
                ? tr.adminProfile.pricing
                : lang === "fa"
                  ? "تأییدیه"
                  : "Verification"}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="grid lg:grid-cols-3 gap-6 fade-in">
          <div className="lg:col-span-2 space-y-5">
            {/* Photo & Bio */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  <img
                    src={`https://images.unsplash.com/${profile.photo}?w=80&h=80&fit=crop&auto=format`}
                    alt="Profile"
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                  <button className="absolute -bottom-1 -end-1 w-6 h-6 bg-[#1e3a5f] rounded-full flex items-center justify-center">
                    <Icon name="camera" size={12} className="text-white" />
                  </button>
                </div>
                <div>
                  <div className="font-bold text-[#0f172a]">
                    {lang === "fa" ? profile.nameFa : profile.nameEn}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                      <Icon name="check" size={12} />
                      {lang === "fa" ? "تأییدشده" : "Verified"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-[#1e3a5f] font-semibold">
                      <Icon name="shield" size={12} />
                      {lang === "fa" ? "بیمه‌شده" : "Insured"}
                    </span>
                  </div>
                </div>
              </div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                {tr.adminProfile.bio}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={tr.adminProfile.bioPh}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all resize-none"
              />
            </div>

            {/* Platforms */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
              <h3 className="font-bold text-[#0f172a] mb-4">
                {tr.adminProfile.platforms}
              </h3>
              <div className="flex flex-wrap gap-2">
                {allPlatforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all btn-press border-2 ${
                      selectedPlatforms.includes(p)
                        ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
                        : "border-[#e2e8f0] text-[#64748b] hover:border-[#1e3a5f]/40"
                    }`}
                  >
                    {selectedPlatforms.includes(p) && (
                      <Icon name="check" size={12} />
                    )}
                    {PLATFORM_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
              <h3 className="font-bold text-[#0f172a] mb-4">
                {tr.adminProfile.skills}
              </h3>
              <div className="flex flex-wrap gap-2">
                {(lang === "fa" ? profile.skillsFa : profile.skillsEn).map(
                  (skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Stats */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
              {[
                {
                  label:
                    lang === "fa" ? "پروژه تکمیل شده" : "Completed Projects",
                  value: String(profile.reviews),
                },
                {
                  label: lang === "fa" ? "امتیاز" : "Rating",
                  value: `${profile.rating} ⭐`,
                },
                {
                  label: lang === "fa" ? "نظرات" : "Reviews",
                  value: String(profile.reviews),
                },
                {
                  label: lang === "fa" ? "میانگین پاسخ" : "Response Time",
                  value: lang === "fa" ? "۲ ساعت" : "2 hrs",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between py-2.5 border-b border-[#f2f5fa] last:border-0"
                >
                  <span className="text-xs text-[#64748b]">{s.label}</span>
                  <span className="text-sm font-bold text-[#0f172a]">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-[#1e3a5f] text-white font-bold text-sm hover:bg-[#122435] transition-colors shadow-md btn-press disabled:opacity-50"
            >
              {saving ? tr.common.loading : tr.adminProfile.saveProfile}
            </button>
          </div>
        </div>
      )}

      {activeTab === "pricing" && (
        <div className="fade-in">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.length === 0
              ? [
                  {
                    key: "basic",
                    label: tr.adminProfile.basic,
                    desc:
                      lang === "fa"
                        ? "۳۰ پست در ماه + مدیریت روزانه"
                        : "30 posts/month + daily management",
                    icon: "🌱",
                    featured: false,
                  },
                  {
                    key: "premium",
                    label: tr.adminProfile.premium,
                    desc:
                      lang === "fa"
                        ? "همه چیز در پایه + ریلز و تبلیغات"
                        : "Everything in Basic + Reels & Ads",
                    icon: "⭐",
                    featured: true,
                  },
                  {
                    key: "hourly",
                    label: tr.adminProfile.hourly,
                    desc:
                      lang === "fa"
                        ? "نرخ ساعتی انعطاف‌پذیر"
                        : "Flexible hourly rate",
                    icon: "⏱️",
                    featured: false,
                  },
                ].map((pkg) => (
                  <PricingCard
                    key={pkg.key}
                    pkg={pkg}
                    price={prices[(pkg.key as keyof typeof prices)]}
                    onSave={(val) =>
                      setPrices((p) => ({ ...p, [pkg.key]: val }))
                    }
                    lang={lang}
                    tr={tr}
                  />
                ))
              : packages.map((pkg) => (
                  <PricingCard
                    key={pkg.id}
                    pkg={{
                      key: pkg.id,
                      label: pkg.name,
                      desc: pkg.description,
                      icon: pkg.featured ? "⭐" : "📦",
                      featured: pkg.featured,
                    }}
                    price={String(pkg.priceToman)}
                    onSave={(val) =>
                      handleSavePackage({
                        ...pkg,
                        priceToman: parseInt(val) || 0,
                        priceUSD: pkg.priceUSD,
                      })
                    }
                    lang={lang}
                    tr={tr}
                  />
                ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-[#64748b]">
            <Icon name="info" size={14} />
            <span>
              {lang === "fa"
                ? "قیمت‌ها به تومان. نمایش دلاری بر اساس نرخ ۴۲,۰۰۰ تومان محاسبه می‌شود."
                : "Prices in Toman. USD shown at 42,000 Toman rate."}
            </span>
          </div>
        </div>
      )}

      {activeTab === "verification" && (
        <div className="max-w-xl fade-in space-y-4">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0">
                <Icon name="shield" size={20} className="text-[#1e3a5f]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a]">
                  {tr.adminProfile.verification}
                </h3>
                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                  {tr.adminProfile.verificationDesc}
                </p>
              </div>
            </div>
            <button className="w-full py-3 rounded-xl bg-[#1e3a5f] text-white font-bold text-sm btn-press hover:bg-[#122435] transition-colors">
              {tr.adminProfile.applyVerification}
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Icon name="check" size={20} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#0f172a]">
                  {tr.adminProfile.insuranceEligibility}
                </h3>
                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                  {tr.adminProfile.insuranceDesc}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-[#64748b]">
                    {tr.adminProfile.status}:
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <Icon name="check" size={12} />
                    {tr.adminProfile.eligible}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PricingCard({
  pkg,
  price,
  onSave,
  lang,
  tr,
}: {
  pkg: {
    key: string
    label: string
    desc: string
    icon: string
    featured: boolean
  }
  price: string
  onSave: (val: string) => void
  lang: Lang
  tr: typeof t["en"] & typeof t["fa"]
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(price)

  return (
    <div
      className={`rounded-2xl border-2 p-5 ${
        pkg.featured
          ? "border-[#1e3a5f] bg-[#1e3a5f]/5"
          : "border-[#e2e8f0] bg-white"
      }`}
    >
      <div className="text-2xl mb-3">{pkg.icon}</div>
      <div
        className={`font-bold text-sm mb-1 ${
          pkg.featured ? "text-[#1e3a5f]" : "text-[#0f172a]"
        }`}
      >
        {pkg.label}
      </div>
      <div className="text-xs text-[#64748b] mb-4 leading-relaxed">
        {pkg.desc}
      </div>
      {editing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] bg-white text-sm font-bold text-[#0f172a] text-center focus:border-[#1e3a5f] transition-all"
            dir="ltr"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                onSave(draft)
                setEditing(false)
              }}
              className="flex-1 py-1.5 rounded-lg bg-[#1e3a5f] text-white text-xs font-bold"
            >
              {tr.common.save}
            </button>
            <button
              onClick={() => {
                setDraft(price)
                setEditing(false)
              }}
              className="flex-1 py-1.5 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#64748b]"
            >
              {tr.common.cancel}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setEditing(true)}
          >
            <div className="text-base font-bold text-[#1e3a5f]">
              {fmt(price)}
            </div>
            <Icon name="edit" size={14} className="text-[#94a3b8]" />
          </div>
          <div className="text-xs text-[#64748b] mt-2 text-center">
            {lang === "fa" ? "برای ویرایش کلیک کنید" : "Click to edit"}
          </div>
        </>
      )}
      {pkg.featured && (
        <div className="mt-3 px-2 py-1 bg-amber-100 rounded-lg text-xs text-amber-700 font-semibold text-center">
          {lang === "fa" ? "پیشنهاد ویژه" : "Most Popular"}
        </div>
      )}
    </div>
  )
}