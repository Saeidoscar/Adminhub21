"use server"

import type { Contract, ContractFormValues } from "@/@types/contracts"
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/apiClient"
import getServerSession from "@/server/actions/auth/getServerSession"
import { revalidatePath, revalidateTag } from "next/cache"
import {
  contractAiPaymentResponseSchema,
  contractPaymentResponseSchema,
  contractAiPricingResponseSchema,
  contractResponseSchema,
  contractSignatureSchema,
} from "./contracts.schemas"

type ActionResult<T = unknown,> = {
  ok: boolean
  data: T | null
  error: string | null
  requiresAuth: boolean
}

type ContractActivationResult = {
  contract: Contract | null
  requiresGateway: boolean
  paymentUrl: string | null
}

type ContractAiOperationResult = {
  summary: string | null
  requiresGateway: boolean
  paymentUrl: string | null
}

export async function createContract(
  values: ContractFormValues,
): Promise<ActionResult<Contract>> {
  const token = await requireToken()
  if (!token) return authRequired()

  const response = await apiPost<unknown>(
    "/contracts",
    {
      title: values.title,
      body: values.body,
    },
    token,
  )
  if (!response.ok || !response.data) return failure(response.error)

  const parsed = contractResponseSchema.safeParse(response.data)
  if (!parsed.success) return failure("پاسخ ایجاد قرارداد معتبر نیست.")

  const contract = parsed.data.data as Contract
  const syncError = await syncContractChildren(contract.uuid, values, token)
  if (syncError) return failure(syncError)

  const refreshed = await loadContract(contract.uuid, token)
  if (!refreshed.ok) return refreshed

  revalidateContracts(contract.uuid)

  return refreshed
}

export async function updateContract(
  uuid: string,
  values: ContractFormValues,
): Promise<ActionResult<Contract>> {
  const token = await requireToken()
  if (!token) return authRequired()

  const response = await apiPatch<unknown>(
    `/contracts/${encodeURIComponent(uuid)}`,
    {
      title: values.title,
      body: values.body,
    },
    token,
  )
  if (!response.ok || !response.data) return failure(response.error)

  const parsed = contractResponseSchema.safeParse(response.data)
  if (!parsed.success) return failure("پاسخ ذخیره قرارداد معتبر نیست.")

  const syncError = await syncContractChildren(uuid, values, token)
  if (syncError) return failure(syncError)

  const refreshed = await loadContract(uuid, token)
  if (!refreshed.ok) return refreshed

  revalidateContracts(uuid)

  return refreshed
}

export async function activateContract(
  uuid: string,
  returnUrl?: string,
  draftValues?: ContractFormValues,
): Promise<ActionResult<ContractActivationResult>> {
  if (draftValues) {
    const saved = await updateContract(uuid, draftValues)
    if (!saved.ok) {
      return failure(saved.error ?? "ذخیره نهایی قرارداد انجام نشد.")
    }
  }

  const token = await requireToken()
  if (!token) return authRequired()

  const response = await apiPost<unknown>(
    `/contracts/${encodeURIComponent(uuid)}/payment`,
    {
      gateway: "smart",
      metadata: { source: "pishkhan_contracts" },
      return_url: returnUrl,
      return_context: "contract_activation",
    },
    token,
  )
  if (!response.ok || !response.data) return failure(response.error)

  const parsed = contractPaymentResponseSchema.safeParse(response.data)
  if (!parsed.success) return failure("پاسخ فعال‌سازی قرارداد معتبر نیست.")

  revalidateContracts(uuid)
  return {
    ok: true,
    data: {
      contract: parsed.data.data.contract as Contract | null ?? null,
      requiresGateway: parsed.data.data.requiresGateway,
      paymentUrl: parsed.data.data.paymentUrl,
    },
    error: null,
    requiresAuth: false,
  }
}

export async function refreshContractPin(
  uuid: string,
): Promise<ActionResult<Contract>> {
  const token = await requireToken()
  if (!token) return authRequired()

  const response = await apiPost<unknown>(
    `/contracts/${encodeURIComponent(uuid)}/pin`,
    {},
    token,
  )
  if (!response.ok || !response.data) return failure(response.error)

  const parsed = contractResponseSchema.safeParse(response.data)
  if (!parsed.success) return failure("پاسخ تغییر PIN معتبر نیست.")

  revalidateContracts(uuid)

  return {
    ok: true,
    data: parsed.data.data as Contract,
    error: null,
    requiresAuth: false,
  }
}

export async function cancelContract(
  uuid: string,
): Promise<ActionResult<Contract>> {
  const token = await requireToken()
  if (!token) return authRequired()

  const response = await apiPost<unknown>(
    `/contracts/${encodeURIComponent(uuid)}/cancel`,
    {},
    token,
  )
  if (!response.ok || !response.data) return failure(response.error)

  const parsed = contractResponseSchema.safeParse(response.data)
  if (!parsed.success) return failure("پاسخ ابطال قرارداد معتبر نیست.")

  revalidateContracts(uuid)

  return {
    ok: true,
    data: parsed.data.data as Contract,
    error: null,
    requiresAuth: false,
  }
}

export async function deleteContract(
  uuid: string,
): Promise<ActionResult<{ message: string }>> {
  const token = await requireToken()
  if (!token) return authRequired()

  const response = await apiDelete<unknown>(
    `/contracts/${encodeURIComponent(uuid)}`,
    token,
  )
  if (!response.ok && response.status !== 404) return failure(response.error)

  revalidatePath("/pishkhan/contracts")
  revalidateTag("contracts:list", "max")

  return {
    ok: true,
    data: { message: "قرارداد پیش‌نویس حذف شد." },
    error: null,
    requiresAuth: false,
  }
}

export async function sendContractInvitations(
  uuid: string,
): Promise<ActionResult<{ message: string }>> {
  const token = await requireToken()
  if (!token) return authRequired()

  const response = await apiPost<unknown>(
    `/contracts/${encodeURIComponent(uuid)}/invitations/send`,
    {},
    token,
  )
  if (!response.ok) return failure(response.error)

  revalidateContracts(uuid)
  return {
    ok: true,
    data: { message: "دعوت‌نامه‌ها در صف ارسال قرار گرفتند." },
    error: null,
    requiresAuth: false,
  }
}

export async function resendSignatureInvitation(
  uuid: string,
  signatureId: number,
): Promise<ActionResult<{ message: string }>> {
  const token = await requireToken()
  if (!token) return authRequired()

  const response = await apiPost<unknown>(
    `/contracts/${encodeURIComponent(uuid)}/signatures/${signatureId}/invitation/resend`,
    {},
    token,
  )
  if (!response.ok) return failure(response.error)

  revalidateContracts(uuid)
  return {
    ok: true,
    data: { message: "دعوت‌نامه مجدد در صف ارسال قرار گرفت." },
    error: null,
    requiresAuth: false,
  }
}

export async function completeContract(
  uuid: string,
): Promise<ActionResult<Contract>> {
  const token = await requireToken()
  if (!token) return authRequired()

  const response = await apiPost<unknown>(
    `/contracts/${encodeURIComponent(uuid)}/complete`,
    {},
    token,
  )
  if (!response.ok || !response.data) return failure(response.error)

  const parsed = contractResponseSchema.safeParse(response.data)
  if (!parsed.success) return failure("پاسخ انعقاد قرارداد معتبر نیست.")

  revalidateContracts(uuid)
  return {
    ok: true,
    data: parsed.data.data as Contract,
    error: null,
    requiresAuth: false,
  }
}

export async function sendSignatureOtp(
  uuid: string,
  signatureId: number,
): Promise<ActionResult> {
  const token = await requireToken()
  if (!token) return authRequired()

  const response = await apiPost<unknown>(
    `/contracts/${encodeURIComponent(uuid)}/signatures/${signatureId}/otp/send`,
    {},
    token,
  )
  if (!response.ok) return failure(response.error)

  revalidateContracts(uuid)
  return { ok: true, data: null, error: null, requiresAuth: false }
}

export async function verifySignatureOtp(
  uuid: string,
  signatureId: number,
  code: string,
): Promise<ActionResult> {
  const token = await requireToken()
  if (!token) return authRequired()

  const response = await apiPost<unknown>(
    `/contracts/${encodeURIComponent(uuid)}/signatures/${signatureId}/otp/verify`,
    { verification_code: code },
    token,
  )
  if (!response.ok) return failure(response.error)

  revalidateContracts(uuid)
  return { ok: true, data: null, error: null, requiresAuth: false }
}

export async function signContract(
  uuid: string,
  signatureId: number,
  signatureAttachmentId?: number,
  metadata?: Record<string, unknown>,
): Promise<ActionResult> {
  const token = await requireToken()
  if (!token) return authRequired()

  const response = await apiPost<unknown>(
    `/contracts/${encodeURIComponent(uuid)}/signatures/${signatureId}/sign`,
    {
      signature_id: signatureAttachmentId || undefined,
      metadata,
    },
    token,
  )
  if (!response.ok) return failure(response.error)

  revalidateContracts(uuid)
  return { ok: true, data: null, error: null, requiresAuth: false }
}

type AiOperation = "analysis" | "rewrite"

export async function analyzeContract(
  uuid: string,
  body: string,
  operation: AiOperation = "analysis",
  returnUrl?: string,
): Promise<ActionResult<ContractAiOperationResult>> {
  const token = await requireToken()
  if (!token) return authRequired()
  const pricing = await apiGet<unknown>(
    `/contracts/${encodeURIComponent(uuid)}/ai/pricing`,
    token,
    { revalidate: false },
  )
  const parsedPricing = pricing.data
    ? contractAiPricingResponseSchema.safeParse(pricing.data)
    : null
  const operationAmount =
    parsedPricing?.success && operation === "rewrite"
      ? parsedPricing.data.data.rewrite_amount
      : parsedPricing?.success
        ? parsedPricing.data.data.analysis_amount
        : null

  const words = body
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean)
  const isRewrite = operation === "rewrite"
  const summary = isRewrite
    ? [
        "پیش‌نویس بازنویسی حقوقی بر اساس آخرین پیشنهادات آماده شد.",
        "عبارات مبهم باید به تعهدات دقیق، زمان‌بندی روشن، ضمانت اجرا و مرجع حل اختلاف تبدیل شوند.",
        "بازنویسی نهایی باید پیش از پرداخت و ثبت نهایی متن توسط ایجادکننده کنترل و تایید شود.",
      ].join("\n")
    : [
        `متن قرارداد شامل حدود ${words.length.toLocaleString("fa-IR")} واژه است.`,
        "پیشنهادها: مشخصات طرفین، موضوع قرارداد، تعهدات، مبلغ، زمان‌بندی، ضمانت اجرا و مرجع حل اختلاف را شفاف‌تر کنید.",
        "این بررسی جایگزین مشاوره حقوقی نیست و فقط برای کاهش خطای نگارشی و ساختاری است.",
      ].join("\n")

  const response = await apiPost<unknown>(
    `/contracts/${encodeURIComponent(uuid)}/ai/analyze`,
    {
      gateway: "smart",
      ai_service: operation,
      ai_data: {
        provider: "dashboard_precheck",
        operation,
        price: operationAmount,
        currency: parsedPricing?.success
          ? parsedPricing.data.data.currency
          : "IRT",
        word_count: words.length,
        checked_at: new Date().toISOString(),
      },
      ai_content: summary,
      return_url: returnUrl,
      return_context:
        operation === "rewrite"
          ? "contract_ai_rewrite"
          : "contract_ai_analysis",
    },
    token,
  )
  if (!response.ok || !response.data) return failure(response.error)

  const parsed = contractAiPaymentResponseSchema.safeParse(response.data)
  if (!parsed.success) return failure("پاسخ بررسی هوش مصنوعی معتبر نیست.")

  revalidateContracts(uuid)
  return {
    ok: true,
    data: {
      summary: parsed.data.data.analysis?.aiContent ?? summary,
      requiresGateway: parsed.data.data.requiresGateway,
      paymentUrl: parsed.data.data.paymentUrl,
    },
    error: null,
    requiresAuth: false,
  }
}

async function syncContractChildren(
  uuid: string,
  values: ContractFormValues,
  token: string,
): Promise<string | null> {
  const current = await loadContract(uuid, token)
  if (!current.ok) {
    return current.error ?? "قرارداد برای همگام‌سازی طرفین قابل دریافت نیست."
  }

  const existingSignatures = current.data?.signatures ?? []
  const removedSignatureIds = new Set(values.removedSignatureIds ?? [])

  for (const contractAttachmentId of values.removedContractAttachmentIds ??
    []) {
    const response = await apiDelete(
      `/contracts/${encodeURIComponent(uuid)}/attachments/${contractAttachmentId}`,
      token,
    )
    if (!response.ok && response.status !== 404) return response.error
  }

  for (const signatureId of removedSignatureIds) {
    const response = await apiDelete(
      `/contracts/${encodeURIComponent(uuid)}/signatures/${signatureId}`,
      token,
    )
    if (!response.ok && response.status !== 404) return response.error
  }

  for (const [index, attachment] of values.attachments.entries()) {
    if (attachment.attachmentId > 0 && !attachment.id) {
      const response = await apiPost(
        `/contracts/${encodeURIComponent(uuid)}/attachments`,
        { attachment_id: attachment.attachmentId, sort_order: index },
        token,
      )
      if (!response.ok) return response.error
    }
  }

  for (const signature of values.signatures.slice(0, 10)) {
    if (!signature.fullName.trim() && !signature.mobile.trim()) continue

    const payload = {
      user_id: signature.userId || undefined,
      full_name: signature.fullName.trim(),
      mobile: signature.mobile.trim(),
    }
    const existingSignature = existingSignatures.find(
      (item) =>
        item.mobile === payload.mobile && !removedSignatureIds.has(item.id),
    )
    const signatureId = signature.id ?? existingSignature?.id

    const response = signatureId
      ? await apiPatch(
          `/contracts/${encodeURIComponent(uuid)}/signatures/${signatureId}`,
          payload,
          token,
        )
      : await apiPost(
          `/contracts/${encodeURIComponent(uuid)}/signatures`,
          payload,
          token,
        )

    if (!response.ok) return response.error
    if (response.data) contractSignatureSchema.safeParse(response.data)
  }

  return null
}

async function loadContract(
  uuid: string,
  token: string,
): Promise<ActionResult<Contract>> {
  const response = await apiGet<unknown>(
    `/contracts/${encodeURIComponent(uuid)}`,
    token,
    { revalidate: false, noStore: true },
  )
  if (!response.ok || !response.data) return failure(response.error)

  const parsed = contractResponseSchema.safeParse(response.data)
  if (!parsed.success) return failure("پاسخ قرارداد معتبر نیست.")

  return {
    ok: true,
    data: parsed.data.data as Contract,
    error: null,
    requiresAuth: false,
  }
}

async function requireToken() {
  const session = await getServerSession()
  return session?.accessToken
}

function revalidateContracts(uuid: string) {
  revalidatePath("/pishkhan/contracts")
  revalidatePath(`/pishkhan/contracts/${uuid}`)
  revalidateTag("contracts:list", "max")
  revalidateTag(`contracts:${uuid}`, "max")
}

function authRequired<T>(): ActionResult<T> {
  return {
    ok: false,
    data: null,
    error: "برای انجام این کار ابتدا وارد حساب شوید.",
    requiresAuth: true,
  }
}

function failure<T>(error: string | null): ActionResult<T> {
  return {
    ok: false,
    data: null,
    error: error ?? "انجام عملیات با خطا مواجه شد.",
    requiresAuth: false,
  }
}
