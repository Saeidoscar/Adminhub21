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
  const admin = form.adminNameEn
  const lines = [
    "CONTRACT",
    "=".repeat(40),
    "",
    `Employer: ${form.employerName}${
      form.employerCo ? ` (${form.employerCo})` : ""
    }`,
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
  const safeTitle = projectTitle.trim() || "untitled"
  const w = window.open("", "_blank", "width=840,height=1024")
  if (!w) {
    // Pop-up blocked: fall back to a downloadable text copy.
    const blob = new Blob([lines.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `contract-${safeTitle.replace(/\s+/g, "-").toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return
  }
  const html = lines
    .map((line) => {
      const esc = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
      if (/^={3,}$/.test(line)) return ""
      return `<p>${esc || "&nbsp;"}</p>`
    })
    .join("")
  w.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${safeTitle}</title>` +
      `<style>body{font-family:Georgia,'Times New Roman',serif;max-width:720px;margin:48px auto;line-height:1.6;color:#0f172a}` +
      `p:first-of-type{font-size:22px;font-weight:700;text-align:center;text-transform:uppercase;letter-spacing:.08em}` +
      `@media print{body{margin:0}}</style></head><body>${html}</body></html>`,
  )
  w.document.close()
  w.focus()
  w.print()
}
