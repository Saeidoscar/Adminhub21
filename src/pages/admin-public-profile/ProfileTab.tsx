import { type AdminProfile, type Lang } from "@adminhub/shared"
import { t } from "../../i18n"
import { Icon } from "../../components/layout/Icon"
import { TOMAN_PER_MILLION } from "../../lib/constants"
import {
  platformLabel,
} from "../../components/packages/platformSpecs"
import { PLATFORM_COLORS } from "../AdminPublicProfilePage"

export function ProfileTab({
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
                 ? `${(admin.monthlyToman / TOMAN_PER_MILLION).toFixed(1)}M ${tr.common.toman}`
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
