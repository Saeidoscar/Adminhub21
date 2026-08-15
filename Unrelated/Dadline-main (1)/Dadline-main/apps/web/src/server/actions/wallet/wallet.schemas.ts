import { z } from "zod"

export const toEnglishDigits = (value: string) =>
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

const nullableIsoDate = z.string().nullable()

export const walletDirectionSchema = z.enum(["deposit", "withdrawal"])

export const walletStatusSchema = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
  "reversed",
])

export const settlementStatusSchema = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
])

export const walletTypeSchema = z.enum([
  "online_charge",
  "submit_case",
  "handling_case_income",
  "handling_case_cost",
  "gift_card",
  "verify_cost",
  "contract_cost",
  "fee_difference",
  "buy_dadcoin",
  "sell_dadcoin",
  "submit_question",
  "submit_vendor_req",
  "handling_doc_cost",
  "submit_legal_doc_cost",
  "submit_counseling_phone",
  "handling_doc_income",
  "deposit_income",
  "sell_document",
  "buy_document",
  "handling_lawlink_cost",
  "submit_lawlink",
  "marketing",
  "buy_ai_token",
  "submit_answer_on_question",
  "premium_buy",
  "sms_charge",
  "cancel_service",
  "contract_ai",
])

export const settlementSchema = z.object({
  id: z.number(),
  transactionId: z.number(),
  amount: z.number(),
  fee: z.number(),
  totalPayable: z.number(),
  iban: z.string(),
  receiptLink: z.string().nullable(),
  trackId: z.string().nullable(),
  status: settlementStatusSchema,
  statusLabel: z.string(),
  paidAt: nullableIsoDate,
  createdAt: nullableIsoDate,
})

export const giftCardSchema = z.object({
  id: z.number(),
  code: z.string(),
  amount: z.number(),
  redemptionLimit: z.number(),
  redeemedCount: z.number(),
  expiresAt: nullableIsoDate,
  createdAt: nullableIsoDate,
})

export const walletDashboardResponseSchema = z.object({
  data: z.object({
    summary: z.object({
      balance: z.number(),
      withdrawableBalance: z.number(),
      blockedBalance: z.number(),
      status: z.string().nullable(),
      activeVerifiedLevel: z.number(),
      isLevelTwoVerified: z.boolean(),
      iban: z.string().nullable(),
      bankVerified: z.boolean(),
      hasActiveSubscription: z.boolean(),
      subscriptionPlan: z.string().nullable(),
      subscriptionExpiresAt: nullableIsoDate,
    }),
    stats: z.object({
      totalDeposits: z.number(),
      totalWithdrawals: z.number(),
      netAmount: z.number(),
      pendingAmount: z.number(),
      completedAmount: z.number(),
      transactionCount: z.number(),
      byType: z.array(
        z.object({
          type: z.string().nullable(),
          typeLabel: z.string(),
          amount: z.number(),
          count: z.number(),
        }),
      ),
    }),
    transactions: z.object({
      data: z.array(
        z.object({
          id: z.number(),
          amount: z.number(),
          direction: walletDirectionSchema,
          directionLabel: z.string(),
          type: walletTypeSchema.nullable(),
          typeLabel: z.string(),
          status: walletStatusSchema,
          statusLabel: z.string(),
          createdAt: nullableIsoDate,
          settlement: settlementSchema.nullable(),
        }),
      ),
      current_page: z.number(),
      last_page: z.number(),
      per_page: z.number(),
      total: z.number(),
    }),
    settlements: z.array(settlementSchema),
    giftCards: z.array(giftCardSchema).default([]),
    settlementFee: z.number().default(0),
  }),
})

export const walletActionResponseSchema = z.object({
  message: z.string(),
})

export const walletChargeResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    paymentId: z.number(),
    paymentUrl: z.string().nullable(),
    gateway: z.string(),
    gatewayToken: z.string().nullable(),
  }),
})

export const giftCardCreateResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    code: z.string(),
    amount: z.number(),
    redemptionLimit: z.number(),
    expiresAt: nullableIsoDate,
  }),
})

export type WalletMutationState = {
  status: "idle" | "success" | "error"
  message: string | null
  giftCode?: string | null
  paymentUrl?: string | null
  fieldErrors?: Partial<Record<"amount" | "code" | "redemptionLimit" | "expiresAt" | "giftCode", string[]>>
}
