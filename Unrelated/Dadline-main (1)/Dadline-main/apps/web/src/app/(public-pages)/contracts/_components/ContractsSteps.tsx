import { TbFileText, TbFingerprint, TbUsers } from "react-icons/tb"

const steps = [
  {
    number: "۰۱",
    icon: TbFileText,
    title: "تنظیم متن قرارداد",
    desc: "متن قرارداد را وارد کنید یا از میان قراردادهای حقوقی آماده، سند متناسب با نیاز خود را انتخاب نمایید.",
  },
  {
    number: "۰۲",
    icon: TbUsers,
    title: "ثبت مشخصات طرفین",
    desc: "اطلاعات اشخاص حقیقی یا حقوقی را ثبت کنید تا دعوت‌نامه بررسی و پذیرش قرارداد برای آنان ارسال شود.",
  },
  {
    number: "۰۳",
    icon: TbFingerprint,
    title: "احراز هویت و امضا",
    desc: "پس از تأیید هویت طرفین، امضاها ثبت و نسخه نهایی قرارداد برای همه امضاکنندگان قابل دسترسی می‌شود.",
  },
]

const ContractsSteps = () => (
  <section className="border-b border-gray-200 bg-gray-50 px-4 py-16 dark:border-gray-800 dark:bg-gray-900/50 md:py-20">
    <div className="mx-auto max-w-6xl">
      <div className="mb-10 grid gap-4 md:grid-cols-[0.7fr_1.3fr] md:items-end">
        <div>
          <p className="mb-3 text-sm font-semibold text-primary">
            فرایند انعقاد قرارداد
          </p>
          <h2 className="text-3xl font-bold leading-tight text-gray-950 text-balance dark:text-white md:text-4xl">
            از تنظیم متن تا نسخه نهایی
          </h2>
        </div>
        <p className="max-w-2xl text-base leading-8 text-gray-600 dark:text-gray-300 md:justify-self-end">
          هر مرحله وضعیت مشخصی دارد و سوابق اقدامات طرفین در پرونده قرارداد ثبت
          می‌شود؛ بدون رفت‌وآمد و با دسترسی همیشگی به نسخه نهایی.
        </p>
      </div>

      <ol className="grid border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 md:grid-cols-3">
        {steps.map(({ number, icon: Icon, title, desc }, index) => (
          <li
            key={number}
            className={`relative p-6 md:p-8 ${
              index < steps.length - 1
                ? "border-b border-gray-200 dark:border-gray-700 md:border-b-0 md:border-l"
                : ""
            }`}
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="font-mono text-sm font-bold tracking-wider text-primary">
                {number}
              </span>
              <Icon
                size={26}
                className="text-gray-400 dark:text-gray-500"
                aria-hidden="true"
              />
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-950 dark:text-white">
              {title}
            </h3>
            <p className="text-base leading-8 text-gray-600 dark:text-gray-400">
              {desc}
            </p>
          </li>
        ))}
      </ol>
    </div>
  </section>
)

export default ContractsSteps
