import Link from "next/link"
import type { ComponentType } from "react"
import {
  TbArrowLeft,
  TbBriefcase,
  TbCheckbox,
  TbFileText,
  TbPhone,
} from "react-icons/tb"
import type { ProviderService } from "@/@types/vendors"
import { ProfileEmptyState } from "./ProviderProfilePrimitives"
import { DOCUMENT_TYPE_LABELS, formatToman } from "./provider-profile.utils"

type ServiceType = ProviderService["type"]

type ServiceMeta = {
  label: string
  description: string
  actionLabel: string
  priceLabel: string
  href: string
  icon: ComponentType<{
    size?: number
    strokeWidth?: number
  }>
}

const SERVICE_META: Record<ServiceType, ServiceMeta> = {
  subscription: {
    label: "اشتراک مشاوره",
    description:
      "با خرید اعتبار دادکوین، بدون محدودیت زمانی از خدمات حقوقی استفاده کنید. هر خدمت بر اساس نوع و میزان استفاده، مقدار مشخصی دادکوین از اعتبار شما کسر می‌کند.",
    actionLabel: "خرید اشتراک",
    priceLabel: "قیمت ۱۰ دادکوین",
    href: "/pishkhan/subscription",
    icon: TbBriefcase,
  },

  case: {
    label: "بررسی پرونده",
    description:
      "ارزیابی دقیق پرونده همراه با گفت‌وگوی آنلاین، بررسی مستندات و توضیحات شما برای ارائه نتیجه احتمالی و راهکارهای حقوقی مناسب.",
    actionLabel: "ثبت درخواست",
    priceLabel: "قیمت",
    href: "/pishkhan/case",
    icon: TbCheckbox,
  },

  call: {
    label: "مشاوره تلفنی",
    description:
      "پاسخ به پرسش‌های حقوقی شما از طریق تماس تلفنی در بازه‌های ۱۰ تا 60 دقیقه، با برقراری تماس در کوتاه‌ترین زمان ممکن پس از ثبت درخواست.",
    actionLabel: "رزرو مشاوره تلفنی",
    priceLabel: "شروع قیمت",
    href: "/pishkhan/phone-consultation",
    icon: TbPhone,
  },

  document: {
    label: "تنظیم اوراق قضایی",
    description:
      "تنظیم تخصصی اظهارنامه، لایحه، دادخواست، شکواییه و انواع قراردادها بر اساس موضوع شما و مطابق آخرین قوانین و مقررات.",
    actionLabel: "ثبت درخواست ",
    priceLabel: "شروع قیمت",
    href: "/pishkhan/legal-document",
    icon: TbFileText,
  },
}

const PHONE_DURATIONS = [10, 20, 30, 40, 60] as const

const getMinimumPrice = (service: ProviderService): number | null => {
  if (service.type === "call") {
    const prices = service.settings.prices.filter(
      (price): price is number => typeof price === "number" && price > 0,
    )

    return prices.length ? Math.min(...prices) : null
  }

  if (service.type === "document") {
    const prices = Object.values(service.settings.prices).filter(
      (price): price is number => typeof price === "number" && price > 0,
    )

    return prices.length ? Math.min(...prices) : null
  }

  return service.price && service.price > 0 ? service.price : null
}

const ServiceMainPrice = ({ service }: { service: ProviderService }) => {
  const meta = SERVICE_META[service.type]
  const minimumPrice = getMinimumPrice(service)

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {minimumPrice ? meta.priceLabel : "هزینه خدمت"}
      </p>

      <div className="mt-1.5 flex min-h-9 items-center">
        {minimumPrice ? (
          <p className="text-xl font-black tracking-tight text-gray-950 dark:text-white sm:text-2xl">
            {formatToman(minimumPrice)}
          </p>
        ) : (
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
            پس از بررسی اعلام می‌شود
          </p>
        )}
      </div>
    </div>
  )
}

const CallPriceOptions = ({
  service,
}: {
  service: Extract<ProviderService, { type: "call" }>
}) => {
  const prices = service.settings.prices
    .filter((price): price is number => typeof price === "number" && price > 0)
    .slice(0, PHONE_DURATIONS.length)

  if (!prices.length) {
    return null
  }

  return (
    <div>
      <p className="mb-3 text-xs font-bold text-gray-500 dark:text-gray-400">
        مدت و هزینه مشاوره
      </p>

      <ul className="space-y-2.5">
        {prices.map((price, index) => {
          const duration = PHONE_DURATIONS[index]

          return (
            <li
              key={`${duration}-${price}`}
              className="flex items-center gap-3 text-xs"
            >
              <span className="shrink-0 font-bold text-gray-600 dark:text-gray-300">
                {duration.toLocaleString("fa-IR")} دقیقه
              </span>

              <span className="min-w-4 flex-1 border-b border-dotted border-gray-300 dark:border-gray-700" />

              <strong className="shrink-0 text-gray-950 dark:text-white">
                {formatToman(price)}
              </strong>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const DocumentPriceOptions = ({
  service,
}: {
  service: Extract<ProviderService, { type: "document" }>
}) => {
  const prices = Object.entries(service.settings.prices).filter(
    ([, price]) => typeof price === "number" && price > 0,
  )

  if (!prices.length) {
    return null
  }

  return (
    <div>
      <p className="mb-3 text-xs font-bold text-gray-500 dark:text-gray-400">
        تعرفه تنظیم اوراق
      </p>

      <ul className="space-y-2.5">
        {prices.slice(0, 5).map(([type, price]) => (
          <li key={type} className="flex items-center gap-2 text-xs">
            <span className="shrink-0 text-gray-500 dark:text-gray-400">
              {DOCUMENT_TYPE_LABELS[type] ?? type}
            </span>

            <span className="min-w-3 flex-1 border-b border-dotted border-gray-300 dark:border-gray-700" />

            <strong className="shrink-0 text-gray-900 dark:text-white">
              {formatToman(price)}
            </strong>
          </li>
        ))}
        {prices.length > 5 && (
          <li className="pt-1 text-[11px] font-medium text-gray-400">
            و {Number(prices.length - 5).toLocaleString("fa-IR")} خدمت دیگر
          </li>
        )}
      </ul>
    </div>
  )
}

const ServiceDetails = ({ service }: { service: ProviderService }) => {
  if (service.type === "call") {
    return <CallPriceOptions service={service} />
  }
  if (service.type === "document") {
    return <DocumentPriceOptions service={service} />
  }
  return null
}

const getServiceHref = ({
  service,
  providerSlug,
}: {
  service: ProviderService
  providerSlug: string
}) => {
  const baseHref = SERVICE_META[service.type].href
  const query = new URLSearchParams({
    provider: providerSlug,
  })

  return `${baseHref}?${query.toString()}`
}

export const ProviderServicesSection = ({
  services,
  providerSlug,
  providerName,
}: {
  services: ProviderService[]
  providerSlug: string
  providerName: string
}) => {
  return (
    <section id="services" className="scroll-mt-24 py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full text-center px-5">
            <h2 className="text-2xl text-primary tracking-tight dark:text-white sm:text-3xl">
              خدمات حقوقی
            </h2>

            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              خدمت موردنظر خود را انتخاب کنید تا درخواست شما مستقیماً به{" "}
              <strong>{providerName}</strong> ارجاع گردد.
            </p>
          </div>
        </div>

        {services.length ? (
          <div className="grid gap-4">
            {services.map((service, index) => {
              const meta = SERVICE_META[service.type]
              const Icon = meta.icon
              const href = getServiceHref({
                service,
                providerSlug,
              })

              const description =
                "description" in service &&
                typeof service.description === "string" &&
                service.description.trim()
                  ? service.description
                  : meta.description

              return (
                <article
                  key={`${service.type}-${service.name}`}
                  className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-primary/40"
                >
                  <span className="absolute top-0 right-0 h-28 w-28 rounded-bl-[6rem] bg-primary/4 transition-all duration-300 group-hover:h-32 group-hover:w-32 group-hover:bg-primary/[0.07]" />

                  <div className="relative flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_300px_220px] lg:items-stretch">
                    {/* اطلاعات سرویس */}
                    <div className="p-5 sm:p-6 lg:p-7">
                      <div className="flex items-start gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                          <Icon size={23} strokeWidth={1.8} />
                        </span>

                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-primary">
                            {meta.label}
                          </p>

                          <h3 className="mt-1.5 text-lg font-black leading-7 text-gray-950 dark:text-white sm:text-xl">
                            {service.name || meta.label}
                          </h3>
                        </div>

                        <span className="mr-auto shrink-0 text-xs font-black text-gray-300 transition group-hover:text-primary/40 dark:text-gray-700">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <p className="mt-5 max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-300">
                        {description}
                      </p>
                    </div>

                    {/* قیمت‌ها */}
                    <div className="border-t border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6 lg:border-t-0 lg:border-r lg:px-7 lg:py-7">
                      {service.type !== "call" &&
                        service.type !== "document" && (
                          <ServiceMainPrice service={service} />
                        )}

                      <ServiceDetails service={service} />
                    </div>

                    {/* دکمه اقدام */}
                    <div className="flex items-center border-t border-gray-100 p-1 dark:border-gray-800 sm:p-2 lg:border-t-0 lg:border-r lg:p-3">
                      <Link
                        href={href}
                        className="flex h-12 w-full items-center justify-between rounded-2xl bg-primary px-4 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      >
                        <span>{meta.actionLabel}</span>

                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 transition-transform group-hover:-translate-x-1">
                          <TbArrowLeft size={18} />
                        </span>
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <ProfileEmptyState text="در حال حاضر خدمتی برای این ارائه‌دهنده ثبت نشده است." />
        )}
      </div>
    </section>
  )
}
