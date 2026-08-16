import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"
import rehypeHighlight from "rehype-highlight"
import { CodeBlock } from "./CodeBlock"

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="max-w-full overflow-x-auto">
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
