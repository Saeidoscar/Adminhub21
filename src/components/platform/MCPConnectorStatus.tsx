import { useTheme } from '../../design-system/ThemeProvider'
import { lightTokens, darkTokens } from '../../design-system/tokens'

interface MCPConnectorStatusProps {
  connected?: boolean
  lastSync?: string
}

export function MCPConnectorStatus({ connected = true, lastSync }: MCPConnectorStatusProps) {
  const { theme } = useTheme()
  const t = theme === 'dark' ? darkTokens : lightTokens
  const isFa = false

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald animate-pulse' : 'bg-rose'}`} />
      <span className="text-xs text-muted">
        {connected
          ? isFa ? 'متصل به MCP' : 'MCP Connected'
          : isFa ? 'قطع ارتباط' : 'Disconnected'}
      </span>
      {lastSync && (
        <span className="text-xs text-muted/60">
          {isFa ? `هماهنگ‌سازی: ${lastSync}` : `Synced: ${lastSync}`}
        </span>
      )}
    </div>
  )
}
