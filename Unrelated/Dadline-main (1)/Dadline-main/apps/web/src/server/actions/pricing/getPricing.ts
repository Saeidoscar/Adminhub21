"use server"

import type { PricingData } from "@/@types/pricing"
import { apiGet } from "@/lib/apiClient"
import { pricingResponseSchema } from "./pricing.schemas"

type PricingResult = {
  pricing: PricingData | null
  error: string | null
}

export async function getPricing(): Promise<PricingResult> {
  const response = await apiGet<unknown>("/public/pricing", undefined, {
    revalidate: 300,
    tags: ["public:pricing"],
  })

  if (!response.ok || !response.data) {
    return {
      pricing: null,
      error: response.error ?? "دریافت تعرفه خدمات در حال حاضر امکان‌پذیر نیست.",
    }
  }

  const parsed = pricingResponseSchema.safeParse(response.data)

  if (!parsed.success) {
    return {
      pricing: null,
      error: "پاسخ تعرفه‌ها از سرور معتبر نیست.",
    }
  }

  return { pricing: parsed.data, error: null }
}
