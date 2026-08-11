import { useState } from "react"
import { t, type Lang } from "../i18n"
import { Icon } from "../components/layout/Icon"
import { Stars } from "../components/platform/Stars"

type Specialty = "video" | "photo" | "motion" | "thumbnail"

interface Editor {
  nameEn: string
  nameFa: string
  photo: string
  specialty: Specialty
  rating: number
  reviews: number
  projects: number
  delivery: string
  rateToman: number
  rateUSD: number
  bioEn: string
  bioFa: string
}

const EDITORS: Editor[] = [
  {
    nameEn: "Pouya Rahimi",
    nameFa: "پویا رحیمی",
    photo: "photo-1507003211169-0a1dd7228f2d",
    specialty: "video",
    rating: 4.9,
    reviews: 87,
    projects: 142,
    delivery: "48h",
    rateToman: 800000,
    rateUSD: 19,
    bioEn:
      "Reels and vertical video specialist. 5M+ views generated for brand accounts last year.",
    bioFa:
      "متخصص ریلز و ویدئو عمودی. سال گذشته بیش از ۵ میلیون بازدید برای برندها تولید کرده است.",
  },
  {
    nameEn: "Elham Sadat",
    nameFa: "الهام سادات",
    photo: "photo-1494790108377-be9c29b29330",
    specialty: "thumbnail",
    rating: 4.8,
    reviews: 64,
    projects: 231,
    delivery: "24h",
    rateToman: 400000,
    rateUSD: 10,
    bioEn:
      "Click-through optimized thumbnails for YouTube, Telegram channels, and product listings.",
    bioFa:
      "تامبنیل بهینه‌شده برای نرخ کلیک در یوتیوب، کانال‌های تلگرام و لیست محصولات.",
  },
  {
    nameEn: "Kaveh Mousavi",
    nameFa: "کاوه موسوی",
    photo: "photo-1500648767791-00dcc994a43e",
    specialty: "motion",
    rating: 4.7,
    reviews: 41,
    projects: 96,
    delivery: "72h",
    rateToman: 1200000,
    rateUSD: 29,
    bioEn:
      "Motion graphics and animated ad creatives that make products impossible to scroll past.",
    bioFa:
      "موشن گرافیک و کریتیوهای انیمیشنی که باعث می‌شود مخاطب از کنار محصول نگذرد.",
  },
  {
    nameEn: "Shirin Abbasi",
    nameFa: "شیرین عباسی",
    photo: "photo-1438761681033-6461ffad8d80",
    specialty: "photo",
    rating: 4.9,
    reviews: 53,
    projects: 178,
    delivery: "36h",
    rateToman: 600000,
    rateUSD: 14,
    bioEn:
      "Product photography retouching and lifestyle photo editing for e-commerce brands.",
    bioFa:
      "ویرایش عکس محصول و عکاسی لایف‌استایل برای برندهای فروشگاه آنلاین.",
  },
  {
    nameEn: "Amir Tavakoli",
    nameFa: "امیر توکلی",
    photo: "photo-1472099645785-5658abf4ff4e",
    specialty: "video",
    rating: 4.6,
    reviews: 78,
    projects: 154,
    delivery: "48h",
    rateToman: 900000,
    rateUSD: 22,
    bioEn:
      "Long-form and documentary style editing with native Persian subtitling and captions.",
    bioFa:
      "ادیت ویدئوی بلند و مستندگونه با زیرنویس فارسی حرفه‌ای.",
  },
  {
    nameEn: "Laleh Ahmadi",
    nameFa: "لاله احمدی",
    photo: "photo-1534528741775-53994a69daeb",
    specialty: "motion",
    rating: 5.0,
    reviews: 37,
    projects: 88,
    delivery: "60h",
    rateToman: 1100000,
    rateUSD: 26,
    bioEn:
      "Kinetic typography and animated logos for social media intros and ad creatives.",
    bioFa:
      "تایپوگرافی متحرک و لوگوی انیمیشنی برای اینترو شبکه‌های اجتماعی و کریتیوهای تبلیغاتی.",
  },
]

const SPECIALTY_LABELS: Record<Specialty, { en: string; fa: string }> = {
  video: { en: "Video Editing", fa: "ادیت ویدئو" },
  photo: { en: "Photo Editing", fa: "ادیت عکس" },
  motion: { en: "Motion Graphics", fa: "موشن گرافیک" },
  thumbnail: { en: "Thumbnails", fa: "تامبنیل" },
}

export default function EditorsPage({
  tr,
  lang,
}: {
  tr: typeof t["en"]
  lang: Lang
}) {
  const [search, setSearch] = useState("")
  const [specialty, setSpecialty] = useState<Specialty | "all">("all")

  const isFa = lang === "fa"

  const filtered = EDITORS.filter((editor) => {
    const name = isFa ? editor.nameFa : editor.nameEn
    const query = search.toLowerCase()
    const matchSearch =
      !query ||
      name.toLowerCase().includes(query) ||
      (isFa ? editor.bioFa : editor.bioEn).toLowerCase().includes(query)
    const matchSpecialty =
      specialty === "all" || editor.specialty === specialty
    return matchSearch && matchSpecialty
  })

  const specialtyKey = (key: Specialty) =>
    isFa ? SPECIALTY_LABELS[key].fa : SPECIALTY_LABELS[key].en

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {tr.editors.title}
        </h1>
        <p className="text-[#64748b] mt-1">{tr.editors.sub}</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="flex-1 min-w-48 relative">
          <div className="absolute start-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
            <Icon name="search" size={16} />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tr.editors.search}
            className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1e3a5f] transition-all"
          />
        </div>
        <select
          value={specialty}
          onChange={(e) =>
            setSpecialty(e.target.value as Specialty | "all")
          }
          className="px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] focus:border-[#1e3a5f] transition-all"
        >
          <option value="all">{tr.editors.allSpecialties}</option>
          {(Object.keys(SPECIALTY_LABELS) as Specialty[]).map((s) => (
            <option key={s} value={s}>
              {specialtyKey(s)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((editor) => (
          <div
            key={editor.nameEn}
            className="bg-white rounded-2xl border border-[#e2e8f0] p-5 card-hover"
          >
            <div className="flex items-start gap-3 mb-4">
              <img
                src={`https://images.unsplash.com/${editor.photo}?w=64&h=64&fit=crop&auto=format`}
                alt={editor.nameEn}
                className="w-14 h-14 rounded-2xl object-cover bg-[#f2f5fa] flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-sm text-[#0f172a] block truncate">
                  {isFa ? editor.nameFa : editor.nameEn}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Stars rating={editor.rating} />
                  <span className="text-xs font-bold text-[#0f172a]">
                    {editor.rating}
                  </span>
                  <span className="text-xs text-[#94a3b8]">
                    ({editor.reviews})
                  </span>
                </div>
                <span className="inline-flex mt-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold">
                  {specialtyKey(editor.specialty)}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#64748b] leading-relaxed mb-4 line-clamp-2">
              {isFa ? editor.bioFa : editor.bioEn}
            </p>

            <div className="flex items-center gap-4 text-xs text-[#64748b] mb-4">
              <span className="flex items-center gap-1">
                <Icon name="check" size={12} className="text-emerald-600" />
                {editor.projects} {tr.editors.projects}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="calendar" size={12} />
                {tr.editors.delivery}: {editor.delivery}
              </span>
            </div>

            <div className="border-t border-[#f2f5fa] pt-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-[#64748b]">
                  {tr.editors.starting}
                </div>
                <div className="text-base font-bold text-[#1e3a5f]">
                  {isFa
                    ? `${(editor.rateToman / 1000000).toFixed(1)}M ${tr.common.toman}`
                    : `$${editor.rateUSD}`}
                  <span className="text-xs font-normal text-[#94a3b8]">
                    /{isFa ? "پروژه" : "project"}
                  </span>
                </div>
              </div>
              <button className="px-4 py-2 rounded-xl bg-[#1e3a5f] text-white text-xs font-bold hover:bg-[#122435] transition-colors btn-press">
                {tr.editors.hire}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[#64748b]">
          <div className="text-4xl mb-3">🎬</div>
          <div className="font-semibold">
            {isFa ? "نتیجه‌ای یافت نشد" : "No results found"}
          </div>
          <div className="text-sm mt-1">
            {isFa
              ? "فیلترها را تغییر دهید"
              : "Try adjusting your filters"}
          </div>
        </div>
      )}
    </div>
  )
}
