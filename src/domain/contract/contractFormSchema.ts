import { z } from "zod"

export const contractFormSchema = z.object({
  employerName: z.string().min(1, "Required"),
  employerCo: z.string().optional(),
  adminId: z.string().min(1, "Select an admin"),
  platform: z.string().min(1, "Select a platform"),
  projectTitle: z.string().min(1, "Required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().min(1, "Required"),
  deliverables: z.string().min(1, "Required"),
  payType: z.enum(["monthly", "hourly", "project"]),
  amount: z.string().min(1, "Required"),
  currency: z.enum(["toman", "usd"]),
  paySchedule: z.enum(["weekly", "biweekly", "payMonthly", "upfront"]),
  termClause: z.string().optional(),
  subClause: z.string().optional(),
  hasInsurance: z.boolean(),
  hasSubstitute: z.boolean(),
})

export type ContractFormValues = z.infer<typeof contractFormSchema>

export function createDefaultContractForm(
  lang: "fa" | "en",
  termDefault: string,
  subDefault: string,
): ContractFormValues {
  return {
    employerName: lang === "fa" ? "علی رضایی" : "Ali Rezaei",
    employerCo: lang === "fa" ? "استارتاپ پارسه" : "Parseh Startup",
    adminId: "",
    platform: "instagram",
    projectTitle:
      lang === "fa"
        ? "مدیریت صفحه اینستاگرام برند"
        : "Brand Instagram Page Management",
    startDate: "2026-09-01",
    endDate: "2026-12-01",
    description:
      lang === "fa"
        ? "مدیریت کامل صفحه اینستاگرام برند شامل تولید محتوا، پست‌گذاری روزانه، پاسخ به کامنت‌ها و گزارش‌دهی هفتگی."
        : "Full management of brand Instagram including content creation, daily posting, comment replies and weekly reporting.",
    deliverables:
      lang === "fa"
        ? "۳۰ پست در ماه\n۱۰۰ استوری در ماه\nگزارش هفتگی آنالیتیکس\nمدیریت روزانه DM‌ها"
        : "30 posts/month\n100 stories/month\nWeekly analytics report\nDaily DM management",
    payType: "monthly",
    amount: lang === "fa" ? "4500000" : "108",
    currency: lang === "fa" ? "toman" : "usd",
    paySchedule: "payMonthly",
    termClause: termDefault,
    subClause: subDefault,
    hasInsurance: false,
    hasSubstitute: false,
  }
}

export function validateContractForm(form: ContractFormValues): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!form.employerName.trim()) errors.employerName = "Required"
  if (!form.projectTitle.trim()) errors.projectTitle = "Required"
  if (!form.description.trim()) errors.description = "Required"
  const amountNum = Number(form.amount)
  if (isNaN(amountNum) || amountNum < 0) errors.amount = "Invalid amount"
  if (!form.adminId) errors.adminId = "Select an admin"
  if (!form.platform) errors.platform = "Select a platform"
  return errors
}
