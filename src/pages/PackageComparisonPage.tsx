import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { t, type Lang } from "../i18n"
import { Icon } from "../components/layout/Icon"
import { Button } from "../components/ui/Button"
import { usePackages } from "../contexts/PackageContext"
import { useApp } from "../App"
import { platformLabel } from "../components/packages/platformSpecs"
import { PLATFORM_SPECS } from "../components/packages/platformSpecs"
import type { ContractPackage } from "@adminhub/shared"
import { formatPrice } from "../domain/package"

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "badge-instagram",
  telegram: "badge-telegram",
  whatsapp: "badge-whatsapp",
  torob: "badge-torob",
  digikala: "badge-digikala",
  linkedin: "badge-linkedin",
}

export default function PackageComparisonPage() {
  const navigate = useNavigate()
  const { comparison, packages, admin: findAdmin } = usePackages()
  const { lang, tr } = useApp()
  const isFa = lang === "fa"

  const selectedPkgs = useMemo(
    () =>
      Array.from(comparison.selected)
        .map((id) => packages.find((p) => p.id === id))
        .filter(Boolean) as ContractPackage[],
    [comparison.selected, packages],
  )

  if (selectedPkgs.length === 0) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto fade-in">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-[#1e3a5f] font-semibold hover:underline mb-4"
          >
            <Icon name="chevronLeft" size={16} /> {tr.common.back}
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center">
          <div className="text-4xl mb-3">📊</div>
          <div className="font-bold text-[#0f172a] mb-1">
            {tr.compare.noComparison}
          </div>
          <div className="text-sm text-[#64748b] mb-4">
            {tr.compare.noComparisonSub}
          </div>
          <Button onClick={() => navigate("/marketplace")}>
            {tr.compare.browsePackages}
          </Button>
        </div>
      </div>
    )
  }

  const platformOrder = selectedPkgs.flatMap((p) => p.platforms)
  const uniquePlatforms = Array.from(new Set(platformOrder))

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto fade-in">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#1e3a5f] font-semibold hover:underline mb-4"
        >
          <Icon name="chevronLeft" size={16} /> {tr.common.back}
        </button>
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {tr.compare.title}
        </h1>
        <p className="text-[#64748b] mt-1">{tr.compare.sub}</p>
      </div>

      {/* Header cards */}
      <div
        className="grid gap-4 mb-6"
        style={{
          gridTemplateColumns: `repeat(${selectedPkgs.length}, minmax(0, 1fr))`,
        }}
      >
        {selectedPkgs.map((pkg) => {
          const adm = findAdmin(pkg.adminId)
          return (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl border border-[#e2e8f0] p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-[#0f172a]">
                  {pkg.name}
                </span>
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
              </div>
              {adm && (
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={`https://images.unsplash.com/${adm.photo}?w=32&h=32&fit=crop&auto=format`}
                    alt=""
                    className="w-6 h-6 rounded-md object-cover"
                  />
                  <span className="text-xs font-semibold text-[#64748b]">
                    {isFa ? adm.nameFa : adm.nameEn}
                  </span>
                </div>
              )}
              <div className="text-lg font-bold text-[#1e3a5f] mb-1">
                {formatPrice(pkg, lang)}
                <span className="text-xs font-normal text-[#94a3b8] ml-1">
                  {tr.common.perMonth}
                </span>
              </div>
              <div className="text-xs text-[#64748b]">
                {tr.common.deliveryTime}: {pkg.deliveryTime}
              </div>
            </div>
          )
        })}
      </div>

      {/* Comparison table */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th className="text-start px-4 py-3 font-semibold text-[#64748b] w-48">
                  {tr.compare.feature}
                </th>
                {selectedPkgs.map((pkg) => (
                  <th
                    key={pkg.id}
                    className="text-center px-4 py-3 font-semibold text-[#0f172a]"
                  >
                    {pkg.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#f2f5fa]">
                <td className="px-4 py-3 font-semibold text-[#0f172a]">
                  {tr.common.billingCycle}
                </td>
                {selectedPkgs.map((pkg) => (
                  <td
                    key={pkg.id}
                    className="px-4 py-3 text-center text-[#64748b]"
                  >
                    {pkg.billingCycle === "monthly"
                      ? isFa
                        ? "ماهانه"
                        : "Monthly"
                      : pkg.billingCycle === "hourly"
                        ? isFa
                          ? "ساعتی"
                          : "Hourly"
                        : isFa
                          ? "پروژه‌ای"
                          : "Project"}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[#f2f5fa]">
                <td className="px-4 py-3 font-semibold text-[#0f172a]">
                  {tr.common.platforms}
                </td>
                {selectedPkgs.map((pkg) => (
                  <td key={pkg.id} className="px-4 py-3 text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {pkg.platforms.map((pl) => (
                        <span
                          key={pl}
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PLATFORM_COLORS[pl] || "bg-gray-100 text-gray-700"}`}
                        >
                          {platformLabel(pl, lang)}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              {uniquePlatforms.map((pl) => {
                const spec = PLATFORM_SPECS[pl]
                if (!spec) return null
                return spec.fields.map((field) => (
                  <tr
                    key={`${pl}:${field.id}`}
                    className="border-b border-[#f2f5fa]"
                  >
                    <td className="px-4 py-3 font-semibold text-[#0f172a]">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded ${spec.colorClass} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}
                        >
                          {spec.label[lang].charAt(0)}
                        </div>
                        <span>{isFa ? field.label.fa : field.label.en}</span>
                      </div>
                    </td>
                    {selectedPkgs.map((pkg) => {
                      const config = pkg.platformConfigs.find(
                        (c) => c.platform === pl,
                      )
                      const val = config?.settings[field.id]
                      if (field.type === "boolean") {
                        return (
                          <td key={pkg.id} className="px-4 py-3 text-center">
                            {val ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                                <Icon name="check" size={10} />{" "}
                                {isFa ? "شامل" : "Included"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">
                                <Icon name="x" size={10} />{" "}
                                {isFa ? "شامل نشده" : "Not included"}
                              </span>
                            )}
                          </td>
                        )
                      }
                      return (
                        <td
                          key={pkg.id}
                          className="px-4 py-3 text-center text-[#0f172a] font-mono text-xs"
                        >
                          {String(val ?? "-")}{" "}
                          {field.unit ? (isFa ? "/ماه" : `/${field.unit}`) : ""}
                        </td>
                      )
                    })}
                  </tr>
                ))
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
