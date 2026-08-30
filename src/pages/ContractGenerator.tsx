import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { t, type Lang } from "../i18n"
import { Icon } from "../components/layout/Icon"
import { createContract, listAdminProfiles, type AdminProfile } from "../lib/api"
import { contractFormSchema, createDefaultContractForm, validateContractForm } from "../domain/contract/contractFormSchema"
import { computeContractAmounts } from "../domain/package"
import { ContractStepIndicator } from "../components/contracts/ContractStepIndicator"
import { ContractReviewStep } from "../components/contracts/ContractReviewStep"

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "telegram", label: "Telegram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "torob", label: "Torob" },
  { value: "digikala", label: "Digikala" },
  { value: "linkedin", label: "LinkedIn" },
]

export default function ContractGenerator({
  tr,
  lang,
  initialContract,
}: {
  tr: typeof t["en"]
  lang: Lang
  initialContract?: {
    id: string
    code: string
    platform: string
    status: string
    amountToman: number
    amountUSD: number
    hasInsurance: boolean
    hasSubstitute: boolean
    termClause: string | null
    substituteClause: string | null
    startDate: string | null
    endDate: string | null
    adminNameEn: string
    employerName: string
    createdAt: string
  } | null
}) {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [admins, setAdmins] = useState<AdminProfile[]>([])
  const [loadingAdmins, setLoadingAdmins] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (initialContract) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0f172a]">
            {tr.contract.title}
          </h1>
          <p className="text-[#64748b] mt-1">{tr.contract.sub}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm text-[#64748b]">Contract Code</div>
              <div className="text-lg font-bold text-[#0f172a]">
                {initialContract.code}
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                initialContract.status === "active"
                  ? "bg-emerald-100 text-emerald-700"
                  : initialContract.status === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : initialContract.status === "completed"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
              }`}
            >
              {initialContract.status}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-[#64748b] mb-1">Employer</div>
              <div className="text-sm font-semibold text-[#0f172a]">
                {initialContract.employerName}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#64748b] mb-1">Admin</div>
              <div className="text-sm font-semibold text-[#0f172a]">
                {initialContract.adminNameEn}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#64748b] mb-1">Platform</div>
              <div className="text-sm font-semibold text-[#0f172a] capitalize">
                {initialContract.platform}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#64748b] mb-1">Amount</div>
              <div className="text-sm font-semibold text-[#0f172a]">
                {lang === "fa"
                  ? `${(initialContract.amountToman / 1000000).toFixed(1)}M ${tr.common.toman}`
                  : `$${initialContract.amountUSD}`}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#64748b] mb-1">Insurance</div>
              <div className="text-sm font-semibold text-[#0f172a]">
                {initialContract.hasInsurance
                  ? lang === "fa" ? "بله" : "Yes"
                  : lang === "fa" ? "خیر" : "No"}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#64748b] mb-1">Substitute</div>
              <div className="text-sm font-semibold text-[#0f172a]">
                {initialContract.hasSubstitute
                  ? lang === "fa" ? "بله" : "Yes"
                  : lang === "fa" ? "خیر" : "No"}
              </div>
            </div>
            {initialContract.startDate && (
              <div>
                <div className="text-xs text-[#64748b] mb-1">Start Date</div>
                <div className="text-sm font-semibold text-[#0f172a]">
                  {initialContract.startDate}
                </div>
              </div>
            )}
            {initialContract.endDate && (
              <div>
                <div className="text-xs text-[#64748b] mb-1">End Date</div>
                <div className="text-sm font-semibold text-[#0f172a]">
                  {initialContract.endDate}
                </div>
              </div>
            )}
          </div>

          {initialContract.termClause && (
            <div className="mb-4">
              <div className="text-xs text-[#64748b] mb-1">
                {tr.contract.termClause}
              </div>
              <p className="text-sm text-[#0f172a] bg-[#f8fafc] rounded-lg p-3">
                {initialContract.termClause}
              </p>
            </div>
          )}

          {initialContract.substituteClause && (
            <div className="mb-4">
              <div className="text-xs text-[#64748b] mb-1">
                {tr.contract.subClause}
              </div>
              <p className="text-sm text-[#0f172a] bg-emerald-50 rounded-lg p-3">
                {initialContract.substituteClause}
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => navigate("/contracts/history")}
              className="px-5 py-2.5 rounded-xl bg-[#1e3a5f] text-white text-sm font-bold hover:bg-[#122435] transition-colors btn-press"
            >
              {lang === "fa" ? "مشاهده همه قراردادها" : "View All Contracts"}
            </button>
            <button
              onClick={() => navigate("/contracts")}
              className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm font-semibold text-[#64748b] hover:bg-[#f2f5fa] transition-colors btn-press"
            >
              {tr.common.back}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const [step, setStep] = useState(1)
  const totalSteps = 5
  const [form, setForm] = useState(() =>
    createDefaultContractForm(lang, tr.contract.termDefault, tr.contract.subDefault),
  )

  useEffect(() => {
    let cancelled = false
    async function loadAdmins() {
      setLoadingAdmins(true)
      try {
        const data = await listAdminProfiles()
        if (!cancelled) {
          setAdmins(data)
          if (data.length > 0 && !form.adminId) {
            setForm((f) => ({ ...f, adminId: data[0].id }))
          }
        }
      } catch {
        if (!cancelled) {
          setAdmins([])
        }
      } finally {
        if (!cancelled) {
          setLoadingAdmins(false)
        }
      }
    }
    void loadAdmins()
    return () => {
      cancelled = true
    }
  }, [form.adminId])

  const setF = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))
  const steps = [
    tr.contract.step1,
    tr.contract.step2,
    tr.contract.step3,
    tr.contract.step4,
    tr.contract.step5,
  ]

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    setErrors({})
    const fieldErrors = validateContractForm(form)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      setSubmitting(false)
      return
    }

    try {
      const { amountToman, amountUSD } = computeContractAmounts(form.amount, form.currency as "toman" | "usd")
      await createContract({
        adminId: form.adminId,
        platform: form.platform,
        amountToman,
        amountUSD,
        hasInsurance: form.hasInsurance,
        hasSubstitute: form.hasSubstitute,
        termClause: form.termClause,
        substituteClause: form.subClause,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      })
      setSuccess(true)
      setTimeout(() => navigate("/contracts/history"), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create contract")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto fade-in">
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center">
          <div className="text-5xl mb-4">✅</div>
          <div className="font-bold text-[#0f172a] mb-1 text-lg">
            {lang === "fa" ? "قرارداد با موفقیت ایجاد شد" : "Contract Created"}
          </div>
          <div className="text-sm text-[#64748b]">
            {lang === "fa" ? "در حال انتقال به لیست قراردادها..." : "Redirecting to contracts..."}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {tr.contract.title}
        </h1>
        <p className="text-[#64748b] mt-1">{tr.contract.sub}</p>
      </div>

      <ContractStepIndicator step={step} totalSteps={totalSteps} steps={steps} />

      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 mb-6">
        {step === 1 && (
          <div className="space-y-5 fade-in">
            <h2 className="font-bold text-[#0f172a] text-lg">
              {tr.contract.step1}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.contract.employerName}
                </label>
                <input
                  value={form.employerName}
                  onChange={(e) => setF("employerName", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                />
                {errors.employerName && (
                  <p className="text-xs text-rose-600 mt-1">{errors.employerName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.contract.employerCo}
                </label>
                <input
                  value={form.employerCo}
                  onChange={(e) => setF("employerCo", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.contract.adminName}
              </label>
              <select
                value={form.adminId}
                onChange={(e) => setF("adminId", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all bg-white"
              >
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {lang === "fa" ? admin.nameFa : admin.nameEn}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {lang === "fa" ? "پلتفرم" : "Platform"}
              </label>
              <select
                value={form.platform}
                onChange={(e) => setF("platform", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all bg-white"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 fade-in">
            <h2 className="font-bold text-[#0f172a] text-lg">
              {tr.contract.step2}
            </h2>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.contract.projectTitle}
              </label>
              <input
                value={form.projectTitle}
                onChange={(e) => setF("projectTitle", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
              />
              {errors.projectTitle && (
                <p className="text-xs text-rose-600 mt-1">{errors.projectTitle}</p>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.contract.startDate}
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setF("startDate", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.contract.endDate}
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setF("endDate", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.contract.description}
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setF("description", e.target.value)}
                placeholder={tr.contract.descPh}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all resize-none"
              />
              {errors.description && (
                <p className="text-xs text-rose-600 mt-1">{errors.description}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.contract.deliverables}
              </label>
              <textarea
                value={form.deliverables}
                onChange={(e) => setF("deliverables", e.target.value)}
                placeholder={tr.contract.delivPh}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all resize-none font-mono text-xs"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 fade-in">
            <h2 className="font-bold text-[#0f172a] text-lg">
              {tr.contract.step3}
            </h2>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                {tr.contract.payType}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["monthly", "hourly", "project"] as const).map((pt) => (
                  <button
                    key={pt}
                    onClick={() => setF("payType", pt)}
                    className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all btn-press ${
                      form.payType === pt
                        ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
                        : "border-[#e2e8f0] text-[#64748b]"
                    }`}
                  >
                    {tr.contract[pt]}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.contract.amount}
                </label>
                <input
                  value={form.amount}
                  onChange={(e) => setF("amount", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                  dir="ltr"
                />
                {errors.amount && (
                  <p className="text-xs text-rose-600 mt-1">{errors.amount}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.contract.currency}
                </label>
                <select
                  value={form.currency}
                  onChange={(e) => setF("currency", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all bg-white"
                >
                  <option value="toman">{tr.contract.toman}</option>
                  <option value="usd">{tr.contract.usd}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                {tr.contract.paySchedule}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["weekly", "biweekly", "payMonthly", "upfront"] as const).map(
                  (ps) => (
                    <button
                      key={ps}
                      onClick={() => setF("paySchedule", ps)}
                      className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all btn-press ${
                        form.paySchedule === ps
                          ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
                          : "border-[#e2e8f0] text-[#64748b]"
                      }`}
                    >
                      {tr.contract[ps]}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5 fade-in">
            <h2 className="font-bold text-[#0f172a] text-lg">
              {tr.contract.step4}
            </h2>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.contract.termClause}
              </label>
              <textarea
                value={form.termClause}
                onChange={(e) => setF("termClause", e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all resize-none text-[#64748b] leading-relaxed"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <label className="text-sm font-semibold text-[#0f172a]">
                  {tr.contract.subClause}
                </label>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1">
                  <Icon name="shield" size={11} />
                  {lang === "fa" ? "بیمه ادمین‌هاب" : "AdminHub21 Insurance"}
                </span>
              </div>
              <textarea
                value={form.subClause}
                onChange={(e) => setF("subClause", e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-sm focus:border-emerald-400 transition-all resize-none text-[#64748b] leading-relaxed"
              />
            </div>
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasInsurance}
                  onChange={(e) => setF("hasInsurance", e.target.checked)}
                  className="w-4 h-4 rounded border-[#e2e8f0] text-[#1e3a5f] focus:ring-[#1e3a5f]"
                />
                <span className="text-sm font-medium text-[#0f172a]">
                  {lang === "fa" ? "بیمه قرارداد" : "Contract Insurance"}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasSubstitute}
                  onChange={(e) => setF("hasSubstitute", e.target.checked)}
                  className="w-4 h-4 rounded border-[#e2e8f0] text-[#1e3a5f] focus:ring-[#1e3a5f]"
                />
                <span className="text-sm font-medium text-[#0f172a]">
                  {lang === "fa" ? "ادمین جایگزین" : "Substitute Admin"}
                </span>
              </label>
            </div>
          </div>
        )}

        {step === 5 && (
          <ContractReviewStep
            form={form}
            admins={admins}
            lang={lang}
            tr={tr}
            error={error}
            onDownloadPdf={() => {
              const admin = admins.find((a) => a.id === form.adminId)
              const lines = buildContractPdfLines({
                employerName: form.employerName,
                employerCo: form.employerCo,
                adminNameEn: admin?.nameEn || form.adminId,
                platform: form.platform,
                projectTitle: form.projectTitle,
                startDate: form.startDate,
                endDate: form.endDate,
                amount: form.amount,
                currency: form.currency,
                paySchedule: form.paySchedule,
                description: form.description,
                deliverables: form.deliverables,
                termClause: form.termClause,
                subClause: form.subClause,
                hasInsurance: form.hasInsurance,
                hasSubstitute: form.hasSubstitute,
              })
              downloadContractPdf(lines, form.projectTitle)
            }}
            onSubmit={handleSubmit}
            submitting={submitting}
            onViewContracts={() => navigate("/contracts/history")}
          />
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm font-semibold text-[#64748b] hover:bg-[#f2f5fa] disabled:opacity-40 disabled:cursor-not-allowed transition-all btn-press"
        >
          <Icon name="chevronLeft" size={16} className="rtl:rotate-180" />
          {tr.contract.prev}
        </button>
        {step < totalSteps ? (
          <button
            onClick={() => setStep(Math.min(totalSteps, step + 1))}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e3a5f] text-white text-sm font-bold hover:bg-[#122435] transition-colors shadow-md btn-press"
          >
            {tr.contract.next}
            <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
