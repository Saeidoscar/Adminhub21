import Link from "next/link"
import Image from "next/image"
import { TbMapPin, TbStar, TbClock } from "react-icons/tb"
import type { Provider } from "./types"

const getInitials = (name: string) => {
  const parts = name.trim().split(" ")
  return parts.length >= 2
    ? parts[0][0] + parts[1][0]
    : (parts[0]?.slice(0, 2) ?? "؟")
}

type Props = {
  provider: Provider
  basePath: string
}

const ProviderCard = ({ provider, basePath }: Props) => {
  return (
    <Link
      href={`${basePath}/${provider.slug}`}
      className="group flex flex-col gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          {provider.avatar ? (
            <Image
              src={provider.avatar}
              alt={provider.name}
              width={56}
              height={56}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,..."
              className="w-14 h-14 rounded-xl object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-primary font-bold text-lg">
              {getInitials(provider.name)}
            </div>
          )}
          {provider.online && (
            <span className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 bg-green-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-primary transition-colors truncate">
              {provider.name}
            </h2>
            {/* <TbShieldCheck size={15} className="text-sky-500 shrink-0" /> */}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {provider.role}
          </p>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <TbMapPin size={12} />
            <span className="truncate">{provider.city.name}</span>
            {/* <span className="truncate">{provider.city.name}، {provider.province.name}</span> */}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {provider.rating > 0 ? (
          <div className="flex items-center gap-1">
            <TbStar size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {provider.rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">
              از {provider.reviewCount.toLocaleString("fa-IR")} دیدگاه
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">بدون امتیاز</span>
        )}
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <TbClock size={12} />
          {provider.online ? "آنلاین" : provider.lastActive}
        </div>
      </div>

      {provider.expertise.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {provider.expertise.slice(0, 3).map((spec) => (
            <span
              key={spec.id}
              className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs"
            >
              {spec.name}
            </span>
          ))}
          {provider.expertise.length > 3 && (
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs">
              +{provider.expertise.length - 3}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}

export default ProviderCard
