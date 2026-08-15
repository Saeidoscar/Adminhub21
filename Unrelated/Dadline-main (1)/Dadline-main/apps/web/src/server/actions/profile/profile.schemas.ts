import { z } from "zod"

const toEnglishDigits = (value: string) =>
  value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const map: Record<string, string> = {
      "۰": "0",
      "۱": "1",
      "۲": "2",
      "۳": "3",
      "۴": "4",
      "۵": "5",
      "۶": "6",
      "۷": "7",
      "۸": "8",
      "۹": "9",
      "٠": "0",
      "١": "1",
      "٢": "2",
      "٣": "3",
      "٤": "4",
      "٥": "5",
      "٦": "6",
      "٧": "7",
      "٨": "8",
      "٩": "9",
    }

    return map[digit] ?? digit
  })

export const profileFormSchema = z.object({
  firstName: z.string().trim().min(1, "نام را وارد کنید.").max(80),
  lastName: z.string().trim().min(1, "نام خانوادگی را وارد کنید.").max(80),
  email: z
    .string()
    .trim()
    .transform((value) => value || null)
    .pipe(z.string().email("ایمیل معتبر نیست.").nullable()),
  nationalId: z
    .string()
    .trim()
    .transform((value) => toEnglishDigits(value).replace(/\D/g, ""))
    .refine((value) => value === "" || /^\d{10}$/.test(value), {
      message: "کد ملی باید ۱۰ رقم باشد.",
    })
    .transform((value) => value || null),
  birthDate: z
    .string()
    .trim()
    .transform((value) => toEnglishDigits(value).replace(/\//g, "-"))
    .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "تاریخ تولد را با قالب ۱۳۷۰-۰۱-۰۱ وارد کنید.",
    })
    .transform((value) => value || null),
  cityId: z
    .string()
    .trim()
    .transform((value) => (value ? Number(value) : null))
    .refine((value) => value === null || Number.isInteger(value), {
      message: "شهر انتخاب‌شده معتبر نیست.",
    }),
})

export const bankAccountFormSchema = z.object({
  iban: z
    .string()
    .trim()
    .transform((value) =>
      toEnglishDigits(value).replace(/\s/g, "").toUpperCase(),
    )
    .refine((value) => /^IR\d{24}$/.test(value), {
      message: "شماره شبا باید با IR شروع شود و ۲۴ رقم داشته باشد.",
    }),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>
export type BankAccountFormValues = z.infer<typeof bankAccountFormSchema>

type ProfileActionField = keyof ProfileFormValues | keyof BankAccountFormValues

export type UserProfilePayload = {
  user: {
    id: number
    firstName: string
    lastName: string
    fullName: string
    mobile: string
    email: string | null
    role: string
    roleLabel: string
    isVendor: boolean
    registeredAt: string | null
    lastLoginAt: string | null
  }
  profile: {
    nationalId: string | null
    birthDate: string | null
    iban: string | null
    cityId: number | null
    cityName: string | null
    provinceName: string | null
    avatarId: number | null
    avatarUrl: string | null
    signatureId: number | null
    signatureUrl: string | null
  }
  verification: {
    verifiedLevel: number
    activeVerifiedLevel: number
    mobileVerified: boolean
    mobileVerifiedAt: string | null
    mobileExpiresAt: string | null
    mobileExpired: boolean
    nationalVerified: boolean
    nationalVerifiedAt: string | null
    nationalExpiresAt: string | null
    nationalExpired: boolean
    needsRenewal: boolean
    identityLocked: boolean
    identityLockedAt: string | null
    ibanVerified: boolean
    ibanVerifiedAt: string | null
    bankVerified: boolean
    bankVerifiedAt: string | null
  }
  pricing: {
    ibanVerificationCost: number
    currency: string
    currencyLabel: string
  }
  wallet: {
    balance: number
    withdrawableBalance: number
    blockedBalance: number
    status: string | null
  }
  subscription: {
    plan: string | null
    expiresAt: string | null
  }
  notificationPreferences: {
    smsEnabled: boolean
    botEnabled: boolean
    pushEnabled: boolean
    eitaaEnabled: boolean
    baleEnabled: boolean
    smsBalance: number
  }
}

export type ProfileActionState = {
  status: "idle" | "success" | "error"
  message: string | null
  fieldErrors?: Partial<Record<ProfileActionField, string[]>>
  requiresGateway?: boolean
  paymentUrl?: string | null
}
