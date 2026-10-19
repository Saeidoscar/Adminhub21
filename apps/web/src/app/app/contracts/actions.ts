"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  createContract,
  lookupUserByEmail,
  signContract,
  transitionContract,
  type Transition,
} from "@/lib/contracts"
import { getSessionToken } from "@/lib/session"

const SIGN_IN = "/sign-in?redirectUrl="

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

export async function signContractAction(formData: FormData): Promise<void> {
  const id = String(formData.get("contractId") ?? "")
  const name = String(formData.get("name") ?? "").trim()
  const token = await getSessionToken()

  if (!token) redirect(`${SIGN_IN}${encodeURIComponent(`/app/contracts/${id}`)}`)
  if (!name) fail(`/app/contracts/${id}`, "نام امضاکننده را وارد کنید.")

  const result = await signContract(token, id, name)

  if (!result.ok) fail(`/app/contracts/${id}`, result.message)

  revalidatePath(`/app/contracts/${id}`)
  revalidatePath("/app/contracts")
  redirect(`/app/contracts/${id}?ok=${encodeURIComponent("قرارداد امضا شد.")}`)
}

export async function transitionAction(formData: FormData): Promise<void> {
  const id = String(formData.get("contractId") ?? "")
  const transition = String(formData.get("transition") ?? "") as Transition
  const token = await getSessionToken()

  if (!token) redirect(`${SIGN_IN}${encodeURIComponent(`/app/contracts/${id}`)}`)
  if (!["activate", "complete", "cancel"].includes(transition)) {
    fail(`/app/contracts/${id}`, "عملیات نامعتبر است.")
  }

  const result = await transitionContract(token, id, transition)

  if (!result.ok) fail(`/app/contracts/${id}`, result.message)

  revalidatePath(`/app/contracts/${id}`)
  revalidatePath("/app/contracts")
  redirect(`/app/contracts/${id}?ok=${encodeURIComponent("وضعیت قرارداد به‌روزرسانی شد.")}`)
}

export async function createContractAction(formData: FormData): Promise<void> {
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const amount = Number(formData.get("amount"))
  const currency = String(formData.get("currency") ?? "IRR")
  const clientEmail = String(formData.get("client_email") ?? "").trim()
  const token = await getSessionToken()

  if (!token) redirect(`${SIGN_IN}${encodeURIComponent("/app/contracts/new")}`)

  if (!title) fail("/app/contracts/new", "عنوان قرارداد را وارد کنید.")
  if (!Number.isFinite(amount) || amount <= 0)
    fail("/app/contracts/new", "مبلغ قرارداد معتبر نیست.")
  if (!clientEmail) fail("/app/contracts/new", "ایمیل طرف مقابل را وارد کنید.")

  // Resolve the counterparty first: the contract endpoint takes an id, while a
  // person knows an email address.
  const counterparty = await lookupUserByEmail(token, clientEmail)

  if (!counterparty.ok) {
    fail("/app/contracts/new", counterparty.message)
  }

  const result = await createContract(token, {
    title,
    description: description || undefined,
    amount,
    currency,
    client_id: counterparty.data.id,
  })

  if (!result.ok) fail("/app/contracts/new", result.message)

  revalidatePath("/app/contracts")
  redirect(`/app/contracts/${result.data.id}`)
}
