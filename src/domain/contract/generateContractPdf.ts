export function buildContractPdfLines(form: {
  employerName: string
  employerCo?: string
  adminNameEn: string
  platform: string
  projectTitle: string
  startDate?: string
  endDate?: string
  amount: string
  currency: string
  paySchedule: string
  description: string
  deliverables: string
  termClause: string
  subClause: string
  hasInsurance: boolean
  hasSubstitute: boolean
}): string[] {
  const admin = form.adminNameEn || form.adminId
  const lines = [
    "CONTRACT",
    "=".repeat(40),
    "",
    `Employer: ${form.employerName}${form.employerCo ? ` (${form.employerCo})` : ""}`,
    `Admin: ${admin}`,
    `Platform: ${form.platform}`,
    `Project: ${form.projectTitle}`,
    `Duration: ${form.startDate || "..."} → ${form.endDate || "..."}`,
    `Payment: ${form.amount} ${form.currency === "toman" ? "Toman" : "USD"}`,
    `Pay Schedule: ${form.paySchedule}`,
    "",
    "DESCRIPTION",
    form.description,
    "",
    "DELIVERABLES",
    form.deliverables,
    "",
    "TERMINATION CLAUSE",
    form.termClause,
    "",
    "SUBSTITUTION & INSURANCE",
    form.subClause,
    `Insurance: ${form.hasInsurance ? "Yes" : "No"}`,
    `Substitute: ${form.hasSubstitute ? "Yes" : "No"}`,
  ]
  return lines
}

export function downloadContractPdf(lines: string[], projectTitle: string) {
  const blob = new Blob([lines.join("\n")], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `contract-${projectTitle.replace(/\s+/g, "-").toLowerCase()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
