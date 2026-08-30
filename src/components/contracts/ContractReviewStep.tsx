import { type Lang } from "../../i18n"
import { Icon } from "../../components/layout/Icon"
import type { ContractFormValues } from "../../domain/contract/contractFormSchema"
import type { AdminProfile } from "@adminhub/shared"
import { buildContractPdfLines, downloadContractPdf } from "../../domain/contract/generateContractPdf"

interface ContractReviewStepProps {
  form: ContractFormValues
  admins: AdminProfile[]
  lang: Lang
  tr: typeof import("../../i18n").t["en"]
  error: string | null
  onDownloadPdf: () => void
  onSubmit: () => void
  submitting: boolean
  onViewContracts: () => void
}

export function ContractReviewStep({
  form,
  admins,
  lang,
  tr,
  error,
  onDownloadPdf,
  onSubmit,
  submitting,
  onViewContracts,
}: ContractReviewStepProps) {
  const admin = admins.find((a) => a.id === form.adminId)

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-[#0f172a] text-lg">
          {tr.contract.contractPreview}
        </h2>
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
          {lang === "fa" ? "آماده برای امضا" : "Ready for Signing"}
        </span>
      </div>
      <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-6 text-sm leading-relaxed text-[#0f172a] font-mono space-y-4 max-h-80 overflow-y-auto">
        <div className="text-center font-bold text-base text-[#1e3a5f] pb-4 border-b border-[#e2e8f0]">
          {tr.contract.partiesTitle}
        </div>
        <p>
          {tr.contract.between} <strong>{form.employerName}</strong>{" "}
          {form.employerCo ? `(${form.employerCo})` : ""},{" "}
          {tr.contract.partyEmployer},<br />
          {tr.contract.and}{" "}
          <strong>{admin?.nameEn || form.adminId}</strong>,{" "}
          {tr.contract.partyAdmin}.
        </p>
        <p>
          <strong>{lang === "fa" ? "پروژه:" : "Project:"}</strong>{" "}
          {form.projectTitle}
        </p>
        <p>
          <strong>{lang === "fa" ? "مدت:" : "Duration:"}</strong>{" "}
          {form.startDate} → {form.endDate}
        </p>
        <p>
          <strong>{lang === "fa" ? "توضیحات:" : "Description:"}</strong>
          <br />
          {form.description}
        </p>
        <p>
          <strong>{lang === "fa" ? "تحویلی‌ها:" : "Deliverables:"}</strong>
          <br />
          {form.deliverables.split("\n").map((d, i) => (
            <span key={i}>
              • {d}
              <br />
            </span>
          ))}
        </p>
        <p>
          <strong>{lang === "fa" ? "پرداخت:" : "Payment:"}</strong>{" "}
          {form.amount}{" "}
          {form.currency === "toman" ? tr.contract.toman : tr.contract.usd}
        </p>
        <p>
          <strong>{lang === "fa" ? "بند فسخ:" : "Termination:"}</strong>
          <br />
          {form.termClause}
        </p>
        <p>
          <strong>
            {lang === "fa"
              ? "بیمه و جایگزینی:"
              : "Substitution & Insurance:"}
          </strong>
          <br />
          {form.subClause}
        </p>
        <p>
          <strong>{lang === "fa" ? "بیمه:" : "Insurance:"}</strong>{" "}
          {form.hasInsurance
            ? lang === "fa"
              ? "بله"
              : "Yes"
            : lang === "fa"
              ? "خیر"
              : "No"}
        </p>
        <p>
          <strong>{lang === "fa" ? "جایگزین:" : "Substitute:"}</strong>{" "}
          {form.hasSubstitute
            ? lang === "fa"
              ? "بله"
              : "Yes"
            : lang === "fa"
              ? "خیر"
              : "No"}
        </p>
      </div>
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <button
          onClick={onDownloadPdf}
          className="py-3 rounded-xl border-2 border-[#1e3a5f] text-[#1e3a5f] text-sm font-bold hover:bg-[#1e3a5f]/5 transition-colors btn-press"
        >
          {tr.contract.downloadPdf}
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="py-3 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors shadow-md btn-press disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting
            ? (lang === "fa" ? "در حال ارسال..." : "Sending...")
            : tr.contract.sendForSigning}
        </button>
      </div>
      <div className="mt-4 text-center">
        <button
          onClick={onViewContracts}
          className="text-sm text-[#1e3a5f] font-semibold hover:underline"
        >
          {lang === "fa" ? "مشاهده قراردادهای من" : "View My Contracts"}
        </button>
      </div>
    </div>
  )
}
