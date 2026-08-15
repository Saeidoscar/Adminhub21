import Link from "next/link"
import {
  TbArrowLeft,
  TbCertificate,
  TbFileCheck,
  TbFingerprint,
  TbSearch,
  TbShieldCheck,
} from "react-icons/tb"

const trustItems = [
  { icon: TbFingerprint, label: "احراز هویت طرفین" },
  { icon: TbShieldCheck, label: "نگهداری امن سوابق" },
  { icon: TbCertificate, label: "نسخه نهایی قابل استعلام" },
]

const ContractsHero = () => (
  <section className="relative overflow-hidden border-b border-gray-200 bg-white px-4 pb-16 pt-28 dark:border-gray-800 dark:bg-gray-950 md:pb-20 md:pt-32">
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[linear-gradient(to_left,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:48px_48px] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_78%)] dark:opacity-[0.08]"
    />

    <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
      <div>
        <div className="mb-6 inline-flex items-center gap-2 border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary">
          <TbFileCheck size={18} />
          زیرساخت تنظیم و امضای الکترونیکی قرارداد
        </div>

        <h1 className="mb-6 max-w-3xl text-4xl font-bold leading-[1.35] text-gray-950 text-balance dark:text-white md:text-5xl lg:text-[3.5rem]">
          قراردادی روشن،
          <br />
          <span className="text-primary">امضایی قابل استناد</span>
        </h1>

        <p className="mb-8 max-w-2xl text-base leading-8 text-gray-600 text-pretty dark:text-gray-300 md:text-lg">
          قرارداد خود را با متن حقوقی معتبر تنظیم کنید، مشخصات طرفین را ثبت
          نمایید و پس از احراز هویت، نسخه نهایی را به‌صورت امن امضا و نگهداری
          کنید.
        </p>

        <div className="mb-9 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/start"
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-7 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            تنظیم قرارداد
            <TbArrowLeft size={19} />
          </Link>
          <Link
            href="/start"
            className="inline-flex min-h-12 items-center justify-center gap-2 border border-gray-300 bg-white px-7 py-3 font-semibold text-gray-800 transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          >
            <TbSearch size={19} />
            استعلام قرارداد
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-gray-200 pt-6 dark:border-gray-800">
          <strong className="text-sm text-gray-900 dark:text-white">
            مورد اعتماد بیش از ۵۰۰ کسب‌وکار
          </strong>
          {trustItems.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
            >
              <Icon size={18} className="text-primary" />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative hidden lg:block">
        <div
          aria-hidden="true"
          className="absolute -inset-5 border border-primary/10 bg-primary/[0.025]"
        />
        <div className="relative border border-gray-200 bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.10)] dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-7 flex items-start justify-between border-b border-gray-200 pb-5 dark:border-gray-700">
            <div>
              <p className="mb-1 text-xs font-semibold text-primary">
                پرونده قرارداد
              </p>
              <p className="text-lg font-bold text-gray-950 dark:text-white">
                سند آماده امضای طرفین
              </p>
            </div>
            <TbShieldCheck
              size={34}
              className="text-primary"
              aria-hidden="true"
            />
          </div>

          <div className="space-y-5">
            {[
              ["هویت طرفین", "تأیید شده"],
              ["متن و پیوست‌ها", "ثبت نهایی"],
              ["وضعیت امضا", "آماده ارسال"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-gray-800"
              >
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {label}
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  <span className="h-2 w-2 bg-primary" />
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-7 bg-gray-50 p-4 text-sm leading-7 text-gray-600 dark:bg-gray-800/70 dark:text-gray-300">
            تمامی رویدادهای قرارداد، از ثبت متن تا امضای نهایی، در سوابق پرونده
            نگهداری می‌شوند.
          </div>
        </div>
      </div>
    </div>
  </section>
)

export default ContractsHero
