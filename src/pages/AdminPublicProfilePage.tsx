import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { t, type Lang } from "../i18n"
import { Icon } from "../components/layout/Icon"
import { Button } from "../components/ui/Button"
import { Input, Textarea, Select } from "../components/ui/Input"
import { Stars } from "../components/platform/Stars"
import { usePackages } from "../contexts/PackageContext"
import {
  platformLabel,
  PLATFORM_SPECS,
  emptyPlatformConfig,
} from "../components/packages/platformSpecs"
import {
  listReviews,
  createReview,
  type ReviewRow,
} from "../lib/api"
import type {
  ContractPackage,
  PlatformKey,
  PlatformConfig,
  CustomOffer,
  AdminProfile,
} from "@adminhub/shared"

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "badge-instagram",
  telegram: "badge-telegram",
  whatsapp: "badge-whatsapp",
  torob: "badge-torob",
  digikala: "badge-digikala",
  linkedin: "badge-linkedin",
}

const BILLING_CYCLES: {
  value: string
  labelEn: string
  labelFa: string
}[] = [
  { value: "monthly", labelEn: "Monthly Retainer", labelFa: "حقوق ماهیانه" },
  {
    value: "project",
    labelEn: "Fixed Project Price",
    labelFa: "قرارداد پروژه‌ای",
  },
  { value: "hourly", labelEn: "Hourly Rate", labelFa: "نرخ ساعتی" },
]

const DURATION_OPTIONS: {
  value: string
  labelEn: string
  labelFa: string
}[] = [
  { value: "1", labelEn: "1 month", labelFa: "۱ ماه" },
  { value: "3", labelEn: "3 months", labelFa: "۳ ماه" },
  { value: "6", labelEn: "6 months", labelFa: "۶ ماه" },
  { value: "12", labelEn: "12 months", labelFa: "۱۲ ماه" },
]

export default function AdminPublicProfilePage() {
  const { adminId } = useParams<{ adminId: string }>()
  const navigate = useNavigate()
  const { packages, comparison, submitOffer, admin: findAdmin } = usePackages()
  const [lang, setLang] = useState<Lang>("fa")
  const [activeTab, setActiveTab] = useState<"profile" | "packages" | "custom" | "reviews">(
    "profile",
  )
  const [offerSent, setOfferSent] = useState(false)
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" })
  const [submittingReview, setSubmittingReview] = useState(false)

  const isFa = lang === "fa"
  const tr = t[lang]
  const admin = adminId ? findAdmin(adminId) : null
  const adminPackages = packages.filter(
    (p) => p.adminId === adminId && p.active !== false,
  )

  if (!admin) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto fade-in">
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <div className="font-bold text-[#0f172a] mb-1">
            {isFa ? "ادمین پیدا نشد" : "Admin not found"}
          </div>
          <Button onClick={() => navigate("/marketplace")}>
            {isFa ? "بازگشت به بازار کار" : "Back to Marketplace"}
          </Button>
        </div>
      </div>
    )
  }

  const platformPackages = adminPackages.filter((p) => p.type === "platform")
  const bundlePackages = adminPackages.filter((p) => p.type === "bundle")

  const toggleCompare = (pkgId: string) => {
    comparison.toggle(pkgId)
  }

  const handleSubmitOffer = async (
    offerData: Omit<CustomOffer, "id" | "createdAt">,
  ) => {
    await submitOffer(offerData)
    setOfferSent(true)
    setTimeout(() => setOfferSent(false), 3000)
  }

  useEffect(() => {
    let cancelled = false
    async function loadReviews() {
      setReviewsLoading(true)
      try {
        const data = await listReviews({ adminId: adminId })
        if (!cancelled) {
          setReviews(data)
        }
      } catch {
        if (!cancelled) {
          setReviews([])
        }
      } finally {
        if (!cancelled) {
          setReviewsLoading(false)
        }
      }
    }
    if (adminId) {
      void loadReviews()
    }
    return () => {
      cancelled = true
    }
  }, [adminId])

  const handleSubmitReview = async () => {
    if (!adminId || !reviewForm.comment.trim()) return
    setSubmittingReview(true)
    try {
      const review = await createReview({
        adminId,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      })
      setReviews((prev) => [review, ...prev])
      setReviewForm({ rating: 5, comment: "" })
    } catch {
      // silently fail
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto fade-in">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#1e3a5f] font-semibold hover:underline mb-4"
        >
          <Icon name="chevronLeft" size={16} /> {tr.common.back}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 mb-6">
        <div className="flex items-start gap-4">
          <img
            src={`https://images.unsplash.com/${admin.photo}?w=120&h=120&fit=crop&auto=format`}
            alt={admin.nameEn}
            className="w-20 h-20 rounded-2xl object-cover bg-[#f2f5fa] flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-[#0f172a] mb-1">
                  {isFa ? admin.nameFa : admin.nameEn}
                </h1>
                <div className="flex items-center gap-2 mb-2">
                  <Stars rating={admin.rating} />
                  <span className="text-sm font-bold text-[#0f172a]">
                    {admin.rating}
                  </span>
                  <span className="text-xs text-[#94a3b8]">
                    ({admin.reviews} {tr.market.reviews})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {admin.platforms.map((p) => (
                    <span
                      key={p}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PLATFORM_COLORS[p] || "bg-gray-100 text-gray-700"}`}
                    >
                      {platformLabel(p, lang)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {admin.verified && (
                  <div
                    className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center"
                    title="Verified"
                  >
                    <Icon name="check" size={12} className="text-emerald-600" />
                  </div>
                )}
                {admin.insured && (
                  <div
                    className="w-6 h-6 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center"
                    title="Insured"
                  >
                    <Icon name="shield" size={12} className="text-[#1e3a5f]" />
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-[#64748b] leading-relaxed mb-3">
              {isFa ? admin.bioFa : admin.bioEn}
            </p>
            <div className="flex flex-wrap gap-2">
              {(isFa ? admin.skillsFa : admin.skillsEn).map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-full bg-[#f2f5fa] text-[#64748b] text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-white border border-[#e2e8f0] rounded-xl p-1 mb-6 w-fit shadow-sm">
        {[
          { id: "profile", label: isFa ? "پروفایل" : "Profile" },
          { id: "packages", label: isFa ? "پکیج‌ها" : "Packages" },
          { id: "reviews", label: isFa ? "نظرات" : "Reviews" },
          { id: "custom", label: isFa ? "پیشنهاد سفارشی" : "Custom Offer" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() =>
              setActiveTab(tab.id as "profile" | "packages" | "custom" | "reviews")
            }
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all btn-press ${
              activeTab === tab.id
                ? "bg-[#1e3a5f] text-white shadow-sm"
                : "text-[#64748b] hover:text-[#1e3a5f]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {comparison.selected.size > 0 && activeTab === "packages" && (
        <div className="bg-[#1e3a5f] rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="compare" size={20} className="text-white" />
            <span className="text-white text-sm font-semibold">
              {isFa
                ? `${comparison.selected.size} پکیج برای مقایسه انتخاب شده`
                : `${comparison.selected.size} packages selected for comparison`}
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={comparison.clear}>
              {tr.common.clearSelection}
            </Button>
            <Button size="sm" onClick={() => navigate("/compare")}>
              {tr.compare.title}
            </Button>
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <ProfileTab admin={admin!} lang={lang} tr={tr} />
      )}

      {activeTab === "packages" && (
        <PackagesTab
          adminPackages={adminPackages}
          platformPackages={platformPackages}
          bundlePackages={bundlePackages}
          lang={lang}
          tr={tr}
          comparison={comparison}
          toggleCompare={toggleCompare}
          navigate={navigate}
        />
      )}

      {activeTab === "reviews" && (
        <ReviewsTab
          reviews={reviews}
          loading={reviewsLoading}
          reviewForm={reviewForm}
          setReviewForm={setReviewForm}
          submitting={submittingReview}
          onSubmit={handleSubmitReview}
          lang={lang}
          tr={tr}
        />
      )}

      {activeTab === "custom" && (
        <CustomOfferForm
          admin={admin!}
          lang={lang}
          tr={tr}
          onSubmit={handleSubmitOffer}
          offerSent={offerSent}
        />
      )}
    </div>
  )
}

function ProfileTab({
  admin,
  lang,
  tr,
}: {
  admin: AdminProfile
  lang: Lang
  tr: typeof t["en"] & typeof t["fa"]
}) {
  const isFa = lang === "fa"
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 fade-in">
      <h2 className="font-bold text-[#0f172a] text-lg mb-4">
        {isFa ? "اطلاعات شخصی" : "Personal Information"}
      </h2>
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-[#64748b] mb-1">
            {isFa ? "بیوگرافی" : "Bio"}
          </label>
          <p className="text-sm text-[#0f172a] leading-relaxed">
            {isFa ? admin.bioFa : admin.bioEn}
          </p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#64748b] mb-1">
            {isFa ? "پلتفرم‌ها" : "Platforms"}
          </label>
          <div className="flex flex-wrap gap-2">
            {admin.platforms.map((p) => (
              <span
                key={p}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${PLATFORM_COLORS[p] || "bg-gray-100 text-gray-700"}`}
              >
                {platformLabel(p, lang)}
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#64748b] mb-1">
            {isFa ? "مهارت‌ها" : "Skills"}
          </label>
          <div className="flex flex-wrap gap-2">
            {(isFa ? admin.skillsFa : admin.skillsEn).map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-full bg-[#f2f5fa] text-[#64748b] text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
            <div className="text-xs text-[#64748b] mb-1">
              {isFa ? "حداقل قیمت ماهانه" : "Monthly starting price"}
            </div>
            <div className="text-lg font-bold text-[#1e3a5f]">
              {isFa
                ? `${(admin.monthlyToman / 1000000).toFixed(1)}M ${tr.common.toman}`
                : `$${admin.monthlyUSD}`}
            </div>
          </div>
          <div className="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
            <div className="text-xs text-[#64748b] mb-1">
              {isFa ? "امتیاز" : "Rating"}
            </div>
            <div className="text-lg font-bold text-[#1e3a5f]">
              {admin.rating} / 5
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {admin.verified && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <Icon name="check" size={12} /> {isFa ? "تأییدشده" : "Verified"}
            </span>
          )}
          {admin.insured && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e3a5f]/5 text-[#1e3a5f] text-xs font-semibold border border-[#1e3a5f]/10">
              <Icon name="shield" size={12} /> {isFa ? "بیمه‌شده" : "Insured"}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function PackagesTab({
  adminPackages,
  platformPackages,
  bundlePackages,
  lang,
  tr,
  comparison,
  toggleCompare,
  navigate,
}: {
  adminPackages: ContractPackage[]
  platformPackages: ContractPackage[]
  bundlePackages: ContractPackage[]
  lang: Lang
  tr: typeof t["en"] & typeof t["fa"]
  comparison: {
    selected: Set<string>
    has: (id: string) => boolean
    toggle: (id: string) => void
    clear: () => void
  }
  toggleCompare: (id: string) => void
  navigate: ReturnType<typeof useNavigate>
}) {
  const isFa = lang === "fa"

  if (adminPackages.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center fade-in">
        <div className="text-4xl mb-3">📦</div>
        <div className="font-bold text-[#0f172a] mb-1">
          {tr.adminPage.noPackages}
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in space-y-8">
      {platformPackages.length > 0 && (
        <div>
          <h2 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
            <Icon name="package" size={20} className="text-[#1e3a5f]" />
            {isFa ? "پکیج‌های تک‌پلتفرمی" : "Platform Packages"}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                lang={lang}
                tr={tr}
                inCompare={comparison.has(pkg.id)}
                onToggleCompare={() => toggleCompare(pkg.id)}
              />
            ))}
          </div>
        </div>
      )}
      {bundlePackages.length > 0 && (
        <div>
          <h2 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
            <Icon name="layers" size={20} className="text-purple-600" />
            {tr.common.bundles}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bundlePackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                lang={lang}
                tr={tr}
                inCompare={comparison.has(pkg.id)}
                onToggleCompare={() => toggleCompare(pkg.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CustomOfferForm({
  admin,
  lang,
  tr,
  onSubmit,
  offerSent,
}: {
  admin: AdminProfile
  lang: Lang
  tr: typeof t["en"] & typeof t["fa"]
  onSubmit: (offer: Omit<CustomOffer, "id" | "createdAt">) => Promise<void>
  offerSent: boolean
}) {
  const isFa = lang === "fa"
  const [employerName, setEmployerName] = useState("")
  const [employerCo, setEmployerCo] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformKey[]>([])
  const [platformConfigs, setPlatformConfigs] = useState<PlatformConfig[]>([])
  const [durationMonths, setDurationMonths] = useState("3")
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [dmControl, setDmControl] = useState(false)
  const [priceToman, setPriceToman] = useState("")
  const [priceUSD, setPriceUSD] = useState("")
  const [message, setMessage] = useState("")

  const togglePlatform = (p: PlatformKey) => {
    setSelectedPlatforms((prev) => {
      const next = prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
      setPlatformConfigs((cfg) => {
        const nextCfg = cfg.filter((c) => next.includes(c.platform))
        next.forEach((pl) => {
          if (!cfg.find((c) => c.platform === pl)) {
            nextCfg.push(emptyPlatformConfig(pl))
          }
        })
        return nextCfg
      })
      return next
    })
  }

  const updateConfig = (
    platform: PlatformKey,
    field: string,
    value: unknown,
  ) => {
    setPlatformConfigs((cfg) =>
      cfg.map((c) =>
        c.platform === platform
          ? { ...c, settings: { ...c.settings, [field]: value } }
          : c,
      ),
    )
  }

  const handleDmToggle = (checked: boolean) => {
    setDmControl(checked)
    setPlatformConfigs((cfg) =>
      cfg.map((c) => {
        const spec = PLATFORM_SPECS[c.platform]
        if (!spec) return c
        const dmFields = spec.fields
          .filter((f) => {
            if (!f.description) return false
            const desc = isFa ? f.description.fa : f.description.en
            return (
              desc.includes("DM") ||
              desc.includes("گروه") ||
              desc.includes("پیام")
            )
          })
          .map((f) => f.id)
        if (dmFields.length === 0) return c
        const newSettings = { ...c.settings }
        dmFields.forEach((id) => {
          newSettings[id] = checked
        })
        return { ...c, settings: newSettings }
      }),
    )
  }

  const handleSubmit = async () => {
    if (selectedPlatforms.length === 0 || !employerName.trim()) return
    const now = new Date().toISOString()
    await onSubmit({
      adminId: String(admin.id),
      employerId: "current-employer",
      employerName,
      name: isFa
        ? `پیشنهاد سفارشی برای ${admin.nameFa}`
        : `Custom Offer for ${admin.nameEn}`,
      description: message || "",
      platforms: selectedPlatforms,
      platformConfigs,
      proposedPriceToman: parseInt(priceToman) || undefined,
      proposedPriceUSD: parseInt(priceUSD) || undefined,
      billingCycle: billingCycle as "monthly" | "project" | "hourly",
      deliveryTime: `${durationMonths} ${isFa ? "ماه" : "months"}`,
      message,
    })
    setEmployerName("")
    setEmployerCo("")
    setSelectedPlatforms([])
    setPlatformConfigs([])
    setDurationMonths("3")
    setBillingCycle("monthly")
    setDmControl(false)
    setPriceToman("")
    setPriceUSD("")
    setMessage("")
  }

  if (offerSent) {
    return (
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Icon name="check" size={32} className="text-emerald-600" />
        </div>
        <h3 className="font-bold text-[#0f172a] text-lg mb-2">
          {tr.customOffer.offerSent}
        </h3>
        <p className="text-sm text-[#64748b] mb-4">
          {tr.customOffer.offerSentSub}
        </p>
        <Button onClick={() => setSelectedPlatforms([])}>
          {tr.customOffer.sendAnother}
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 fade-in">
      <h2 className="font-bold text-[#0f172a] text-lg mb-1">
        {tr.customOffer.title}
      </h2>
      <p className="text-sm text-[#64748b] mb-6">{tr.customOffer.sub}</p>

      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
              {tr.customOffer.yourName}
            </label>
            <Input
              value={employerName}
              onChange={setEmployerName}
              placeholder={tr.customOffer.yourNamePh}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
              {tr.customOffer.yourCompany}
            </label>
            <Input
              value={employerCo}
              onChange={setEmployerCo}
              placeholder={tr.customOffer.yourCompanyPh}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0f172a] mb-2">
            {tr.customOffer.platforms}
          </label>
          <p className="text-xs text-[#64748b] mb-2">
            {tr.customOffer.platformNote}
          </p>
          <div className="flex flex-wrap gap-2">
            {admin.platforms.map((p) => (
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
                {platformLabel(p, lang)}
              </button>
            ))}
          </div>
          {selectedPlatforms.length === 0 && (
            <p className="text-xs text-red-500 mt-1">
              {tr.customOffer.platformRequired}
            </p>
          )}
        </div>

        {selectedPlatforms.length > 0 && (
          <div className="space-y-4">
            {platformConfigs.map((config) => {
              const spec = PLATFORM_SPECS[config.platform]
              if (!spec) return null
              return (
                <div
                  key={config.platform}
                  className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={`w-6 h-6 rounded-md ${spec.colorClass} flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {spec.label[lang].charAt(0)}
                    </div>
                    <span className="font-bold text-sm text-[#0f172a]">
                      {spec.label[lang]}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {spec.fields.map((field) => (
                      <div key={field.id}>
                        {field.type === "boolean" ? (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!config.settings[field.id] as boolean}
                              onChange={(e) =>
                                updateConfig(
                                  config.platform,
                                  field.id,
                                  e.target.checked,
                                )
                              }
                              className="w-4 h-4 rounded border-[#e2e8f0] text-[#1e3a5f] focus:ring-[#1e3a5f]"
                            />
                            <span className="text-sm text-[#0f172a]">
                              {isFa ? field.label.fa : field.label.en}
                            </span>
                          </label>
                        ) : (
                          <div>
                            <label className="block text-xs font-semibold text-[#64748b] mb-1">
                              {isFa ? field.label.fa : field.label.en}
                            </label>
                            <input
                              type="number"
                              value={String(config.settings[field.id] ?? "")}
                              onChange={(e) =>
                                updateConfig(
                                  config.platform,
                                  field.id,
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] bg-white text-sm text-[#0f172a] focus:border-[#1e3a5f] transition-all"
                              dir="ltr"
                              min={field.min}
                              max={field.max}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
              {tr.customOffer.contractDuration}
            </label>
            <Select
              value={durationMonths}
              onChange={setDurationMonths}
              options={DURATION_OPTIONS.map((d) => ({
                value: d.value,
                label: isFa ? d.labelFa : d.labelEn,
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
              {tr.customOffer.billingCycle}
            </label>
            <Select
              value={billingCycle}
              onChange={setBillingCycle}
              options={BILLING_CYCLES.map((bc) => ({
                value: bc.value,
                label: isFa ? bc.labelFa : bc.labelEn,
              }))}
            />
          </div>
        </div>

        <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-semibold text-[#0f172a]">
                {tr.customOffer.dmControl}
              </label>
              <p className="text-xs text-[#64748b]">
                {tr.customOffer.dmControlNote}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDmToggle(!dmControl)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                dmControl ? "bg-[#1e3a5f]" : "bg-[#e2e8f0]"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  dmControl ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
              {tr.customOffer.priceToman}
            </label>
            <Input
              value={priceToman}
              onChange={setPriceToman}
              placeholder={tr.customOffer.priceTomanPh}
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
              {tr.customOffer.priceUSD}
            </label>
            <Input
              value={priceUSD}
              onChange={setPriceUSD}
              placeholder={tr.customOffer.priceUSDPh}
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
            {tr.customOffer.message}
          </label>
          <Textarea
            value={message}
            onChange={setMessage}
            placeholder={tr.customOffer.messagePh}
            rows={4}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={selectedPlatforms.length === 0 || !employerName.trim()}
          >
            {tr.customOffer.sendOffer}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ReviewsTab({
  reviews,
  loading,
  reviewForm,
  setReviewForm,
  submitting,
  onSubmit,
  lang,
  tr,
}: {
  reviews: ReviewRow[]
  loading: boolean
  reviewForm: { rating: number; comment: string }
  setReviewForm: (form: { rating: number; comment: string }) => void
  submitting: boolean
  onSubmit: () => Promise<void>
  lang: Lang
  tr: typeof t["en"] & typeof t["fa"]
}) {
  const isFa = lang === "fa"

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center text-[#64748b]">
        {tr.common.loading}
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
        <h3 className="font-bold text-[#0f172a] text-lg mb-4">
          {isFa ? "ثبت نظر" : "Write a Review"}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-2">
              {isFa ? "امتیاز" : "Rating"}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  className={`text-2xl transition-colors ${
                    star <= reviewForm.rating
                      ? "text-amber-400"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
              {isFa ? "نظر شما" : "Your Review"}
            </label>
            <textarea
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, comment: e.target.value })
              }
              placeholder={isFa ? "تجربه خود را با دیگران به اشتراک بگذارید..." : "Share your experience..."}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all resize-none"
            />
          </div>
          <Button
            onClick={onSubmit}
            disabled={submitting || !reviewForm.comment.trim()}
          >
            {submitting ? tr.common.loading : isFa ? "ثبت نظر" : "Submit Review"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-[#0f172a] text-lg">
          {isFa ? `نظرات (${reviews.length})` : `Reviews (${reviews.length})`}
        </h3>
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center text-[#64748b]">
            {isFa ? "هنوز نظری ثبت نشده" : "No reviews yet"}
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl border border-[#e2e8f0] p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Stars rating={review.rating} />
                <span className="text-sm font-bold text-[#0f172a]">
                  {review.rating}/5
                </span>
                <span className="text-xs text-[#94a3b8]">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-[#64748b] leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function PackageCard({
  pkg,
  lang,
  tr,
  inCompare,
  onToggleCompare,
}: {
  pkg: ContractPackage
  lang: Lang
  tr: typeof t["en"] & typeof t["fa"]
  inCompare: boolean
  onToggleCompare: () => void
}) {
  const isFa = lang === "fa"
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`bg-white rounded-2xl border-2 p-5 transition-all ${
        inCompare ? "border-[#1e3a5f] bg-[#1e3a5f]/5" : "border-[#e2e8f0]"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm text-[#0f172a]">{pkg.name}</span>
            {pkg.featured && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                {isFa ? "ویژه" : "Featured"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                pkg.type === "bundle"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-sky-100 text-sky-700"
              }`}
            >
              {pkg.type === "bundle"
                ? isFa
                  ? "باندل"
                  : "Bundle"
                : isFa
                  ? "تک‌پلتفرم"
                  : "Platform"}
            </span>
            {pkg.platforms.map((pl) => (
              <span
                key={pl}
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PLATFORM_COLORS[pl] || "bg-gray-100 text-gray-700"}`}
              >
                {platformLabel(pl, lang)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-[#64748b] mb-3">{pkg.description}</p>

      <div className="flex items-center justify-between pt-3 border-t border-[#f2f5fa] mb-3">
        <div>
          <div className="text-base font-bold text-[#1e3a5f]">
            {isFa
              ? `${(pkg.priceToman / 1000000).toFixed(1)}M ${tr.common.toman}`
              : `$${pkg.priceUSD}`}
            <span className="text-xs font-normal text-[#94a3b8] ml-1">
              {tr.common.perMonth}
            </span>
          </div>
          <div className="text-xs text-[#64748b] mt-0.5">
            {tr.common.deliveryTime}: {pkg.deliveryTime}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {pkg.platformConfigs.map((config) => {
          const spec = PLATFORM_SPECS[config.platform]
          if (!spec) return null
          return (
            <div
              key={config.platform}
              className="bg-[#f8fafc] rounded-lg p-2.5"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div
                  className={`w-4 h-4 rounded ${spec.colorClass} flex items-center justify-center text-white text-[10px] font-bold`}
                >
                  {spec.label[lang].charAt(0)}
                </div>
                <span className="text-xs font-bold text-[#0f172a]">
                  {spec.label[lang]}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {spec.fields.slice(0, expanded ? undefined : 4).map((field) => {
                  const val = config.settings[field.id]
                  if (field.type === "boolean") {
                    return (
                      <span
                        key={field.id}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          val
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {val ? (
                          <Icon name="check" size={10} />
                        ) : (
                          <Icon name="x" size={10} />
                        )}
                        {isFa ? field.label.fa : field.label.en}
                      </span>
                    )
                  }
                  return (
                    <span
                      key={field.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e2e8f0] text-[#0f172a] text-[10px] font-semibold"
                    >
                      {isFa ? field.label.fa : field.label.en}:{" "}
                      {String(val ?? "-")}
                    </span>
                  )
                })}
              </div>
              {spec.fields.length > 4 && !expanded && (
                <button
                  onClick={() => setExpanded(true)}
                  className="text-[10px] text-[#1e3a5f] font-semibold mt-1 hover:underline"
                >
                  {isFa
                    ? `+${spec.fields.length - 4} بیشتر`
                    : `+${spec.fields.length - 4} more`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={onToggleCompare}
          className={inCompare ? "border-[#1e3a5f] text-[#1e3a5f]" : ""}
        >
          <Icon name={inCompare ? "check" : "compare"} size={14} />
          {inCompare ? (isFa ? "در مقایسه" : "Comparing") : tr.common.compare}
        </Button>
      </div>
    </div>
  )
}
