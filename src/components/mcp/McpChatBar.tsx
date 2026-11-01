import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react"

import { Icon } from "../layout/Icon"
import { MarkdownMessage } from "../ai/MarkdownMessage"
import type { Lang } from "../../i18n"
import { desktopBridge, isDesktop } from "../../lib/desktop"
import { useMcpChat } from "./useMcpChat"
import type { McpModel, ToolRun, Turn } from "./types"

type Role = "employer" | "admin" | "super_admin"

type CopyShape = {
  launcher: string
  launcherHint: string
  title: string
  subtitle: string
  placeholder: string
  hint: string
  emptyTitle: string
  emptyBody: string
  suggestions: { label: string; prompt: string }[]
  thinking: string
  send: string
  stop: string
  clear: string
  settings: string
  close: string
  live: string
  demo: string
  tokens: string
  cost: string
  latency: string
  redacted: string
  budget: string
  toolRunning: string
  toolDone: string
  toolFailed: string
  openLink: string
  retry: string
  copied: string
  copy: string
  keyTitle: string
  keyBody: string
  keyLabel: string
  keyPlaceholder: string
  save: string
  saved: string
  test: string
  testing: string
  model: string
  storage: string
  storagePlain: string
  resetBudget: string
  openFolder: string
  noDesktop: string
  demoNote: string
  errorTitle: string
  clearConfirm: string
  homeGreeting: string
  homeIntro: string
  back: string
}

const COPY: Record<"en" | "fa", CopyShape> = {
  en: {
    launcher: "Ask AdminHub",
    launcherHint: "MCP assistant",
    title: "MCP assistant",
    subtitle: "Grounded in live marketplace data",
    placeholder: "Ask about admins, packages, pricing or contracts…",
    hint: "Enter to send · Shift+Enter for a new line",
    emptyTitle: "What do you want to get done?",
    emptyBody:
      "The assistant calls the same MCP tools the app uses, so every number it quotes comes from your data.",
    suggestions: [
      { label: "Find Instagram admins", prompt: "Find me Instagram admins with a strong rating" },
      { label: "Compare packages", prompt: "Compare the top three packages side by side" },
      {
        label: "Suggest pricing",
        prompt: "What is a fair monthly price for Instagram management?",
      },
      { label: "Open tickets", prompt: "Which support tickets need attention right now?" },
    ],
    thinking: "Thinking…",
    send: "Send",
    stop: "Stop",
    clear: "Clear thread",
    settings: "Settings",
    close: "Close",
    live: "Live",
    demo: "Demo data",
    tokens: "tokens",
    cost: "cost",
    latency: "latency",
    redacted: "redacted",
    budget: "Daily budget",
    toolRunning: "running",
    toolDone: "done",
    toolFailed: "failed",
    openLink: "Open",
    retry: "Retry",
    copied: "Copied",
    copy: "Copy answer",
    keyTitle: "Model access",
    keyBody:
      "Paste a LayerCloud API key to answer with a live free-tier model. Without a key the assistant answers from the bundled demo dataset.",
    keyLabel: "API key",
    keyPlaceholder: "lc_…",
    save: "Save key",
    saved: "Saved. The key is encrypted with the OS keychain and never reaches the UI.",
    test: "Test connection",
    testing: "Testing…",
    model: "Model",
    storage: "Stored encrypted on this device",
    storagePlain: "Stored in plain text (OS keychain unavailable)",
    resetBudget: "Reset counters",
    openFolder: "Open data folder",
    noDesktop: "Key management is available in the desktop app.",
    demoNote: "Answers come from local demo data. Add a key in Settings for a live model.",
    errorTitle: "Something went wrong",
    clearConfirm: "Clear the whole thread?",
    homeGreeting: "What can I get done for you?",
    homeIntro:
      "I can search the marketplace, compare packages, price a service, draft a brief or find open tickets — answering from your own data.",
    back: "Back to the dashboard",
  },
  fa: {
    launcher: "از AdminHub بپرس",
    launcherHint: "دستیار MCP",
    title: "دستیار MCP",
    subtitle: "متصل به دادهٔ واقعی بازار",
    placeholder: "درباره ادمین‌ها، پکیج‌ها، قیمت یا قرارداد بپرسید…",
    hint: "برای ارسال Enter · برای خط جدید Shift+Enter",
    emptyTitle: "چه کاری می‌خواهید انجام شود؟",
    emptyBody:
      "دستیار همان ابزارهای MCP برنامه را صدا می‌زند؛ هر عددی که می‌گوید از دادهٔ خودتان می‌آید.",
    suggestions: [
      { label: "ادمین اینستاگرام", prompt: "ادمین اینستاگرام با امتیاز بالا پیدا کن" },
      { label: "مقایسه پکیج‌ها", prompt: "سه پکیج برتر را با هم مقایسه کن" },
      { label: "پیشنهاد قیمت", prompt: "قیمت منصفانه ماهانه مدیریت اینستاگرام چقدر است؟" },
      { label: "تیکت‌های باز", prompt: "کدام تیکت‌های پشتیبانی الان نیاز به رسیدگی دارند؟" },
    ],
    thinking: "در حال فکر کردن…",
    send: "ارسال",
    stop: "توقف",
    clear: "پاک کردن گفتگو",
    settings: "تنظیمات",
    close: "بستن",
    live: "زنده",
    demo: "دادهٔ دمو",
    tokens: "توکن",
    cost: "هزینه",
    latency: "تأخیر",
    redacted: "پوشانده‌شده",
    budget: "سهمیه روزانه",
    toolRunning: "در حال اجرا",
    toolDone: "انجام شد",
    toolFailed: "خطا",
    openLink: "باز کن",
    retry: "تلاش دوباره",
    copied: "کپی شد",
    copy: "کپی پاسخ",
    keyTitle: "دسترسی به مدل",
    keyBody:
      "برای پاسخ با مدل زنده، کلید API لایه‌کلود را وارد کنید. بدون کلید، پاسخ‌ها از دادهٔ دمو ساخته می‌شوند.",
    keyLabel: "کلید API",
    keyPlaceholder: "lc_…",
    save: "ذخیره کلید",
    saved: "ذخیره شد. کلید با زنجیره‌کلید سیستم رمز می‌شود و هرگز به رابط کاربری نمی‌رسد.",
    test: "آزمایش اتصال",
    testing: "در حال آزمایش…",
    model: "مدل",
    storage: "ذخیره‌شده به‌صورت رمزنگاری‌شده روی این دستگاه",
    storagePlain: "ذخیره‌شده به‌صورت متن ساده (زنجیره‌کلید سیستم در دسترس نیست)",
    resetBudget: "صفر کردن شمارنده‌ها",
    openFolder: "پوشه داده",
    noDesktop: "مدیریت کلید فقط در نسخه دسکتاپ فعال است.",
    demoNote: "پاسخ‌ها از دادهٔ دموی محلی ساخته می‌شوند. برای مدل زنده در تنظیمات کلید وارد کنید.",
    errorTitle: "مشکلی پیش آمد",
    clearConfirm: "کل گفتگو پاک شود؟",
    homeGreeting: "چه کاری برایتان انجام بدهم؟",
    homeIntro:
      "می‌توانم بازار را جستجو کنم، پکیج‌ها را مقایسه کنم، قیمت پیشنهاد بدهم، طرح پروژه بنویسم یا تیکت‌های باز را نشان بدهم — همه بر پایه دادهٔ خودتان.",
    back: "بازگشت به داشبورد",
  },
}

const money = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "—"
  if (value === 0) return "$0"
  if (value < 0.0001) return `$${value.toFixed(6)}`
  return `$${value.toFixed(4)}`
}

const compact = (value: number) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value))

/**
 * The conversation surface, shared by the floating panel and the home screen.
 *
 * `variant="floating"` is the Ctrl+K overlay; `variant="page"` is the full
 * height home route. Both drive the same transport and the same MCP tools —
 * only the chrome differs.
 */
export function ChatSurface({
  lang,
  role,
  variant = "floating",
  startInSettings = false,
  onClose,
}: {
  lang: Lang
  role: string
  variant?: "floating" | "page"
  startInSettings?: boolean
  onClose?: () => void
}) {
  const copy = COPY[lang]
  const [showSettings, setShowSettings] = useState(startInSettings)
  const [draft, setDraft] = useState("")

  const normalisedRole: Role = role === "admin" || role === "super_admin" ? "admin" : "employer"
  const { turns, send, stop, clear, busy, statusText, status, model, setModel, refreshStatus } =
    useMcpChat(lang, normalisedRole)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const previousPrompts = useRef<string[]>([])
  const historyIndex = useRef(-1)

  const isPage = variant === "page"

  const submit = useCallback(() => {
    const text = draft.trim()
    if (!text || busy) return

    previousPrompts.current = [...previousPrompts.current, text].slice(-20)
    historyIndex.current = -1
    setDraft("")
    void send({ text })
  }, [busy, draft, send])

  const retry = useCallback(
    (prompt: string) => {
      if (busy) return
      void send({ text: prompt })
    },
    [busy, send],
  )

  // On the home screen Ctrl+K means "put the cursor in the box", not "open the
  // panel" — the panel is already open.
  useEffect(() => {
    if (!isPage) return

    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey
      if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault()
        inputRef.current?.focus()
      }
      if (event.key === "Escape" && showSettings) setShowSettings(false)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isPage, showSettings])

  // Keep the newest turn in view, including while it streams.
  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior: turns.length > 1 ? "smooth" : "auto" })
  }, [turns, statusText])

  // Autosize the composer between one and five lines.
  useEffect(() => {
    const node = inputRef.current
    if (!node) return
    node.style.height = "auto"
    node.style.height = `${Math.min(node.scrollHeight, 132)}px`
  }, [draft])

  const lastPrompt = useMemo(() => {
    const lastUser = [...turns].reverse().find((turn) => turn.role === "user")
    return lastUser?.text ?? ""
  }, [turns])

  const handleDraftKeys = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      submit()
      return
    }

    if (event.key === "ArrowUp" && draft === "" && previousPrompts.current.length > 0) {
      event.preventDefault()
      const next = Math.min(historyIndex.current + 1, previousPrompts.current.length - 1)
      historyIndex.current = next
      setDraft(previousPrompts.current[previousPrompts.current.length - 1 - next] ?? "")
    }
  }

  const budget = status?.budget
  const budgetPct =
    budget && budget.limit > 0 ? Math.min(100, (budget.used / budget.limit) * 100) : 0
  const live = status?.configured ?? false
  const empty = turns.length === 0

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!isPage && (
        <header className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-3">
          <span className="mcp-orb flex h-9 w-9 items-center justify-center rounded-xl text-white">
            <Icon name="ai" size={18} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-bold">{copy.title}</h2>
              <SourceBadge live={live} copy={copy} />
            </div>
            <p className="truncate text-[11px] text-muted">
              {status?.configured
                ? `${status.models.find((entry) => entry.id === model)?.name ?? model} · ${copy.subtitle}`
                : copy.demoNote}
            </p>
          </div>

          {status && status.models.length > 0 && (
            <ModelPicker
              models={status.models}
              value={model}
              onChange={setModel}
              label={copy.model}
            />
          )}

          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="rounded-lg p-2 text-muted transition hover:bg-surface2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label={copy.settings}
            title={copy.settings}
          >
            <Icon name="settings" size={17} />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-muted transition hover:bg-surface2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label={copy.close}
              title={copy.close}
            >
              <Icon name="x" size={17} />
            </button>
          )}
        </header>
      )}

      {isPage && (
        <div className="hidden shrink-0 items-center gap-3 border-b border-border bg-card/80 px-6 py-2.5 backdrop-blur lg:flex">
          <span className="min-w-0 flex-1 truncate text-[11px] text-muted">
            {status?.configured
              ? `${copy.subtitle} · ${status.models.find((entry) => entry.id === model)?.name ?? model}`
              : copy.demoNote}
          </span>

          {status && status.models.length > 0 && (
            <ModelPicker
              models={status.models}
              value={model}
              onChange={setModel}
              label={copy.model}
            />
          )}

          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[11px] font-medium text-muted transition hover:bg-surface2 hover:text-foreground"
          >
            <Icon name="settings" size={13} />
            {copy.settings}
          </button>

          {turns.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(copy.clearConfirm)) clear()
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[11px] font-medium text-muted transition hover:bg-surface2 hover:text-foreground"
            >
              <Icon name="trash" size={13} />
              {copy.clear}
            </button>
          )}
        </div>
      )}

      <div className="relative flex min-h-0 flex-1">
        <div
          ref={scrollRef}
          className={`mcp-scroll flex-1 overflow-y-auto ${isPage ? "px-4 py-6" : "px-4 py-4"}`}
          aria-live="polite"
          aria-busy={busy}
        >
          {empty ? (
            <EmptyState
              copy={copy}
              variant={variant}
              live={live}
              onPick={(prompt) => void send({ text: prompt })}
            />
          ) : (
            <div
              className={`mx-auto flex w-full flex-col gap-5 ${isPage ? "max-w-[760px]" : "max-w-[720px]"}`}
            >
              {turns.map((turn, index) => (
                <TurnView
                  key={turn.id}
                  turn={turn}
                  copy={copy}
                  lang={lang}
                  streaming={busy && index === turns.length - 1 && turn.role === "assistant"}
                  onRetry={() => retry(lastPrompt)}
                />
              ))}

              {busy && !statusText && turns[turns.length - 1]?.status === "pending" && (
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="flex gap-1">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </span>
                  {copy.thinking}
                </div>
              )}

              {statusText && <p className="text-xs text-muted">{statusText}</p>}
            </div>
          )}
        </div>

        {showSettings && (
          <SettingsSheet
            copy={copy}
            status={status}
            onClose={() => setShowSettings(false)}
            onRefresh={refreshStatus}
          />
        )}
      </div>

      <footer
        className={`shrink-0 border-t border-border bg-card ${isPage ? "px-4 pb-4 pt-3" : "px-4 pb-3 pt-2.5"}`}
      >
        <div className={`mx-auto w-full ${isPage ? "max-w-[760px]" : "max-w-[720px]"}`}>
          <div className="flex items-end gap-2 rounded-xl border border-border bg-surface px-3 py-2 transition focus-within:border-primary/40 focus-within:bg-card">
            <textarea
              ref={inputRef}
              value={draft}
              rows={1}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleDraftKeys}
              placeholder={copy.placeholder}
              className="mcp-input max-h-[132px] flex-1 resize-none bg-transparent py-1 text-sm leading-6 text-foreground outline-none placeholder:text-muted"
              aria-label={copy.placeholder}
              autoFocus={isPage}
            />

            {busy ? (
              <button
                type="button"
                onClick={stop}
                className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-rose/10 px-2.5 text-xs font-semibold text-rose transition hover:bg-rose/15"
              >
                <span className="h-2 w-2 rounded-[2px] bg-rose" />
                {copy.stop}
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={draft.trim().length === 0}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label={copy.send}
                title={copy.send}
              >
                <Icon name="send" size={15} className={lang === "fa" ? "-scale-x-100" : ""} />
              </button>
            )}
          </div>

          <div className="mt-2 flex items-center gap-3 text-[10.5px] text-muted">
            <span className="hidden sm:inline">{copy.hint}</span>

            {budget && (
              <span className="ms-auto flex items-center gap-2" title={copy.budget}>
                <span className="tabular-nums">
                  {compact(budget.used)}/{compact(budget.limit)} {copy.tokens}
                </span>
                <span className="h-1 w-16 overflow-hidden rounded-full bg-surface2">
                  <span
                    className={`block h-full rounded-full transition-[width] duration-500 ${
                      budgetPct > 85 ? "bg-rose" : budgetPct > 60 ? "bg-amber" : "bg-emerald"
                    }`}
                    style={{ width: `${Math.max(2, budgetPct)}%` }}
                  />
                </span>
              </span>
            )}

            {!isPage && turns.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(copy.clearConfirm)) clear()
                }}
                className="rounded px-1.5 py-0.5 transition hover:bg-surface2 hover:text-foreground"
              >
                {copy.clear}
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}

/** Floating Ctrl+K panel. Thin wrapper around {@link ChatSurface}. */
export function McpChatBar({ lang, role }: { lang: Lang; role: string }) {
  const copy = COPY[lang]
  const [open, setOpen] = useState(false)
  const [openSettings, setOpenSettings] = useState(false)
  const [live, setLive] = useState(false)

  const openPanel = useCallback((settings = false) => {
    setOpenSettings(settings)
    setOpen(true)
  }, [])

  const closePanel = useCallback(() => {
    setOpen(false)
    setOpenSettings(false)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey
      if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((current) => !current)
      }
      if (event.key === "Escape" && open) {
        event.preventDefault()
        closePanel()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [closePanel, open])

  // Any screen can open the panel (the topbar pill dispatches this).
  useEffect(() => {
    const open = () => openPanel()
    window.addEventListener("adminhub:mcp-open", open)
    return () => window.removeEventListener("adminhub:mcp-open", open)
  }, [openPanel])

  useEffect(() => {
    let cancelled = false

    void fetch("/api/ai/status", { headers: { Accept: "application/json" } })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { configured?: boolean } | null) => {
        if (!cancelled) setLive(Boolean(data?.configured))
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    const bridge = desktopBridge()
    if (!bridge) return

    return bridge.onCommand((command) => {
      if (command === "chat") openPanel()
      if (command === "settings") openPanel(true)
    })
  }, [openPanel])

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => openPanel()}
          className="mcp-launcher group fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-[0_10px_30px_-12px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-14px_rgba(15,23,42,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label={`${copy.launcher} (${copy.launcherHint})`}
        >
          <span className="mcp-orb flex h-6 w-6 items-center justify-center rounded-full text-white">
            <Icon name="ai" size={14} />
          </span>
          <span>{copy.launcher}</span>
          <span className="hidden items-center gap-1 rounded-md border border-border bg-surface2 px-1.5 py-0.5 text-[10px] font-medium text-muted sm:inline-flex">
            {lang === "fa" ? "Ctrl K" : "⌘K"}
          </span>
          <span className={`ml-0.5 h-1.5 w-1.5 rounded-full ${live ? "bg-emerald" : "bg-amber"}`} />
        </button>
      )}

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-[#0f172a]/25 backdrop-blur-[2px]"
            onClick={closePanel}
            aria-hidden="true"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-label={copy.title}
            dir={lang === "fa" ? "rtl" : "ltr"}
            className="mcp-panel fixed bottom-4 left-1/2 z-50 flex h-[min(78vh,700px)] w-[min(940px,calc(100vw-1.5rem))] -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-[0_30px_80px_-24px_rgba(15,23,42,0.55)]"
          >
            <ChatSurface
              lang={lang}
              role={role}
              startInSettings={openSettings}
              onClose={closePanel}
            />
          </section>
        </>
      )}
    </>
  )
}

// ── pieces ──────────────────────────────────────────────────────────────────

type Copy = CopyShape

function SourceBadge({ live, copy }: { live: boolean; copy: Copy }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        live ? "bg-emerald/10 text-emerald" : "bg-amber/10 text-amber"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald" : "bg-amber"}`} />
      {live ? copy.live : copy.demo}
    </span>
  )
}

function EmptyState({
  copy,
  variant,
  live,
  onPick,
}: {
  copy: Copy
  variant: "floating" | "page"
  live: boolean
  onPick: (prompt: string) => void
}) {
  if (variant === "page") {
    return (
      <div className="mx-auto flex h-full w-full max-w-[720px] flex-col items-center justify-center gap-6 py-10 text-center">
        <div className="relative">
          <span className="mcp-orb mcp-orb-lg flex h-16 w-16 items-center justify-center rounded-[22px] text-white">
            <Icon name="ai" size={30} />
          </span>
          <span className="absolute -bottom-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-emerald text-white">
            <Icon name="check" size={11} />
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {copy.homeGreeting}
          </h1>
          <p className="mx-auto max-w-[480px] text-sm leading-6 text-muted">{copy.homeIntro}</p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[10.5px] font-medium text-muted">
          <SourceBadge live={live} copy={copy} />
          {live ? copy.subtitle : copy.demoNote}
        </span>

        <div className="grid w-full gap-2.5 sm:grid-cols-2">
          {copy.suggestions.map((suggestion, index) => (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => onPick(suggestion.prompt)}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3 text-start transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_10px_24px_-16px_rgba(15,23,42,0.4)]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary transition group-hover:bg-primary group-hover:text-white">
                <Icon
                  name={["search", "compare", "chart", "tickets"][index] ?? "search"}
                  size={14}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-foreground">
                  {suggestion.label}
                </span>
                <span className="block truncate text-[10.5px] text-muted">{suggestion.prompt}</span>
              </span>
              <Icon
                name="chevronRight"
                size={13}
                className="shrink-0 text-muted rtl:-scale-x-100"
              />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-[640px] flex-col items-center gap-5 py-8 text-center">
      <span className="mcp-orb flex h-12 w-12 items-center justify-center rounded-2xl text-white">
        <Icon name="ai" size={22} />
      </span>

      <div>
        <h3 className="text-base font-bold">{copy.emptyTitle}</h3>
        <p className="mx-auto mt-1 max-w-[440px] text-xs leading-5 text-muted">{copy.emptyBody}</p>
      </div>

      <div className="grid w-full gap-2 sm:grid-cols-2">
        {copy.suggestions.map((suggestion) => (
          <button
            key={suggestion.label}
            type="button"
            onClick={() => onPick(suggestion.prompt)}
            className="group flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-start text-xs font-medium transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-sm"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary transition group-hover:bg-primary group-hover:text-white">
              <Icon name="search" size={13} />
            </span>
            <span className="min-w-0 flex-1 truncate">{suggestion.label}</span>
            <Icon name="chevronRight" size={13} className="shrink-0 text-muted rtl:-scale-x-100" />
          </button>
        ))}
      </div>
    </div>
  )
}

function TurnView({
  turn,
  copy,
  lang,
  streaming,
  onRetry,
}: {
  turn: Turn
  copy: Copy
  lang: Lang
  streaming: boolean
  onRetry: () => void
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1400)
    return () => window.clearTimeout(timer)
  }, [copied])

  if (turn.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm leading-6 text-white">
          {turn.text}
        </p>
      </div>
    )
  }

  const meta = turn.meta

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[11px] text-muted">
        <span className="mcp-orb flex h-5 w-5 items-center justify-center rounded-md text-white">
          <Icon name="ai" size={11} />
        </span>
        <span className="font-semibold text-foreground">MCP</span>
        {meta.source && (
          <span
            className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold ${
              meta.source === "live" ? "bg-emerald/10 text-emerald" : "bg-amber/10 text-amber"
            }`}
          >
            {meta.source === "live" ? copy.live : copy.demo}
          </span>
        )}
        {meta.modelName && <span className="truncate">{meta.modelName}</span>}
      </div>

      {turn.tools.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {turn.tools.map((tool) => (
            <ToolChip key={tool.id} tool={tool} copy={copy} />
          ))}
        </div>
      )}

      {turn.text && (
        <div className="mcp-markdown text-sm leading-6 text-foreground">
          <MarkdownMessage content={turn.text} />
          {streaming && <span className="mcp-caret" aria-hidden="true" />}
        </div>
      )}

      {turn.status === "error" && (
        <div className="flex items-start gap-2 rounded-lg border border-rose/25 bg-rose/5 px-3 py-2 text-xs text-rose">
          <Icon name="warning" size={14} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{copy.errorTitle}</p>
            <p className="mt-0.5 break-words opacity-90">{turn.error}</p>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="shrink-0 rounded-md border border-rose/30 px-2 py-0.5 text-[10px] font-semibold transition hover:bg-rose/10"
          >
            {copy.retry}
          </button>
        </div>
      )}

      {(meta.latencyMs !== undefined || meta.promptTokens !== undefined || meta.redactions) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted">
          {meta.latencyMs !== undefined && <span>{meta.latencyMs} ms</span>}
          {meta.promptTokens !== undefined && (
            <span>
              {meta.promptTokens}↑ {meta.completionTokens ?? 0}↓ {copy.tokens}
            </span>
          )}
          {meta.costUsd !== undefined && meta.costUsd !== null && (
            <span>
              {copy.cost} {money(meta.costUsd)}
            </span>
          )}
          {Boolean(meta.redactions) && (
            <span className="rounded bg-amber/10 px-1.5 py-0.5 font-semibold text-amber">
              {meta.redactions} {copy.redacted}
            </span>
          )}

          {turn.text && (
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(turn.text)
                setCopied(true)
              }}
              className="ms-auto inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition hover:bg-surface2 hover:text-foreground"
            >
              <Icon name={copied ? "check" : "copy"} size={11} />
              {copied ? copy.copied : copy.copy}
            </button>
          )}
        </div>
      )}

      {turn.tools.some((tool) => tool.link) && !streaming && (
        <div className="flex flex-wrap gap-1.5">
          {turn.tools
            .filter((tool) => tool.link)
            .map((tool) => (
              <a
                key={`${tool.id}-link`}
                href={tool.link?.path}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[11px] font-medium text-primary transition hover:border-primary/40 hover:bg-card"
              >
                {tool.link?.label}
                <Icon name={lang === "fa" ? "chevronLeft" : "chevronRight"} size={11} />
              </a>
            ))}
        </div>
      )}
    </div>
  )
}

function ToolChip({ tool, copy }: { tool: ToolRun; copy: Copy }) {
  const [expanded, setExpanded] = useState(false)
  const running = tool.status === "running"
  const failed = tool.status === "error"

  return (
    <div
      className={`overflow-hidden rounded-lg border text-[11px] ${
        failed ? "border-rose/30 bg-rose/5" : "border-border bg-surface"
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center gap-2 px-2.5 py-1.5 text-start transition hover:bg-surface2/70"
        aria-expanded={expanded}
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
            failed ? "bg-rose/10 text-rose" : "bg-primary/8 text-primary"
          }`}
        >
          <Icon name={running ? "layers" : failed ? "warning" : "check"} size={11} />
        </span>
        <code className="font-mono text-[10.5px] font-semibold text-foreground">{tool.name}</code>
        <span className="text-muted">
          {running ? copy.toolRunning : failed ? copy.toolFailed : `${tool.durationMs ?? 0} ms`}
        </span>
        {running && <span className="mcp-spinner" aria-hidden="true" />}
        <Icon
          name="chevronRight"
          size={11}
          className={`ms-auto shrink-0 text-muted transition-transform ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-border/70 px-2.5 py-2">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">input</p>
          <pre className="mcp-json">{JSON.stringify(tool.input, null, 2)}</pre>
          {tool.structured && (
            <>
              <p className="mb-1 mt-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
                result
              </p>
              <pre className="mcp-json">{JSON.stringify(tool.structured, null, 2)}</pre>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ModelPicker({
  models,
  value,
  onChange,
  label,
}: {
  models: McpModel[]
  value: string
  onChange: (id: string) => void
  label: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = models.find((model) => model.id === value) ?? models[0]

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [open])

  return (
    <div className="relative hidden md:block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1.5 text-[11px] font-medium transition hover:bg-surface2"
      >
        <Icon name="layers" size={12} className="text-muted" />
        <span className="max-w-[130px] truncate">{selected?.name ?? value}</span>
        <Icon
          name="chevronRight"
          size={10}
          className={`text-muted transition-transform ${open ? "-rotate-90" : "rotate-90"}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="mcp-dropdown absolute end-0 top-[calc(100%+6px)] z-10 w-[280px] overflow-hidden rounded-xl border border-border bg-card p-1 shadow-xl"
        >
          {models.map((model) => {
            const active = model.id === value
            return (
              <button
                key={model.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(model.id)
                  setOpen(false)
                }}
                className={`flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-start transition hover:bg-surface2 ${
                  active ? "bg-surface2" : ""
                }`}
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border">
                  {active && <span className="h-2 w-2 rounded-full bg-primary" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[11.5px] font-semibold">{model.name}</span>
                    <span className="shrink-0 text-[10px] tabular-nums text-muted">
                      ${model.inUsd.toFixed(2)}/${model.outUsd.toFixed(2)}
                    </span>
                  </span>
                  <span className="block truncate text-[10px] text-muted">{model.blurb}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SettingsSheet({
  copy,
  status,
  onClose,
  onRefresh,
}: {
  copy: Copy
  status: ReturnType<typeof useMcpChat>["status"]
  onClose: () => void
  onRefresh: () => Promise<void>
}) {
  const [key, setKey] = useState("")
  const [reveal, setReveal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ tone: "ok" | "error" | "info"; text: string } | null>(
    null,
  )

  const desktop = isDesktop()

  const save = async () => {
    if (!key.trim()) return
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/ai/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key.trim() }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      setMessage({ tone: "ok", text: copy.saved })
      setKey("")
      await onRefresh()
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : String(error) })
    } finally {
      setSaving(false)
    }
  }

  const test = async () => {
    setTesting(true)
    setMessage(null)

    try {
      const response = await fetch("/api/ai/probe", { method: "POST" })
      const data = (await response.json()) as { ok: boolean; message: string; latencyMs: number }
      setMessage({
        tone: data.ok ? "ok" : "error",
        text: `${data.ok ? "✔" : "✖"} ${data.message} · ${data.latencyMs} ms`,
      })
      await onRefresh()
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : String(error) })
    } finally {
      setTesting(false)
    }
  }

  const resetBudget = async () => {
    await fetch("/api/ai/budget/reset", { method: "POST" })
    await onRefresh()
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-bold">{copy.keyTitle}</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted transition hover:bg-surface2 hover:text-foreground"
          aria-label={copy.close}
        >
          <Icon name="x" size={16} />
        </button>
      </div>

      <div className="mcp-scroll flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-[560px] space-y-4">
          <p className="text-xs leading-5 text-muted">{copy.keyBody}</p>

          {status?.configured && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald/25 bg-emerald/5 px-3 py-2 text-xs text-emerald">
              <Icon name="shield" size={14} />
              <span className="font-mono">{status.keyPreview}</span>
              <span className="ms-auto text-[10px] opacity-80">
                {status.keyEncrypted ? copy.storage : copy.storagePlain}
              </span>
            </div>
          )}

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold text-muted">{copy.keyLabel}</span>
            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 focus-within:border-primary/40">
                <input
                  type={reveal ? "text" : "password"}
                  value={key}
                  onChange={(event) => setKey(event.target.value)}
                  placeholder={copy.keyPlaceholder}
                  className="min-w-0 flex-1 bg-transparent py-2 font-mono text-xs outline-none"
                  spellCheck={false}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setReveal((current) => !current)}
                  className="text-[10px] text-muted transition hover:text-foreground"
                >
                  <Icon name="eye" size={13} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => void save()}
                disabled={!key.trim() || saving}
                className="rounded-lg bg-primary px-3 text-xs font-semibold text-white transition enabled:hover:brightness-110 disabled:opacity-40"
              >
                {copy.save}
              </button>
            </div>
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void test()}
              disabled={!status?.configured || testing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold transition enabled:hover:bg-surface2 disabled:opacity-40"
            >
              <Icon name="shield" size={12} />
              {testing ? copy.testing : copy.test}
            </button>

            <button
              type="button"
              onClick={() => void resetBudget()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold transition hover:bg-surface2"
            >
              <Icon name="chart" size={12} />
              {copy.resetBudget}
            </button>

            {desktop && (
              <button
                type="button"
                onClick={() => void desktopBridge()?.openSettingsFile()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold transition hover:bg-surface2"
              >
                <Icon name="download" size={12} />
                {copy.openFolder}
              </button>
            )}
          </div>

          {message && (
            <p
              className={`rounded-lg px-3 py-2 text-xs ${
                message.tone === "ok"
                  ? "bg-emerald/10 text-emerald"
                  : message.tone === "error"
                    ? "bg-rose/10 text-rose"
                    : "bg-surface2 text-muted"
              }`}
            >
              {message.text}
            </p>
          )}

          {status?.lastProbe && !message && (
            <p className="text-[10.5px] text-muted">
              last check · {new Date(status.lastProbe.at).toLocaleString()} ·{" "}
              {status.lastProbe.message}
            </p>
          )}

          {!desktop && (
            <p className="rounded-lg bg-surface2 px-3 py-2 text-[11px] text-muted">
              {copy.noDesktop}
            </p>
          )}

          {status && (
            <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span>{copy.budget}</span>
                <span className="tabular-nums text-muted">
                  {status.budget.used.toLocaleString()} / {status.budget.limit.toLocaleString()}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface2">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{
                    width: `${Math.min(100, (status.budget.used / status.budget.limit) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
