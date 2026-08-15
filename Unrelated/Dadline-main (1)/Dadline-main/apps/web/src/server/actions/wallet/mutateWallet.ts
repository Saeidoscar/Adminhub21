"use server"

import { apiPost } from "@/lib/apiClient"
import getServerSession from "@/server/actions/auth/getServerSession"
import { revalidatePath } from "next/cache"
import {
  giftCardCreateResponseSchema,
  toEnglishDigits,
  walletActionResponseSchema,
  walletChargeResponseSchema,
  type WalletMutationState,
} from "./wallet.schemas"

const successState = (
  message: string,
  giftCode: string | null = null,
): WalletMutationState => ({
  status: "success",
  message,
  giftCode,
})

const errorState = (
  message: string | null,
  fieldErrors?: WalletMutationState["fieldErrors"],
): WalletMutationState => ({
  status: "error",
  message: message ?? "خطایی رخ داد، دوباره تلاش کنید.",
  fieldErrors,
})

const giftCardCreateErrorState = (
  message: string | null,
): WalletMutationState => {
  if (message === "validation.unique") {
    return errorState("این کد کارت هدیه قبلاً ثبت شده است.", {
      giftCode: ["این کد کارت هدیه قبلاً ثبت شده است."],
    })
  }

  if (message === "validation.after") {
    return errorState("تاریخ انقضا باید بعد از امروز باشد.", {
      expiresAt: ["تاریخ انقضا باید بعد از امروز باشد."],
    })
  }

  return errorState(message)
}

export async function chargeWallet(
  _prevState: WalletMutationState,
  formData: FormData,
): Promise<WalletMutationState> {
  const session = await getServerSession()
  if (!session?.accessToken) return errorState("برای شارژ کیف پول وارد شوید.")

  const amount = amountFromForm(formData)
  const gateway = String(formData.get("gateway") ?? "smart")

  if (!Number.isInteger(amount) || amount < 10000) {
    return errorState("مبلغ شارژ باید حداقل ۱۰٬۰۰۰ تومان باشد.", {
      amount: ["مبلغ شارژ معتبر نیست."],
    })
  }

  if (gateway === "snapp_pay" && amount < 1000000) {
    return errorState(
      "شارژ قسطی با اسنپ‌پی از ۱٬۰۰۰٬۰۰۰ تومان به بالا فعال است.",
      {
        amount: ["حداقل مبلغ اسنپ‌پی رعایت نشده است."],
      },
    )
  }

  const response = await apiPost<unknown>(
    "/users/me/wallet/charges",
    { amount, gateway },
    session.accessToken,
  )
  if (!response.ok || !response.data) return errorState(response.error)

  const parsed = walletChargeResponseSchema.safeParse(response.data)
  if (!parsed.success) return errorState("پاسخ سرور معتبر نیست.")

  revalidatePath("/pishkhan/wallet")

  return {
    status: "success",
    message: parsed.data.message,
    paymentUrl: parsed.data.data.paymentUrl,
  }
}

const amountFromForm = (formData: FormData) =>
  Number(
    toEnglishDigits(String(formData.get("amount") ?? "")).replace(/\D/g, ""),
  )

export async function requestWalletWithdrawal(
  _prevState: WalletMutationState,
  formData: FormData,
): Promise<WalletMutationState> {
  const session = await getServerSession()
  if (!session?.accessToken) return errorState("برای ثبت برداشت وارد شوید.")

  const amount = amountFromForm(formData)
  if (!Number.isInteger(amount) || amount < 10000) {
    return errorState("مبلغ برداشت باید حداقل ۱۰٬۰۰۰ تومان باشد.", {
      amount: ["مبلغ برداشت معتبر نیست."],
    })
  }

  const response = await apiPost<unknown>(
    "/users/me/wallet/withdrawals",
    { amount },
    session.accessToken,
  )
  if (!response.ok || !response.data) return errorState(response.error)

  const parsed = walletActionResponseSchema.safeParse(response.data)
  if (!parsed.success) return errorState("پاسخ سرور معتبر نیست.")

  revalidatePath("/pishkhan/wallet")

  return successState(parsed.data.message)
}

export async function redeemGiftCard(
  _prevState: WalletMutationState,
  formData: FormData,
): Promise<WalletMutationState> {
  const session = await getServerSession()
  if (!session?.accessToken) return errorState("برای ثبت کارت هدیه وارد شوید.")

  const code = String(formData.get("code") ?? "").trim()
  if (!code) {
    return errorState("کد هدیه را وارد کنید.", {
      code: ["کد هدیه الزامی است."],
    })
  }

  const response = await apiPost<unknown>(
    "/users/me/wallet/gift-cards/redeem",
    { code },
    session.accessToken,
  )
  if (!response.ok || !response.data) return errorState(response.error)

  const parsed = walletActionResponseSchema.safeParse(response.data)
  if (!parsed.success) return errorState("پاسخ سرور معتبر نیست.")

  revalidatePath("/pishkhan/wallet")

  return successState(parsed.data.message)
}

export async function createGiftCard(
  _prevState: WalletMutationState,
  formData: FormData,
): Promise<WalletMutationState> {
  const session = await getServerSession()
  if (!session?.accessToken) return errorState("برای ساخت کارت هدیه وارد شوید.")

  const amount = amountFromForm(formData)
  const code = String(formData.get("giftCode") ?? "").trim()
  const redemptionLimit = Number(
    toEnglishDigits(String(formData.get("redemptionLimit") ?? "")).replace(
      /\D/g,
      "",
    ),
  )
  const expiresAt = String(formData.get("expiresAt") ?? "").trim() || null

  const fieldErrors: WalletMutationState["fieldErrors"] = {}
  if (!Number.isInteger(amount) || amount < 10000)
    fieldErrors.amount = ["مبلغ کارت هدیه معتبر نیست."]
  if (!Number.isInteger(redemptionLimit) || redemptionLimit < 1)
    fieldErrors.redemptionLimit = ["تعداد استفاده معتبر نیست."]
  if (code && code.length < 4)
    fieldErrors.giftCode = ["کد کارت هدیه باید حداقل ۴ کاراکتر باشد."]

  if (Object.keys(fieldErrors).length > 0) {
    return errorState("اطلاعات کارت هدیه را کامل کنید.", fieldErrors)
  }

  const response = await apiPost<unknown>(
    "/users/me/wallet/gift-cards",
    {
      amount,
      code: code || null,
      redemption_limit: redemptionLimit,
      expires_at: expiresAt,
    },
    session.accessToken,
  )
  if (!response.ok || !response.data)
    return giftCardCreateErrorState(response.error)

  const parsed = giftCardCreateResponseSchema.safeParse(response.data)
  if (!parsed.success) return errorState("پاسخ سرور معتبر نیست.")

  revalidatePath("/pishkhan/wallet")

  return successState(parsed.data.message, parsed.data.data.code)
}
