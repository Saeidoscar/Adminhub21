import { useState, useEffect, useRef } from "react"
import { Icon } from "../layout/Icon"
import { useTheme } from "../../design-system/ThemeProvider"
import { callTool, detectIntent } from "../../lib/mcp-client"
import type { McpTool } from "../../lib/mcp-client"

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const { lang } = useTheme()
  const [query, setQuery] = useState("")
  const [tools, setTools] = useState<McpTool[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery("")
      setResult(null)
      inputRef.current?.focus()
      loadTools()
    }
  }, [open])

  const loadTools = async () => {
    setLoading(true)
    const t = await callTool("list-tools", {}, { language: lang })
    setLoading(false)
  }

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setResult(null)
    const intent = await detectIntent(query, { language: lang })
    const toolResult = await callTool(
      intent.intent as string,
      { text: query },
      { language: lang },
    )
    setResult(toolResult.text)
    setLoading(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden fade-in">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Icon name="search" size={20} className="text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={
              lang === "fa"
                ? "جستجو یا اجرای دستور..."
                : "Search or run a command..."
            }
            className="flex-1 bg-transparent text-text text-sm placeholder:text-muted outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-surface2 border border-border text-xs text-muted font-mono">
            ESC
          </kbd>
        </div>
        <div className="p-2 max-h-80 overflow-y-auto">
          {loading && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          )}
          {result && (
            <div className="px-3 py-3 bg-surface2 rounded-xl text-sm text-text leading-relaxed">
              {result}
            </div>
          )}
          {!loading && !result && (
            <div className="px-3 py-2 text-xs text-muted">
              {lang === "fa"
                ? 'مثلاً: "یک ادمین اینستاگرام پیدا کن" یا "قیمت‌گذاری برای مدیریت صفحه"'
                : 'Try: "Find an Instagram admin" or "Suggest pricing for page management"'}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-surface2">
          <span className="text-xs text-muted">
            {lang === "fa"
              ? "پایه شده بر MCP Protocol"
              : "Powered by MCP Protocol"}
          </span>
          <div className="flex gap-2">
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-card border border-border text-xs text-muted font-mono">
              ↑↓
            </kbd>
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-card border border-border text-xs text-muted font-mono">
              ↵
            </kbd>
          </div>
        </div>
      </div>
    </div>
  )
}
