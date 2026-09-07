import { useNavigate } from "react-router-dom"
import { type Lang, t } from "../../i18n"
import { Icon } from "../../components/layout/Icon"
import { type ContractPackage } from "@adminhub/shared"
import { PackageCard } from "./PackageCard"

export function PackagesTab({
  adminPackages,
  platformPackages,
  bundlePackages,
  lang,
  tr,
  comparison,
  toggleCompare,
  navigate,
}: {
  adminPackages: ContractPackage[]
  platformPackages: ContractPackage[]
  bundlePackages: ContractPackage[]
  lang: Lang
  tr: typeof t["en"] & typeof t["fa"]
  comparison: {
    selected: Set<string>
    has: (id: string) => boolean
    toggle: (id: string) => void
    clear: () => void
  }
  toggleCompare: (id: string) => void
  navigate: ReturnType<typeof useNavigate>
}) {
  const isFa = lang === "fa"

  if (adminPackages.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center fade-in">
        <div className="text-4xl mb-3">📦</div>
        <div className="font-bold text-[#0f172a] mb-1">
          {tr.adminPage.noPackages}
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in space-y-8">
      {platformPackages.length > 0 && (
        <div>
          <h2 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
            <Icon name="package" size={20} className="text-[#1e3a5f]" />
            {isFa ? "پکیج‌های تک‌پلتفرمی" : "Platform Packages"}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                lang={lang}
                tr={tr}
                inCompare={comparison.has(pkg.id)}
                onToggleCompare={() => toggleCompare(pkg.id)}
              />
            ))}
          </div>
        </div>
      )}
      {bundlePackages.length > 0 && (
        <div>
          <h2 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
            <Icon name="layers" size={20} className="text-purple-600" />
            {tr.common.bundles}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bundlePackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                lang={lang}
                tr={tr}
                inCompare={comparison.has(pkg.id)}
                onToggleCompare={() => toggleCompare(pkg.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
