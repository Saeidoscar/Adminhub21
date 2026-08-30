import { useState } from "react"
import { Icon } from "../layout/Icon"
import { Button } from "../ui/Button"
import type { ContractPackage } from "@adminhub/shared"
import { PLATFORM_SPECS } from "./platformSpecs"
import { formatPrice } from "../../domain/package"

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "badge-instagram",
  telegram: "badge-telegram",
  whatsapp: "badge-whatsapp",
  torob: "badge-torob",
  digikala: "badge-digikala",
  linkedin: "badge-linkedin",
}

interface PackageCardProps {
  pkg: ContractPackage
  lang: "en" | "fa"
  tr: Record<string, string>
  inCompare?: boolean
  onToggleCompare?: () => void
  onEdit?: () => void
  onDelete?: () => void
  showActions?: boolean
}

export default function PackageCard({
  pkg,
  lang,
  tr,
  inCompare,
  onToggleCompare,
  onEdit,
  onDelete,
  showActions,
}: PackageCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isFa = lang === "fa"

  return (
    <div
      className={`bg-white rounded-2xl border-2 p-5 transition-all ${
        inCompare ? "border-[#1e3a5f] bg-[#1e3a5f]/5" : "border-[#e2e8f0]"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm text-[#0f172a]">{pkg.name}</span>
            {pkg.featured && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                {isFa ? "ویژه" : "Featured"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                pkg.type === "bundle"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-sky-100 text-sky-700"
              }`}
            >
              {pkg.type === "bundle"
                ? isFa
                  ? "باندل"
                  : "Bundle"
                : isFa
                  ? "تک‌پلتفرم"
                  : "Platform"}
            </span>
            {pkg.platforms.map((pl) => (
              <span
                key={pl}
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PLATFORM_COLORS[pl] || "bg-gray-100 text-gray-700"}`}
              >
                {PLATFORM_SPECS[pl]?.label[lang] || pl}
              </span>
            ))}
          </div>
        </div>
        {showActions && (
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="w-8 h-8 rounded-lg bg-[#f2f5fa] flex items-center justify-center text-[#1e3a5f] hover:bg-[#1e3a5f]/10 transition-colors"
            >
              <Icon name="edit" size={14} />
            </button>
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 hover:bg-rose-100 transition-colors"
            >
              <Icon name="trash" size={14} />
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-[#64748b] mb-3">{pkg.description}</p>

      <div className="flex items-center justify-between pt-3 border-t border-[#f2f5fa] mb-3">
        <div>
          <div className="text-base font-bold text-[#1e3a5f]">
            {formatPrice(pkg, lang)}
            <span className="text-xs font-normal text-[#94a3b8] ml-1">
              {tr.common?.perMonth || ""}
            </span>
          </div>
          <div className="text-xs text-[#64748b] mt-0.5">
            {tr.common?.deliveryTime}: {pkg.deliveryTime}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {pkg.platformConfigs.map((config) => {
          const spec = PLATFORM_SPECS[config.platform]
          if (!spec) return null
          return (
            <div
              key={config.platform}
              className="bg-[#f8fafc] rounded-lg p-2.5"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div
                  className={`w-4 h-4 rounded ${spec.colorClass} flex items-center justify-center text-white text-[10px] font-bold`}
                >
                  {spec.label[lang].charAt(0)}
                </div>
                <span className="text-xs font-bold text-[#0f172a]">
                  {spec.label[lang]}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {spec.fields.slice(0, expanded ? undefined : 4).map((field) => {
                  const val = config.settings[field.id]
                  if (field.type === "boolean") {
                    return (
                      <span
                        key={field.id}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          val
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {val ? (
                          <Icon name="check" size={10} />
                        ) : (
                          <Icon name="x" size={10} />
                        )}
                        {field.label[lang]}
                      </span>
                    )
                  }
                  return (
                    <span
                      key={field.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e2e8f0] text-[#0f172a] text-[10px] font-semibold"
                    >
                      {field.label[lang]}: {String(val ?? "-")}
                    </span>
                  )
                })}
              </div>
              {spec.fields.length > 4 && !expanded && (
                <button
                  onClick={() => setExpanded(true)}
                  className="text-[10px] text-[#1e3a5f] font-semibold mt-1 hover:underline"
                >
                  {isFa
                    ? `+${spec.fields.length - 4} بیشتر`
                    : `+${spec.fields.length - 4} more`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex gap-2">
        {onToggleCompare && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onToggleCompare}
            className={inCompare ? "border-[#1e3a5f] text-[#1e3a5f]" : ""}
          >
            <Icon name={inCompare ? "check" : "compare"} size={14} />
            {inCompare ? (isFa ? "در مقایسه" : "Comparing") : tr.common?.compare || "Compare"}
          </Button>
        )}
      </div>
    </div>
  )
}
