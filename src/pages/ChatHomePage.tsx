import { ChatSurface } from "../components/mcp/McpChatBar"
import type { Lang } from "../i18n"

/**
 * The home screen: the MCP assistant, full height, with no dashboard in front
 * of it. Same transport, same tools, same settings as the floating Ctrl+K
 * panel — only the chrome is different (no overlay, no close button, a
 * greeting instead of a modal's empty state).
 *
 * The dashboard lives at `/dashboard` now; the sidebar links there.
 */
export default function ChatHomePage({ lang, role }: { lang: Lang; role: string }) {
  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden bg-surface"
      dir={lang === "fa" ? "rtl" : "ltr"}
    >
      <ChatSurface lang={lang} role={role} variant="page" />
    </div>
  )
}
