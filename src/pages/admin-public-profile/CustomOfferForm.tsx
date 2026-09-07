import { useState } from "react"
import { type AdminProfile, type Lang, type PlatformKey, type PlatformConfig, type CustomOffer } from "@adminhub/shared"
import { t } from "../../i18n"
import { Icon } from "../../components/layout/Icon"
import { Input, Textarea, Select } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import {
  PLATFORM_SPECS,
  emptyPlatformConfig,
} from "../../components/packages/platformSpecs"
import { BILLING_CYCLES, DURATION_OPTIONS } from "../AdminPublicProfilePage"

export function CustomOfferForm({
  admin,
  lang,
  tr,
  onSubmit,
  offerSent,
}: {
  admin: AdminProfile
  lang: Lang
  tr: typeof t["en"] & typeof t["fa"]
  onSubmit: (offer: Omit<CustomOffer, "id" | "createdAt">) => Promise<void>
  offerSent: boolean
}) {
  const isFa = lang === "fa"
  const [employerName, setEmployerName] = useState("")
  const [employerCo, setEmployerCo] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformKey[]>([])
  const [platformConfigs, setPlatformConfigs] = useState<PlatformConfig[]>([])
  const [durationMonths, setDurationMonths] = useState("3")
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [dmControl, setDmControl] = useState(false)
  const [priceToman, setPriceToman] = useState("")
  const [priceUSD, setPriceUSD] = useState("")
  const [message, setMessage] = useState("")

  const togglePlatform = (p: PlatformKey) => {
    setSelectedPlatforms((prev) => {
      const next = prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
      setPlatformConfigs((cfg) => {
        const nextCfg = cfg.filter((c) => next.includes(c.platform))
        next.forEach((pl) => {
          if (!cfg.find((c) => c.platform === pl)) {
            nextCfg.push(emptyPlatformConfig(pl))
          }
        })
        return nextCfg
      })
      return next
    })
  }

  const updateConfig = (
    platform: PlatformKey,
    field: string,
    value: unknown,
  ) => {
    setPlatformConfigs((cfg) =>
      cfg.map((c) =>
        c.platform === platform
          ? { ...c, settings: { ...c.settings, [field]: value } }
          : c,
      ),
    )
  }

  const handleDmToggle = (checked: boolean) => {
    setDmControl(checked)
    setPlatformConfigs((cfg) =>
      cfg.map((c) => {
        const spec = PLATFORM_SPECS[c.platform]
        if (!spec) return c
        const dmFields = spec.fields
          .filter((f) => {
            if (!f.description) return false
            const desc = isFa ? f.description.fa : f.description.en
            return (
              desc.includes("DM") ||
              desc.includes("گروه") ||
              desc.includes("پیام")
            )
          })
          .map((f) => f.id)
        if (dmFields.length === 0) return c
        const newSettings = { ...c.settings }
        dmFields.forEach((id) => {
          newSettings[id] = checked
        })
        return { ...c, settings: newSettings }
      }),
    )
  }

  const handleSubmit = async () => {
    if (selectedPlatforms.length === 0 || !employerName.trim()) return
    const now = new Date().toISOString()
    await onSubmit({
      adminId: String(admin.id),
      employerId: "current-employer",
      employerName,
      name: isFa
        ? `پیشنهاد سفارشی برای ${admin.nameFa}`
        : `Custom Offer for ${admin.nameEn}`,
      description: message || "",
      platforms: selectedPlatforms,
      platformConfigs,
      proposedPriceToman: parseInt(priceToman, 10) || undefined,
      proposedPriceUSD: parseInt(priceUSD, 10) || undefined,
      billingCycle: billingCycle as "monthly" | "project" | "hourly",
      deliveryTime: `${durationMonths} ${isFa ? "ماه" : "months"}`,
      message,
    })
    setEmployerName("")
    setEmployerCo("")
    setSelectedPlatforms([])
    setPlatformConfigs([])
    setDurationMonths("3")
    setBillingCycle("monthly")
    setDmControl(false)
    setPriceToman("")
    setPriceUSD("")
    setMessage("")
  }

  if (offerSent) {
    return (
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Icon name="check" size={32} className="text-emerald-600" />
        </div>
        <h3 className="font-bold text-[#0f172a] text-lg mb-2">
          {tr.customOffer.offerSent}
        </h3>
        <p className="text-sm text-[#64748b] mb-4">
          {tr.customOffer.offerSentSub}
        </p>
        <Button onClick={() => setSelectedPlatforms([])}>
          {tr.customOffer.sendAnother}
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 fade-in">
      <h2 className="font-bold text-[#0f172a] text-lg mb-1">
        {tr.customOffer.title}
      </h2>
      <p className="text-sm text-[#64748b] mb-6">{tr.customOffer.sub}</p>

      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
              {tr.customOffer.yourName}
            </label>
            <Input
              value={employerName}
              onChange={setEmployerName}
              placeholder={tr.customOffer.yourNamePh}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
              {tr.customOffer.yourCompany}
            </label>
            <Input
              value={employerCo}
              onChange={setEmployerCo}
              placeholder={tr.customOffer.yourCompanyPh}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0f172a] mb-2">
            {tr.customOffer.platforms}
          </label>
          <p className="text-xs text-[#64748b] mb-2">
            {tr.customOffer.platformNote}
          </p>
          <div className="flex flex-wrap gap-2">
            {admin.platforms.map((p) => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all btn-press border-2 ${
                  selectedPlatforms.includes(p)
                    ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
                    : "border-[#e2e8f0] text-[#64748b] hover:border-[#1e3a5f]/40"
                }`}
              >
                {selectedPlatforms.includes(p) && (
                  <Icon name="check" size={12} />
                )}
                {platformLabel(p, lang)}
              </button>
            ))}
          </div>
          {selectedPlatforms.length === 0 && (
            <p className="text-xs text-red-500 mt-1">
              {tr.customOffer.platformRequired}
            </p>
          )}
        </div>

        {selectedPlatforms.length > 0 && (
          <div className="space-y-4">
            {platformConfigs.map((config) => {
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
                              checked={!!config.settings[field.id] as boolean}
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
                              value={String(config.settings[field.id] ?? "")}
                              onChange={(e) =>
                                updateConfig(
                                  config.platform,
                                  field.id,
                                  parseInt(e.target.value, 10) || 0,
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
              {tr.customOffer.contractDuration}
            </label>
            <Select
              value={durationMonths}
              onChange={setDurationMonths}
              options={DURATION_OPTIONS.map((d) => ({
                value: d.value,
                label: isFa ? d.labelFa : d.labelEn,
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
              {tr.customOffer.billingCycle}
            </label>
            <Select
              value={billingCycle}
              onChange={setBillingCycle}
              options={BILLING_CYCLES.map((bc) => ({
                value: bc.value,
                label: isFa ? bc.labelFa : bc.labelEn,
              }))}
            />
          </div>
        </div>

        <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-semibold text-[#0f172a]">
                {tr.customOffer.dmControl}
              </label>
              <p className="text-xs text-[#64748b]">
                {tr.customOffer.dmControlNote}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDmToggle(!dmControl)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                dmControl ? "bg-[#1e3a5f]" : "bg-[#e2e8f0]"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  dmControl ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
              {tr.customOffer.priceToman}
            </label>
            <Input
              value={priceToman}
              onChange={setPriceToman}
              placeholder={tr.customOffer.priceTomanPh}
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
              {tr.customOffer.priceUSD}
            </label>
            <Input
              value={priceUSD}
              onChange={setPriceUSD}
              placeholder={tr.customOffer.priceUSDPh}
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
            {tr.customOffer.message}
          </label>
          <Textarea
            value={message}
            onChange={setMessage}
            placeholder={tr.customOffer.messagePh}
            rows={4}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={selectedPlatforms.length === 0 || !employerName.trim()}
          >
            {tr.customOffer.sendOffer}
          </Button>
        </div>
      </div>
    </div>
  )
}
