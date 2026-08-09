import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { t, type Lang } from "../i18n"
import { Icon } from "../components/layout/Icon"
import { Button } from "../components/ui/Button"
import { Input, Textarea, Select } from "../components/ui/Input"
import { usePackages } from "../contexts/PackageContext"
import {
  emptyPlatformConfig,
  platformLabel,
} from "../components/packages/platformSpecs"
import { PLATFORM_SPECS } from "../components/packages/platformSpecs"
import type {
  ContractPackage,
  PlatformKey,
  BillingCycle,
  PackageType,
  PlatformConfig,
} from "../lib/types"

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "badge-instagram",
  telegram: "badge-telegram",
  whatsapp: "badge-whatsapp",
  torob: "badge-torob",
  digikala: "badge-digikala",
  linkedin: "badge-linkedin",
}

const BILLING_CYCLES: {
  value: BillingCycle
  labelEn: string
  labelFa: string
}[] = [
  { value: "monthly", labelEn: "Monthly", labelFa: "ماهانه" },
  { value: "project", labelEn: "Project", labelFa: "پروژه‌ای" },
  { value: "hourly", labelEn: "Hourly", labelFa: "ساعتی" },
]

export default function AdminPackagesPage() {
  const navigate = useNavigate()
  const { packages, addPackage, updatePackage, deletePackage } = usePackages()
  const [lang, setLang] = useState<Lang>("fa")
  const [activeTab, setActiveTab] = useState<"list" | "create">("list")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "platform" as PackageType,
    platforms: [] as PlatformKey[],
    priceToman: "",
    priceUSD: "",
    billingCycle: "monthly" as BillingCycle,
    deliveryTime: "",
    featured: false,
    active: true,
    platformConfigs: [] as PlatformConfig[],
  })

  const isFa = lang === "fa"
  const tr = t[lang]

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      type: "platform",
      platforms: [],
      priceToman: "",
      priceUSD: "",
      billingCycle: "monthly",
      deliveryTime: "",
      featured: false,
      active: true,
      platformConfigs: [],
    })
    setEditingId(null)
  }

  const togglePlatform = (p: PlatformKey) => {
    setForm((f) => {
      const next = f.platforms.includes(p)
        ? f.platforms.filter((x) => x !== p)
        : [...f.platforms, p]
      return {
        ...f,
        platforms: next,
        platformConfigs: next.map((pl) => {
          const existing = f.platformConfigs.find((c) => c.platform === pl)
          return existing ?? emptyPlatformConfig(pl)
        }),
      }
    })
  }

  const updateConfig = (
    platform: PlatformKey,
    field: string,
    value: unknown,
  ) => {
    setForm((f) => ({
      ...f,
      platformConfigs: f.platformConfigs.map((c) =>
        c.platform === platform
          ? { ...c, settings: { ...c.settings, [field]: value } }
          : c,
      ),
    }))
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || form.platforms.length === 0) return
    const now = new Date().toISOString()
    const payload = {
      adminId: "current",
      name: form.name,
      description: form.description,
      type: form.type,
      platforms: form.platforms,
      platformConfigs: form.platformConfigs,
      priceToman: parseInt(form.priceToman) || 0,
      priceUSD: parseInt(form.priceUSD) || 0,
      billingCycle: form.billingCycle,
      deliveryTime: form.deliveryTime || "Within 24h",
      featured: form.featured,
      active: form.active,
      createdAt: now,
      updatedAt: now,
    }
    if (editingId) {
      await updatePackage({ ...payload, id: editingId })
    } else {
      await addPackage(payload)
    }
    resetForm()
    setActiveTab("list")
  }

  const startEdit = (pkg: ContractPackage) => {
    setEditingId(pkg.id)
    setForm({
      name: pkg.name,
      description: pkg.description,
      type: pkg.type,
      platforms: pkg.platforms,
      priceToman: String(pkg.priceToman),
      priceUSD: String(pkg.priceUSD),
      billingCycle: pkg.billingCycle,
      deliveryTime: pkg.deliveryTime,
      featured: pkg.featured,
      active: pkg.active,
      platformConfigs: pkg.platformConfigs,
    })
    setActiveTab("create")
  }

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
                    <div className="text-base font-bold text-[#1e3a5f]">
                      {isFa
                        ? `${(pkg.priceToman / 1000000).toFixed(1)}M ${tr.common.toman}`
                        : `$${pkg.priceUSD}`}
                      <span className="text-xs font-normal text-[#94a3b8] ml-1">
                        {tr.common.perMonth}
                      </span>
                    </div>
                    <div className="text-xs text-[#64748b] mt-0.5">
                      {tr.common.deliveryTime}: {pkg.deliveryTime}
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                      pkg.active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {pkg.active ? tr.common.active : tr.common.inactive}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "create" && (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 fade-in">
          <h2 className="font-bold text-[#0f172a] text-lg mb-6">
            {editingId
              ? tr.adminProfile.editPackage
              : tr.adminProfile.createPackage}
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.adminProfile.packageName}
              </label>
              <Input
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder={tr.adminProfile.packageNamePh}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.adminProfile.packageDesc}
              </label>
              <Textarea
                value={form.description}
                onChange={(v) => setForm((f) => ({ ...f, description: v }))}
                placeholder={tr.adminProfile.packageDescPh}
                rows={3}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.adminProfile.packageType}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "platform", label: tr.adminProfile.platformOnly },
                    { key: "bundle", label: tr.adminProfile.bundle },
                  ].map((pt) => (
                    <button
                      key={pt.key}
                      onClick={() =>
                        setForm((f) => ({ ...f, type: pt.key as PackageType }))
                      }
                      className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all btn-press ${
                        form.type === pt.key
                          ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
                          : "border-[#e2e8f0] text-[#64748b]"
                      }`}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.adminProfile.billingCycle}
                </label>
                <Select
                  value={form.billingCycle}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, billingCycle: v as BillingCycle }))
                  }
                  options={BILLING_CYCLES.map((bc) => ({
                    value: bc.value,
                    label: isFa ? bc.labelFa : bc.labelEn,
                  }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                {tr.adminProfile.platformsIncluded}
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(PLATFORM_SPECS).map((p) => (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p as PlatformKey)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all btn-press border-2 ${
                      form.platforms.includes(p as PlatformKey)
                        ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
                        : "border-[#e2e8f0] text-[#64748b] hover:border-[#1e3a5f]/40"
                    }`}
                  >
                    {form.platforms.includes(p as PlatformKey) && (
                      <Icon name="check" size={12} />
                    )}
                    {platformLabel(p as PlatformKey, lang)}
                  </button>
                ))}
              </div>
            </div>

            {form.platforms.length > 0 && (
              <div className="space-y-4">
                {form.platformConfigs.map((config) => {
                  const spec = PLATFORM_SPECS[config.platform]
                  if (!spec) return null
                  return (
                    <div
                      key={config.platform}
                      className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className={`w-6 h-6 rounded-md ${spec.colorClass} flex items-center justify-center text-white text-xs font-bold`}
                        >
                          {spec.label[lang].charAt(0)}
                        </div>
                        <span className="font-bold text-sm text-[#0f172a]">
                          {spec.label[lang]}
                        </span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {spec.fields.map((field) => (
                          <div key={field.id}>
                            {field.type === "boolean" ? (
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={
                                    !!config.settings[field.id] as boolean
                                  }
                                  onChange={(e) =>
                                    updateConfig(
                                      config.platform,
                                      field.id,
                                      e.target.checked,
                                    )
                                  }
                                  className="w-4 h-4 rounded border-[#e2e8f0] text-[#1e3a5f] focus:ring-[#1e3a5f]"
                                />
                                <span className="text-sm text-[#0f172a]">
                                  {isFa ? field.label.fa : field.label.en}
                                </span>
                              </label>
                            ) : (
                              <div>
                                <label className="block text-xs font-semibold text-[#64748b] mb-1">
                                  {isFa ? field.label.fa : field.label.en}
                                </label>
                                <input
                                  type="number"
                                  value={String(
                                    config.settings[field.id] ?? "",
                                  )}
                                  onChange={(e) =>
                                    updateConfig(
                                      config.platform,
                                      field.id,
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] bg-white text-sm text-[#0f172a] focus:border-[#1e3a5f] transition-all"
                                  dir="ltr"
                                  min={field.min}
                                  max={field.max}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.common.priceToman}
                </label>
                <Input
                  value={form.priceToman}
                  onChange={(v) => setForm((f) => ({ ...f, priceToman: v }))}
                  placeholder="4500000"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.common.priceUSD}
                </label>
                <Input
                  value={form.priceUSD}
                  onChange={(v) => setForm((f) => ({ ...f, priceUSD: v }))}
                  placeholder="108"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.common.deliveryTime}
              </label>
              <Input
                value={form.deliveryTime}
                onChange={(v) => setForm((f) => ({ ...f, deliveryTime: v }))}
                placeholder={tr.adminProfile.deliveryTimePh}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, featured: e.target.checked }))
                }
                className="w-4 h-4 rounded border-[#e2e8f0] text-[#1e3a5f] focus:ring-[#1e3a5f]"
              />
              <label
                htmlFor="featured"
                className="text-sm font-semibold text-[#0f172a] cursor-pointer"
              >
                {tr.adminProfile.featured}
              </label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!form.name.trim() || form.platforms.length === 0}
              >
                {editingId ? tr.common.save : tr.adminProfile.savePackage}
              </Button>
              {editingId && (
                <Button variant="secondary" onClick={resetForm}>
                  {tr.common.cancel}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
