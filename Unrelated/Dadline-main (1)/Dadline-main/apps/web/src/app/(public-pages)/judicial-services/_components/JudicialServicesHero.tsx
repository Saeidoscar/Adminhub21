import Link from "next/link"
import {
  TbArrowLeft,
  TbCheck,
  TbChevronLeft,
  TbFileCheck,
  TbLock,
  TbScale,
  TbShieldCheckered,
} from "react-icons/tb"

const heroSteps = [
  { label: "انتخاب خدمت و تکمیل اطلاعات", status: "انجام آنلاین" },
  { label: "بررسی مدارک و رفع نقص", status: "با همراهی کارشناس" },
  { label: "ثبت رسمی و دریافت کد پیگیری", status: "قابل پیگیری" },
]

const JudicialServicesHero = () => (
  <section className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32 lg:px-8">
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-x-0 top-0 h-[34rem] bg-linear-to-b from-primary/10 via-primary/5 to-transparent dark:from-primary/15 dark:via-primary/5" />
      <div className="absolute -right-40 top-20 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -left-32 top-44 size-80 rounded-full bg-blue-400/10 blur-3xl" />
    </div>

    <div className="mx-auto max-w-7xl">
      <nav
        aria-label="مسیر راهنما"
        className="mb-8 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
      >
        <Link href="/" className="transition-colors hover:text-primary">
          دادلاین
        </Link>
        <TbChevronLeft aria-hidden size={15} />
        <span className="font-medium text-gray-800 dark:text-gray-200">
          خدمات قضایی
        </span>
      </nav>

      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)] lg:gap-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur dark:bg-gray-900/80">
            <TbShieldCheckered aria-hidden size={18} />
            خدمات الکترونیک قضایی
          </div>

          <h1 className="mt-6 max-w-4xl text-3xl font-black leading-[1.7] text-gray-950 dark:text-white sm:text-4xl sm:leading-[1.65] lg:text-5xl lg:leading-[1.55]">
            خدمات قضایی آنلاین و رسمی
            <span className="block text-primary">تحت نظر قوه قضاییه</span>
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-8 text-gray-600 dark:text-gray-300 sm:text-base sm:leading-9">
            ثبت دادخواست، لایحه، شکواییه و اظهارنامه را بدون صف و رفت‌وآمد
            غیرضروری آغاز کنید. دادلاین از تکمیل اطلاعات و مدارک تا بررسی، ثبت
            رسمی و پیگیری درخواست، مسیری روشن، امن و قابل پیگیری در اختیار شما
            قرار می‌دهد.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#services"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90"
            >
              مشاهده خدمات قابل ثبت
              <TbArrowLeft aria-hidden size={19} />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-800 transition hover:border-primary/40 hover:text-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              مراحل ثبت درخواست
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-gray-600 dark:text-gray-300 sm:text-sm">
            <span className="inline-flex items-center gap-2">
              <TbCheck aria-hidden className="text-emerald-600" size={18} />
              ثبت اولیه کاملاً آنلاین
            </span>
            <span className="inline-flex items-center gap-2">
              <TbLock aria-hidden className="text-emerald-600" size={18} />
              محرمانگی اطلاعات و مدارک
            </span>
            <span className="inline-flex items-center gap-2">
              <TbScale aria-hidden className="text-emerald-600" size={18} />
              فرایند رسمی و قانونی
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-primary/10 blur-2xl" />
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/10 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/20">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
                  <TbFileCheck aria-hidden size={22} />
                </div>
                <div>
                  <strong className="block text-sm text-gray-950 dark:text-white">
                    مسیر ثبت رسمی درخواست
                  </strong>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    از شروع تا دریافت نتیجه
                  </span>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                قابل پیگیری
              </span>
            </div>

            <div className="space-y-3 p-5 sm:p-6">
              {heroSteps.map((step, index) => (
                <div
                  key={step.label}
                  className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4 dark:border-gray-800"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-black text-primary">
                    {new Intl.NumberFormat("fa-IR").format(index + 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="block text-sm leading-6 text-gray-900 dark:text-white">
                      {step.label}
                    </strong>
                    <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                      {step.status}
                    </span>
                  </div>
                  <TbCheck
                    aria-hidden
                    className="shrink-0 text-emerald-600"
                    size={20}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 border-t border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-gray-800/40">
              {[
                ["۲۴/۷", "ثبت درخواست"],
                ["۴", "خدمت فعال"],
                ["۱۰۰٪", "پیگیری آنلاین"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="border-e border-gray-100 px-2 py-4 text-center last:border-e-0 dark:border-gray-800"
                >
                  <strong className="block text-lg font-black text-primary">
                    {value}
                  </strong>
                  <span className="mt-1 block text-[11px] text-gray-500 dark:text-gray-400">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)

export default JudicialServicesHero
