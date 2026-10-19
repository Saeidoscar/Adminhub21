import { apiRequest, type ApiResult } from "@/lib/session"

export type ContractStatus = "draft" | "pending" | "active" | "completed" | "cancelled"

export type ContractParty = {
  id: number
  name: string
  avatar?: string | null
}

export type ContractSignature = {
  name: string
  signed_at: string
  ip_address?: string | null
  user_agent?: string | null
}

export type ContractClause = {
  id: number
  contract_id: number
  type: string
  title: string
  content: string
  is_accepted: boolean
  accepted_at: string | null
}

export type ContractRow = {
  id: number
  user_id: number
  client_id: number
  package_id: number | null
  title: string
  description: string | null
  amount: string | number
  currency: string
  status: ContractStatus
  signatures: ContractSignature[] | null
  signed_at: string | null
  clauses_accepted_at: string | null
  starts_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
  user?: ContractParty | null
  client?: ContractParty | null
  clauses?: ContractClause[]
}

export type ContractPage = {
  data: ContractRow[]
  current_page: number
  last_page: number
  total: number
  per_page: number
}

export const STATUS_META: Record<ContractStatus, { label: string; className: string }> = {
  draft: { label: "پیش‌نویس", className: "bg-amber/15 text-amber" },
  pending: { label: "در انتظار امضا", className: "bg-sky/15 text-sky" },
  active: { label: "فعال", className: "bg-emerald/15 text-emerald" },
  completed: { label: "تمام‌شده", className: "bg-subtle text-muted" },
  cancelled: { label: "لغو‌شده", className: "bg-rose/15 text-rose" },
}

export function statusMeta(status: string) {
  return (
    STATUS_META[status as ContractStatus] ?? { label: status, className: "bg-subtle text-muted" }
  )
}

export function formatAmount(amount: string | number, currency: string): string {
  const value = Number(amount)

  if (!Number.isFinite(value)) return "—"

  const formatted = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 }).format(value)

  return currency === "IRR" ? `${formatted} ریال` : `${formatted} ${currency}`
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(date)
}

export type ListContractsQuery = {
  status?: string
  page?: string
  per_page?: string
}

export function listContracts(
  token: string,
  query: ListContractsQuery = {},
): Promise<ApiResult<ContractPage>> {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value)
  }

  const suffix = params.toString()
  return apiRequest<ContractPage>(token, `/api/v1/contracts${suffix ? `?${suffix}` : ""}`)
}

export function getContract(token: string, id: string): Promise<ApiResult<ContractRow>> {
  return apiRequest<ContractRow>(token, `/api/v1/contracts/${encodeURIComponent(id)}`)
}

export function createContract(
  token: string,
  input: {
    title: string
    description?: string
    amount: number
    currency: string
    client_id: number
  },
): Promise<ApiResult<ContractRow>> {
  return apiRequest<ContractRow>(token, "/api/v1/contracts", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function signContract(
  token: string,
  id: string,
  name: string,
): Promise<ApiResult<ContractRow>> {
  return apiRequest<ContractRow>(token, `/api/v1/contracts/${encodeURIComponent(id)}/sign`, {
    method: "POST",
    body: JSON.stringify({ name }),
  })
}

export type Transition = "activate" | "complete" | "cancel"

export function transitionContract(
  token: string,
  id: string,
  transition: Transition,
): Promise<ApiResult<ContractRow>> {
  return apiRequest<ContractRow>(
    token,
    `/api/v1/contracts/${encodeURIComponent(id)}/${transition}`,
    {
      method: "POST",
    },
  )
}

export function generateContractPdf(
  token: string,
  id: string,
): Promise<ApiResult<{ pdf_path: string }>> {
  return apiRequest<{ pdf_path: string }>(
    token,
    `/api/v1/contracts/${encodeURIComponent(id)}/pdf`,
    {
      method: "POST",
    },
  )
}

export function lookupUserByEmail(
  token: string,
  email: string,
): Promise<ApiResult<{ id: number; name: string }>> {
  return apiRequest<{ id: number; name: string }>(
    token,
    `/api/v1/users/lookup?email=${encodeURIComponent(email)}`,
  )
}
