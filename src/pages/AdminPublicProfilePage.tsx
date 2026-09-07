import { useState, useEffect } from "react"
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
import { TOMAN_PER_MILLION } from "../lib/constants"
import type {
  ContractPackage,
  PlatformKey,
  PlatformConfig,
  CustomOffer,
  AdminProfile,
} from "@adminhub/shared"
import { ProfileTab } from "./admin-public-profile/ProfileTab"
import { PackagesTab } from "./admin-public-profile/PackagesTab"
import { CustomOfferForm } from "./admin-public-profile/CustomOfferForm"
import { ReviewsTab } from "./admin-public-profile/ReviewsTab"
import { PackageCard } from "./admin-public-profile/PackageCard"

export const PLATFORM_COLORS: Record<string, string> = {
  instagram: "badge-instagram",
  telegram: "badge-telegram",
  whatsapp: "badge-whatsapp",
  torob: "badge-torob",
  digikala: "badge-digikala",
  linkedin: "badge-linkedin",
}

export const BILLING_CYCLES: {
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

export const DURATION_OPTIONS: {
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
