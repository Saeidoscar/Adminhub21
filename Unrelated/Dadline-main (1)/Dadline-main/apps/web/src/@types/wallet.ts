export type WalletDirection = "deposit" | "withdrawal"

export type WalletTransactionStatus = "pending" | "processing" | "completed" | "failed" | "cancelled" | "reversed"

export type WalletTransactionType = "online_charge" | "submit_case" | "handling_case_income" | "handling_case_cost" | "gift_card" | "verify_cost" | "contract_cost" | "fee_difference" | "buy_dadcoin" | "sell_dadcoin" | "submit_question" | "submit_vendor_req" | "handling_doc_cost" | "submit_legal_doc_cost" | "submit_counseling_phone" | "handling_doc_income" | "deposit_income" | "sell_document" | "buy_document" | "handling_lawlink_cost" | "submit_lawlink" | "marketing" | "buy_ai_token" | "submit_answer_on_question" | "premium_buy" | "sms_charge" | "cancel_service" | "contract_ai"

export type PayoutSettlementStatus = "pending" | "processing" | "completed" | "failed" | "cancelled"

export type WalletSummary = {
  balance: number
  withdrawableBalance: number
  blockedBalance: number
  status: string | null
  activeVerifiedLevel: number
  isLevelTwoVerified: boolean
  iban: string | null
  bankVerified: boolean
  hasActiveSubscription: boolean
  subscriptionPlan: string | null
  subscriptionExpiresAt: string | null
}

export type PayoutSettlement = {
  id: number
  transactionId: number
  amount: number
  fee: number
  totalPayable: number
  iban: string
  receiptLink: string | null
  trackId: string | null
  status: PayoutSettlementStatus
  statusLabel: string
  paidAt: string | null
  createdAt: string | null
}

export type WalletGiftCard = {
  id: number
  code: string
  amount: number
  redemptionLimit: number
  redeemedCount: number
  expiresAt: string | null
  createdAt: string | null
}

export type WalletTransaction = {
  id: number
  amount: number
  direction: WalletDirection
  directionLabel: string
  type: WalletTransactionType | null
  typeLabel: string
  status: WalletTransactionStatus
  statusLabel: string
  createdAt: string | null
  settlement: PayoutSettlement | null
}

export type WalletPagination = {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
}

export type WalletStatsItem = {
  type: string | null
  typeLabel: string
  amount: number
  count: number
}

export type WalletStats = {
  totalDeposits: number
  totalWithdrawals: number
  netAmount: number
  pendingAmount: number
  completedAmount: number
  transactionCount: number
  byType: WalletStatsItem[]
}

export type WalletDashboard = {
  summary: WalletSummary
  stats: WalletStats
  transactions: WalletTransaction[]
  settlements: PayoutSettlement[]
  giftCards: WalletGiftCard[]
  settlementFee: number
  pagination: WalletPagination
}

export type WalletListParams = {
  direction?: WalletDirection | "all"
  type?: WalletTransactionType | "all"
  status?: WalletTransactionStatus | "all"
  dateFrom?: string
  dateTo?: string
  page?: number
  perPage?: number
  forceFresh?: boolean
}
