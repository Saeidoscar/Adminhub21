import { useCallback } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import { Icon } from "../layout/Icon"
import { Button } from "../ui/Button"

function CodeBlock({
  children,
  className,
}: {
  children?: string
  className?: string
}) {
  const language = className?.replace("language-", "") || "text"
  const code = String(children ?? "").replace(/\n$/, "")

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
  }, [code])

  return (
    <div className="relative mt-2 rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5 text-xs text-muted">
        <span>{language}</span>
        <Button
          variant="ghost"
          className="h-6 px-2 text-xs"
          onClick={handleCopy}
        >
          <Icon name="check" className="h-3 w-3" />
          Copy
        </Button>
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed">
        <code className={className}>{code}</code>
      </pre>
    </div>
  )
}

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize, rehypeHighlight]}
        components={{
          pre: ({ children }) => <>{children}</>,
          code: CodeBlock,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
