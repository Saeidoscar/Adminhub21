import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { t, type Lang } from "../i18n"
import { Icon } from "../components/layout/Icon"
import { Button } from "../components/ui/Button"
import { usePackages } from "../contexts/PackageContext"
import { usePackageForm } from "../hooks/usePackageForm"
import {
  platformLabel,
  ALL_PLATFORM_KEYS,
} from "../components/packages/platformSpecs"
import { PLATFORM_SPECS } from "../components/packages/platformSpecs"
import type {
  ContractPackage,
  PlatformKey,
} from "@adminhub/shared"

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "badge-instagram",
  telegram: "badge-telegram",
  whatsapp: "badge-whatsapp",
  torob: "badge-torob",
  digikala: "badge-digikala",
  linkedin: "badge-linkedin",
}

const BILLING_CYCLES: {
  value: "monthly" | "project" | "hourly"
  labelEn: string
  labelFa: string
}[] = [
  { value: "monthly", labelEn: "Monthly", labelFa: "ماهانه" },
  { value: "project", labelEn: "Project", labelFa: "پروژه‌ای" },
  { value: "hourly", labelEn: "Hourly", labelFa: "ساعتی" },
]

export default function AdminPackagesPage() {
  const navigate = useNavigate()
  const { packages, deletePackage } = usePackages()
  const [lang, setLang] = useState<Lang>("fa")
  const [activeTab, setActiveTab] = useState<"list" | "create">("list")
  const isFa = lang === "fa"
  const tr = t[lang]

  const {
    form,
    editingId,
    errors,
    setFormField,
    togglePlatform,
    updateConfig,
    startEdit,
    resetForm,
    handleSubmit,
  } = usePackageForm({
    onSuccess: () => setActiveTab("list"),
  })

  const handleDelete = async (id: string) => {
    if (
      confirm(
        isFa
          ? "آیا از حذف این پکیج اطمینان دارید؟"
          : "Are you sure you want to delete this package?",
      )
    ) {
      await deletePackage(id)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {tr.packages.title}
        </h1>
        <p className="text-[#64748b] mt-1">{tr.packages.sub}</p>
      </div>

      <div className="flex gap-1 bg-white border border-[#e2e8f0] rounded-xl p-1 mb-6 w-fit shadow-sm">
        {[
          { id: "list", label: tr.packages.manage },
          {
            id: "create",
            label: editingId
              ? tr.adminProfile.editPackage
              : tr.packages.createNew,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === "list") resetForm()
              setActiveTab(tab.id as "list" | "create")
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all btn-press ${
              activeTab === tab.id
                ? "bg-[#1e3a5f] text-white shadow-sm"
                : "text-[#64748b] hover:text-[#1e3a5f]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "list" && (
        <div className="space-y-4 fade-in">
          {packages.length === 0 && (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center">
              <div className="text-4xl mb-3">📦</div>
              <div className="font-bold text-[#0f172a] mb-1">
                {tr.adminProfile.noPackages}
              </div>
              <div className="text-sm text-[#64748b] mb-4">
                {tr.adminProfile.noPackagesSub}
              </div>
              <button
                onClick={() => setActiveTab("create")}
                className="px-4 py-2 rounded-xl bg-[#1e3a5f] text-white text-sm font-bold btn-press"
              >
                {tr.adminProfile.addFirstPackage}
              </button>
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl border border-[#e2e8f0] p-5 card-hover"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-[#0f172a]">
                        {pkg.name}
                      </span>
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
                          {platformLabel(pl, lang)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(pkg)}
                      className="w-8 h-8 rounded-lg bg-[#f2f5fa] flex items-center justify-center text-[#1e3a5f] hover:bg-[#1e3a5f]/10 transition-colors"
                    >
                      <Icon name="edit" size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 hover:bg-rose-100 transition-colors"
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[#64748b] mb-3 line-clamp-2">
                  {pkg.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-[#f2f5fa]">
                  <div>
                    <span className="text-lg font-bold text-[#1e3a5f]">
                      {(pkg.priceToman / 1000000).toFixed(1)}M
                    </span>
                    <span className="text-xs text-[#94a3b8] mr-1">
                      {tr.common.perMonth}
                    </span>
                  </div>
                  <span className="text-xs text-[#64748b]">
                    {pkg.deliveryTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "create" && (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 fade-in">
          <h2 className="font-bold text-[#0f172a] text-lg mb-5">
            {editingId
              ? isFa
                ? "ویرایش پکیج"
                : "Edit Package"
              : isFa
                ? "ایجاد پکیج جدید"
                : "Create New Package"}
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.packages.packageName}
              </label>
              <input
                value={form.name}
                onChange={(e) => setFormField("name", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
              />
              {errors.name && (
                <p className="text-xs text-rose-600 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {isFa ? "توضیحات" : "Description"}
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setFormField("description", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                {isFa ? "پلتفرم‌ها" : "Platforms"}
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_PLATFORM_KEYS.map((pl) => (
                  <button
                    key={pl}
                    type="button"
                    onClick={() => togglePlatform(pl)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all btn-press ${
                      form.platforms.includes(pl)
                        ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
                        : "border-[#e2e8f0] text-[#64748b]"
                    }`}
                  >
                    {platformLabel(pl, lang)}
                  </button>
                ))}
              </div>
              {errors.platforms && (
                <p className="text-xs text-rose-600 mt-1">{errors.platforms}</p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {isFa ? "قیمت (تومان)" : "Price (Toman)"}
                </label>
                <input
                  value={form.priceToman}
                  onChange={(e) => setFormField("priceToman", e.target.value)}
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all"
                />
                {errors.priceToman && (
                  <p className="text-xs text-rose-600 mt-1">{errors.priceToman}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {isFa ? "قیمت (دلار)" : "Price (USD)"}
                </label>
                <input
                  value={form.priceUSD}
                  onChange={(e) => setFormField("priceUSD", e.target.value)}
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all"
                />
                {errors.priceUSD && (
                  <p className="text-xs text-rose-600 mt-1">{errors.priceUSD}</p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {isFa ? "چرخه صورتبندی" : "Billing Cycle"}
                </label>
                <select
                  value={form.billingCycle}
                  onChange={(e) => setFormField("billingCycle", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all bg-white"
                >
                  {BILLING_CYCLES.map((bc) => (
                    <option key={bc.value} value={bc.value}>
                      {isFa ? bc.labelFa : bc.labelEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {isFa ? "زمان تحویل" : "Delivery Time"}
                </label>
                <input
                  value={form.deliveryTime}
                  onChange={(e) => setFormField("deliveryTime", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all"
                />
                {errors.deliveryTime && (
                  <p className="text-xs text-rose-600 mt-1">{errors.deliveryTime}</p>
                )}
              </div>
            </div>

            {form.platforms.map((pl) => {
              const spec = PLATFORM_SPECS[pl]
              const config = form.platformConfigs.find((c) => c.platform === pl)
              if (!spec || !config) return null
              return (
                <div key={pl} className="border border-[#e2e8f0] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={`w-5 h-5 rounded ${spec.colorClass} flex items-center justify-center text-white text-[10px] font-bold`}
                    >
                      {spec.label.en.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-[#0f172a]">
                      {spec.label[lang]}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {spec.fields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-xs text-[#64748b] mb-1">
                          {isFa ? field.label.fa : field.label.en}
                        </label>
                        {field.type === "boolean" ? (
                          <button
                            type="button"
                            onClick={() =>
                              updateConfig(pl, field.id, !config.settings[field.id])
                            }
                            className={`w-full px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                              config.settings[field.id]
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-[#e2e8f0] text-[#64748b]"
                            }`}
                          >
                            {config.settings[field.id]
                              ? isFa
                                ? "شامل"
                                : "Included"
                              : isFa
                                ? "خیر"
                                : "No"}
                          </button>
                        ) : (
                          <input
                            type="number"
                            value={String(config.settings[field.id] ?? "")}
                            onChange={(e) =>
                              updateConfig(
                                pl,
                                field.id,
                                e.target.value ? Number(e.target.value) : field.default ?? 0,
                              )
                            }
                            className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-xs focus:border-[#1e3a5f] transition-all"
                            dir="ltr"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmit}
                className="px-6 py-3 rounded-xl bg-[#1e3a5f] text-white text-sm font-bold hover:bg-[#122435] transition-colors btn-press"
              >
                {editingId
                  ? isFa
                    ? "ذخیره تغییرات"
                    : "Save Changes"
                  : isFa
                    ? "ایجاد پکیج"
                    : "Create Package"}
              </button>
              <button
                onClick={() => {
                  resetForm()
                  setActiveTab("list")
                }}
                className="px-6 py-3 rounded-xl border border-[#e2e8f0] text-sm font-semibold text-[#64748b] hover:bg-[#f2f5fa] transition-colors btn-press"
              >
                {tr.common.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
