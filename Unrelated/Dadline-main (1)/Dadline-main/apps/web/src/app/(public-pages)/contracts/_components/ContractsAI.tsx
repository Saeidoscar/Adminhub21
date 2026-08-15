import Link from "next/link"
import {
  TbAlertTriangle,
  TbArrowLeft,
  TbCheck,
  TbFileAnalytics,
  TbScale,
} from "react-icons/tb"

const aiFeatures = [
  "شناسایی ابهامات و تعهدات پرریسک",
  "تشخیص بندهای غیراستاندارد یا متعارض",
  "پیشنهاد اصلاح متناسب با موضوع قرارداد",
  "بررسی ارتباط مفاد با قوانین مرتبط",
]

const analysisRows = [
  {
    icon: TbAlertTriangle,
    label: "ابهام در شرایط فسخ",
    status: "نیازمند بازبینی",
    tone: "text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300",
  },
  {
    icon: TbScale,
    label: "تعهدات طرفین",
    status: "۲ پیشنهاد اصلاحی",
    tone: "text-primary bg-primary/5",
  },
  {
    icon: TbCheck,
    label: "مشخصات و موضوع قرارداد",
    status: "تأیید اولیه",
    tone: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
]

const ContractsAI = () => (
  <section className="border-b border-gray-200 bg-white px-4 py-16 dark:border-gray-800 dark:bg-gray-950 md:py-20">
    <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
      <div>
        <div className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <TbFileAnalytics size={20} />
          تحلیل هوشمند دادبات
        </div>

        <h2 className="mb-5 text-3xl font-bold leading-tight text-gray-950 text-balance dark:text-white md:text-4xl">
          کنترل ریسک قراردادی،
          <br />
          پیش از امضای نهایی
        </h2>

        <p className="mb-7 max-w-xl text-base leading-8 text-gray-600 dark:text-gray-300">
          دادبات متن قرارداد را از نظر ابهام، تعارض و تعهدات ناخواسته بررسی
          می‌کند تا موارد قابل‌توجه پیش از امضا روشن شوند. تصمیم نهایی همچنان با
          شما و مشاور حقوقی شماست.
        </p>

        <ul className="mb-8 grid gap-3 sm:grid-cols-2">
          {aiFeatures.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-base leading-7 text-gray-700 dark:text-gray-300"
            >
              <TbCheck
                size={19}
                className="mt-1 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Link
          href="/ai"
          className="inline-flex min-h-12 items-center justify-center gap-2 border border-primary px-6 py-3 font-semibold text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          بررسی قرارداد با دادبات
          <TbArrowLeft size={19} />
        </Link>
      </div>

      <div className="border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900 md:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-5 dark:border-gray-700">
          <div>
            <p className="mb-1 text-sm font-bold text-gray-950 dark:text-white">
              گزارش بررسی قرارداد
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              خلاصه موارد نیازمند توجه
            </p>
          </div>
          <div className="border border-primary/20 bg-white p-2.5 text-primary dark:bg-gray-950">
            <TbFileAnalytics size={24} aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-3">
          {analysisRows.map(({ icon: Icon, label, status, tone }) => (
            <div
              key={label}
              className="grid gap-3 border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-950 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={20}
                  className="shrink-0 text-gray-500"
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {label}
                </span>
              </div>
              <span
                className={`w-fit px-2.5 py-1 text-xs font-semibold ${tone}`}
              >
                {status}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-5 text-sm leading-7 text-gray-500 dark:text-gray-400">
          این گزارش برای شناسایی اولیه ریسک‌هاست و جایگزین نظر تخصصی وکیل در
          قراردادهای پیچیده نیست.
        </p>
      </div>
    </div>
  </section>
)

export default ContractsAI
