"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { lookupUserByEmail } from "@/lib/contracts"
import { getSessionToken } from "@/lib/session"
import { requestDeposit, requestWithdrawal, transferFunds } from "@/lib/wallet"

const PATH = "/app/wallet"

function fail(message: string, tab?: string): never {
  const suffix = tab ? `&tab=${tab}` : ""
  redirect(`${PATH}?error=${encodeURIComponent(message)}${suffix}`)
}

function done(message: string, tab: string): never {
  redirect(`${PATH}?ok=${encodeURIComponent(message)}&tab=${tab}`)
}

async function requireToken(): Promise<string> {
  const token = await getSessionToken()
  if (!token) redirect(`/sign-in?redirectUrl=${encodeURIComponent(PATH)}`)
  return token
}

function parseAmount(formData: FormData): number {
  const raw = String(formData.get("amount") ?? "").replace(/[^\d]/g, "")
  return Number(raw)
}

export async function depositAction(formData: FormData): Promise<void> {
  const token = await requireToken()
  const amount = parseAmount(formData)
  const gateway = String(formData.get("gateway") ?? "")

  if (!Number.isFinite(amount) || amount < 1) fail("مبلغ شارژ معتبر نیست.", "deposit")
  if (!gateway) fail("درگاه پرداخت را انتخاب کنید.", "deposit")

  const result = await requestDeposit(token, amount, gateway)

  if (!result.ok) fail(result.message, "deposit")

  revalidatePath(PATH)
  // The transaction is pending: the wallet is credited by the gateway callback,
  // not by this request.
  done("درخواست شارژ ثبت شد و پس از تأیید درگاه اعمال می‌شود.", "deposit")
}

export async function withdrawAction(formData: FormData): Promise<void> {
  const token = await requireToken()
  const amount = parseAmount(formData)

  if (!Number.isFinite(amount) || amount < 1) fail("مبلغ برداشت معتبر نیست.", "withdraw")

  const result = await requestWithdrawal(token, amount)

  if (!result.ok) fail(result.message, "withdraw")

  revalidatePath(PATH)
  done("درخواست برداشت ثبت شد و در انتظار بررسی است.", "withdraw")
}

export async function transferAction(formData: FormData): Promise<void> {
  const token = await requireToken()
  const amount = parseAmount(formData)
  const email = String(formData.get("email") ?? "").trim()

  if (!Number.isFinite(amount) || amount < 1) fail("مبلغ انتقال معتبر نیست.", "transfer")
  if (!email) fail("ایمیل گیرنده را وارد کنید.", "transfer")

  const receiver = await lookupUserByEmail(token, email)

  if (!receiver.ok) fail(receiver.message, "transfer")

  const result = await transferFunds(token, receiver.data.id, amount)

  if (!result.ok) fail(result.message, "transfer")

  revalidatePath(PATH)
  done(`مبلغ به ${receiver.data.name} منتقل شد.`, "transfer")
}
