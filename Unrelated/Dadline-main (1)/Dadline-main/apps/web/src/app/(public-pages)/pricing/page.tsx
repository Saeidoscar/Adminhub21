import { getPricing } from "@/server/actions/pricing/getPricing"
import type { Metadata } from "next"
import { TbCheck, TbInfoCircle, TbReceipt } from "react-icons/tb"

export const metadata: Metadata = {
  title: "تعرفه خدمات حقوقی | دادلاین",
  description:
    "مشاهده تعرفه به‌روز خدمات دادلاین شامل مشاوره حقوقی، تنظیم مستندات، بررسی پرونده، قرارداد و خدمات هوش مصنوعی حقوقی.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "تعرفه خدمات حقوقی دادلاین",
    description:
      "قیمت به‌روز خدمات مشاوره، تنظیم مستندات و سرویس‌های حقوقی دادلاین.",
    url: "/pricing",
    type: "website",
  },
}

export default async function PricingPage() {
  const { pricing, error } = await getPricing()
  const services =
    pricing?.groups.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        groupTitle: group.title,
      })),
    ) ?? []

  return (
    <main className="min-h-screen py-12">
      <section className="relative overflow-hidde">
        <div className="relative mx-auto max-w-6xl px-4 pt-10 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <TbReceipt size={18} />
            شفاف، به‌روز و بدون هزینه پنهان
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-relaxed text-gray-900 dark:text-white sm:text-4xl sm:leading-relaxed">
            تعرفه خدمات حقوقی دادلاین
          </h1>
          <p className="mx-auto mt-2 max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-300 sm:text-base">
            هزینه هر خدمت را پیش از ثبت درخواست مشاهده و متناسب با نیاز حقوقی
            خود بهترین گزینه را انتخاب کنید.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {!pricing || services.length === 0 ? (
          <div
            className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
            role="alert"
          >
            <TbInfoCircle className="mx-auto mb-3" size={28} />
            <h2 className="font-bold">تعرفه‌ها در دسترس نیستند</h2>
            <p className="mt-2 text-sm leading-7">
              {error ?? "در حال حاضر تعرفه فعالی برای نمایش ثبت نشده است."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-start text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-800/70 dark:text-gray-400">
                  <tr>
                    <th className="px-5 py-4 text-start font-medium">
                      دسته‌بندی
                    </th>
                    <th className="px-5 py-4 text-start font-medium">خدمت</th>
                    <th className="px-5 py-4 text-start font-medium">تعرفه</th>
                    <th className="px-5 py-4 text-start font-medium">واحد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {services.map((service) => (
                    <tr
                      key={service.key}
                      className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                    >
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          {service.groupTitle}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <strong className="block font-semibold text-gray-900 dark:text-white">
                          {service.title}
                        </strong>
                        <span className="mt-1 block max-w-xl text-xs leading-6 text-gray-500 dark:text-gray-400">
                          {service.description}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <strong className="text-base text-primary">
                          {service.price === 0
                            ? "رایگان"
                            : formatNumber(service.price)}
                        </strong>
                        {service.price > 0 && (
                          <span className="ms-1 text-xs text-gray-500">
                            {pricing.currencyLabel}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-500 dark:text-gray-400">
                        {service.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-px bg-gray-100 sm:hidden dark:bg-gray-800">
              {services.map((service) => (
                <article
                  key={service.key}
                  className="bg-white p-4 dark:bg-gray-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-medium text-primary">
                        {service.groupTitle}
                      </span>
                      <h2 className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {service.title}
                      </h2>
                    </div>
                    <div className="shrink-0 text-end">
                      <strong className="block text-base text-primary">
                        {service.price === 0
                          ? "رایگان"
                          : formatNumber(service.price)}
                      </strong>
                      <span className="text-[11px] text-gray-400">
                        {service.price > 0
                          ? pricing.currencyLabel
                          : service.unit}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-gray-200 bg-white p-4 text-xs leading-6 text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          <TbInfoCircle className="mt-0.5 shrink-0 text-primary" size={17} />
          مبلغ نهایی پیش از پرداخت نمایش داده می‌شود. هزینه‌های قانونی مستقل مانند
          دادرسی، کارشناسی یا تمبر، در صورت نیاز جداگانه محاسبه خواهند شد.
        </div>
      </div>
    </main>
  )
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value)
}
