import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { t, type Lang } from "../i18n"
import { Icon } from "../components/layout/Icon"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import {
  getWallet,
  listTransactions,
  createTransaction,
} from "../lib/api"

const TRANSACTION_TYPE_LABELS: Record<string, Record<string, string>> = {
  en: {
    deposit: "Deposit",
    withdraw: "Withdrawal",
    transfer: "Transfer",
    payout: "Payout",
    payment: "Payment",
  },
  fa: {
    deposit: "واریز",
    withdraw: "برداشت",
    transfer: "انتقال",
    payout: "پرداخت",
    payment: "پرداخت",
  },
}

const TRANSACTION_STATUS_CLASSES: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-rose-100 text-rose-700",
  cancelled: "bg-gray-100 text-gray-600",
}

export default function WalletPage() {
  const navigate = useNavigate()
  const [lang, setLang] = useState<Lang>("fa")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [wallet, setWallet] = useState<WalletRow | null>(null)
  const [transactions, setTransactions] = useState<WalletTransactionRow[]>([])
  const [showForm, setShowForm] = useState(false)
  const [txType, setTxType] = useState<"deposit" | "withdraw">("deposit")
  const [amountToman, setAmountToman] = useState("")
  const [amountUSD, setAmountUSD] = useState("")
  const [currency, setCurrency] = useState("IRT")
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const isFa = lang === "fa"
  const tr = t[lang]

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [w, txs] = await Promise.all([getWallet(), listTransactions()])
      setWallet(w)
      setTransactions(txs)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wallet data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amountToman && !amountUSD) return

    setSubmitting(true)
    setSuccess(null)
    try {
      await createTransaction({
        type: txType,
        amountToman: amountToman ? parseInt(amountToman) : undefined,
        amountUSD: amountUSD ? parseInt(amountUSD) : undefined,
        currency,
        note: note.trim() || undefined,
      })
      setSuccess(
        txType === "deposit" ? tr.dash.depositSuccess : tr.dash.withdrawSuccess,
      )
      setAmountToman("")
      setAmountUSD("")
      setNote("")
      setShowForm(false)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed")
    } finally {
      setSubmitting(false)
    }
  }

  const fmtMoney = (toman: number, usd: number) =>
    isFa
      ? `${(toman / 1000000).toFixed(1)}M ${tr.common.toman}`
      : `$${usd}`

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto fade-in">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#1e3a5f] font-semibold hover:underline mb-4"
        >
          <Icon name="chevronLeft" size={16} /> {tr.common.back}
        </button>
        <h1 className="text-2xl font-bold text-[#0f172a]">{tr.dash.wallet}</h1>
        <p className="text-[#64748b] mt-1">{tr.dash.walletBalance}</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6 text-sm text-rose-700">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-[#64748b]">{tr.common.loading}</div>
      ) : (
        <>
          {/* Balance Cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] rounded-2xl p-6 text-white">
              <div className="text-blue-200 text-xs font-semibold mb-2">
                {tr.common.toman} {tr.dash.balance}
              </div>
              <div className="text-3xl font-bold">
                {wallet ? (wallet.balanceToman / 1000000).toFixed(1) : "0"}M
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 text-white">
              <div className="text-emerald-100 text-xs font-semibold mb-2">
                {tr.common.usd} {tr.dash.balance}
              </div>
              <div className="text-3xl font-bold">
                {wallet ? `$${wallet.balanceUSD}` : "$0"}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <Button onClick={() => { setTxType("deposit"); setShowForm(true) }}>
              <Icon name="plus" size={14} /> {tr.dash.deposit}
            </Button>
            <Button
              variant="secondary"
              onClick={() => { setTxType("withdraw"); setShowForm(true) }}
            >
              <Icon name="arrowUp" size={14} /> {tr.dash.withdraw}
            </Button>
          </div>

          {/* Transaction Form */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 mb-6 fade-in">
              <h2 className="font-bold text-[#0f172a] text-lg mb-4">
                {txType === "deposit" ? tr.dash.makeDeposit : tr.dash.makeWithdrawal}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                      {tr.common.toman}
                    </label>
                    <Input
                      value={amountToman}
                      onChange={setAmountToman}
                      placeholder="e.g. 5000000"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                      {tr.common.usd}
                    </label>
                    <Input
                      value={amountUSD}
                      onChange={setAmountUSD}
                      placeholder="e.g. 120"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                    {tr.common.cancel}
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] focus:border-[#1e3a5f] transition-all"
                  >
                    <option value="IRT">IRT (Toman)</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                    {tr.dash.note}
                  </label>
                  <Input
                    value={note}
                    onChange={setNote}
                    placeholder={isFa ? "اختیاری" : "Optional note"}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={submitting || (!amountToman && !amountUSD)}>
                    {submitting ? tr.common.loading : (isFa ? "ثبت تراکنش" : "Submit Transaction")}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowForm(false)}
                  >
                    {tr.common.cancel}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Transactions */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e2e8f0]">
              <h2 className="font-bold text-[#0f172a]">
                {tr.dash.transactionHistory}
              </h2>
            </div>
            {transactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">📋</div>
                <div className="font-bold text-[#0f172a] mb-1">
                  {tr.dash.noTransactions}
                </div>
                <div className="text-sm text-[#64748b]">
                  {tr.dash.noTransactionsSub}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#e2e8f0]">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-[#f8fafc] transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tx.type === "deposit"
                          ? "bg-emerald-100 text-emerald-600"
                          : tx.type === "withdraw"
                            ? "bg-rose-100 text-rose-600"
                            : "bg-[#f2f5fa] text-[#64748b]"
                      }`}
                    >
                      <Icon
                        name={tx.type === "deposit" ? "arrowDown" : "arrowUp"}
                        size={18}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-sm text-[#0f172a]">
                          {TRANSACTION_TYPE_LABELS[lang]?.[tx.type] || tx.type}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            TRANSACTION_STATUS_CLASSES[tx.status] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {tr.dash.status[tx.status as keyof typeof tr.dash.status] || tx.status}
                        </span>
                      </div>
                      {tx.note && (
                        <div className="text-xs text-[#64748b] truncate">
                          {tx.note}
                        </div>
                      )}
                    </div>
                    <div className="text-end">
                      <div
                        className={`text-sm font-bold ${
                          tx.type === "deposit"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {tx.type === "deposit" ? "+" : "-"}
                        {tx.amountToman > 0
                          ? isFa
                            ? `${(tx.amountToman / 1000000).toFixed(1)}M ${tr.common.toman}`
                            : `$${tx.amountUSD}`
                          : `$${tx.amountUSD}`}
                      </div>
                      <div className="text-xs text-[#94a3b8]">
                        {new Date(tx.createdAt).toLocaleDateString(isFa ? "fa-IR" : "en-US")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}