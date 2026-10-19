import { apiRequest, type ApiResult } from "@/lib/session"

export type WalletBalance = {
  balance: number
  withdrawable_balance: number
  blocked_balance: number
}

export type WalletTransactionRow = {
  id: number
  user_id: number
  amount: number
  direction: "deposit" | "withdrawal"
  type: string
  status: "pending" | "processing" | "completed" | "failed" | "cancelled" | "reversed"
  payload: Record<string, unknown> | null
  created_at: string
}

export type TransactionPage = {
  data: WalletTransactionRow[]
  current_page: number
  last_page: number
  total: number
  per_page: number
}

export type Gateway = { id: number; code: string; name: string; provider?: string | null }

export const TYPE_LABELS: Record<string, string> = {
  online_charge: "شارژ آنلاین",
  contract_payment: "پرداخت قرارداد",
  proposal_cost: "هزینه پیشنهاد",
  platform_fee: "کارمزد پلتفرم",
  handling_income: "درآمد رسیدگی",
  handling_cost: "هزینه رسیدگی",
  ai_token_purchase: "خرید توکن هوش مصنوعی",
  affiliate_commission: "پورسانت معرفی",
  refund: "بازگشت وجه",
  withdrawal: "برداشت",
  deposit: "واریز",
  transfer: "انتقال",
}

export const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: "در انتظار", className: "bg-amber/15 text-amber" },
  processing: { label: "در حال پردازش", className: "bg-sky/15 text-sky" },
  completed: { label: "انجام‌شده", className: "bg-emerald/15 text-emerald" },
  failed: { label: "ناموفق", className: "bg-rose/15 text-rose" },
  cancelled: { label: "لغوشده", className: "bg-subtle text-muted" },
  reversed: { label: "برگشت‌خورده", className: "bg-rose/15 text-rose" },
}

export function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type
}

export function statusMeta(status: string) {
  return STATUS_LABELS[status] ?? { label: status, className: "bg-subtle text-muted" }
}

/** Wallet amounts are integers in the platform currency (IRR). */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("fa-IR").format(amount)
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

export function getBalance(token: string): Promise<ApiResult<WalletBalance>> {
  return apiRequest<WalletBalance>(token, "/api/v1/wallet/balance")
}

export function listTransactions(token: string, page = "1"): Promise<ApiResult<TransactionPage>> {
  return apiRequest<TransactionPage>(token, `/api/v1/wallet/transactions?page=${page}`)
}

export function listGateways(token: string): Promise<ApiResult<Gateway[]>> {
  return apiRequest<Gateway[]>(token, "/api/v1/payments")
}

export function requestDeposit(
  token: string,
  amount: number,
  gateway: string,
): Promise<ApiResult<WalletTransactionRow>> {
  return apiRequest<WalletTransactionRow>(token, "/api/v1/wallet/deposit", {
    method: "POST",
    body: JSON.stringify({ amount, gateway }),
  })
}

export function requestWithdrawal(
  token: string,
  amount: number,
): Promise<ApiResult<WalletTransactionRow>> {
  return apiRequest<WalletTransactionRow>(token, "/api/v1/wallet/withdraw", {
    method: "POST",
    body: JSON.stringify({ amount }),
  })
}

export function transferFunds(
  token: string,
  receiverId: number,
  amount: number,
): Promise<ApiResult<WalletTransactionRow>> {
  return apiRequest<WalletTransactionRow>(token, "/api/v1/wallet/transfer", {
    method: "POST",
    body: JSON.stringify({ receiver_id: receiverId, amount }),
  })
}
