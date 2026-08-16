import { useCallback, useState } from "react"
import { Icon } from "../layout/Icon"
import { Button } from "../ui/Button"

export function useCopyText() {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text: string) => {
    if (!navigator.clipboard?.writeText) {
      return false
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return true
    } catch {
      setCopied(false)
      return false
    }
  }, [])

  return { copied, copy }
}

export function CodeBlock({
  children,
  className,
}: {
  children?: string
  className?: string
}) {
  const language = className?.replace("language-", "") || "text"
  const code = String(children ?? "").replace(/\n$/, "")
  const { copied, copy } = useCopyText()

  return (
    <div className="relative mt-2 rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5 text-xs text-muted">
        <span>{language}</span>
        <Button
          variant="ghost"
          className="h-6 px-2 text-xs"
          onClick={() => copy(code)}
          aria-label={copied ? "Copied" : "Copy code"}
          type="button"
        >
          <Icon name={copied ? "check" : "copy"} className="h-3 w-3" />
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed">
        <code className={className}>{code}</code>
      </pre>
    </div>
  )
}
