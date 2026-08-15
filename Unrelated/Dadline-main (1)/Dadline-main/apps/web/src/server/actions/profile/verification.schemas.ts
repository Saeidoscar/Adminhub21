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

export const verificationLevelOneSchema = z.object({
  nationalId: z
    .string()
    .trim()
    .transform((value) => toEnglishDigits(value).replace(/\D/g, ""))
    .refine((value) => /^\d{10}$/.test(value), {
      message: "کد ملی باید ۱۰ رقم باشد.",
    }),
})

export const verificationLevelTwoSchema = z.object({
  birthDate: z
    .string()
    .trim()
    .transform((value) => toEnglishDigits(value).replace(/\//g, "-"))
    .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "تاریخ تولد را کامل انتخاب کنید.",
    }),
})

export type VerificationLevelOneValues = z.infer<typeof verificationLevelOneSchema>
export type VerificationLevelTwoValues = z.infer<typeof verificationLevelTwoSchema>

export type UserVerificationPayload = {
  user: {
    mobile: string
  }
  profile: {
    nationalId: string | null
    birthDate: string | null
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
    bankVerified: boolean
    bankVerifiedAt: string | null
    renewalMessage: string | null
  }
  pricing: {
    levelOneCost: number
    levelTwoCost: number
    levelThreeDepositAmount: number
    currency: string
    currencyLabel: string
  }
  wallet: {
    balance: number
    withdrawableBalance: number
    blockedBalance: number
  }
  apiToken: {
    enabled: boolean
    createdAt: string | null
    lastUsedAt: string | null
    plainTextToken: string | null
  }
}

export type VerificationActionField = keyof VerificationLevelOneValues | keyof VerificationLevelTwoValues | "bankVerification" | "apiToken"

export type VerificationActionState = {
  status: "idle" | "success" | "error"
  message: string | null
  token?: string | null
  requiresGateway?: boolean
  paymentUrl?: string | null
  fieldErrors?: Partial<Record<VerificationActionField, string[]>>
}
