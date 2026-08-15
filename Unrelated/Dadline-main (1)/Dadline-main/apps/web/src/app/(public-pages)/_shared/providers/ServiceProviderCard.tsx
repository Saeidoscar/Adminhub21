import Image from "next/image"
import Link from "next/link"
import { TbClock, TbMapPin, TbPhone, TbStar, TbUserHeart } from "react-icons/tb"

type ServiceType = "call" | "subscription"

export type ServiceProviderCardData = {
  name: string
  role: string
  slug: string
  online: boolean
  lastActive: string | null
  city: { name: string | null }
  province: { name: string | null }
  expertise: Array<{
    id: number
    name: string
    slug: string
  }>
  avatar: string | null
  rating: number
  reviewCount: number
  service: {
    type: ServiceType
    price: number | null
    startingPrice: number | null
  }
}

const servicePresentation = {
  call: {
    basePath: "/pishkhan/phone-consultation",
    priceLabel: "شروع از",
    actionLabel: "رزرو مشاوره",
    icon: TbPhone,
  },
  subscription: {
    basePath: "/pishkhan/subscription",
    priceLabel: "قیمت اشتراک",
    actionLabel: "انتخاب",
    icon: TbUserHeart,
  },
} as const

export default function ServiceProviderCard({
  provider,
}: {
  provider: ServiceProviderCardData
}) {
  const presentation = servicePresentation[provider.service.type]
  const ActionIcon = presentation.icon
  const href = `${presentation.basePath}?provider=${encodeURIComponent(provider.slug)}`
  const price = provider.service.startingPrice ?? provider.service.price

  return (
    <Link
      href={href}
      className="
    group flex h-full flex-col rounded-2xl
    border border-gray-200 bg-white p-3
    transition-[border-color,box-shadow,transform]
    duration-300 ease-out
    hover:-translate-y-0.5
    hover:border-primary
    hover:shadow-[0_8px_25px_rgba(29,78,216,0.12)]
    dark:border-gray-800 dark:bg-gray-900
    dark:hover:border-primary
    dark:hover:shadow-[0_8px_25px_rgba(29,78,216,0.18)]
"
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          {provider.avatar ? (
            <Image
              src={provider.avatar}
              alt={provider.name}
              width={56}
              height={56}
              className="h-14 w-14 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/50 text-lg font-bold text-primary">
              {getInitials(provider.name)}
            </div>
          )}
          {provider.online && (
            <span
              className="absolute -bottom-0.5 -inset-s-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-gray-900"
              title="آنلاین"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className={`truncate text-sm font-bold text-gray-900 transition dark:text-white group-hover:text-primary`}
          >
            {provider.name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
            {provider.role}
          </p>
          {(provider.city.name || provider.province.name) && (
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <TbMapPin size={12} />
              <span className="truncate">
                {[provider.city.name, provider.province.name]
                  .filter(Boolean)
                  .join("، ")}
              </span>
            </div>
          )}
        </div>
      </div>

      {provider.expertise.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {provider.expertise.slice(0, 3).map((expertise) => (
            <span
              key={expertise.id}
              className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            >
              {expertise.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-2 text-xs">
        {provider.reviewCount > 0 ? (
          <div className="flex min-w-0 items-center gap-1">
            <TbStar
              size={14}
              className="shrink-0 fill-amber-400 text-amber-400"
            />
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {provider.rating.toLocaleString("fa-IR", {
                maximumFractionDigits: 1,
              })}
            </span>
            <span className="truncate text-gray-400">
              ({provider.reviewCount.toLocaleString("fa-IR")} نظر)
            </span>
          </div>
        ) : (
          <span className="text-gray-400">بدون امتیاز</span>
        )}

        <ProviderActivity provider={provider} />
      </div>

      <div className="flex items-center justify-between gap-3 mt-2 border-t border-gray-100 pt-3 dark:border-gray-800">
        <div>
          <span className="block text-[11px] text-gray-400">
            {presentation.priceLabel}
          </span>
          <strong className={`text-sm text-primary`}>
            {formatPrice(price)}
          </strong>
        </div>
        <span className="flex items-center gap-1 text-sm font-semibold text-primary">
          <ActionIcon size={14} />
          {presentation.actionLabel}
        </span>
      </div>
    </Link>
  )
}

function ProviderActivity({
  provider,
}: {
  provider: Pick<ServiceProviderCardData, "online" | "lastActive">
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-1 font-medium ${
        provider.online
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-gray-400 dark:text-gray-500"
      }`}
    >
      {provider.online ? (
        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
      ) : (
        <TbClock size={13} className="shrink-0" />
      )}
      <span className="truncate">
        {provider.online
          ? "آنلاین"
          : (provider.lastActive ?? "آخرین فعالیت: مدت‌ها پیش")}
      </span>
    </div>
  )
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts.length > 0
    ? `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`
    : (parts[0]?.slice(0, 1) ?? "؟")
}

function formatPrice(price: number | null) {
  if (price === null) return "استعلام تعرفه"
  if (price === 0) return "رایگان"

  return `${price.toLocaleString("fa-IR")} تومان`
}
