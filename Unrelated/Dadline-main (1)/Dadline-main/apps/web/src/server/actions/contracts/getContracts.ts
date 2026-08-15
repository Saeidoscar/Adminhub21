"use server"

import type {
  Contract,
  ContractAiPricing,
  ContractBasePricing,
  ContractListParams,
  ContractPagination,
  ContractPricingQuote,
  PublicContractPreview,
  PublicContractVerification,
} from "@/@types/contracts"
import { apiGet, apiPost } from "@/lib/apiClient"
import getServerSession from "@/server/actions/auth/getServerSession"
import {
  contractListResponseSchema,
  contractAiPricingResponseSchema,
  contractBasePricingResponseSchema,
  contractPricingResponseSchema,
  contractResponseSchema,
  publicContractPreviewResponseSchema,
  publicContractVerificationResponseSchema,
} from "./contracts.schemas"

const parseError = "پاسخ قراردادها از سرور معتبر نیست."

type FreshOptions = {
  forceFresh?: boolean
}

export async function getContracts(
  params: ContractListParams,
): Promise<{
  items: Contract[]
  pagination: ContractPagination
  error: string | null
  status: number
}> {
  const session = await getServerSession()
  if (!session?.accessToken)
    return listFailure("برای مشاهده قراردادها وارد شوید.", 401)

  const query = new URLSearchParams()
  if (params.q) query.set("q", params.q)
  if (params.status && params.status !== "all")
    query.set("status", params.status)
  if (params.dateFrom) query.set("date_from", params.dateFrom)
  if (params.dateTo) query.set("date_to", params.dateTo)
  query.set("page", String(params.page ?? 1))
  query.set("per_page", String(params.perPage ?? 10))

  const response = await apiGet<unknown>(
    `/contracts?${query.toString()}`,
    session.accessToken,
    { revalidate: false, tags: ["contracts:list"] },
  )
  if (!response.ok || !response.data)
    return listFailure(response.error, response.status)

  const parsed = contractListResponseSchema.safeParse(response.data)
  if (!parsed.success) return listFailure(parseError, 422)

  return {
    items: parsed.data.data as Contract[],
    pagination: {
      currentPage: parsed.data.meta.current_page,
      lastPage: parsed.data.meta.last_page,
      perPage: parsed.data.meta.per_page,
      total: parsed.data.meta.total,
    },
    error: null,
    status: response.status,
  }
}

export async function getContract(
  uuid: string,
  options?: FreshOptions,
): Promise<{
  contract: Contract | null
  error: string | null
  notFound: boolean
  status: number
}> {
  const session = await getServerSession()
  if (!session?.accessToken) {
    return {
      contract: null,
      error: "برای مشاهده قرارداد وارد شوید.",
      notFound: false,
      status: 401,
    }
  }

  const response = await apiGet<unknown>(
    `/contracts/${encodeURIComponent(uuid)}`,
    session.accessToken,
    {
      revalidate: false,
      tags: [`contracts:${uuid}`],
      noStore: options?.forceFresh,
    },
  )

  if (response.status === 404)
    return { contract: null, error: null, notFound: true, status: 404 }
  if (!response.ok || !response.data) {
    return {
      contract: null,
      error: response.error,
      notFound: false,
      status: response.status,
    }
  }

  const parsed = contractResponseSchema.safeParse(response.data)
  if (!parsed.success)
    return { contract: null, error: parseError, notFound: false, status: 422 }

  return {
    contract: parsed.data.data as Contract,
    error: null,
    notFound: false,
    status: response.status,
  }
}

export async function getContractBasePricing(): Promise<{
  pricing: ContractBasePricing | null
  error: string | null
}> {
  const response = await apiGet<unknown>(
    "/public/contracts/pricing",
    undefined,
    {
      revalidate: 300,
    },
  )
  if (!response.ok || !response.data) {
    return { pricing: null, error: response.error }
  }

  const parsed = contractBasePricingResponseSchema.safeParse(response.data)
  if (!parsed.success) return { pricing: null, error: parseError }

  const data = parsed.data.data

  return {
    pricing: {
      baseAmount: data.base_amount,
      includedParties: data.included_parties,
      extraPartyRate: data.extra_party_rate,
      currency: data.currency,
      currencyLabel: data.currency_label,
    },
    error: null,
  }
}

export async function getContractPricing(
  uuid: string,
  options?: FreshOptions,
): Promise<{
  quote: ContractPricingQuote | null
  error: string | null
  status: number
}> {
  const session = await getServerSession()
  if (!session?.accessToken) {
    return { quote: null, error: "برای مشاهده قیمت وارد شوید.", status: 401 }
  }

  const response = await apiGet<unknown>(
    `/contracts/${encodeURIComponent(uuid)}/pricing`,
    session.accessToken,
    { revalidate: false, noStore: options?.forceFresh },
  )
  if (!response.ok || !response.data) {
    return { quote: null, error: response.error, status: response.status }
  }

  const parsed = contractPricingResponseSchema.safeParse(response.data)
  if (!parsed.success) return { quote: null, error: parseError, status: 422 }

  const data = parsed.data.data

  return {
    quote: {
      baseAmount: data.base_amount,
      includedParties: data.included_parties,
      partiesCount: data.parties_count,
      extraParties: data.extra_parties,
      extraPartyRate: data.extra_party_rate,
      extraAmount: data.extra_amount,
      totalAmount: data.total_amount,
      currency: data.currency,
      currencyLabel: data.currency_label,
    },
    error: null,
    status: response.status,
  }
}

export async function getContractAiPricing(
  uuid: string,
): Promise<{
  pricing: ContractAiPricing | null
  error: string | null
}> {
  const session = await getServerSession()
  if (!session?.accessToken) {
    return { pricing: null, error: "برای مشاهده قیمت وارد شوید." }
  }

  const response = await apiGet<unknown>(
    `/contracts/${encodeURIComponent(uuid)}/ai/pricing`,
    session.accessToken,
    { revalidate: false },
  )
  if (!response.ok || !response.data) {
    return { pricing: null, error: response.error }
  }

  const parsed = contractAiPricingResponseSchema.safeParse(response.data)
  if (!parsed.success) return { pricing: null, error: parseError }

  const data = parsed.data.data

  return {
    pricing: {
      analysisAmount: data.analysis_amount,
      rewriteAmount: data.rewrite_amount,
      currency: data.currency,
      currencyLabel: data.currency_label,
    },
    error: null,
  }
}

export async function getPublicContractPreview(
  uuid: string,
): Promise<{
  preview: PublicContractPreview | null
  error: string | null
  notFound: boolean
}> {
  const response = await apiGet<unknown>(
    `/public/contracts/preview/${encodeURIComponent(uuid)}`,
    undefined,
    { revalidate: false },
  )

  if (response.status === 404)
    return { preview: null, error: null, notFound: true }
  if (!response.ok || !response.data) {
    return { preview: null, error: response.error, notFound: false }
  }

  const parsed = publicContractPreviewResponseSchema.safeParse(response.data)
  if (!parsed.success)
    return { preview: null, error: parseError, notFound: false }

  return {
    preview: parsed.data.data as PublicContractPreview,
    error: null,
    notFound: false,
  }
}

export async function verifyPublicContractPin(
  uuid: string,
  pinCode: string,
): Promise<{
  preview: PublicContractPreview | null
  error: string | null
}> {
  const response = await apiPost<unknown>(
    `/public/contracts/preview/${encodeURIComponent(uuid)}/verify-pin`,
    { pin_code: pinCode },
  )
  if (!response.ok || !response.data) {
    return { preview: null, error: response.error }
  }

  const parsed = publicContractPreviewResponseSchema.safeParse(response.data)
  if (!parsed.success) return { preview: null, error: parseError }

  const preview = parsed.data.data as PublicContractPreview

  if (!preview.verified) {
    return { preview: null, error: "کد PIN واردشده صحیح نیست." }
  }

  return { preview, error: null }
}

export async function getPublicContractVerification(
  trackingCode: string,
): Promise<{
  verification: PublicContractVerification | null
  error: string | null
  notFound: boolean
}> {
  const response = await apiGet<unknown>(
    `/public/contracts/${encodeURIComponent(trackingCode)}/verification`,
    undefined,
    { revalidate: false },
  )

  if (response.status === 404) {
    return { verification: null, error: null, notFound: true }
  }

  if (!response.ok || !response.data) {
    return { verification: null, error: response.error, notFound: false }
  }

  const parsed = publicContractVerificationResponseSchema.safeParse(
    response.data,
  )
  if (!parsed.success) {
    return { verification: null, error: parseError, notFound: false }
  }

  return {
    verification: parsed.data.data as PublicContractVerification,
    error: null,
    notFound: false,
  }
}

function listFailure(error: string | null, status: number) {
  return {
    items: [] as Contract[],
    pagination: {
      currentPage: 1,
      lastPage: 1,
      perPage: 10,
      total: 0,
    },
    error,
    status,
  }
}
